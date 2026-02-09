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
    const { status, limit = '50', offset = '0' } = req.query;
    const supabase = getServiceSupabase();

    let query = supabase
      .from('bookings')
      .select(`
        id, booking_ref, status, booking_date, booking_time, slot_duration,
        customer_name, customer_phone, customer_email, address, postal_code,
        issue_description, quoted_price, final_price, pricing_tier,
        created_at, updated_at,
        device_models:model_id (name, slug, brands:brand_id (name)),
        services:service_id (name, display_name),
        service_locations:location_id (city_name)
      `)
      .eq('technician_id', technicianId)
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false })
      .limit(parseInt(limit as string))
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (status === 'active') {
      query = query.in('status', ['assigned', 'in-progress']);
    } else if (status === 'past') {
      query = query.in('status', ['completed', 'cancelled']);
    } else if (status && status !== 'all') {
      query = query.eq('status', status as string);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching my jobs:', error);
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error in my-jobs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireTechnicianAuth(handler);
