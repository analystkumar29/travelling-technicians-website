import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('test/test-create-booking');

// Function to generate a reference number
function generateReferenceNumber(): string {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    // Extract data from request body
    const bookingData = req.body;
    apiLogger.info('Received test booking creation request');
    apiLogger.debug('Request body received', { ...bookingData });
    
    // Generate a reference number
    const referenceNumber = generateReferenceNumber();
    apiLogger.debug('Generated reference:', { reference: referenceNumber });
    
    // Get Supabase client
    const supabase = getServiceSupabase();
    
    // Create test booking data with only snake_case field names
    // that match the database schema (avoid camelCase fields)
    const testBookingData = {
      reference_number: referenceNumber,
      device_type: bookingData.deviceType || 'mobile',
      device_brand: bookingData.deviceBrand || bookingData.brand || 'Test Brand',
      brand: bookingData.deviceBrand || bookingData.brand || 'Test Brand',
      device_model: bookingData.deviceModel || bookingData.model || 'Test Model',
      model: bookingData.deviceModel || bookingData.model || 'Test Model',
      service_type: bookingData.serviceType || 'Screen Replacement',
      booking_date: new Date().toISOString().split('T')[0],
      booking_time: '09-11',
      customer_name: bookingData.customerName || 'John Doe',
      customer_email: 'test@example.com',
      customer_phone: '5551234567',
      address: '123 Test Street, Vancouver, BC',
      postal_code: 'V6B 1A1',
      city: 'Vancouver',
      province: 'BC',
      issue_description: 'Test booking created via API',
      status: 'pending'
    };
    
    apiLogger.info('Creating booking with direct insertion');
    
    // Insert the booking into the database
    const { data, error } = await supabase
      .from('bookings')
      .insert(testBookingData)
      .select();
    
    if (error) {
      apiLogger.error('Error creating test booking', {
        error: error.message,
        code: error.code,
        details: error.details
      });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create test booking',
        error: error.message,
        code: error.code,
        details: error.details
      });
    }
    
    apiLogger.info('Test booking created successfully', { reference: referenceNumber });
    
    // Return success with the test reference
    return res.status(200).json({
      success: true,
      message: 'Test booking created successfully',
      reference: referenceNumber,
      data: data
    });
  } catch (error) {
    apiLogger.error('Unexpected error creating test booking', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return res.status(500).json({
      success: false,
      message: 'Server error during test booking creation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 