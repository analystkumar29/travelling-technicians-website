// Script to drop the brand column and re-add it as a regular column
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixBrandColumn() {
  console.log('=== FIXING BRAND COLUMN ===');
  
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
  
  try {
    // First check if the column exists
    console.log('Checking if brand column exists...');
    const { data: columnCheck, error: checkError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type, is_generated, generation_expression
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'brand';
      `
    });
    
    if (checkError) {
      console.error('Error checking column:', checkError);
      return;
    }
    
    console.log('Column check result:', columnCheck);
    
    // Drop the column if it exists
    console.log('\nDropping brand column...');
    const { data: dropData, error: dropError } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE public.bookings DROP COLUMN IF EXISTS brand;
      `
    });
    
    if (dropError) {
      console.error('Error dropping column:', dropError);
      return;
    }
    
    console.log('Brand column dropped:', dropData);
    
    // Add the column back as a regular column
    console.log('\nAdding brand column as regular column...');
    const { data: addData, error: addError } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE public.bookings ADD COLUMN brand TEXT;
      `
    });
    
    if (addError) {
      console.error('Error adding column:', addError);
      return;
    }
    
    console.log('Brand column added:', addData);
    
    // Verify the changes
    console.log('\nVerifying brand column changes...');
    const { data: verifyData, error: verifyError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type, is_generated, generation_expression
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'brand';
      `
    });
    
    if (verifyError) {
      console.error('Error verifying column:', verifyError);
      return;
    }
    
    console.log('Column verification result:', verifyData);
    
    // Test direct insertion with the new columns
    console.log('\nTesting a direct insertion with the fixed column...');
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
      RETURNING id, reference_number, city, province, brand, device_brand;
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
    console.error('Exception during column fix:', err);
  }
}

// Run the fix
fixBrandColumn(); 