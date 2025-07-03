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

async function checkOldDatabaseSchema() {
  console.log('🔍 Checking Old Database Schema');
  console.log('=' .repeat(50));
  
  try {
    // Check device_types table structure
    console.log('\n📱 Device Types Table:');
    const { data: deviceTypes, error: dtError } = await supabase
      .from('device_types')
      .select('*')
      .limit(1);
    
    if (dtError) {
      console.log('❌ Error:', dtError.message);
    } else if (deviceTypes && deviceTypes.length > 0) {
      console.log('✅ Columns:', Object.keys(deviceTypes[0]));
      console.log('📋 Sample data:', deviceTypes[0]);
    }
    
    // Check brands table structure
    console.log('\n🏷️ Brands Table:');
    const { data: brands, error: bError } = await supabase
      .from('brands')
      .select('*')
      .limit(1);
    
    if (bError) {
      console.log('❌ Error:', bError.message);
    } else if (brands && brands.length > 0) {
      console.log('✅ Columns:', Object.keys(brands[0]));
      console.log('📋 Sample data:', brands[0]);
    }
    
    // Check device_models table structure
    console.log('\n📱 Device Models Table:');
    const { data: models, error: mError } = await supabase
      .from('device_models')
      .select('*')
      .limit(1);
    
    if (mError) {
      console.log('❌ Error:', mError.message);
    } else if (models && models.length > 0) {
      console.log('✅ Columns:', Object.keys(models[0]));
      console.log('📋 Sample data:', models[0]);
    } else {
      console.log('⚠️ Table exists but is empty');
    }
    
    // Check services table structure
    console.log('\n🔧 Services Table:');
    const { data: services, error: sError } = await supabase
      .from('services')
      .select('*')
      .limit(1);
    
    if (sError) {
      console.log('❌ Error:', sError.message);
    } else if (services && services.length > 0) {
      console.log('✅ Columns:', Object.keys(services[0]));
      console.log('📋 Sample data:', services[0]);
    }
    
    // Check pricing_tiers table structure
    console.log('\n💰 Pricing Tiers Table:');
    const { data: tiers, error: tError } = await supabase
      .from('pricing_tiers')
      .select('*')
      .limit(1);
    
    if (tError) {
      console.log('❌ Error:', tError.message);
    } else if (tiers && tiers.length > 0) {
      console.log('✅ Columns:', Object.keys(tiers[0]));
      console.log('📋 Sample data:', tiers[0]);
    } else {
      console.log('⚠️ Table exists but is empty');
    }
    
    // Check dynamic_pricing table structure
    console.log('\n💵 Dynamic Pricing Table:');
    const { data: pricing, error: pError } = await supabase
      .from('dynamic_pricing')
      .select('*')
      .limit(1);
    
    if (pError) {
      console.log('❌ Error:', pError.message);
    } else if (pricing && pricing.length > 0) {
      console.log('✅ Columns:', Object.keys(pricing[0]));
      console.log('📋 Sample data:', pricing[0]);
    } else {
      console.log('⚠️ Table exists but is empty');
    }
    
    // Check service_locations table structure
    console.log('\n📍 Service Locations Table:');
    const { data: locations, error: lError } = await supabase
      .from('service_locations')
      .select('*')
      .limit(1);
    
    if (lError) {
      console.log('❌ Error:', lError.message);
    } else if (locations && locations.length > 0) {
      console.log('✅ Columns:', Object.keys(locations[0]));
      console.log('📋 Sample data:', locations[0]);
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkOldDatabaseSchema().catch(console.error); 