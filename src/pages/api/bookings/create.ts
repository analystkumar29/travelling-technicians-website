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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the request for debugging
    console.log('Booking create request received:', { 
      body: req.body,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'URL exists' : 'URL missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service key exists' : 'Service key missing'
    });

    const {
      bookingReference,
      deviceType,
      brand,
      model,
      serviceType,
      issueDescription,
      address,
      postalCode,
      appointmentDate,
      appointmentTime,
      customerName,
      customerPhone,
      customerEmail,
    } = req.body;

    // Validate ALL required fields according to database constraints
    if (!deviceType || !serviceType || !appointmentDate || !appointmentTime || 
        !customerEmail || !customerName || !customerPhone || !address || !postalCode) {
      console.error('Missing required fields:', {
        deviceType: !!deviceType,
        serviceType: !!serviceType,
        appointmentDate: !!appointmentDate,
        appointmentTime: !!appointmentTime,
        customerEmail: !!customerEmail,
        customerName: !!customerName,
        customerPhone: !!customerPhone,
        address: !!address,
        postalCode: !!postalCode
      });
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields: {
          deviceType: !deviceType,
          serviceType: !serviceType,
          appointmentDate: !appointmentDate,
          appointmentTime: !appointmentTime,
          customerEmail: !customerEmail,
          customerName: !customerName,
          customerPhone: !customerPhone,
          address: !address,
          postalCode: !postalCode
        }
      });
    }

    // Create a reference if one wasn't provided
    const reference = bookingReference || generateReferenceCode();

    // Get Supabase client with service role
    const supabase = getServiceSupabase();

    // Prepare booking data with default values for required fields
    const bookingData = {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      device_type: deviceType,
      device_brand: brand || 'Not specified',
      device_model: model || 'Not specified',
      issue_description: issueDescription || '',
      service_type: serviceType,
      address: address,
      postal_code: postalCode,
      booking_date: appointmentDate,
      booking_time: appointmentTime,
      status: 'pending',
      reference_number: reference,
    };

    console.log('Attempting to insert booking data:', bookingData);

    // Insert the booking into the database
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();

    if (error) {
      console.error('Supabase insertion error:', error);
      throw error;
    }

    console.log('Booking created successfully:', data);

    return res.status(201).json({
      success: true,
      booking: data && data.length > 0 ? data[0] : {
        ...bookingData,
        id: 'generated-id',
        created_at: new Date().toISOString()
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Return more detailed error information
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking',
      details: error instanceof Error ? error.stack : undefined
    });
  }
} 