/**
 * Verify a Stripe Checkout Session — used by booking-confirmation page
 * to show payment confirmation details after Stripe redirect.
 *
 * Auth: None (public — session_id serves as auth token)
 * Input: ?session_id=cs_...
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getStripe } from '@/lib/stripe';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('stripe/verify-session');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'session_id is required' });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const bookingRef = session.metadata?.booking_ref;
    const bookingId = session.metadata?.booking_id;

    // Fetch booking details
    const supabase = getServiceSupabase();
    let booking = null;

    if (bookingId) {
      const { data } = await supabase
        .from('bookings')
        .select('booking_ref, customer_name, customer_email, status, payment_status, quoted_price, final_price')
        .eq('id', bookingId)
        .single();
      booking = data;
    } else if (bookingRef) {
      const { data } = await supabase
        .from('bookings')
        .select('booking_ref, customer_name, customer_email, status, payment_status, quoted_price, final_price')
        .eq('booking_ref', bookingRef)
        .single();
      booking = data;
    }

    const amountTotal = session.amount_total ? session.amount_total / 100 : null;

    return res.status(200).json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: amountTotal,
        currency: session.currency,
      },
      booking: booking
        ? {
            booking_ref: booking.booking_ref,
            customer_name: booking.customer_name,
            status: booking.status,
            payment_status: booking.payment_status,
          }
        : null,
    });
  } catch (err) {
    apiLogger.error('Error verifying session', { error: String(err) });
    return res.status(500).json({ error: 'Failed to verify session' });
  }
}
