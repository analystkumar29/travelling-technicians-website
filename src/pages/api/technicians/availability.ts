import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import logger from '@/utils/logger';

/**
 * API handler for technician availability
 * GET - Retrieve availability for a technician
 * POST - Set availability for a technician
 * PUT - Update availability
 * DELETE - Remove availability
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetAvailability(req, res);
    case 'POST':
      return handleCreateAvailability(req, res);
    case 'PUT':
      return handleUpdateAvailability(req, res);
    case 'DELETE':
      return handleDeleteAvailability(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

/**
 * Handle GET request to retrieve availability
 */
async function handleGetAvailability(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { technician_id, day_of_week } = req.query;
    
    if (!technician_id) {
      return res.status(400).json({ 
        error: 'Technician ID is required' 
      });
    }
    
    let query = supabase
      .from('technician_availability')
      .select('*')
      .eq('technician_id', technician_id);
    
    if (day_of_week !== undefined) {
      query = query.eq('day_of_week', parseInt(day_of_week as string));
    }
    
    query = query.order('day_of_week', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('Error fetching availability:', error);
      return res.status(500).json({ error: 'Failed to fetch availability' });
    }
    
    return res.status(200).json(data || []);
  } catch (error) {
    logger.error('Unexpected error in availability API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Handle POST request to create availability
 */
async function handleCreateAvailability(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { body } = req;
    
    // Validate required fields
    const requiredFields = ['technician_id', 'day_of_week', 'start_time', 'end_time'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }
    
    // Validate day_of_week
    const dayOfWeek = parseInt(body.day_of_week);
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ 
        error: 'day_of_week must be between 0 (Sunday) and 6 (Saturday)' 
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
    
    // Check if availability already exists for this day
    const { data: existingAvailability } = await supabase
      .from('technician_availability')
      .select('id')
      .eq('technician_id', body.technician_id)
      .eq('day_of_week', dayOfWeek)
      .single();
    
    if (existingAvailability) {
      return res.status(409).json({ 
        error: 'Availability already exists for this day. Use PUT to update.' 
      });
    }
    
    // Prepare availability data
    const availabilityData = {
      technician_id: body.technician_id,
      day_of_week: dayOfWeek,
      start_time: body.start_time,
      end_time: body.end_time,
      is_available: body.is_available ?? true
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('technician_availability')
      .insert([availabilityData])
      .select()
      .single();
    
    if (error) {
      logger.error('Error creating availability:', error);
      return res.status(500).json({ error: 'Failed to create availability' });
    }
    
    return res.status(201).json(data);
  } catch (error) {
    logger.error('Unexpected error in create availability API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Handle PUT request to update availability
 */
async function handleUpdateAvailability(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { body } = req;
    
    if (!id) {
      return res.status(400).json({ error: 'Availability ID is required' });
    }
    
    // Check if availability exists
    const { data: existingAvailability, error: fetchError } = await supabase
      .from('technician_availability')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingAvailability) {
      return res.status(404).json({ error: 'Availability not found' });
    }
    
    // Prepare update data
    const updateData: any = {};
    
    // Updateable fields
    const updateableFields = ['start_time', 'end_time', 'is_available'];
    updateableFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });
    
    // Update the availability
    const { data, error } = await supabase
      .from('technician_availability')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      logger.error('Error updating availability:', error);
      return res.status(500).json({ error: 'Failed to update availability' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Unexpected error in update availability API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Handle DELETE request to remove availability
 */
async function handleDeleteAvailability(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Availability ID is required' });
    }
    
    // Check if availability exists
    const { data: existingAvailability, error: fetchError } = await supabase
      .from('technician_availability')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingAvailability) {
      return res.status(404).json({ error: 'Availability not found' });
    }
    
    // Delete the availability
    const { error } = await supabase
      .from('technician_availability')
      .delete()
      .eq('id', id);
    
    if (error) {
      logger.error('Error deleting availability:', error);
      return res.status(500).json({ error: 'Failed to delete availability' });
    }
    
    return res.status(200).json({ success: true, message: 'Availability deleted successfully' });
  } catch (error) {
    logger.error('Unexpected error in delete availability API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Export the handler directly
export default handler;