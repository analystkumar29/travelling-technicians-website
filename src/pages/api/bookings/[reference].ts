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
    
    // Fetch booking by reference number
    apiLogger.info('Executing database query', { reference });
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', reference)
      .single();
    
    if (error) {
      apiLogger.error('Error finding booking', {
        reference,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          message: 'Booking not found'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Database error',
        details: error.message
      });
    }
    
    if (!booking) {
      apiLogger.warn('Booking not found', { reference });
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
    
    // Normalize the booking data for the frontend
    const normalizedBooking = normalizeBookingData(booking);
    
    return res.status(200).json(normalizedBooking);
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