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
    const { id } = req.query;
    const supabase = getServiceSupabase();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id, booking_ref, status, booking_date, booking_time, slot_duration,
        customer_name, customer_phone, customer_email, address, postal_code,
        city, province, issue_description, quoted_price, final_price, pricing_tier,
        created_at, updated_at,
        device_models:model_id (name, slug, brands:brand_id (name)),
        services:service_id (name, display_name, estimated_duration_minutes),
        service_locations:location_id (city_name)
      `)
      .eq('id', id as string)
      .eq('technician_id', technicianId)
      .single();

    if (error || !booking) {
      return res.status(404).json({ error: 'Job not found or not assigned to you' });
    }

    // Also fetch warranty if completed
    let warranty = null;
    if (booking.status === 'completed') {
      const { data: warrantyData } = await supabase
        .from('warranties')
        .select('warranty_number, start_date, end_date, duration_days, status')
        .eq('booking_id', booking.id)
        .maybeSingle();
      warranty = warrantyData;
    }

    // Fetch repair completion if exists
    let repairCompletion = null;
    const { data: completionData } = await supabase
      .from('repair_completions')
      .select('id, completed_at, repair_notes, parts_used, repair_duration')
      .eq('booking_id', booking.id)
      .maybeSingle();
    repairCompletion = completionData;

    return res.status(200).json({
      ...booking,
      warranty,
      repair_completion: repairCompletion,
    });
  } catch (error) {
    console.error('Error fetching job detail:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireTechnicianAuth(handler);
