import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireTechnicianAuth } from '@/middleware/technicianAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { technicianId } = (req as any).technician;
  const supabase = getServiceSupabase();

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('technician_availability')
        .select('*')
        .eq('technician_id', technicianId)
        .order('day_of_week');

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch availability' });
      }

      return res.status(200).json(data || []);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { current_status } = req.body;

      if (current_status && ['available', 'busy', 'offline'].includes(current_status)) {
        const { error } = await supabase
          .from('technicians')
          .update({ current_status })
          .eq('id', technicianId);

        if (error) {
          return res.status(500).json({ error: 'Failed to update status' });
        }

        return res.status(200).json({ success: true, current_status });
      }

      return res.status(400).json({ error: 'Invalid status value' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireTechnicianAuth(handler);
