import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireTechnicianAuth } from '@/middleware/technicianAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { technicianId } = (req as any).technician;
    const supabase = getServiceSupabase();

    const { data, error } = await supabase.rpc('get_smart_feed', {
      p_technician_id: technicianId,
    });

    if (error) {
      console.error('Smart feed RPC error:', error);
      return res.status(500).json({ error: 'Failed to fetch job feed' });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching smart feed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireTechnicianAuth(handler);
