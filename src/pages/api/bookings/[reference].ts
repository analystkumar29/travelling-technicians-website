import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { normalizeBookingData } from '@/services/transformers/bookingTransformer';

// Create module logger
const apiLogger = logger.createModuleLogger('bookings/[reference]');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;

    apiLogger.info('Finding booking by reference', { reference, userAgent: req.headers['user-agent'] });

    if (!reference || Array.isArray(reference)) {
      apiLogger.warn('Invalid reference format', { reference });
      return res.status(400).json({ 
        success: false, 
        message: 'Valid reference number is required'
      });
    }

    // Get Supabase client with service role
    apiLogger.info('Getting Supabase service client');
    const supabase = getServiceSupabase();
    
    // Log environment check
    apiLogger.info('Environment check', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Fetch booking by reference number - try both booking_ref and reference_number
    apiLogger.info('Executing database query', { reference });
    
    // First try booking_ref
    let { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_ref', reference)
      .single();
    
    // If not found, try reference_number as fallback
    if (error || !booking) {
      apiLogger.warn('Booking not found with booking_ref, trying reference_number', {
        reference,
        error: error?.message
      });
      
      const fallbackResult = await supabase
        .from('bookings')
        .select('*')
        .eq('reference_number', reference)
        .single();
      
      booking = fallbackResult.data;
      error = fallbackResult.error;
      
      if (fallbackResult.error || !fallbackResult.data) {
        apiLogger.error('Error finding booking with reference_number', {
          reference,
          error: fallbackResult.error?.message,
          code: fallbackResult.error?.code,
          details: fallbackResult.error?.details,
          hint: fallbackResult.error?.hint
        });
        
        if (fallbackResult.error?.code === 'PGRST116') {
          return res.status(404).json({ 
            success: false,
            message: 'Booking not found'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Database error',
          details: fallbackResult.error?.message
        });
      }
      
      apiLogger.info('Found booking using reference_number fallback', { 
        reference, 
        id: booking.id,
        customerName: booking.customer_name
      });
    } else {
      apiLogger.info('Found booking using booking_ref', { 
        reference, 
        id: booking.id,
        customerName: booking.customer_name
      });
    }
    
    if (!booking) {
      apiLogger.warn('Booking not found after all attempts', { reference });
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found'
      });
    }
    
    apiLogger.info('Found booking successfully', { 
      reference, 
      id: booking.id,
      customerName: booking.customer_name
    });
    
    // Return raw booking data for consistency with other endpoints
    return res.status(200).json({
      success: true,
      booking: booking
    });
  } catch (error) {
    apiLogger.error('Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 