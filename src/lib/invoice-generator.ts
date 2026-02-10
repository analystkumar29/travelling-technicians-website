/**
 * Invoice Generator — creates Stripe Invoices for completed repairs.
 * Works for all payment methods (Stripe, cash, debit, etc.)
 */

import { getStripe, getOrCreateStripeCustomer } from '@/lib/stripe';
import { calculateTax, toStripeCents } from '@/lib/tax-calculator';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const invoiceLogger = logger.createModuleLogger('invoice-generator');

export interface InvoiceResult {
  success: boolean;
  invoice_id?: string;
  stripe_invoice_id?: string;
  invoice_url?: string;
  invoice_pdf?: string;
  invoice_number?: string;
  error?: string;
}

export async function generateInvoice(booking_id: string): Promise<InvoiceResult> {
  const supabase = getServiceSupabase();
  const stripe = getStripe();

  try {
    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, stripe_invoice_id, stripe_invoice_url, stripe_invoice_pdf')
      .eq('booking_id', booking_id)
      .maybeSingle();

    if (existingInvoice?.stripe_invoice_id) {
      invoiceLogger.info('Invoice already exists', { booking_id, invoiceId: existingInvoice.stripe_invoice_id });
      return {
        success: true,
        invoice_id: existingInvoice.id,
        stripe_invoice_id: existingInvoice.stripe_invoice_id,
        invoice_url: existingInvoice.stripe_invoice_url,
        invoice_pdf: existingInvoice.stripe_invoice_pdf,
      };
    }

    // Fetch booking + repair data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id, booking_ref, customer_name, customer_email, customer_phone,
        quoted_price, final_price, province, payment_status, pricing_tier,
        device_models:model_id (name, brands:brand_id (name)),
        services:service_id (name, display_name)
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (!booking.customer_email) {
      return { success: false, error: 'Customer email required for invoice' };
    }

    // Fetch repair_completions for parts info
    const { data: completion } = await supabase
      .from('repair_completions')
      .select('parts_used, repair_notes, completed_at')
      .eq('booking_id', booking_id)
      .maybeSingle();

    // Determine price
    const price = booking.final_price || booking.quoted_price;
    if (!price || parseFloat(String(price)) <= 0) {
      return { success: false, error: 'No price available for invoice' };
    }

    const subtotal = parseFloat(String(price));
    const tax = calculateTax(subtotal, booking.province || 'BC');

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(
      booking.customer_email,
      booking.customer_name || 'Customer',
      booking.customer_phone
    );

    // Build service description
    const deviceModels = booking.device_models as any;
    const services = booking.services as any;
    const serviceName = services?.display_name || services?.name || 'Repair Service';
    const brandName = deviceModels?.brands?.name || '';
    const modelName = deviceModels?.name || '';
    const lineDescription = `${serviceName}${brandName ? ` — ${brandName}` : ''}${modelName ? ` ${modelName}` : ''}`;

    // Create invoice items
    // Service line
    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      amount: toStripeCents(tax.subtotal),
      currency: 'cad',
      description: lineDescription,
    });

    // Parts (informational, $0 each)
    const parts = completion?.parts_used;
    if (Array.isArray(parts) && parts.length > 0) {
      for (const part of parts) {
        const partName = typeof part === 'string' ? part : (part.name || part.description || 'Part');
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          amount: 0,
          currency: 'cad',
          description: `Part: ${partName}`,
        });
      }
    }

    // GST line
    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      amount: toStripeCents(tax.gstAmount),
      currency: 'cad',
      description: 'GST (5%)',
    });

    // PST line
    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      amount: toStripeCents(tax.pstAmount),
      currency: 'cad',
      description: 'BC PST (7%)',
    });

    // Determine if already paid
    const isPaid = booking.payment_status === 'paid';

    // Create Stripe Invoice
    const invoiceParams: any = {
      customer: stripeCustomerId,
      currency: 'cad',
      auto_advance: true,
      collection_method: isPaid ? 'charge_automatically' : 'send_invoice',
      metadata: {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        source: 'travelling-technicians',
      },
    };

    if (!isPaid) {
      invoiceParams.days_until_due = 7;
    }

    const stripeInvoice = await stripe.invoices.create(invoiceParams);

    // If already paid (via Stripe or manually), mark as paid
    if (isPaid) {
      try {
        await stripe.invoices.pay(stripeInvoice.id, { paid_out_of_band: true });
      } catch (e) {
        invoiceLogger.warn('Could not mark invoice as paid_out_of_band', { error: String(e) });
      }
    }

    // Finalize invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

    // Send invoice email via Stripe
    if (!isPaid) {
      try {
        await stripe.invoices.sendInvoice(finalizedInvoice.id);
      } catch (e) {
        invoiceLogger.warn('Could not send invoice email', { error: String(e) });
      }
    }

    // Build line items for DB
    const lineItems = [
      { description: lineDescription, amount: tax.subtotal, type: 'service' },
      ...(Array.isArray(parts) ? parts.map((p: any) => ({
        description: `Part: ${typeof p === 'string' ? p : (p.name || 'Part')}`,
        amount: 0,
        type: 'part',
      })) : []),
      { description: 'GST (5%)', amount: tax.gstAmount, type: 'tax' },
      { description: 'BC PST (7%)', amount: tax.pstAmount, type: 'tax' },
    ];

    // Find associated payment
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('booking_id', booking_id)
      .eq('payment_type', 'full')
      .maybeSingle();

    // Insert into invoices table
    const { data: dbInvoice, error: insertError } = await supabase
      .from('invoices')
      .insert({
        booking_id,
        payment_id: payment?.id || null,
        stripe_invoice_id: finalizedInvoice.id,
        stripe_invoice_url: finalizedInvoice.hosted_invoice_url || null,
        stripe_invoice_pdf: finalizedInvoice.invoice_pdf || null,
        invoice_number: finalizedInvoice.number || null,
        subtotal: tax.subtotal,
        gst_amount: tax.gstAmount,
        pst_amount: tax.pstAmount,
        total: tax.total,
        currency: 'CAD',
        status: isPaid ? 'paid' : (finalizedInvoice.status || 'open'),
        line_items: lineItems,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        issued_at: new Date().toISOString(),
        paid_at: isPaid ? new Date().toISOString() : null,
      })
      .select('id')
      .single();

    if (insertError) {
      invoiceLogger.error('Failed to insert invoice into DB', { error: insertError });
    }

    // Update booking with invoice reference
    await supabase
      .from('bookings')
      .update({ stripe_invoice_id: finalizedInvoice.id })
      .eq('id', booking_id);

    invoiceLogger.info('Invoice generated successfully', {
      booking_id,
      invoiceId: finalizedInvoice.id,
      total: tax.total,
      isPaid,
    });

    return {
      success: true,
      invoice_id: dbInvoice?.id,
      stripe_invoice_id: finalizedInvoice.id,
      invoice_url: finalizedInvoice.hosted_invoice_url || undefined,
      invoice_pdf: finalizedInvoice.invoice_pdf || undefined,
      invoice_number: finalizedInvoice.number || undefined,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    invoiceLogger.error('Invoice generation failed', { booking_id, error: errorMsg });
    return { success: false, error: errorMsg };
  }
}
