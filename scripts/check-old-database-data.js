const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client using environment variables (old database)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOldDatabaseData() {
  console.log('🔍 Checking Old Database Data');
  console.log('=' .repeat(50));
  
  try {
    // Check device_types
    console.log('\n📱 Device Types:');
    const { data: deviceTypes, error: dtError } = await supabase
      .from('device_types')
      .select('*')
      .order('sort_order');
    
    if (dtError) {
      console.log('❌ Error:', dtError.message);
    } else {
      console.log(`✅ Found ${deviceTypes.length} device types:`);
      deviceTypes.forEach(dt => {
        console.log(`   - ${dt.name} (${dt.display_name}) - Active: ${dt.is_active}`);
      });
    }
    
    // Check services
    console.log('\n🔧 Services:');
    const { data: services, error: sError } = await supabase
      .from('services')
      .select('*')
      .order('sort_order');
    
    if (sError) {
      console.log('❌ Error:', sError.message);
    } else {
      console.log(`✅ Found ${services.length} services:`);
      services.forEach(s => {
        console.log(`   - ${s.name} (${s.display_name}) - Device Type: ${s.device_type_id}`);
      });
    }
    
    // Check service_locations
    console.log('\n📍 Service Locations:');
    const { data: locations, error: lError } = await supabase
      .from('service_locations')
      .select('*')
      .order('sort_order');
    
    if (lError) {
      console.log('❌ Error:', lError.message);
    } else {
      console.log(`✅ Found ${locations.length} service locations:`);
      locations.forEach(l => {
        console.log(`   - ${l.name} (${l.display_name}) - Active: ${l.is_active}`);
      });
    }
    
    // Check empty tables
    console.log('\n📊 Empty Tables:');
    const emptyTables = ['brands', 'device_models', 'pricing_tiers', 'dynamic_pricing', 'bookings'];
    
    for (const table of emptyTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count || 0} records`);
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('✅ Tables with data: device_types, services, service_locations');
    console.log('❌ Empty tables: brands, device_models, pricing_tiers, dynamic_pricing, bookings');
    console.log('🔧 Missing: Complete device catalog and pricing data');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkOldDatabaseData().catch(console.error); 