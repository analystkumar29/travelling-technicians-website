import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getServiceSupabase } from '@/utils/supabaseClient';
import logger from '@/utils/logger';

/**
 * API handler for completing repairs
 * POST - Register a completed repair
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    const { body } = req;
    
    // Validate required fields
    const requiredFields = ['booking_id', 'technician_id'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }
    
    // Verify booking exists and is not already completed
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('status, repair_status')
      .eq('id', body.booking_id)
      .single();
    
    if (bookingError) {
      logger.error('Error fetching booking:', bookingError);
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (bookingData.status === 'completed' || bookingData.repair_status === 'completed') {
      return res.status(400).json({ error: 'This booking has already been marked as completed' });
    }
    
    // Verify technician exists
    const { data: technicianData, error: technicianError } = await supabase
      .from('technicians')
      .select('id')
      .eq('id', body.technician_id)
      .single();
    
    if (technicianError) {
      logger.error('Error fetching technician:', technicianError);
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Convert parts_used and additional_services to JSONB if present
    if (body.parts_used && !Array.isArray(body.parts_used)) {
      try {
        body.parts_used = JSON.parse(body.parts_used);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid parts_used format. Must be JSON array.' });
      }
    }
    
    if (body.additional_services && !Array.isArray(body.additional_services)) {
      try {
        body.additional_services = JSON.parse(body.additional_services);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid additional_services format. Must be JSON array.' });
      }
    }
    
    // Insert repair completion record
    // Note: The database trigger will create the warranty automatically
    const repairData = {
      booking_id: body.booking_id,
      technician_id: body.technician_id,
      completed_at: body.completed_at || new Date().toISOString(),
      repair_notes: body.repair_notes,
      parts_used: body.parts_used,
      repair_duration: body.repair_duration ? parseInt(body.repair_duration.toString()) : null,
      customer_signature_url: body.customer_signature_url,
      additional_services: body.additional_services
    };
    
    const { data: completionData, error: completionError } = await supabase
      .from('repair_completions')
      .insert([repairData])
      .select();
    
    if (completionError) {
      logger.error('Error creating repair completion:', completionError);
      return res.status(500).json({ error: 'Failed to register repair completion' });
    }
    
    // Return the repair completion data along with booking and technician info
    const { data: fullData, error: fullDataError } = await supabase
      .from('repair_completions')
      .select(`
        *,
        booking:booking_id (
          booking_ref,
          customer_name,
          customer_email,
          customer_phone,
          device_type,
          device_brand,
          device_model,
          service_type
        ),
        technician:technician_id (
          full_name,
          email,
          phone
        ),
        warranty:booking_id (
          warranty_code,
          expiry_date,
          status
        )
      `)
      .eq('id', completionData[0].id)
      .single();
    
    if (fullDataError) {
      // If we can't get the full data, still return the success with basic data
      logger.warn('Error getting full repair data:', fullDataError);
      return res.status(201).json(completionData[0]);
    }
    
    return res.status(201).json(fullData);
  } catch (error) {
    console.error('Error in repair completion API:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}

// Export the handler directly
export default handler; 