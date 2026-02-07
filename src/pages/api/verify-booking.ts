import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

// Create a module logger
const verifyLogger = logger.createModuleLogger('verify-booking');

// Ensure required environment variables are set
const VERIFICATION_SECRET = process.env.BOOKING_VERIFICATION_SECRET;

if (!VERIFICATION_SECRET) {
  throw new Error('BOOKING_VERIFICATION_SECRET environment variable is required');
}

// Type assertion to help TypeScript understand the variable is defined
const SECRET: string = VERIFICATION_SECRET;

/**
 * Verify a token against a generated hash using booking reference and email
 * 
 * @param token The token to verify
 * @param email The customer email
 * @param reference The booking reference
 * @returns boolean indicating if token is valid
 */
function verifyToken(token: string, email: string, reference: string): boolean {
  try {
    // We allow verification for tokens generated on the same day
    const today = new Date().toISOString().split('T')[0];
    const expectedToken = crypto
      .createHmac('sha256', SECRET)
      .update(`${email.toLowerCase()}:${reference}:${today}`)
      .digest('hex');

    // Direct comparison for same-day token
    if (token === expectedToken) {
      return true;
    }

    // Check for tokens generated within the last 7 days (for older tokens)
    for (let i = 1; i <= 7; i++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - i);
      const pastDateStr = pastDate.toISOString().split('T')[0];
      
      const pastToken = crypto
        .createHmac('sha256', SECRET)
        .update(`${email.toLowerCase()}:${reference}:${pastDateStr}`)
        .digest('hex');

      if (token === pastToken) {
        return true;
      }
    }

    // No valid token found
    return false;
  } catch (error) {
    verifyLogger.error('Token verification error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      reference
    });
    return false;
  }
}

/**
 * API handler for verifying booking tokens and updating booking status
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    verifyLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { token, reference, email } = req.body;
    
    // Check required parameters
    if (!token || !reference || !email) {
      verifyLogger.warn('Missing required verification parameters', {
        hasToken: !!token,
        hasReference: !!reference,
        hasEmail: !!email
      });
      
      return res.status(400).json({
        success: false,
        message: 'Missing required verification parameters'
      });
    }
    
    verifyLogger.info('Processing verification request', {
      reference,
      email: email.substring(0, 3) + '***' // Log partial email for privacy
    });
    
    // Log environment check
    verifyLogger.info('Environment check', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasVerificationSecret: !!VERIFICATION_SECRET,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Get booking from database with full details including technician info
    verifyLogger.info('Getting Supabase service client');
    const supabase = getServiceSupabase();
    
    verifyLogger.info('Executing database query for verification with full details', { reference });
    
    // Use SQL query to get full booking details with LEFT JOINs
    const { data: bookingData, error: findError } = await supabase
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
      .eq('booking_ref', reference)
      .single();
      
    if (findError || !bookingData) {
      verifyLogger.warn('Booking not found', {
        reference,
        error: findError?.message,
        code: findError?.code,
        details: findError?.details,
        hint: findError?.hint
      });
      
      return res.status(400).json({
        success: false,
        message: 'Booking not found. Please check your reference number.'
      });
    }
    
    // Transform the data for cleaner response - remove final_price to avoid confusion
    const booking = {
      ...bookingData,
      // Remove final_price to avoid confusion with quoted_price
      final_price: undefined,
      technician: bookingData.technicians ? {
        assigned: true,
        name: bookingData.technicians.full_name,
        whatsapp: bookingData.technicians.whatsapp_number,
        phone: bookingData.technicians.phone,
        email: bookingData.technicians.email,
        status: bookingData.technicians.current_status
      } : {
        assigned: false,
        message: 'Your technician will be assigned soon. We\'ll notify you when assigned.',
        next_steps: 'Our team will contact you to confirm technician assignment.'
      },
      service: bookingData.services ? {
        name: bookingData.services.display_name || bookingData.services.name,
        description: bookingData.services.description
      } : null,
      device: bookingData.device_models ? {
        model: bookingData.device_models.display_name || bookingData.device_models.name,
        brand: bookingData.device_models.brands?.display_name || bookingData.device_models.brands?.name || 'Unknown'
      } : null,
      location: bookingData.service_locations ? {
        city: bookingData.service_locations.city_name,
        local_phone: bookingData.service_locations.local_phone
      } : null
    };
    
    // Remove the nested objects to avoid duplication
    delete booking.technicians;
    delete booking.services;
    delete booking.device_models;
    delete booking.service_locations;
    // Ensure final_price is not included in response
    delete booking.final_price;

    // Fetch warranty data for completed bookings
    if (bookingData.status === 'completed') {
      const { data: warrantyData } = await supabase
        .from('warranties')
        .select('warranty_number, start_date, end_date, duration_days, status')
        .eq('booking_id', bookingData.id)
        .single();
      if (warrantyData) {
        booking.warranty = warrantyData;
      }
    }

    // Verify the email matches
    if (booking.customer_email.toLowerCase() !== email.toLowerCase()) {
      verifyLogger.warn('Email mismatch during verification', {
        reference,
        providedEmail: email.substring(0, 3) + '***'
      });
      
      return res.status(400).json({
        success: false,
        message: 'The email address does not match our records.'
      });
    }
    
    // Check if booking is already verified
    if (booking.status === 'confirmed') {
      verifyLogger.info('Booking already verified', { reference });
      
      return res.status(200).json({
        success: true,
        message: 'This booking has already been verified.',
        booking
      });
    }
    
    // Verify the token
    const isTokenValid = verifyToken(token, email, reference);
    
    if (!isTokenValid) {
      verifyLogger.warn('Invalid verification token', { reference });
      
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.'
      });
    }
    
    // Update booking status to confirmed
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed'
      })
      .eq('booking_ref', reference)
      .select()
      .single();
      
    if (updateError) {
      verifyLogger.error('Error updating booking status', {
        reference,
        error: updateError.message
      });
      
      return res.status(500).json({
        success: false,
        message: 'Error updating booking status.'
      });
    }
    
    verifyLogger.info('Booking verified successfully', { reference });
    
    // Return success response with the transformed booking object (not the raw row)
    return res.status(200).json({
      success: true,
      message: 'Booking verified successfully!',
      booking: { ...booking, status: 'confirmed' }
    });
    
  } catch (error) {
    verifyLogger.error('Unhandled error in verification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred during verification.'
    });
  }
} 