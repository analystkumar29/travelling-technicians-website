import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getServiceSupabase } from '@/utils/supabaseClient';
import logger from '@/utils/logger';
import { TechnicianRecord } from '@/types/admin';
import { requireAdminAuth } from '@/middleware/adminAuth';

/**
 * API handler for technicians endpoint
 * GET - Retrieve a list of technicians with optional filters
 * POST - Create a new technician
 * PUT - Update a technician
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetTechnicians(req, res);
    case 'POST':
      return handleCreateTechnician(req, res);
    case 'PUT':
      return handleUpdateTechnician(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

/**
 * Handle GET request to retrieve technicians
 */
async function handleGetTechnicians(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get query parameters
    const { 
      status, 
      is_active, 
      specialization,
      location_id,
      include_service_zones = 'false'
    } = req.query;
    
    // TEMPORARY: Use service role client until RLS policies are created
    // This bypasses RLS and allows us to test the UI
    const supabaseAdmin = getServiceSupabase();
    
    // Build the base query
    let query = supabaseAdmin
      .from('technicians')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (status && ['available', 'busy', 'offline'].includes(status as string)) {
      query = query.eq('current_status', status);
    }
    
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    
    if (specialization) {
      query = query.contains('specializations', [specialization]);
    }
    
    // Execute the query
    const { data: technicians, error } = await query;
    
    if (error) {
      logger.error('Error fetching technicians:', error);
      return res.status(500).json({ error: 'Failed to fetch technicians' });
    }
    
    // If location_id is provided, filter technicians by service zones
    let filteredTechnicians = technicians || [];
    if (location_id && include_service_zones === 'true') {
      // Get technicians for this location
      const { data: zoneTechnicians } = await supabaseAdmin
        .from('technician_service_zones')
        .select('technician_id')
        .eq('location_id', location_id);
      
      if (zoneTechnicians && zoneTechnicians.length > 0) {
        const technicianIds = zoneTechnicians.map(z => z.technician_id);
        filteredTechnicians = filteredTechnicians.filter(t => 
          technicianIds.includes(t.id)
        );
      }
    }
    
    // If include_service_zones is true, fetch service zones for each technician
    if (include_service_zones === 'true') {
      const techniciansWithZones = await Promise.all(
        filteredTechnicians.map(async (technician) => {
          const { data: serviceZones } = await supabaseAdmin
            .from('technician_service_zones')
            .select(`
              *,
              location:service_locations(*)
            `)
            .eq('technician_id', technician.id)
            .order('priority', { ascending: true });
          
          return {
            ...technician,
            service_zones: serviceZones || []
          };
        })
      );
      
      return res.status(200).json(techniciansWithZones);
    }
    
    return res.status(200).json(filteredTechnicians);
  } catch (error) {
    logger.error('Unexpected error in technicians API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Handle POST request to create a technician
 */
async function handleCreateTechnician(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { body } = req;
    
    // Validate required fields
    const requiredFields = ['full_name', 'whatsapp_number'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }
    
    // Prepare technician data with defaults
    const technicianData = {
      full_name: body.full_name,
      whatsapp_number: body.whatsapp_number,
      whatsapp_capable: body.whatsapp_capable ?? true,
      current_status: body.current_status || 'available',
      is_active: body.is_active ?? true,
      email: body.email || null,
      phone: body.phone || null,
      specializations: body.specializations || ['mobile', 'laptop'],
      hourly_rate: body.hourly_rate || 25.00,
      max_daily_appointments: body.max_daily_appointments || 100,
      notes: body.notes || null,
      experience_years: body.experience_years || 1,
      rating: body.rating || 5.00,
      total_bookings_completed: body.total_bookings_completed || 0
    };
    
    // Use service role client to bypass RLS for admin operations
    const supabaseAdmin = getServiceSupabase();
    
    // Insert into database
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .insert([technicianData])
      .select()
      .single();
    
    if (error) {
      logger.error('Error creating technician:', error);
      return res.status(500).json({ error: 'Failed to create technician' });
    }
    
    return res.status(201).json(data);
  } catch (error) {
    logger.error('Unexpected error in create technician API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Handle PUT request to update a technician
 */
async function handleUpdateTechnician(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { body } = req;
    
    if (!id) {
      return res.status(400).json({ error: 'Technician ID is required' });
    }
    
    // Use service role client to bypass RLS for admin operations
    const supabaseAdmin = getServiceSupabase();
    
    // Validate technician exists
    const { data: existingTech, error: fetchError } = await supabaseAdmin
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingTech) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Prepare update data (only include fields that are provided)
    const updateData: any = {};
    
    // Updateable fields
    const updateableFields = [
      'full_name', 'whatsapp_number', 'whatsapp_capable', 'current_status',
      'is_active', 'email', 'phone', 'specializations', 'hourly_rate',
      'max_daily_appointments', 'notes', 'experience_years', 'rating'
    ];
    
    updateableFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });
    
    // Update the technician
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      logger.error('Error updating technician:', error);
      return res.status(500).json({ error: 'Failed to update technician' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Unexpected error in update technician API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Wrap the handler with admin authentication
export default requireAdminAuth(handler);