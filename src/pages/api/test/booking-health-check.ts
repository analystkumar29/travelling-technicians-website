import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('test/booking-health-check');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    apiLogger.info('Running booking system health check');
    
    // Step 1: Check database connection
    apiLogger.info('Step 1: Checking database connection');
    const supabase = getServiceSupabase();
    
    const { data: healthData, error: healthError } = await supabase
      .from('bookings')
      .select('count()', { count: 'exact', head: true });
      
    if (healthError) {
      apiLogger.error('Database connection error', { error: healthError });
      return res.status(500).json({
        status: 'error',
        component: 'database',
        message: 'Database connection error',
        details: healthError.message
      });
    }
    
    apiLogger.info('Database connection successful');
    
    // Step 2: Check database schema
    apiLogger.info('Step 2: Checking database schema');
    const { data: schemaData, error: schemaError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'bookings'
        ORDER BY ordinal_position;
      `
    });
    
    if (schemaError) {
      // Direct query if RPC fails
      const { data: directSchemaData, error: directSchemaError } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);
        
      if (directSchemaError) {
        apiLogger.error('Schema check error', { error: directSchemaError });
        return res.status(500).json({
          status: 'error',
          component: 'schema',
          message: 'Failed to check database schema',
          details: directSchemaError.message
        });
      }
      
      // Get columns from a single row
      const columns = directSchemaData && directSchemaData.length > 0 
        ? Object.keys(directSchemaData[0]) 
        : [];
        
      apiLogger.info('Retrieved columns via direct query', { columns });
    } else {
      // Extract column names if RPC worked
      const columns = schemaData?.rows?.map((row: { column_name: string }) => row.column_name) || [];
      apiLogger.info('Retrieved columns via RPC', { columns });
    }
    
    // Step 3: Test booking creation
    apiLogger.info('Step 3: Testing booking creation');
    const testReference = `TEST-HEALTH-${Date.now()}`;
    
    const testBooking = {
      reference_number: testReference,
      device_type: 'mobile',
      device_brand: 'Test Brand',
      device_model: 'Test Model',
      service_type: 'Test Service',
      booking_date: new Date().toISOString().split('T')[0],
      booking_time: '09-11',
      customer_name: 'Health Check',
      customer_email: 'healthcheck@example.com',
      customer_phone: '5551234567',
      address: '123 Test St',
      postal_code: 'V6B 1A1',
      status: 'pending',
      
      // Include fields that the trigger might be looking for
      brand: 'Test Brand',
      model: 'Test Model',
      city: 'Vancouver',
      province: 'BC',
      
      // Adding both forms of date/time fields to avoid trigger errors
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '09-11',
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('bookings')
      .insert(testBooking)
      .select();
      
    if (insertError) {
      apiLogger.error('Booking creation test failed', { 
        error: insertError,
        testBooking: {
          ...testBooking,
          customer_email: '[REDACTED]'
        }
      });
      
      return res.status(500).json({
        status: 'error',
        component: 'booking_creation',
        message: 'Failed to create test booking',
        details: insertError.message,
        suggestion: "Check the trigger function and database schema"
      });
    }
    
    apiLogger.info('Test booking created successfully', { 
      reference: testReference,
      insertedData: insertData && insertData.length > 0
    });
    
    // Step 4: Test booking retrieval
    apiLogger.info('Step 4: Testing booking retrieval');
    const { data: retrieveData, error: retrieveError } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', testReference)
      .single();
    
    if (retrieveError) {
      apiLogger.error('Booking retrieval test failed', { error: retrieveError });
      return res.status(500).json({
        status: 'error',
        component: 'booking_retrieval',
        message: 'Failed to retrieve the test booking',
        details: retrieveError.message
      });
    }
    
    apiLogger.info('Test booking retrieved successfully', {
      reference: testReference,
      retrievedFields: Object.keys(retrieveData).length
    });
    
    // Step 5: Clean up test booking (optional)
    apiLogger.info('Step 5: Cleaning up test booking');
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('reference_number', testReference);
      
    if (deleteError) {
      apiLogger.warn('Failed to clean up test booking', { error: deleteError });
      // Continue despite deletion error
    } else {
      apiLogger.info('Test booking deleted successfully');
    }
    
    // Return success with diagnostics
    return res.status(200).json({
      status: 'healthy',
      message: 'The booking system is working correctly',
      diagnostics: {
        database_connection: 'ok',
        database_schema: 'ok',
        booking_creation: 'ok',
        booking_retrieval: 'ok',
        booking_count: healthData[0].count,
        test_booking: {
          reference: testReference,
          created: true,
          retrieved: true,
          cleaned_up: !deleteError
        }
      }
    });
  } catch (error) {
    apiLogger.error('Unexpected error during health check', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error during health check',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 