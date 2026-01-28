const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Testing Supabase count operations...');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // Test different count syntaxes
  console.log('\n=== Test 1: Count with head: true ===');
  try {
    const result = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    console.log('Result:', {
      data: result.data,
      error: result.error,
      count: result.count
    });
  } catch (error) {
    console.error('Exception:', error);
  }

  console.log('\n=== Test 2: Count without head ===');
  try {
    const result = await supabase.from('bookings').select('*', { count: 'exact' });
    console.log('Result:', {
      data: result.data,
      error: result.error,
      count: result.count
    });
  } catch (error) {
    console.error('Exception:', error);
  }

  console.log('\n=== Test 3: Raw count query ===');
  try {
    const result = await supabase.from('bookings').select('count(*)');
    console.log('Result:', {
      data: result.data,
      error: result.error
    });
  } catch (error) {
    console.error('Exception:', error);
  }

  console.log('\n=== Test 4: Simple select with limit ===');
  try {
    const result = await supabase.from('bookings').select('*').limit(5);
    console.log('Result:', {
      data: result.data,
      error: result.error
    });
  } catch (error) {
    console.error('Exception:', error);
  }

  console.log('\n=== Test 5: Check if table exists via information_schema ===');
  try {
    const result = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public').eq('table_name', 'bookings');
    console.log('Result:', {
      data: result.data,
      error: result.error
    });
  } catch (error) {
    console.error('Exception:', error);
  }

  console.log('\n=== Test 6: Direct REST API count ===');
  try {
    const url = `${supabaseUrl}/rest/v1/bookings?select=count`;
    const response = await fetch(url, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Response status:', response.status);
    const body = await response.text();
    console.log('Response body:', body);
  } catch (error) {
    console.error('Exception:', error);
  }
}

testSupabase().catch(console.error);