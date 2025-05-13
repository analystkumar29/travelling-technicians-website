import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('test/create-booking-direct');

// Function to generate a reference number
function generateReferenceNumber(): string {
  const prefix = 'TTR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Extract data from request body
    const data = req.body;
    
    // Generate a reference number if not provided
    const referenceNumber = data.reference_number || generateReferenceNumber();
    
    // Log incoming data (omitting sensitive info)
    apiLogger.info('Received direct booking creation request', {
      reference: referenceNumber,
      deviceType: data.deviceType || data.device_type
    });
    
    // Create a simplified booking object with just the fields in the database schema
    // IMPORTANT: Only include fields that actually exist in the database
    const bookingData = {
      reference_number: referenceNumber,
      device_type: data.device_type || data.deviceType || 'mobile',
      device_brand: data.device_brand || data.deviceBrand || null,
      device_model: data.device_model || data.deviceModel || null,
      service_type: data.service_type || data.serviceType || 'screen_replacement',
      booking_date: data.booking_date || data.appointmentDate || new Date().toISOString().split('T')[0],
      booking_time: data.booking_time || data.appointmentTime || '09-11',
      customer_name: data.customer_name || data.customerName || 'Test Customer',
      customer_email: data.customer_email || data.customerEmail || 'test@example.com',
      customer_phone: data.customer_phone || data.customerPhone || '5551234567',
      address: data.address || '123 Test Street',
      postal_code: data.postal_code || data.postalCode || 'V6B 1S5',
      issue_description: data.issue_description || data.issueDescription || null,
      status: 'pending',
      
      // Only include these fields if they definitely exist in the database schema
      ...(data.city ? { city: data.city } : {}),
      ...(data.province ? { province: data.province } : {}),
    };
    
    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
    // First, log what we're inserting
    apiLogger.info('Inserting booking with data', {
      reference: referenceNumber,
      fields: Object.keys(bookingData)
    });
    
    // Use direct SQL to bypass triggers that might be causing issues
    apiLogger.info('Trying direct SQL insert to bypass triggers');
    
    // Convert booking data to SQL values
    const columns = Object.keys(bookingData).join(', ');
    const placeholders = Object.keys(bookingData).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(bookingData);
    
    const query = `
      INSERT INTO bookings (${columns})
      VALUES (${placeholders})
      RETURNING *;
    `;
    
    const { data: sqlResult, error: sqlError } = await supabase.rpc('execute_sql', {
      sql_query: query,
      params: values
    });
    
    if (sqlError) {
      apiLogger.error('SQL error during direct insertion', {
        error: sqlError.message,
        details: sqlError
      });
      
      // Fall back to standard insert if SQL approach fails
      apiLogger.info('Falling back to standard insert API');
      const { data: insertedBooking, error: insertError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
      
      if (insertError) {
        apiLogger.error('Database error during booking creation', {
          error: insertError.message,
          details: insertError
        });
        
        return res.status(500).json({
          success: false,
          message: 'Database error during booking creation',
          error: insertError.message,
          details: insertError
        });
      }
      
      if (!insertedBooking) {
        apiLogger.error('No booking returned after insertion');
        return res.status(500).json({
          success: false,
          message: 'No booking data returned after insertion'
        });
      }
      
      apiLogger.info('Booking created successfully via standard insertion', {
        id: insertedBooking.id,
        reference: insertedBooking.reference_number
      });
      
      return res.status(201).json({
        success: true,
        message: 'Booking created successfully via standard insertion',
        booking: insertedBooking,
        booking_reference: insertedBooking.reference_number
      });
    }
    
    // Process SQL result
    if (!sqlResult || !sqlResult.rows || sqlResult.rows.length === 0) {
      apiLogger.error('No booking returned after SQL insertion');
      return res.status(500).json({
        success: false,
        message: 'No booking data returned after SQL insertion'
      });
    }
    
    const insertedSqlBooking = sqlResult.rows[0];
    apiLogger.info('Booking created successfully via SQL insertion', {
      id: insertedSqlBooking.id,
      reference: insertedSqlBooking.reference_number
    });
    
    // Return success with the created booking
    return res.status(201).json({
      success: true,
      message: 'Booking created successfully via SQL insertion',
      booking: insertedSqlBooking,
      booking_reference: insertedSqlBooking.reference_number
    });
  } catch (error) {
    // Handle unexpected errors
    apiLogger.error('Unexpected error during direct booking creation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      success: false,
      message: 'Server error during booking creation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 