const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCurrentSchema() {
  console.log('🔍 Checking Current Database Schema');
  console.log('=' .repeat(60));
  
  try {
    // Check dynamic_pricing table structure
    console.log('\n📋 Dynamic Pricing Table Structure:');
    const { data: pricingSample, error: pricingError } = await supabase
      .from('dynamic_pricing')
      .select('*')
      .limit(1);
    
    if (pricingError) {
      console.error('Error checking dynamic_pricing:', pricingError);
    } else if (pricingSample && pricingSample.length > 0) {
      console.log('Columns:', Object.keys(pricingSample[0]));
      console.log('Sample data:', pricingSample[0]);
    } else {
      console.log('Table exists but is empty');
    }
    
    // Check device_models table structure
    console.log('\n📱 Device Models Table Structure:');
    const { data: modelsSample, error: modelsError } = await supabase
      .from('device_models')
      .select('*')
      .limit(1);
    
    if (modelsError) {
      console.error('Error checking device_models:', modelsError);
    } else if (modelsSample && modelsSample.length > 0) {
      console.log('Columns:', Object.keys(modelsSample[0]));
      console.log('Sample data:', modelsSample[0]);
    } else {
      console.log('Table exists but is empty');
    }
    
    // Check brands table structure
    console.log('\n🏷️ Brands Table Structure:');
    const { data: brandsSample, error: brandsError } = await supabase
      .from('brands')
      .select('*')
      .limit(1);
    
    if (brandsError) {
      console.error('Error checking brands:', brandsError);
    } else if (brandsSample && brandsSample.length > 0) {
      console.log('Columns:', Object.keys(brandsSample[0]));
      console.log('Sample data:', brandsSample[0]);
    } else {
      console.log('Table exists but is empty');
    }
    
    // Check services table structure
    console.log('\n🔧 Services Table Structure:');
    const { data: servicesSample, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(1);
    
    if (servicesError) {
      console.error('Error checking services:', servicesError);
    } else if (servicesSample && servicesSample.length > 0) {
      console.log('Columns:', Object.keys(servicesSample[0]));
      console.log('Sample data:', servicesSample[0]);
    } else {
      console.log('Table exists but is empty');
    }
    
    // Check pricing_tiers table structure
    console.log('\n💰 Pricing Tiers Table Structure:');
    const { data: tiersSample, error: tiersError } = await supabase
      .from('pricing_tiers')
      .select('*')
      .limit(1);
    
    if (tiersError) {
      console.error('Error checking pricing_tiers:', tiersError);
    } else if (tiersSample && tiersSample.length > 0) {
      console.log('Columns:', Object.keys(tiersSample[0]));
      console.log('Sample data:', tiersSample[0]);
    } else {
      console.log('Table exists but is empty');
    }
    
    // Check device_types table structure
    console.log('\n📱 Device Types Table Structure:');
    const { data: typesSample, error: typesError } = await supabase
      .from('device_types')
      .select('*')
      .limit(1);
    
    if (typesError) {
      console.error('Error checking device_types:', typesError);
    } else if (typesSample && typesSample.length > 0) {
      console.log('Columns:', Object.keys(typesSample[0]));
      console.log('Sample data:', typesSample[0]);
    } else {
      console.log('Table exists but is empty');
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

// Run the schema check
checkCurrentSchema(); 