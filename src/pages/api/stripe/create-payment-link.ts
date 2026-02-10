/**
 * Create a Stripe Checkout Session for pay-later bookings.
 * Called by technicians or admins to generate a payment link for a completed repair.
 *
 * Auth: Technician JWT OR Admin JWT
 * Input: { booking_id, amount? }
 * Returns: { url, booking_ref }
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getStripe, getOrCreateStripeCustomer, getBaseUrl } from '@/lib/stripe';
import { calculateTax, toStripeCents } from '@/lib/tax-calculator';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { verifyAdminToken } from '@/middleware/adminAuth';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('stripe/create-payment-link');

// Also accept technician JWT
function verifyTechOrAdmin(req: NextApiRequest): boolean {
  // Check admin token
  const adminAuth = verifyAdminToken(req);
  if (adminAuth.isAuthenticated) return true;

  // Check technician token
  try {
    const { verifyTechnicianToken } = require('@/middleware/technicianAuth');
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return false;
    const token = authHeader.substring(7);
    const decoded = verifyTechnicianToken(token);
    return !!decoded;
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyTechOrAdmin(req)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { booking_id, amount } = req.body;

  if (!booking_id) {
    return res.status(400).json({ error: 'booking_id is required' });
  }

  const supabase = getServiceSupabase();

  try {
    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id, booking_ref, customer_name, customer_email, customer_phone,
        quoted_price, final_price, province, payment_status,
        payment_link_url, stripe_checkout_session_id,
        device_models:model_id (name, brands:brand_id (name)),
        services:service_id (name, display_name)
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.payment_status === 'paid') {
      return res.status(400).json({ error: 'Booking is already paid' });
    }

    // If a payment link already exists and isn't expired, return it
    if (booking.payment_link_url) {
      return res.status(200).json({
        url: booking.payment_link_url,
        booking_ref: booking.booking_ref,
        existing: true,
      });
    }

    // Determine price
    const price = amount || booking.final_price || booking.quoted_price;
    if (!price || price <= 0) {
      return res.status(400).json({ error: 'No price available for this booking. Please provide an amount.' });
    }

    const subtotal = parseFloat(String(price));
    const tax = calculateTax(subtotal, booking.province || 'BC');

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(
      booking.customer_email,
      booking.customer_name,
      booking.customer_phone
    );

    // Build line item descriptions
    const deviceModels = booking.device_models as any;
    const services = booking.services as any;
    const serviceName = services?.display_name || services?.name || 'Repair Service';
    const brandName = deviceModels?.brands?.name || '';
    const modelName = deviceModels?.name || '';
    const serviceDescription = `${serviceName}${brandName ? ` — ${brandName}` : ''}${modelName ? ` ${modelName}` : ''}`;

    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      currency: 'cad',
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: { name: serviceDescription },
            unit_amount: toStripeCents(tax.subtotal),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            product_data: { name: 'GST (5%)' },
            unit_amount: toStripeCents(tax.gstAmount),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            product_data: { name: 'BC PST (7%)' },
            unit_amount: toStripeCents(tax.pstAmount),
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        source: 'payment-link',
      },
      success_url: `${baseUrl}/verify-booking?reference=${booking.booking_ref}&payment=success`,
      cancel_url: `${baseUrl}/verify-booking?reference=${booking.booking_ref}&payment=cancelled`,
      expires_at: Math.floor(Date.now() / 1000) + 23 * 60 * 60, // 23 hours (Stripe max is 24h)
    });

    // Store payment link on booking
    await supabase
      .from('bookings')
      .update({
        payment_link_url: session.url,
        stripe_checkout_session_id: session.id,
        payment_status: 'pending',
      })
      .eq('id', booking_id);

    apiLogger.info('Payment link created', {
      bookingRef: booking.booking_ref,
      sessionId: session.id,
      total: tax.total,
    });

    return res.status(200).json({
      url: session.url,
      booking_ref: booking.booking_ref,
      total: tax.total,
      tax_breakdown: {
        subtotal: tax.subtotal,
        gst: tax.gstAmount,
        pst: tax.pstAmount,
        total: tax.total,
      },
    });
  } catch (err) {
    apiLogger.error('Error creating payment link', { error: String(err) });
    return res.status(500).json({ error: 'Failed to create payment link' });
  }
}
