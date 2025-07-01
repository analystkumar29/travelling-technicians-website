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

// Function to verify original booking verification token
function verifyBookingToken(token: string, email: string, reference: string): boolean {
  try {
    // Use the same token generation logic as the original verification
    const today = new Date().toISOString().split('T')[0];
    const data = `${email.toLowerCase()}:${reference}:${today}`;
    const expectedToken = crypto
      .createHmac('sha256', VERIFICATION_SECRET)
      .update(data)
      .digest('hex');
    
    return token === expectedToken;
  } catch (error) {
    emailBookingsLogger.error('Error verifying booking token', error);
    return false;
  }
}

// Function to generate email access token
export function generateEmailAccessToken(email: string): string {
  const today = new Date().toISOString().split('T')[0];
  return crypto
    .createHmac('sha256', VERIFICATION_SECRET)
    .update(`${email.toLowerCase()}:email-access:${today}`)
    .digest('hex');
}

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

    // Get all bookings for this email
    const supabase = getServiceSupabase();
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
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

    // Return bookings with formatted data
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      reference_number: booking.reference_number,
      device_type: booking.device_type,
      device_brand: booking.device_brand,
      device_model: booking.device_model,
      service_type: booking.service_type,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      address: booking.address,
      status: booking.status,
      created_at: booking.created_at,
      issue_description: booking.issue_description
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