import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import logger from '@/utils/logger';

/**
 * API handler for technician service zones
 * GET - Retrieve service zones for a technician or location
 * POST - Add a service zone for a technician
 * DELETE - Remove a service zone
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetServiceZones(req, res);
    case 'POST':
      return handleCreateServiceZone(req, res);
    case 'DELETE':
      return handleDeleteServiceZone(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

/**
 * Handle GET request to retrieve service zones
 */
async function handleGetServiceZones(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { technician_id, location_id } = req.query;
    
    if (!technician_id && !location_id) {
      return res.status(400).json({ 
        error: 'Either technician_id or location_id is required' 
      });
    }
    
    let query = supabase
      .from('technician_service_zones')
      .select(`
        *,
        technician:technicians(*),
        location:service_locations(*)
      `);
    
    if (technician_id) {
      query = query.eq('technician_id', technician_id);
    }
    
    if (location_id) {
      query = query.eq('location_id', location_id);
    }
    
    query = query.order('priority', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('Error fetching service zones:', error);
      return res.status(500).json({ error: 'Failed to fetch service zones' });
    }
    
    return res.status(200).json(data || []);
  } catch (error) {
    logger.error('Unexpected error in service zones API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Handle POST request to create a service zone
 */
async function handleCreateServiceZone(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { body } = req;
    
    // Validate required fields
    const requiredFields = ['technician_id', 'location_id'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }
    
    // Check if technician exists
    const { data: technician, error: techError } = await supabase
      .from('technicians')
      .select('id')
      .eq('id', body.technician_id)
      .single();
    
    if (techError || !technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Check if location exists
    const { data: location, error: locError } = await supabase
      .from('service_locations')
      .select('id')
      .eq('id', body.location_id)
      .single();
    
    if (locError || !location) {
      return res.status(404).json({ error: 'Service location not found' });
    }
    
    // Check if service zone already exists
    const { data: existingZone } = await supabase
      .from('technician_service_zones')
      .select('id')
      .eq('technician_id', body.technician_id)
      .eq('location_id', body.location_id)
      .single();
    
    if (existingZone) {
      return res.status(409).json({ error: 'Service zone already exists for this technician and location' });
    }
    
    // Prepare service zone data with defaults
    const serviceZoneData = {
      technician_id: body.technician_id,
      location_id: body.location_id,
      priority: body.priority || 1,
      is_primary: body.is_primary || false,
      travel_time_minutes: body.travel_time_minutes || null,
      service_fee_adjustment: body.service_fee_adjustment || 0.00
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('technician_service_zones')
      .insert([serviceZoneData])
      .select(`
        *,
        technician:technicians(*),
        location:service_locations(*)
      `)
      .single();
    
    if (error) {
      logger.error('Error creating service zone:', error);
      return res.status(500).json({ error: 'Failed to create service zone' });
    }
    
    return res.status(201).json(data);
  } catch (error) {
    logger.error('Unexpected error in create service zone API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Handle DELETE request to remove a service zone
 */
async function handleDeleteServiceZone(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Service zone ID is required' });
    }
    
    // Check if service zone exists
    const { data: existingZone, error: fetchError } = await supabase
      .from('technician_service_zones')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingZone) {
      return res.status(404).json({ error: 'Service zone not found' });
    }
    
    // Delete the service zone
    const { error } = await supabase
      .from('technician_service_zones')
      .delete()
      .eq('id', id);
    
    if (error) {
      logger.error('Error deleting service zone:', error);
      return res.status(500).json({ error: 'Failed to delete service zone' });
    }
    
    return res.status(200).json({ success: true, message: 'Service zone deleted successfully' });
  } catch (error) {
    logger.error('Unexpected error in delete service zone API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Export the handler directly
export default handler;