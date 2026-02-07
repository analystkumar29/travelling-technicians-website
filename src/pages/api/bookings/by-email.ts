import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

// Create a module logger
const emailBookingsLogger = logger.createModuleLogger('api/bookings/by-email');

// Ensure required environment variables are set
const VERIFICATION_SECRET = process.env.BOOKING_VERIFICATION_SECRET;

if (!VERIFICATION_SECRET) {
  throw new Error('BOOKING_VERIFICATION_SECRET environment variable is required');
}

const SECRET: string = VERIFICATION_SECRET;

// Function to verify original booking verification token (checks today + last 7 days)
function verifyBookingToken(token: string, email: string, reference: string): boolean {
  try {
    // Check today and the last 7 days to match verify-booking.ts logic
    for (let i = 0; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const data = `${email.toLowerCase()}:${reference}:${dateStr}`;
      const expectedToken = crypto
        .createHmac('sha256', SECRET)
        .update(data)
        .digest('hex');

      if (token === expectedToken) {
        return true;
      }
    }
    return false;
  } catch (error) {
    emailBookingsLogger.error('Error verifying booking token', error);
    return false;
  }
}

// Note: Email access is verified using the original booking verification token

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, verificationToken, verificationReference } = req.body;

    // Validate inputs
    if (!email || !verificationToken || !verificationReference) {
      emailBookingsLogger.warn('Missing required fields', { 
        hasEmail: !!email, 
        hasToken: !!verificationToken, 
        hasReference: !!verificationReference 
      });
      return res.status(400).json({
        success: false,
        message: 'Email, verification token, and reference are required'
      });
    }

    // Verify the original booking verification token
    if (!verifyBookingToken(verificationToken, email, verificationReference)) {
      emailBookingsLogger.warn('Invalid verification token', { 
        email: email.substring(0, 3) + '***',
        reference: verificationReference
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    emailBookingsLogger.info('Fetching bookings for verified email', { 
      email: email.substring(0, 3) + '***' 
    });

    // Get all bookings for this email with full relationships
    const supabase = getServiceSupabase();
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        technicians:technician_id (
          id,
          full_name,
          whatsapp_number,
          phone,
          email,
          current_status
        ),
        services:service_id (
          id,
          name,
          display_name,
          description
        ),
        device_models:model_id (
          id,
          name,
          display_name,
          brands!inner (
            id,
            name,
            display_name
          )
        ),
        service_locations:location_id (
          id,
          city_name,
          local_phone
        )
      `)
      .eq('customer_email', email.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      emailBookingsLogger.error('Database error fetching bookings', {
        error: error.message,
        code: error.code
      });
      return res.status(500).json({
        success: false,
        message: 'Error fetching your bookings'
      });
    }

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No bookings found for this email address'
      });
    }

    emailBookingsLogger.info('Successfully fetched bookings', { 
      email: email.substring(0, 3) + '***',
      count: bookings.length 
    });

    // Transform bookings to match the structure expected by the component
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      booking_ref: booking.booking_ref,
      reference_number: booking.booking_ref, // For backward compatibility
      quoted_price: booking.quoted_price,
      scheduled_at: booking.scheduled_at,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_address: booking.customer_address,
      address: booking.address,
      status: booking.status,
      created_at: booking.created_at,
      issue_description: booking.issue_description,
      // Transform nested objects to match component expectations
      technician: booking.technicians ? {
        assigned: true,
        name: booking.technicians.full_name,
        whatsapp: booking.technicians.whatsapp_number,
        phone: booking.technicians.phone,
        email: booking.technicians.email,
        status: booking.technicians.current_status
      } : {
        assigned: false,
        message: 'Your technician will be assigned soon. We\'ll notify you when assigned.',
        next_steps: 'Our team will contact you to confirm technician assignment.'
      },
      service: booking.services ? {
        name: booking.services.display_name || booking.services.name,
        description: booking.services.description
      } : null,
      device: booking.device_models ? {
        model: booking.device_models.display_name || booking.device_models.name,
        brand: booking.device_models.brands?.display_name || booking.device_models.brands?.name || 'Unknown'
      } : null,
      location: booking.service_locations ? {
        city: booking.service_locations.city_name,
        local_phone: booking.service_locations.local_phone
      } : null
    }));

    return res.status(200).json({
      success: true,
      bookings: formattedBookings,
      count: formattedBookings.length
    });

  } catch (error) {
    emailBookingsLogger.error('Unhandled error fetching bookings by email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your bookings'
    });
  }
} 