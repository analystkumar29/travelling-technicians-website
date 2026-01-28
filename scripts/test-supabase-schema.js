const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Testing Supabase schema...');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // Test 1: Try to list tables
  console.log('\n=== Test 1: Try to list tables via REST ===');
  try {
    const tablesUrl = `${supabaseUrl}/rest/v1/?apikey=${serviceRoleKey}`;
    const response = await fetch(tablesUrl);
    console.log('Tables response status:', response.status);
    const body = await response.text();
    console.log('Tables response body (first 500 chars):', body.substring(0, 500));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: Try different table
  console.log('\n=== Test 2: Try device_models table ===');
  try {
    const result = await supabase.from('device_models').select('count(*)', { count: 'exact', head: true });
    console.log('device_models result:', {
      data: result.data,
      error: result.error,
      errorDetails: result.error ? {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details,
        hint: result.error.hint
      } : null
    });
  } catch (error) {
    console.error('Exception:', error);
  }

  // Test 3: Try with schema prefix
  console.log('\n=== Test 3: Try with public.bookings ===');
  try {
    const result = await supabase.from('public.bookings').select('count(*)', { count: 'exact', head: true });
    console.log('public.bookings result:', {
      data: result.data,
      error: result.error,
      errorDetails: result.error ? {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details,
        hint: result.error.hint
      } : null
    });
  } catch (error) {
    console.error('Exception:', error);
  }

  // Test 4: Try a simple query without count
  console.log('\n=== Test 4: Try simple select ===');
  try {
    const result = await supabase.from('bookings').select('*').limit(1);
    console.log('Simple select result:', {
      data: result.data,
      error: result.error,
      errorDetails: result.error ? {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details,
        hint: result.error.hint
      } : null
    });
  } catch (error) {
    console.error('Exception:', error);
  }

  // Test 5: Check if it's a permissions issue - try anon key
  console.log('\n=== Test 5: Try with anon key ===');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  console.log('Anon key first 10 chars:', anonKey?.substring(0, 10) + '...');
  
  const supabaseAnon = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false }
  });
  
  try {
    const result = await supabaseAnon.from('bookings').select('count(*)', { count: 'exact', head: true });
    console.log('Anon key result:', {
      data: result.data,
      error: result.error,
      errorDetails: result.error ? {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details,
        hint: result.error.hint
      } : null
    });
  } catch (error) {
    console.error('Exception:', error);
  }
}

testSupabase().catch(console.error);