import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';

// Function to generate a reference number
function generateReferenceNumber(): string {
  const prefix = 'TTR';
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

  console.log('[bookings/create] Received booking creation request');
  
  try {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[bookings/create] Missing Supabase configuration');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error',
        details: 'Missing Supabase configuration'
      });
    }

    // Extract data from request body
    const { 
      deviceType, 
      brand, 
      model, 
      serviceType, 
      appointmentDate, 
      appointmentTime, 
      bookingDate,
      bookingTime,
      customerName, 
      customerEmail, 
      customerPhone,
      address,
      postalCode,
      message
    } = req.body;

    console.log('[bookings/create] Request body:', {
      deviceType, 
      serviceType, 
      appointmentDate: appointmentDate || bookingDate, 
      appointmentTime: appointmentTime || bookingTime, 
      customerName, 
      customerEmail, 
      customerPhone,
      address,
      postalCode
    });

    // Validate required fields
    const requiredFields = { 
      deviceType, 
      serviceType, 
      appointmentOrBookingDate: appointmentDate || bookingDate, 
      appointmentOrBookingTime: appointmentTime || bookingTime, 
      customerName, 
      customerEmail, 
      customerPhone 
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      console.error('[bookings/create] Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields',
        details: { missingFields }
      });
    }

    // Validate address and postal code
    if (!address || !postalCode) {
      console.error('[bookings/create] Missing address or postal code');
      return res.status(400).json({
        success: false,
        message: 'Address and postal code are required',
        details: {
          address: !address,
          postalCode: !postalCode
        }
      });
    }

    console.log(`[bookings/create] Processing booking with postal code: ${postalCode}`);

    // Generate a reference number
    const referenceNumber = generateReferenceNumber();
    console.log(`[bookings/create] Generated reference: ${referenceNumber}`);

    // Prepare booking data
    const bookingData = {
      reference_number: referenceNumber,
      device_type: deviceType,
      device_brand: brand || null,
      device_model: model || null,
      service_type: serviceType,
      booking_date: appointmentDate || bookingDate,
      booking_time: appointmentTime || bookingTime,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      address: address,
      postal_code: postalCode,
      issue_description: message || null,
      status: 'pending'
    };

    console.log('[bookings/create] Prepared booking data:', bookingData);

    // Get Supabase client with service role
    const supabase = getServiceSupabase();

    // Insert booking into database
    console.log('[bookings/create] Inserting booking into database');
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    // Handle database errors
    if (error) {
      console.error('[bookings/create] Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        details: error.message
      });
    }

    // Return success response
    console.log('[bookings/create] Booking created successfully:', data);
    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: data
    });

  } catch (error) {
    // Handle unexpected errors
    console.error('[bookings/create] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      details: errorMessage
    });
  }
} 