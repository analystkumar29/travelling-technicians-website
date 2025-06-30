// Test script to check Supabase database schema
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTableSchema() {
  console.log('=== CHECKING SUPABASE TABLE SCHEMA ===');
  
  try {
    // Get the first booking (if any) to examine its structure
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing bookings table:', error);
      return;
    }
    
    console.log('Successfully accessed bookings table');
    
    // Query Postgres information_schema to get column details
    const { data: columns, error: colError } = await supabase
      .rpc('get_table_columns', { target_table: 'bookings' });
    
    if (colError) {
      console.error('Error getting column information:', colError);
      
      // Direct query to information_schema as fallback
      console.log('Trying fallback method to get schema information...');
      
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'bookings');
      
      if (schemaError) {
        console.error('Fallback method failed:', schemaError);
        
        // If we have sample data, we can at least show its structure
        if (data && data.length > 0) {
          console.log('\nTable structure based on sample data:');
          console.log('Column names:', Object.keys(data[0]));
          Object.entries(data[0]).forEach(([key, value]) => {
            console.log(`- ${key}: ${typeof value} ${value === null ? '(nullable)' : ''}`);
          });
        }
      } else {
        console.log('\nTable columns from information_schema:');
        schemaData.forEach(col => {
          console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
        });
      }
    } else {
      console.log('\nTable columns:');
      columns.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable ? '(nullable)' : '(not null)'}`);
      });
    }
    
    // Try an alternate approach using raw SQL
    console.log('\nAttempting to use raw SQL to get table info...');
    const { data: rawData, error: rawError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' AND table_schema = 'public'
        ORDER BY ordinal_position
      `
    });
    
    if (rawError) {
      console.error('Raw SQL approach failed:', rawError);
    } else if (rawData) {
      console.log('Column information from raw SQL:');
      console.log(rawData);
    }
    
    // If we have sample data, show it
    if (data && data.length > 0) {
      console.log('\nSample data structure:');
      console.log(Object.keys(data[0]).map(k => `"${k}"`).join(', '));
    } else {
      console.log('\nNo sample data available. Creating a simple test record...');
      
      // Create a simple test record to see if we can understand the error better
      const testData = {
        reference_number: `TEST-${Date.now()}`,
        device_type: 'mobile',
        device_brand: 'Apple',
        device_model: 'iPhone 13',
        service_type: 'screen_replacement',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '09-11',
        customer_name: 'Schema Test User',
        customer_email: 'schema_test@example.com',
        customer_phone: '5551234567',
        address: '123 Test Street',
        postal_code: 'V6B 1A1',
        issue_description: 'Schema test',
        status: 'pending'
      };
      
      // Try inserting directly
      const { data: insertData, error: insertError } = await supabase
        .from('bookings')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.error('Error creating test record:', insertError);
        
        // If the insert failed, try with the most minimal record possible
        console.log('Trying with minimal required fields...');
        const minimalData = {
          reference_number: `TEST-${Date.now()}-MIN`,
          customer_name: 'Minimal Test',
          customer_email: 'minimal@example.com',
          customer_phone: '5551234567',
          device_type: 'mobile',
          service_type: 'screen_replacement',
          address: '123 Test St',
          postal_code: 'V6B 1A1',
          booking_date: new Date().toISOString().split('T')[0],
          booking_time: '09-11'
        };
        
        const { data: minData, error: minError } = await supabase
          .from('bookings')
          .insert(minimalData)
          .select();
        
        if (minError) {
          console.error('Error creating minimal record:', minError);
        } else {
          console.log('Minimal record created successfully');
          console.log('Record structure:', Object.keys(minData[0]));
        }
      } else {
        console.log('Test record created successfully');
        console.log('Record structure:', Object.keys(insertData[0]));
      }
    }
  } catch (err) {
    console.error('Exception during schema check:', err);
  }
}

// Run the schema check
checkTableSchema(); 