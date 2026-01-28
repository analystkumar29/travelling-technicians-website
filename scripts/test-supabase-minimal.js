const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Testing Supabase client...');
  console.log('URL:', supabaseUrl);
  console.log('Key first 10 chars:', serviceRoleKey?.substring(0, 10) + '...');

  // Test 1: Minimal client
  console.log('\n=== Test 1: Minimal client ===');
  const supabase1 = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    const result = await supabase1.from('bookings').select('count(*)', { count: 'exact', head: true });
    console.log('Result:', {
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

  // Test 2: Client with auth config
  console.log('\n=== Test 2: Client with auth config ===');
  const supabase2 = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
  
  try {
    const result = await supabase2.from('bookings').select('count(*)', { count: 'exact', head: true });
    console.log('Result:', {
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

  // Test 3: Direct fetch to compare
  console.log('\n=== Test 3: Direct fetch ===');
  try {
    const testUrl = `${supabaseUrl}/rest/v1/bookings?select=count&limit=1`;
    const testResponse = await fetch(testUrl, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', testResponse.status);
    console.log('Response headers:', Object.fromEntries(testResponse.headers.entries()));
    const body = await testResponse.text();
    console.log('Response body:', body);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testSupabase().catch(console.error);