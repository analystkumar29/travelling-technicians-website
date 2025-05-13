import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('test/fetch-booking');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    // Extract reference number from query
    const { reference } = req.query;
    
    if (!reference || typeof reference !== 'string') {
      apiLogger.warn('Missing reference number in request');
      return res.status(400).json({
        success: false,
        message: 'Reference number is required'
      });
    }
    
    apiLogger.info('Fetching booking by reference', { reference });
    
    // Get Supabase client
    const supabase = getServiceSupabase();
    
    // Fetch the booking by reference number
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', reference)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        apiLogger.info('No booking found with reference', { reference });
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      apiLogger.error('Error fetching booking', {
        error: error.message,
        code: error.code,
        details: error.details
      });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch booking',
        error: error.message
      });
    }
    
    if (!data) {
      apiLogger.info('No booking found with reference', { reference });
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    apiLogger.info('Booking fetched successfully', { reference });
    
    // Return the booking data
    return res.status(200).json({
      success: true,
      message: 'Booking fetched successfully',
      data: data
    });
  } catch (error) {
    apiLogger.error('Unexpected error fetching booking', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return res.status(500).json({
      success: false,
      message: 'Server error during booking fetch',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 