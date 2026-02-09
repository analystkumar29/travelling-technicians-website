/**
 * Technician Push Subscription API
 * POST — stores push_subscription in technicians table
 * DELETE — nulls out push_subscription
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { requireTechnicianAuth } from '@/middleware/technicianAuth';
import { getServiceSupabase } from '@/utils/supabaseClient';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { technicianId } = (req as any).technician;
  const supabase = getServiceSupabase();

  if (req.method === 'POST') {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    const { error } = await supabase
      .from('technicians')
      .update({ push_subscription: subscription })
      .eq('id', technicianId);

    if (error) {
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('technicians')
      .update({ push_subscription: null })
      .eq('id', technicianId);

    if (error) {
      return res.status(500).json({ error: 'Failed to remove subscription' });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireTechnicianAuth(handler);
