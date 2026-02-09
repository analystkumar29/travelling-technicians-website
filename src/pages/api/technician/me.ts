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

    // Get technician profile
    const { data: tech, error: techError } = await supabase
      .from('technicians')
      .select('id, full_name, email, phone, whatsapp_number, current_status, is_active, specializations, hourly_rate, max_daily_appointments, experience_years, rating, total_bookings_completed, last_login_at')
      .eq('id', technicianId)
      .single();

    if (techError || !tech) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Get service zones
    const { data: zones } = await supabase
      .from('technician_service_zones')
      .select('id, location_id, priority, is_primary, travel_time_minutes, service_locations:location_id (city_name)')
      .eq('technician_id', technicianId)
      .order('priority');

    // Get specializations
    const { data: specs } = await supabase
      .from('technician_specializations')
      .select('id, service_id, category_id, skill_level, services:service_id (display_name), service_categories:category_id (name)')
      .eq('technician_id', technicianId);

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];

    const { count: todayJobs } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('technician_id', technicianId)
      .eq('booking_date', today)
      .in('status', ['assigned', 'in-progress', 'completed']);

    const { count: activeJobs } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('technician_id', technicianId)
      .in('status', ['assigned', 'in-progress']);

    return res.status(200).json({
      ...tech,
      service_zones: zones || [],
      technician_specializations: specs || [],
      stats: {
        today_jobs: todayJobs || 0,
        active_jobs: activeJobs || 0,
        total_completed: tech.total_bookings_completed,
        rating: tech.rating,
      },
    });
  } catch (error) {
    console.error('Error fetching technician profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireTechnicianAuth(handler);
