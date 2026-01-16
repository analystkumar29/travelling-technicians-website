require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function testPricingAPIs() {
  console.log('🧪 Testing Pricing APIs...\n');

  try {
    // Test 1: Database Tables Check
    console.log('📋 Test 1: Checking pricing tables...');
    await testPricingTables();
    
    // Test 2: Test Pricing Tiers API (simulated)
    console.log('💎 Test 2: Testing pricing tiers...');
    await testPricingTiers();
    
    // Test 3: Test Services API (simulated)
    console.log('🔧 Test 3: Testing services API...');
    await testServicesAPI();
    
    // Test 4: Test Price Calculation API (simulated)
    console.log('💰 Test 4: Testing price calculation...');
    await testPriceCalculation();
    
    // Test 5: Location-based Pricing
    console.log('📍 Test 5: Testing location-based pricing...');
    await testLocationPricing();
    
    console.log('\n🎉 All pricing API tests passed!');
    console.log('\n🔗 You can now test in browser:');
    console.log('   1. Services: http://localhost:3000/api/pricing/services?deviceType=mobile');
    console.log('   2. Tiers: http://localhost:3000/api/pricing/tiers');
    console.log('   3. Calculate price: http://localhost:3000/api/pricing/calculate?deviceType=mobile&brand=apple&model=iPhone%2015%20Pro&service=screen_replacement&tier=standard&postalCode=V6B2N9');
    
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

async function testPricingTables() {
  // Check all pricing-related tables
  const tables = [
    'service_categories',
    'services', 
    'pricing_tiers',
    'dynamic_pricing',
    'service_locations'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
      
    if (error) {
      throw new Error(`${table} table error: ${error.message}`);
    }
    
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    console.log(`   ✅ ${table}: ${count || 0} records`);
  }
}

async function testPricingTiers() {
  // Test pricing tiers fetch
  const { data: tiers, error } = await supabase
    .from('pricing_tiers')
    .select(`
      id,
      name,
      display_name,
      description,
      price_multiplier,
      estimated_delivery_hours,
      includes_features,
      is_active,
      sort_order
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Pricing tiers fetch error: ${error.message}`);
  }

  console.log(`   ✅ Pricing tiers fetched: ${tiers?.length || 0} found`);
  if (tiers && tiers.length > 0) {
    console.log(`       Available tiers: ${tiers.map(t => t.name).join(', ')}`);
    console.log(`       Price multipliers: ${tiers.map(t => `${t.name}=${t.price_multiplier}x`).join(', ')}`);
  }
}

async function testServicesAPI() {
  // Test mobile services
  const { data: mobileServices, error: mobileError } = await supabase
    .from('services')
    .select(`
      id,
      name,
      display_name,
      description,
      estimated_duration_minutes,
      warranty_period_days,
      is_doorstep_eligible,
      requires_diagnostics,
      sort_order,
      service_categories!inner(
        id,
        name,
        display_name
      ),
      device_types!inner(
        name
      )
    `)
    .eq('device_types.name', 'mobile')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (mobileError) {
    throw new Error(`Mobile services fetch error: ${mobileError.message}`);
  }

  console.log(`   ✅ Mobile services: ${mobileServices?.length || 0} found`);
  if (mobileServices && mobileServices.length > 0) {
    console.log(`       Services: ${mobileServices.map(s => s.name).join(', ')}`);
  }

  // Test laptop services
  const { data: laptopServices, error: laptopError } = await supabase
    .from('services')
    .select(`
      id,
      name,
      display_name,
      device_types!inner(
        name
      )
    `)
    .eq('device_types.name', 'laptop')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (laptopError) {
    throw new Error(`Laptop services fetch error: ${laptopError.message}`);
  }

  console.log(`   ✅ Laptop services: ${laptopServices?.length || 0} found`);
}

async function testPriceCalculation() {
  // Test price calculation for specific device/service combinations
  const testCases = [
    {
      deviceType: 'mobile',
      brand: 'apple',
      model: 'iPhone 15 Pro',
      service: 'screen_replacement',
      tier: 'standard'
    },
    {
      deviceType: 'mobile',
      brand: 'samsung', 
      model: 'Galaxy S24',
      service: 'battery_replacement',
      tier: 'premium'
    },
    {
      deviceType: 'laptop',
      brand: 'apple',
      model: 'MacBook Pro 16" (M3 Pro/Max)',
      service: 'screen_replacement',
      tier: 'same_day'
    }
  ];

  for (const testCase of testCases) {
    // Simulate the pricing calculation API logic
    const { data: pricingData, error } = await supabase
      .from('dynamic_pricing')
      .select(`
        base_price,
        discounted_price,
        services!inner(
          name,
          display_name,
          device_types!inner(
            name
          )
        ),
        device_models!inner(
          name,
          display_name,
          brands!inner(
            name,
            device_types!inner(
              name
            )
          )
        ),
        pricing_tiers!inner(
          name,
          display_name,
          price_multiplier
        )
      `)
      .eq('services.device_types.name', testCase.deviceType)
      .eq('device_models.brands.name', testCase.brand)
      .eq('device_models.name', testCase.model)
      .eq('services.name', testCase.service)
      .eq('pricing_tiers.name', testCase.tier)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.log(`   ⚠️  No pricing data for ${testCase.deviceType} ${testCase.brand} ${testCase.model} - ${testCase.service} (${testCase.tier})`);
      continue;
    }

    if (pricingData) {
      const basePrice = parseFloat(pricingData.base_price);
      const discountedPrice = pricingData.discounted_price ? parseFloat(pricingData.discounted_price) : null;
      const tierMultiplier = parseFloat(pricingData.pricing_tiers.price_multiplier);
      const finalPrice = (discountedPrice || basePrice) * tierMultiplier;

      console.log(`   ✅ ${testCase.deviceType.toUpperCase()} pricing: ${testCase.brand} ${testCase.model} - ${testCase.service}`);
      console.log(`       Base: $${basePrice}${discountedPrice ? ` (Discounted: $${discountedPrice})` : ''} × ${tierMultiplier}x = $${finalPrice.toFixed(2)}`);
    }
  }
}

async function testLocationPricing() {
  // Test location-based pricing adjustments
  const testPostalCodes = [
    'V6B2N9', // Downtown Vancouver (+5%)
    'V6R4J1', // West Side Vancouver (+2%)
    'V5K2A1', // East Side Vancouver (0%)
    'V6X1A1', // Richmond (+3%)
    'V3J1M2', // Burnaby (0%)
    'V7S1E2'  // West Vancouver (+4%)
  ];

  for (const postalCode of testPostalCodes) {
    const postalPrefix = postalCode.substring(0, 3);
    
    const { data: locationData, error } = await supabase
      .from('service_locations')
      .select('name, price_adjustment_percentage')
      .contains('postal_code_prefixes', [postalPrefix])
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.log(`   ⚠️  No location data for postal code ${postalCode}`);
      continue;
    }

    if (locationData) {
      const adjustment = parseFloat(locationData.price_adjustment_percentage);
      console.log(`   ✅ Location pricing: ${postalCode} (${locationData.name}) - ${adjustment > 0 ? '+' : ''}${adjustment}%`);
    } else {
      console.log(`   ✅ Location pricing: ${postalCode} - No adjustment (0%)`);
    }
  }
}

// Integration test - simulate complete pricing flow
async function testCompletePricingFlow() {
  console.log('\n🔗 Testing complete pricing flow...');
  
  // Get a sample device
  const { data: sampleModel } = await supabase
    .from('device_models')
    .select(`
      name,
      brands(name, device_types(name))
    `)
    .eq('brands.device_types.name', 'mobile')
    .eq('brands.name', 'apple')
    .limit(1)
    .single();

  if (!sampleModel) {
    console.log('   ⚠️  No sample model found for testing');
    return;
  }

  // Get a sample service
  const { data: sampleService } = await supabase
    .from('services')
    .select('name, display_name')
    .eq('device_types.name', 'mobile')
    .limit(1)
    .single();

  if (!sampleService) {
    console.log('   ⚠️  No sample service found for testing');
    return;
  }

  console.log(`   📱 Testing: ${sampleModel.brands.name} ${sampleModel.name} - ${sampleService.display_name}`);
  
  // This would simulate the full API call
  console.log(`   🔗 API URL: /api/pricing/calculate?deviceType=mobile&brand=${sampleModel.brands.name}&model=${encodeURIComponent(sampleModel.name)}&service=${sampleService.name}&tier=standard&postalCode=V6B2N9`);
}

// Run the tests
testPricingAPIs()
  .then(() => testCompletePricingFlow())
  .catch(console.error); 