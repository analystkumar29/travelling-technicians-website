/**
 * Process Stripe refunds (admin only)
 *
 * POST - Create a refund for a booking's Stripe payment
 * Input: { booking_id, amount?, reason? }
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '@/middleware/adminAuth';
import { getStripe } from '@/lib/stripe';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('stripe/refund');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { booking_id, amount, reason } = req.body;

  if (!booking_id) {
    return res.status(400).json({ error: 'booking_id is required' });
  }

  const supabase = getServiceSupabase();

  try {
    // Find the Stripe payment for this booking
    const { data: payment } = await supabase
      .from('payments')
      .select('id, stripe_payment_intent_id, amount, status')
      .eq('booking_id', booking_id)
      .eq('payment_method', 'stripe')
      .eq('payment_type', 'full')
      .eq('status', 'completed')
      .maybeSingle();

    if (!payment?.stripe_payment_intent_id) {
      return res.status(404).json({ error: 'No Stripe payment found for this booking' });
    }

    const stripe = getStripe();

    // Create refund params
    const refundParams: any = {
      payment_intent: payment.stripe_payment_intent_id,
    };

    // Partial refund if amount specified
    if (amount) {
      const refundAmount = Math.round(parseFloat(String(amount)) * 100);
      if (refundAmount <= 0) {
        return res.status(400).json({ error: 'Refund amount must be positive' });
      }
      refundParams.amount = refundAmount;
    }

    if (reason) {
      refundParams.reason = reason; // 'duplicate', 'fraudulent', 'requested_by_customer'
    }

    const refund = await stripe.refunds.create(refundParams);

    apiLogger.info('Refund created', {
      booking_id,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    });

    // The webhook handler (charge.refunded) will handle DB updates,
    // but update immediately for responsive UI
    const refundAmountDollars = refund.amount / 100;
    const isFullRefund = !amount || refundAmountDollars >= parseFloat(String(payment.amount));

    await supabase
      .from('bookings')
      .update({
        payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
      })
      .eq('id', booking_id);

    return res.status(200).json({
      success: true,
      refund: {
        id: refund.id,
        amount: refundAmountDollars,
        status: refund.status,
        currency: refund.currency,
      },
    });
  } catch (err) {
    apiLogger.error('Error processing refund', { error: String(err) });
    return res.status(500).json({ error: 'Failed to process refund' });
  }
}

export default requireAdminAuth(handler);
