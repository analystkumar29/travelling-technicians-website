import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireAdminAuth } from '@/middleware/adminAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const supabase = getServiceSupabase();

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('technician_service_zones')
        .select('id, location_id, priority, is_primary, travel_time_minutes, service_fee_adjustment, service_locations:location_id (city_name, slug)')
        .eq('technician_id', id as string)
        .order('priority');

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch zones' });
      }

      return res.status(200).json(data || []);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { zones } = req.body;

      if (!Array.isArray(zones)) {
        return res.status(400).json({ error: 'zones must be an array' });
      }

      // Delete existing zones
      await supabase
        .from('technician_service_zones')
        .delete()
        .eq('technician_id', id as string);

      // Insert new ones
      if (zones.length > 0) {
        const rows = zones.map((z: any, i: number) => ({
          technician_id: id,
          location_id: z.location_id,
          priority: z.priority || i + 1,
          is_primary: z.is_primary || i === 0,
          travel_time_minutes: z.travel_time_minutes || null,
          service_fee_adjustment: z.service_fee_adjustment || 0,
        }));

        const { error: insertError } = await supabase
          .from('technician_service_zones')
          .insert(rows);

        if (insertError) {
          console.error('Error inserting zones:', insertError);
          return res.status(500).json({ error: 'Failed to update zones' });
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAdminAuth(handler);
