// Simple script to execute individual SQL statements
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function executeSimpleSchemaUpdate() {
  console.log('=== DIRECT SCHEMA UPDATE ===');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  // Define direct SQL statements
  const statements = [
    'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS city TEXT;',
    'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS province TEXT;',
    'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS brand TEXT;'
  ];
  
  try {
    // Execute each statement individually
    for (const sql of statements) {
      console.log(`Executing SQL: ${sql}`);
      
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: sql
      });
      
      if (error) {
        console.error(`Error executing statement "${sql}":`, error);
      } else {
        console.log('Statement executed successfully:', data);
      }
    }
    
    // Verify the changes
    console.log('\nVerifying schema changes...');
    const { data: schemaData, error: schemaError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type, table_name
        FROM information_schema.columns 
        WHERE table_name = 'bookings'
        AND column_name IN ('city', 'province', 'brand')
        ORDER BY column_name;
      `
    });
    
    if (schemaError) {
      console.error('Error verifying schema:', schemaError);
    } else {
      console.log('Schema verification result:');
      console.log(schemaData);
    }
    
    // Test direct insertion with the new columns
    console.log('\nTesting a direct insertion with new columns...');
    const testRef = `TEST-${Date.now()}`;
    
    const insertSQL = `
      INSERT INTO public.bookings (
        reference_number, 
        device_type, 
        device_brand,
        brand,
        service_type, 
        booking_date, 
        booking_time, 
        customer_name, 
        customer_email, 
        customer_phone,
        address,
        city,
        province,
        postal_code,
        status
      ) VALUES (
        '${testRef}',
        'mobile',
        'Apple',
        'Apple',
        'screen_replacement',
        '${new Date().toISOString().split('T')[0]}',
        '09-11',
        'Direct Test User',
        'direct-test@example.com',
        '5551234567',
        '123 Test St',
        'Vancouver',
        'BC',
        'V6B 1A1',
        'pending'
      )
      RETURNING id, reference_number, city, province, brand;
    `;
    
    const { data: insertData, error: insertError } = await supabase.rpc('execute_sql', {
      sql_query: insertSQL
    });
    
    if (insertError) {
      console.error('Error inserting test data:', insertError);
    } else {
      console.log('Test data insertion successful:');
      console.log(insertData);
      
      // Clean up test data
      const deleteSQL = `DELETE FROM public.bookings WHERE reference_number = '${testRef}';`;
      await supabase.rpc('execute_sql', { sql_query: deleteSQL });
      console.log('Test data cleaned up.');
    }
    
  } catch (err) {
    console.error('Exception during schema update:', err);
  }
}

// Run the update
executeSimpleSchemaUpdate(); 