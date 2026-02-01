import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';

// Helper function to generate a unique reference code
function generateReferenceCode(): string {
  const prefix = 'TT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Creating test booking...');

    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
    // Generate a unique reference
    const reference = generateReferenceCode();
    
    // Create test booking data with ALL required fields
    const bookingData = {
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '123-456-7890',
      device_type: 'mobile',
      device_brand: 'Test Brand',
      device_model: 'Test Model',
      issue_description: 'Test booking created via API',
      service_type: 'screen',
      address: '123 Test Street, Vancouver',  // Required field that was missing before
      postal_code: 'V6B 1S5',                 // Required field that was missing before
      booking_date: new Date().toISOString().split('T')[0], // Today's date
      booking_time: '09-11',
      status: 'pending',
      booking_ref: reference,
    };
    
    console.log('Attempting to insert test booking:', bookingData);
    
    // Insert the booking
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();
      
    if (error) {
      console.error('Error creating test booking:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error 
      });
    }
    
    console.log('Test booking created successfully:', data);
    
    return res.status(200).json({
      success: true,
      message: 'Test booking created successfully',
      booking: data && data.length > 0 ? data[0] : bookingData
    });
  } catch (error) {
    console.error('Unexpected error creating test booking:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 