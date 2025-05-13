import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { normalizeBookingData } from '@/services/transformers/bookingTransformer';

// Create module logger
const apiLogger = logger.createModuleLogger('bookings/fetchAll');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    apiLogger.info('Fetching all bookings');

    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
    // Fetch all bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      apiLogger.error('Error fetching bookings', {
        error: error.message,
        code: error.code
      });
      
      return res.status(500).json({
        success: false,
        message: 'Database error',
        details: error.message
      });
    }
    
    apiLogger.info(`Found ${bookings?.length || 0} bookings`);
    
    // Normalize the bookings data for the frontend
    const normalizedBookings = bookings?.map(normalizeBookingData) || [];
    
    return res.status(200).json({
      success: true,
      bookings: normalizedBookings
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