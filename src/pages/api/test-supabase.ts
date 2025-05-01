import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint is for testing the Supabase connection and booking creation
  try {
    console.log('Testing Supabase connection...');

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', {
        url: !!supabaseUrl,
        key: !!serviceRoleKey
      });
      
      return res.status(500).json({
        success: false,
        error: 'Missing environment variables',
        details: {
          url: !!supabaseUrl,
          key: !!serviceRoleKey
        }
      });
    }

    // Get Supabase client with service role
    const supabase = getServiceSupabase();

    // 1. First try a simple query to check connection
    console.log('Checking table existence...');
    const { data: tableData, error: tableError } = await supabase
      .from('bookings')
      .select('count(*)', { count: 'exact', head: true });

    if (tableError) {
      console.error('Error checking table:', tableError);
      return res.status(500).json({
        success: false,
        error: 'Failed to connect to Supabase or table not found',
        details: tableError
      });
    }

    // 2. Try inserting a test booking
    console.log('Attempting to insert test booking...');
    const testReference = `TEST-${Date.now()}`;
    
    const { data: insertData, error: insertError } = await supabase
      .from('bookings')
      .insert([
        {
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          customer_phone: '123-456-7890',
          device_type: 'mobile',
          device_brand: 'Test Brand',
          device_model: 'Test Model',
          issue_description: 'Test insertion',
          service_type: 'test',
          address: 'Test Address',
          postal_code: 'T3ST',
          booking_date: new Date().toISOString().split('T')[0],
          booking_time: '09-11',
          status: 'pending',
          reference_number: testReference,
        }
      ])
      .select();

    if (insertError) {
      console.error('Error inserting test booking:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to insert test booking',
        details: insertError
      });
    }

    // 3. Verify the insertion
    console.log('Verifying test booking insertion...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', testReference)
      .single();

    if (verifyError) {
      console.error('Error verifying test booking:', verifyError);
    }

    // Return results
    return res.status(200).json({
      success: true,
      message: 'Supabase connection test complete',
      tableCheck: { success: !tableError, data: tableData },
      insertion: { success: !insertError, data: insertData },
      verification: { 
        success: !verifyError, 
        found: !!verifyData,
        data: verifyData 
      }
    });
  } catch (error) {
    console.error('Unexpected error during test:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 