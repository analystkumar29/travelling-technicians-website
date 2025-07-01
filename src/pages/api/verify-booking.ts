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
    
    // Get booking from database
    const supabase = getServiceSupabase();
    const { data: booking, error: findError } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', reference)
      .single();
      
    if (findError || !booking) {
      verifyLogger.warn('Booking not found', {
        reference,
        error: findError?.message
      });
      
      return res.status(400).json({
        success: false,
        message: 'Booking not found. Please check your reference number.'
      });
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
      .eq('reference_number', reference)
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
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Booking verified successfully!',
      booking: updatedBooking
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