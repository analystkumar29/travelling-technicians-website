import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('bookings/reference/[reference]');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;

    apiLogger.info('Finding booking by reference', { reference });

    if (!reference || Array.isArray(reference)) {
      apiLogger.warn('Invalid reference format', { reference });
      return res.status(400).json({ 
        success: false, 
        message: 'Valid reference number is required'
      });
    }

    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
    // Fetch booking by reference number - return raw data without normalization
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
        details: error
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
        details: error.message,
        error: error
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
    
    // Return the raw booking data without normalization
    // This avoids any potential errors in the normalizeBookingData function
    return res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    apiLogger.error('Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 