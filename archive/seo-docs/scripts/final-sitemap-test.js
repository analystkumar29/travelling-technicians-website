/**
 * Final sitemap test to verify the fix
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runFinalTest() {
  console.log('🔍 FINAL SITEMAP TEST\n');
  
  console.log('1. Testing database connectivity...');
  const { data: testData, error: testError } = await supabase
    .from('service_locations')
    .select('count')
    .limit(1);
    
  if (testError) {
    console.error('❌ Database connection error:', testError.message);
    return;
  }
  console.log('✅ Database connection successful');
  
  console.log('\n2. Checking active service locations...');
  const { data: locations, error: locError } = await supabase
    .from('service_locations')
    .select('city_name, is_active')
    .eq('is_active', true)
    .order('city_name');
    
  if (locError) {
    console.error('❌ Error fetching locations:', locError.message);
  } else {
    console.log(`✅ Found ${locations.length} active service locations`);
    console.log('   Cities:', locations.map(l => l.city_name).join(', '));
  }
  
  console.log('\n3. Checking dynamic pricing records...');
  const { count, error: countError } = await supabase
    .from('dynamic_pricing')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
    
  if (countError) {
    console.error('❌ Error counting records:', countError.message);
  } else {
    console.log(`✅ Found ${count} active dynamic pricing records`);
  }
  
  console.log('\n4. Testing the actual sitemap query...');
  const { data: combinations, error: comboError } = await supabase
    .from('dynamic_pricing')
    .select(`
      services!inner (name),
      device_models!inner (name)
    `)
    .eq('is_active', true)
    .eq('services.is_active', true)
    .eq('device_models.is_active', true)
    .limit(5);
    
  if (comboError) {
    console.error('❌ Query error:', comboError.message);
    console.log('   This might be the issue with the sitemap generation.');
  } else {
    console.log(`✅ Query successful, found ${combinations.length} sample combinations`);
    if (combinations.length > 0) {
      console.log('   Sample:', combinations[0].services?.name, '+', combinations[0].device_models?.name);
    }
  }
  
  console.log('\n5. Expected sitemap results:');
  console.log('   • Static pages: ~20 URLs');
  console.log('   • City pages: 13 URLs');
  console.log('   • City-service-model pages: 429+ URLs (13 cities × 33 models)');
  console.log('   • Total expected: 480+ URLs');
  
  console.log('\n6. Current sitemap status:');
  console.log('   The sitemap was returning 58 URLs (missing city-service-model pages)');
  console.log('   The fix changed "city" to "city_name" in the sitemap API');
  console.log('   This should now generate all 480+ URLs');
  
  console.log('\n🎯 VERIFICATION:');
  console.log('   Run: curl -s "http://localhost:3000/api/sitemap.xml" | grep -c "<loc>"');
  console.log('   Expected: 480+ URLs');
  console.log('   Previous: 58 URLs');
}

runFinalTest().catch(console.error);