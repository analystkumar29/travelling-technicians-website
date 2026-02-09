import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireTechnicianAuth } from '@/middleware/technicianAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { technicianId } = (req as any).technician;
    const { booking_id } = req.body;

    if (!booking_id) {
      return res.status(400).json({ error: 'booking_id is required' });
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase.rpc('claim_job', {
      p_booking_id: booking_id,
      p_technician_id: technicianId,
    });

    if (error) {
      console.error('Claim job RPC error:', error);
      return res.status(500).json({ error: 'Failed to claim job' });
    }

    if (!data?.success) {
      return res.status(409).json({
        error: data?.reason || 'Failed to claim job',
      });
    }

    return res.status(200).json({
      success: true,
      message: data.message,
    });
  } catch (error) {
    console.error('Error claiming job:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireTechnicianAuth(handler);
