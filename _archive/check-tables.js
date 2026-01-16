require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
  console.log('🔍 Checking existing tables...\n');
  
  const tables = ['device_types', 'brands', 'device_models', 'service_categories', 'pricing_tiers', 'service_locations', 'services', 'dynamic_pricing'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count || 0} records`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  // Check some sample data
  console.log('\n📋 Sample data:');
  
  const { data: deviceTypes } = await supabase.from('device_types').select('*').limit(3);
  console.log('Device Types:', deviceTypes || 'None');
  
  const { data: categories } = await supabase.from('service_categories').select('*').limit(3);
  console.log('Service Categories:', categories || 'None');
  
  const { data: tiers } = await supabase.from('pricing_tiers').select('*').limit(3);
  console.log('Pricing Tiers:', tiers || 'None');
}

checkTables().catch(console.error); 