// Simple script to directly query the bookings table structure
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function queryTableStructure() {
  console.log('=== DIRECT TABLE QUERY ===');
  
  try {
    // Try to get a single row to see the structure
    console.log('Fetching a sample row...');
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing bookings table:', error);
    } else {
      if (data && data.length > 0) {
        console.log('Table structure from sample data:');
        console.log('Columns:', Object.keys(data[0]));
      } else {
        console.log('No existing bookings found.');
      }
    }

    // Try to insert with SQL query to bypass potential RLS policies
    console.log('\nAttempting direct SQL insertion...');
    const testRef = `TEST-${Date.now()}`;
    const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', {
      sql_query: `
        INSERT INTO public.bookings 
        (reference_number, customer_name, customer_email, customer_phone, device_type, service_type, address, postal_code, booking_date, booking_time, device_brand, device_model, issue_description, status) 
        VALUES 
        ('${testRef}', 'Test User', 'test@example.com', '5551234567', 'mobile', 'screen_replacement', '123 Test St', 'V6B 1A1', '2025-05-12', '09-11', 'Apple', 'iPhone 13', 'Test', 'pending')
        RETURNING *
      `
    });

    if (sqlError) {
      console.error('Direct SQL insertion failed:', sqlError);
      
      // Try with just an empty object to see what Supabase does with it
      console.log('\nTrying bare minimum insert...');
      const { data: minData, error: minError } = await supabase
        .from('bookings')
        .insert({
          reference_number: `BARE-${Date.now()}`,
          customer_name: 'Test',
          customer_email: 'test@example.com',
          customer_phone: '5551234567',
          device_type: 'mobile',
          service_type: 'screen_replacement',
          address: '123 Test St',
          postal_code: 'V6B 1A1',
          booking_date: '2025-05-12',
          booking_time: '09-11',
          device_brand: 'Apple',
          device_model: 'iPhone 13'
        })
        .select();
      
      if (minError) {
        console.error('Bare minimum insert failed:', minError);
        
        // If we keep getting the same error, let's create a new test script with different approach
        console.log('\nTrying a different approach to isolate the issue...');
        
        // Let's try to debug by enabling console client-side debugging
        const debugSupa = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            debug: true
          }
        });
        
        // Test with a simpler object
        const simpleBooking = {
          reference_number: `SIMPLE-${Date.now()}`,
          device_type: 'mobile',
          service_type: 'screen_replacement',
          customer_name: 'Test User',
          customer_email: 'test@example.com',
          customer_phone: '5551234567',
          address: '123 Test St',
          postal_code: 'V6B 1A1',
          booking_date: '2025-05-12',
          booking_time: '09-11',
          device_brand: 'Apple',
          device_model: 'iPhone 13',
          issue_description: 'Test',
          status: 'pending'
        };
        
        console.log('Attempting insert with debug client:', simpleBooking);
        const { data: debugData, error: debugError } = await debugSupa
          .from('bookings')
          .insert(simpleBooking)
          .select();
          
        if (debugError) {
          console.error('Debug insert failed:', debugError);
          console.log('Error message hints at "brand" field issue, let\'s examine triggers...');
        } else {
          console.log('Debug insert succeeded!', debugData);
        }
      } else {
        console.log('Insertion successful!');
        console.log('Data structure:', Object.keys(minData[0]));
      }
    } else {
      console.log('Direct SQL insertion succeeded:', sqlData);
    }
    
    // Try to directly query the information schema
    console.log('\nQuerying PostgreSQL information schema...');
    const { data: pgData, error: pgError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' AND table_schema = 'public'
        ORDER BY ordinal_position
      `
    });
    
    if (pgError) {
      console.error('PostgreSQL schema query failed:', pgError);
    } else {
      console.log('Table schema from PostgreSQL:');
      console.log(pgData);
    }
  } catch (err) {
    console.error('Exception during query:', err);
  }
}

// Run the query
queryTableStructure(); 