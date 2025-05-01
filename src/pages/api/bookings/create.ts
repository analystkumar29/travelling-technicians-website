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

    // Validate required fields
    if (!deviceType || !serviceType || !appointmentDate || !appointmentTime || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a reference if one wasn't provided
    const reference = bookingReference || generateReferenceCode();

    // Get Supabase client with service role
    const supabase = getServiceSupabase();

    // Insert the booking into the database
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          device_type: deviceType,
          device_brand: brand,
          device_model: model,
          issue_description: issueDescription || '',
          service_type: serviceType,
          address: address,
          postal_code: postalCode,
          booking_date: appointmentDate,
          booking_time: appointmentTime,
          status: 'pending',
          reference_number: reference,
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      booking: data[0],
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create booking' 
    });
  }
} 