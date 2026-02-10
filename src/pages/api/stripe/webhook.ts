/**
 * Stripe Webhook Handler
 * Processes all Stripe events with idempotent processing via stripe_events table.
 *
 * Events handled:
 * - checkout.session.completed
 * - checkout.session.expired
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.refunded
 * - invoice.paid
 * - invoice.finalized
 */

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { getStripe, getBaseUrl } from '@/lib/stripe';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { calculateTax } from '@/lib/tax-calculator';
import { logger } from '@/utils/logger';

const webhookLogger = logger.createModuleLogger('stripe/webhook');

// Disable Next.js body parsing — raw body required for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    webhookLogger.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    webhookLogger.error('Webhook signature verification failed', { error: String(err) });
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  const supabase = getServiceSupabase();

  // Idempotency check — prevent double-processing
  const { data: existingEvent } = await supabase
    .from('stripe_events')
    .select('id, processed')
    .eq('stripe_event_id', event.id)
    .maybeSingle();

  if (existingEvent?.processed) {
    webhookLogger.info('Event already processed, skipping', { eventId: event.id });
    return res.status(200).json({ received: true, status: 'already_processed' });
  }

  // Record the event
  if (!existingEvent) {
    await supabase.from('stripe_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object as any,
      processed: false,
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge, supabase);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'invoice.finalized':
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice, supabase);
        break;

      default:
        webhookLogger.info('Unhandled event type', { type: event.type });
    }

    // Mark event as processed
    await supabase
      .from('stripe_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

    webhookLogger.info('Event processed successfully', { eventId: event.id, type: event.type });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    webhookLogger.error('Error processing webhook event', {
      eventId: event.id,
      type: event.type,
      error: errorMsg,
    });

    // Record the error but still return 200 to prevent Stripe retries
    await supabase
      .from('stripe_events')
      .update({ processing_error: errorMsg })
      .eq('stripe_event_id', event.id);
  }

  // Always return 200 to Stripe
  return res.status(200).json({ received: true });
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) {
    webhookLogger.warn('checkout.session.completed without booking_id in metadata');
    return;
  }

  webhookLogger.info('Processing checkout.session.completed', {
    bookingId,
    sessionId: session.id,
    paymentIntent: session.payment_intent,
  });

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      stripe_checkout_session_id: session.id,
    })
    .eq('id', bookingId);

  // Get booking details for the payment record
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, booking_ref, quoted_price, final_price, customer_email, customer_name, customer_phone, province')
    .eq('id', bookingId)
    .single();

  if (!booking) return;

  const price = booking.final_price || booking.quoted_price || 0;
  const tax = calculateTax(parseFloat(String(price)), booking.province || 'BC');

  // Insert payment row
  await supabase.from('payments').insert({
    booking_id: bookingId,
    amount: tax.total,
    subtotal: tax.subtotal,
    gst_amount: tax.gstAmount,
    pst_amount: tax.pstAmount,
    tax_province: tax.province,
    payment_method: 'stripe',
    payment_type: 'full',
    status: 'completed',
    currency: 'CAD',
    stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    transaction_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    processed_at: new Date().toISOString(),
    notes: `Stripe Checkout Session ${session.id}`,
  });

  // Update customer stripe_customer_id if available
  if (session.customer && booking.customer_email) {
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
    await supabase
      .from('customer_profiles')
      .update({ stripe_customer_id: customerId })
      .eq('email', booking.customer_email);
  }

  // Send confirmation email, admin notification, and payment receipt (non-blocking)
  const baseUrl = getBaseUrl();
  try {
    await fetch(`${baseUrl}/api/send-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: booking.customer_email,
        name: booking.customer_name,
        referenceNumber: booking.booking_ref,
      }),
    });
  } catch (e) {
    webhookLogger.error('Confirmation email failed (non-blocking)', { error: String(e) });
  }

  try {
    await fetch(`${baseUrl}/api/send-admin-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingReference: booking.booking_ref,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        paymentNote: `Paid online via Stripe — $${tax.total.toFixed(2)} CAD (incl. GST $${tax.gstAmount.toFixed(2)} + PST $${tax.pstAmount.toFixed(2)})`,
      }),
    });
  } catch (e) {
    webhookLogger.error('Admin notification failed (non-blocking)', { error: String(e) });
  }

  // Send payment receipt email
  try {
    await fetch(`${baseUrl}/api/send-payment-receipt-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: booking.customer_email,
        name: booking.customer_name,
        bookingReference: booking.booking_ref,
        subtotal: tax.subtotal,
        gst: tax.gstAmount,
        pst: tax.pstAmount,
        total: tax.total,
        paymentMethod: 'Stripe Online Payment',
      }),
    });
  } catch (e) {
    webhookLogger.error('Payment receipt email failed (non-blocking)', { error: String(e) });
  }
}

async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) return;

  webhookLogger.info('Processing checkout.session.expired', { bookingId, sessionId: session.id });

  // Only cancel if still in pending-payment state
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, payment_status')
    .eq('id', bookingId)
    .single();

  if (booking && booking.payment_status === 'pending') {
    await supabase
      .from('bookings')
      .update({ status: 'cancelled', payment_status: 'unpaid' })
      .eq('id', bookingId);

    webhookLogger.info('Booking cancelled due to expired checkout', { bookingId });
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  const bookingId = paymentIntent.metadata?.booking_id;
  webhookLogger.info('Processing payment_intent.succeeded', {
    paymentIntentId: paymentIntent.id,
    bookingId,
  });

  if (!bookingId) return;

  // Update payments table
  await supabase
    .from('payments')
    .update({ status: 'completed', processed_at: new Date().toISOString() })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // Update booking payment status
  await supabase
    .from('bookings')
    .update({ payment_status: 'paid' })
    .eq('id', bookingId);
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  webhookLogger.info('Processing payment_intent.payment_failed', {
    paymentIntentId: paymentIntent.id,
    lastError: paymentIntent.last_payment_error?.message,
  });

  // Update any payment row with this PI
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);
}

async function handleChargeRefunded(
  charge: Stripe.Charge,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  webhookLogger.info('Processing charge.refunded', { chargeId: charge.id });

  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  // Find the original payment
  const { data: originalPayment } = await supabase
    .from('payments')
    .select('id, booking_id, amount')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();

  if (!originalPayment) return;

  const refundAmount = (charge.amount_refunded || 0) / 100;

  // Insert refund payment row
  await supabase.from('payments').insert({
    booking_id: originalPayment.booking_id,
    amount: -refundAmount,
    payment_method: 'stripe',
    payment_type: 'refund',
    status: 'completed',
    currency: 'CAD',
    stripe_payment_intent_id: paymentIntentId,
    stripe_charge_id: charge.id,
    stripe_refund_id: charge.refunds?.data?.[0]?.id || null,
    processed_at: new Date().toISOString(),
    notes: `Stripe refund for charge ${charge.id}`,
  });

  // Update booking payment status
  const isFullRefund = charge.refunded;
  await supabase
    .from('bookings')
    .update({ payment_status: isFullRefund ? 'refunded' : 'partially_refunded' })
    .eq('id', originalPayment.booking_id);
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  webhookLogger.info('Processing invoice.paid', { invoiceId: invoice.id });

  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      stripe_invoice_pdf: invoice.invoice_pdf || null,
    })
    .eq('stripe_invoice_id', invoice.id);
}

async function handleInvoiceFinalized(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  webhookLogger.info('Processing invoice.finalized', { invoiceId: invoice.id });

  await supabase
    .from('invoices')
    .update({
      stripe_invoice_url: invoice.hosted_invoice_url || null,
      stripe_invoice_pdf: invoice.invoice_pdf || null,
      invoice_number: invoice.number || null,
      status: invoice.status || 'open',
    })
    .eq('stripe_invoice_id', invoice.id);
}
