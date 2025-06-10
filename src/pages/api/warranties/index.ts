import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import logger from '@/utils/logger';

/**
 * API handler for warranties endpoint
 * GET - Retrieve a list of warranties (with filtering)
 * POST - Create a new warranty manually
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetWarranties(req, res);
    case 'POST':
      return handleCreateWarranty(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

/**
 * Handle GET request to retrieve warranties with optional filtering
 */
async function handleGetWarranties(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      warranty_code, 
      booking_id, 
      status, 
      technician_id,
      customer_email,
      active_only
    } = req.query;
    
    // Start building the query with joins for related data
    let query = supabase
      .from('warranties')
      .select(`
        *,
        booking:booking_id (
          reference_number,
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
        )
      `);
    
    // Apply filters
    if (warranty_code) {
      query = query.eq('warranty_code', warranty_code);
    }
    
    if (booking_id) {
      query = query.eq('booking_id', booking_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (technician_id) {
      query = query.eq('technician_id', technician_id);
    }
    
    if (active_only === 'true') {
      query = query.eq('status', 'active');
    }
    
    // If customer email is provided, we need a more complex query
    if (customer_email) {
      // First get the booking IDs for this customer
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_email', customer_email);
      
      if (bookingError) {
        logger.error('Error fetching bookings by email:', bookingError);
        return res.status(500).json({ error: 'Failed to fetch warranties' });
      }
      
      if (bookings && bookings.length > 0) {
        const bookingIds = bookings.map(b => b.id);
        query = query.in('booking_id', bookingIds);
      } else {
        // No bookings found for this email, return empty array
        return res.status(200).json([]);
      }
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      logger.error('Error fetching warranties:', error);
      return res.status(500).json({ error: 'Failed to fetch warranties' });
    }
    
    // Add days_remaining for each warranty
    const now = new Date();
    const processedData = data.map(warranty => {
      const expiryDate = new Date(warranty.expiry_date);
      const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      return {
        ...warranty,
        days_remaining: daysRemaining
      };
    });
    
    return res.status(200).json(processedData);
  } catch (error) {
    logger.error('Unexpected error in warranties API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Handle POST request to create a warranty manually
 * Note: Normally warranties are created automatically via trigger
 */
async function handleCreateWarranty(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { body } = req;
    
    // Validate required fields
    const requiredFields = [
      'booking_id', 
      'repair_completion_id', 
      'technician_id', 
      'warranty_code',
      'issue_date',
      'expiry_date',
      'status'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }
    
    // Insert into database
    const { data, error } = await supabase
      .from('warranties')
      .insert([body])
      .select();
    
    if (error) {
      logger.error('Error creating warranty:', error);
      return res.status(500).json({ error: 'Failed to create warranty' });
    }
    
    return res.status(201).json(data[0]);
  } catch (error) {
    logger.error('Unexpected error in create warranty API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Export the handler directly
export default handler; 