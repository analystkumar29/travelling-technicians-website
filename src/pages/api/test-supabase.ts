import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint is for testing the Supabase connection and booking creation
  const timestamp = new Date().toISOString();
  const isProduction = process.env.NODE_ENV === 'production';
  
  try {
    console.log(`[${timestamp}] Testing Supabase connection in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} environment...`);

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
    console.log('Creating Supabase client with service role...');
    console.log('Supabase URL present:', !!supabaseUrl);
    console.log('Service role key present:', !!serviceRoleKey);
    console.log('Service role key first 10 chars:', serviceRoleKey?.substring(0, 10) + '...');
    
    // Test service role key with direct HTTP request first
    console.log('Testing service role key with direct HTTP request...');
    try {
      const testUrl = `${supabaseUrl}/rest/v1/bookings?select=count&limit=1`;
      const testResponse = await fetch(testUrl, {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Direct HTTP test response status:', testResponse.status);
      console.log('Direct HTTP test response headers:', Object.fromEntries(testResponse.headers.entries()));
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('Direct HTTP test failed:', {
          status: testResponse.status,
          statusText: testResponse.statusText,
          body: errorText
        });
      } else {
        console.log('Direct HTTP test successful');
      }
    } catch (httpError) {
      console.error('Direct HTTP test exception:', httpError);
    }
    
    // Create Supabase client directly in the API route to isolate issues
    console.log('Creating Supabase client directly in API route...');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: {
        fetch: fetch.bind(globalThis),
        headers: {
          'X-Client-Info': 'travelling-technicians-server-test'
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    
    // Debug: Check if supabase client has the expected methods
    console.log('Supabase client created:', {
      hasFrom: typeof supabase.from === 'function',
      clientType: typeof supabase
    });

    // 1. First try a simple query to check connection
    console.log('Checking table existence...');
    let tableData: any = null;
    let tableError: any = null;
    
    try {
      const result = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      tableData = result.data;
      tableError = result.error;

      if (tableError) {
        console.error('Error checking table:', {
          message: tableError.message,
          code: tableError.code,
          details: tableError.details,
          hint: tableError.hint,
          fullError: JSON.stringify(tableError, null, 2)
        });
        return res.status(500).json({
          success: false,
          error: 'Failed to connect to Supabase or table not found',
          details: tableError
        });
      }
      
      console.log('Table check successful, count:', result.count);
    } catch (error) {
      console.error('Exception during table check:', error);
      return res.status(500).json({
        success: false,
        error: 'Exception during table check',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // 2. Fetch foreign key IDs from reference tables for V2 schema
    console.log('Fetching foreign key IDs for V2 schema...');
    
    // Get first available device model ID
    const { data: deviceModels, error: deviceModelsError } = await supabase
      .from('device_models')
      .select('id')
      .limit(1);
    
    if (deviceModelsError) {
      console.error('Error fetching device models:', deviceModelsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch device models',
        details: deviceModelsError
      });
    }
    
    // Get first available service ID
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .limit(1);
    
    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch services',
        details: servicesError
      });
    }
    
    // Get first available service location ID
    const { data: serviceLocations, error: serviceLocationsError } = await supabase
      .from('service_locations')
      .select('id')
      .limit(1);
    
    if (serviceLocationsError) {
      console.error('Error fetching service locations:', serviceLocationsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch service locations',
        details: serviceLocationsError
      });
    }
    
    // Check if we have all required foreign keys
    if (!deviceModels?.[0]?.id || !services?.[0]?.id || !serviceLocations?.[0]?.id) {
      console.error('Missing foreign key references:', {
        deviceModelId: deviceModels?.[0]?.id,
        serviceId: services?.[0]?.id,
        serviceLocationId: serviceLocations?.[0]?.id
      });
      return res.status(500).json({
        success: false,
        error: 'Missing required foreign key references in database',
        details: {
          deviceModelId: deviceModels?.[0]?.id,
          serviceId: services?.[0]?.id,
          serviceLocationId: serviceLocations?.[0]?.id
        }
      });
    }
    
    const modelId = deviceModels[0].id;
    const serviceId = services[0].id;
    const serviceLocationId = serviceLocations[0].id;

    // 3. Try inserting a test booking with V2 schema
    console.log('Attempting to insert test booking with V2 schema...');
    const testReference = `TEST-${Date.now()}`;
    
    const { data: insertData, error: insertError } = await supabase
      .from('bookings')
      .insert([
        {
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          customer_phone: '123-456-7890',
          customer_address: 'Test Address, T3ST',
          model_id: modelId,
          service_id: serviceId,
          location_id: serviceLocationId,
          scheduled_at: new Date().toISOString(),
          booking_ref: testReference,
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

    // 4. Verify the insertion
    console.log('Verifying test booking insertion...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_ref', testReference)
      .single();

    if (verifyError) {
      console.error('Error verifying test booking:', verifyError);
    }

    // 5. Test the new tables that were just created
    console.log('Testing newly created tables...');
    const newTables = ['site_settings', 'testimonials', 'payments', 'faqs', 'sitemap_regeneration_status'];
    const newTablesResults: Record<string, any> = {};
    
    for (const tableName of newTables) {
      console.log(`Testing table: ${tableName}`);
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        newTablesResults[tableName] = {
          success: !error,
          error: error ? {
            message: error.message,
            code: error.code,
            details: error.details
          } : null,
          count: data ? 0 : (error ? null : 0)
        };
        
        if (error) {
          console.error(`Error testing table ${tableName}:`, error);
        } else {
          console.log(`Table ${tableName} accessible successfully`);
        }
      } catch (error) {
        console.error(`Exception testing table ${tableName}:`, error);
        newTablesResults[tableName] = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          count: null
        };
      }
    }
    
    // 6. Test creating a payment record linked to the test booking (if booking was created)
    let paymentTestResult = null;
    if (insertData && insertData[0]?.id) {
      console.log('Testing payment creation with foreign key constraint...');
      const bookingId = insertData[0].id;
      
      try {
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .insert([
              {
                booking_id: bookingId,
                amount: 99.99,
                status: 'pending',
                payment_method: 'credit',
                transaction_id: `TEST-TX-${Date.now()}`,
                currency: 'CAD'
              }
            ])
            .select();
        
        paymentTestResult = {
          success: !paymentError,
          error: paymentError ? {
            message: paymentError.message,
            code: paymentError.code,
            details: paymentError.details
          } : null,
          data: paymentData
        };
        
        if (paymentError) {
          console.error('Error creating payment:', paymentError);
        } else {
          console.log('Payment created successfully:', paymentData);
        }
      } catch (error) {
        console.error('Exception creating payment:', error);
        paymentTestResult = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    // 7. Test the unique constraint on payments (one payment per booking)
    let uniqueConstraintTest = null;
    if (insertData && insertData[0]?.id && paymentTestResult?.success) {
      console.log('Testing unique constraint (one payment per booking)...');
      const bookingId = insertData[0].id;
      
      try {
        const { error: duplicateError } = await supabase
          .from('payments')
          .insert([
            {
              booking_id: bookingId,
              amount: 49.99,
              status: 'pending',
              payment_method: 'debit',
              transaction_id: `TEST-DUP-${Date.now()}`,
              currency: 'CAD'
            }
          ]);
        
        uniqueConstraintTest = {
          success: !!duplicateError, // Should fail due to unique constraint
          expectedError: duplicateError?.code === '23505' ? 'unique_violation' : null,
          error: duplicateError ? {
            message: duplicateError.message,
            code: duplicateError.code,
            details: duplicateError.details
          } : null
        };
        
        if (duplicateError?.code === '23505') {
          console.log('Unique constraint works correctly - duplicate payment prevented');
        } else if (duplicateError) {
          console.log('Duplicate payment failed with different error:', duplicateError);
        } else {
          console.warn('WARNING: Duplicate payment succeeded - unique constraint may not be working');
        }
      } catch (error) {
        console.error('Exception testing unique constraint:', error);
        uniqueConstraintTest = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    // Return results
    return res.status(200).json({
      success: true,
      message: 'Supabase connection test complete',
      tableCheck: { success: !tableError, data: tableData },
      foreignKeys: {
        modelId,
        serviceId,
        serviceLocationId
      },
      insertion: { success: !insertError, data: insertData },
      verification: {
        success: !verifyError,
        found: !!verifyData,
        data: verifyData
      },
      newTables: newTablesResults,
      paymentTest: paymentTestResult,
      uniqueConstraintTest: uniqueConstraintTest,
      summary: {
        totalTablesTested: 1 + newTables.length,
        tablesAccessible: Object.values(newTablesResults).filter(r => r.success).length + 1,
        foreignKeyTest: paymentTestResult?.success ? 'passed' : 'not_tested',
        uniqueConstraintTest: uniqueConstraintTest?.expectedError === 'unique_violation' ? 'passed' : 'not_tested'
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