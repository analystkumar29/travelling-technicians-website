// Test database connection for getAllActiveCities
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

console.log('🔗 Testing database connection...');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testGetAllActiveCities() {
  console.log('\n📊 Testing getAllActiveCities query...');
  
  try {
    const { data, error } = await supabase
      .from('service_locations')
      .select('city_name')
      .eq('is_active', true)
      .order('city_name');

    if (error) {
      console.error('❌ Database error:', error.message);
      console.error('Error details:', error);
      return;
    }

    console.log('✅ Query successful!');
    console.log('Number of cities:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('Cities found:');
      data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.city_name}`);
      });
      
      // Test the slug generation
      console.log('\n🔗 Generated slugs:');
      data.forEach(item => {
        const slug = item.city_name.toLowerCase().replace(/\s+/g, '-');
        console.log(`  ${item.city_name} -> ${slug}`);
      });
    } else {
      console.log('⚠️ No cities found in database');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function testGetAllActiveServices() {
  console.log('\n🔧 Testing getAllActiveServices query...');
  
  try {
    const { data, error } = await supabase
      .from('services')
      .select('name, display_name, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Database error:', error.message);
      return;
    }

    console.log('✅ Query successful!');
    console.log('Number of active services:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('Active services found:');
      data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name} (${item.display_name || 'No display name'})`);
      });
    } else {
      console.log('⚠️ No active services found in database');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting database connection tests...\n');
  
  await testGetAllActiveCities();
  await testGetAllActiveServices();
  
  console.log('\n✅ All tests completed!');
}

main().catch(console.error);