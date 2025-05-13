import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('test/verify-booking');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get the reference from the query
    const { reference } = req.query;
    
    if (!reference || Array.isArray(reference)) {
      apiLogger.warn('Invalid reference format', { reference });
      return res.status(400).json({
        success: false,
        message: 'Valid reference number is required'
      });
    }
    
    apiLogger.info('Verifying booking existence', { reference });
    
    // First check: standard Supabase query
    const supabase = getServiceSupabase();
    
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', reference)
      .single();
    
    if (bookingError) {
      apiLogger.warn('Error fetching booking via standard query', {
        reference,
        error: bookingError.message,
        code: bookingError.code
      });
      
      // If not found with standard query, try direct SQL
      apiLogger.info('Trying direct SQL query as fallback');
      
      const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT * FROM bookings 
          WHERE reference_number = '${reference.replace(/'/g, "''")}' 
          LIMIT 1;
        `
      });
      
      if (sqlError) {
        apiLogger.error('SQL error during verification', {
          error: sqlError.message,
          details: sqlError
        });
        
        return res.status(500).json({
          success: false,
          message: 'Database error during verification',
          error: sqlError.message
        });
      }
      
      if (!sqlData || !sqlData.rows || sqlData.rows.length === 0) {
        apiLogger.warn('Booking not found via SQL query', { reference });
        
        // Do one more check: list all bookings
        const { data: allData, error: allError } = await supabase.rpc('execute_sql', {
          sql_query: `
            SELECT reference_number, created_at, customer_name 
            FROM bookings
            ORDER BY created_at DESC
            LIMIT 10;
          `
        });
        
        if (!allError && allData && allData.rows) {
          apiLogger.info('Found recent bookings', {
            count: allData.rows.length,
            references: allData.rows.map((r: { reference_number: string; created_at: string; customer_name: string; }) => r.reference_number)
          });
          
          return res.status(404).json({
            success: false,
            message: 'Booking not found',
            recentBookings: allData.rows
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Booking not found',
            recentBookingsError: allError ? allError.message : 'No data'
          });
        }
      }
      
      // Success via SQL query
      apiLogger.info('Booking found via SQL query', {
        reference,
        id: sqlData.rows[0].id
      });
      
      return res.status(200).json({
        success: true,
        message: 'Booking found via SQL query',
        booking: sqlData.rows[0],
        queryMethod: 'sql'
      });
    }
    
    // Success via standard query
    apiLogger.info('Booking found via standard query', {
      reference,
      id: bookingData.id
    });
    
    return res.status(200).json({
      success: true,
      message: 'Booking found via standard query',
      booking: bookingData,
      queryMethod: 'standard'
    });
  } catch (error) {
    // Handle unexpected errors
    apiLogger.error('Unexpected error during booking verification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      success: false,
      message: 'Server error during booking verification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 