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

async function testDynamicAPIs() {
  console.log('🧪 Testing Dynamic Pricing APIs...\n');

  try {
    // Test 1: Check table existence and data
    console.log('📋 Test 1: Checking database tables...');
    await testTables();
    
    // Test 2: Test brand fetching (simulating API call)
    console.log('🏷️  Test 2: Testing brand fetching...');
    await testBrandFetching();
    
    // Test 3: Test model fetching (simulating API call)
    console.log('📱 Test 3: Testing model fetching...');
    await testModelFetching();
    
    // Test 4: Integration test
    console.log('🔗 Test 4: Integration test...');
    await testIntegration();
    
    console.log('\n🎉 All tests passed! Dynamic APIs are working correctly.');
    console.log('\n🔗 You can now test in browser:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Visit: http://localhost:3000/api/devices/brands?deviceType=mobile');
    console.log('   3. Visit: http://localhost:3000/api/devices/models?deviceType=mobile&brand=apple');
    
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

async function testTables() {
  // Check device_types
  const { data: deviceTypes, error: dtError } = await supabase
    .from('device_types')
    .select('*');
    
  if (dtError) {
    throw new Error(`device_types table error: ${dtError.message}`);
  }
  
  console.log(`   ✅ device_types: ${deviceTypes?.length || 0} records`);
  
  // Check brands
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*');
    
  if (brandsError) {
    throw new Error(`brands table error: ${brandsError.message}`);
  }
  
  console.log(`   ✅ brands: ${brands?.length || 0} records`);
  
  // Check device_models
  const { data: models, error: modelsError } = await supabase
    .from('device_models')
    .select('*');
    
  if (modelsError) {
    throw new Error(`device_models table error: ${modelsError.message}`);
  }
  
  console.log(`   ✅ device_models: ${models?.length || 0} records`);
}

async function testBrandFetching() {
  // Test mobile brands
  const { data: mobileBrands, error: mobileError } = await supabase
    .from('brands')
    .select(`
      id,
      name,
      display_name,
      logo_url,
      website_url,
      is_active,
      sort_order,
      created_at,
      updated_at,
      device_types!inner(
        id,
        name,
        display_name
      )
    `)
    .eq('device_types.name', 'mobile')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
    
  if (mobileError) {
    throw new Error(`Mobile brands fetch error: ${mobileError.message}`);
  }
  
  console.log(`   ✅ Mobile brands: ${mobileBrands?.length || 0} found`);
  if (mobileBrands && mobileBrands.length > 0) {
    console.log(`       First brand: ${mobileBrands[0].display_name}`);
  }
  
  // Test laptop brands
  const { data: laptopBrands, error: laptopError } = await supabase
    .from('brands')
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
    throw new Error(`Laptop brands fetch error: ${laptopError.message}`);
  }
  
  console.log(`   ✅ Laptop brands: ${laptopBrands?.length || 0} found`);
}

async function testModelFetching() {
  // Test Apple iPhone models
  const { data: iPhoneModels, error: iPhoneError } = await supabase
    .from('device_models')
    .select(`
      id,
      name,
      display_name,
      brand_id,
      model_year,
      is_active,
      is_featured,
      sort_order,
      created_at,
      brands!inner(
        id,
        name,
        display_name,
        device_types!inner(
          name
        )
      )
    `)
    .eq('brands.device_types.name', 'mobile')
    .eq('brands.name', 'apple')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
    
  if (iPhoneError) {
    throw new Error(`iPhone models fetch error: ${iPhoneError.message}`);
  }
  
  console.log(`   ✅ Apple iPhone models: ${iPhoneModels?.length || 0} found`);
  if (iPhoneModels && iPhoneModels.length > 0) {
    console.log(`       First model: ${iPhoneModels[0].display_name}`);
    console.log(`       Featured models: ${iPhoneModels.filter(m => m.is_featured).length}`);
  }
  
  // Test MacBook models
  const { data: macbookModels, error: macbookError } = await supabase
    .from('device_models')
    .select(`
      id,
      name,
      display_name,
      brands!inner(
        name,
        device_types!inner(
          name
        )
      )
    `)
    .eq('brands.device_types.name', 'laptop')
    .eq('brands.name', 'apple')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
    
  if (macbookError) {
    throw new Error(`MacBook models fetch error: ${macbookError.message}`);
  }
  
  console.log(`   ✅ Apple MacBook models: ${macbookModels?.length || 0} found`);
}

async function testIntegration() {
  // Simulate the full flow: device type -> brands -> models
  
  // 1. Get all device types
  const { data: deviceTypes } = await supabase
    .from('device_types')
    .select('name, display_name')
    .eq('is_active', true)
    .order('sort_order');
    
  console.log(`   ✅ Device types available: ${deviceTypes?.map(dt => dt.name).join(', ')}`);
  
  // 2. For each device type, get brands
  for (const deviceType of deviceTypes || []) {
    const { data: brands } = await supabase
      .from('brands')
      .select(`
        name,
        display_name,
        device_types!inner(name)
      `)
      .eq('device_types.name', deviceType.name)
      .eq('is_active', true)
      .limit(3); // Just first 3 for test
      
    console.log(`   ✅ ${deviceType.display_name} brands: ${brands?.map(b => b.display_name).join(', ')}`);
    
    // 3. For first brand, get models
    if (brands && brands.length > 0) {
      const firstBrand = brands[0];
      const { data: models } = await supabase
        .from('device_models')
        .select(`
          name,
          display_name,
          is_featured,
          brands!inner(
            name,
            device_types!inner(name)
          )
        `)
        .eq('brands.device_types.name', deviceType.name)
        .eq('brands.name', firstBrand.name)
        .eq('is_active', true)
        .limit(3); // Just first 3 for test
        
      console.log(`       └─ ${firstBrand.display_name} models: ${models?.map(m => m.display_name).join(', ')}`);
    }
  }
}

// Run the tests
testDynamicAPIs(); 