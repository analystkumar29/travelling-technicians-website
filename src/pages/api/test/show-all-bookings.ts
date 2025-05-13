import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('test/show-all-bookings');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    apiLogger.info('Fetching all bookings');
    
    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
    // Try using both methods to fetch bookings
    
    // 1. Standard Supabase query
    const { data: standardData, error: standardError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 2. Direct SQL query as a backup
    const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT * FROM bookings
        ORDER BY created_at DESC;
      `
    });
    
    // 3. Check if the table exists and get its structure
    const { data: tableData, error: tableError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'bookings'
        ORDER BY ordinal_position;
      `
    });
    
    // Prepare the response
    const response = {
      success: true,
      standardQuery: {
        success: !standardError,
        count: standardData ? standardData.length : 0,
        error: standardError ? standardError.message : null,
        bookings: standardData || []
      },
      sqlQuery: {
        success: !sqlError,
        count: sqlData && sqlData.rows ? sqlData.rows.length : 0,
        error: sqlError ? sqlError.message : null,
        bookings: sqlData && sqlData.rows ? sqlData.rows : []
      },
      tableStructure: {
        success: !tableError,
        error: tableError ? tableError.message : null,
        columns: tableData && tableData.rows ? tableData.rows : []
      }
    };
    
    // Log the results
    apiLogger.info('Bookings fetch results', {
      standardSuccess: !standardError,
      standardCount: standardData ? standardData.length : 0,
      sqlSuccess: !sqlError,
      sqlCount: sqlData && sqlData.rows ? sqlData.rows.length : 0,
      tableSuccess: !tableError,
      columnCount: tableData && tableData.rows ? tableData.rows.length : 0
    });
    
    return res.status(200).json(response);
  } catch (error) {
    // Handle unexpected errors
    apiLogger.error('Unexpected error fetching all bookings', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      success: false,
      message: 'Server error fetching all bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 