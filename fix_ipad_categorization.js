const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixIPadCategorization() {
  console.log('🔧 Fixing iPad categorization...\n');

  // First, let's see the current structure
  console.log('📊 Checking current device types and brands...');
  
  const { data: deviceTypes, error: dtError } = await supabase
    .from('device_types')
    .select('id, name, display_name');

  if (dtError) {
    console.error('Error fetching device types:', dtError);
    return;
  }

  console.log('Device types:', deviceTypes);

  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('id, name, device_type_id, device_types(name)')
    .eq('name', 'apple');

  if (brandsError) {
    console.error('Error fetching brands:', brandsError);
    return;
  }

  console.log('Apple brands:', brands);

  // Check if tablet device type exists
  const tabletType = deviceTypes.find(dt => dt.name === 'tablet');
  let tabletTypeId;

  if (!tabletType) {
    console.log('Creating tablet device type...');
    const { data: newTabletType, error: createError } = await supabase
      .from('device_types')
      .insert({ name: 'tablet', display_name: 'Tablet', sort_order: 3 })
      .select('id')
      .single();
    
    if (createError) {
      console.error('Error creating tablet device type:', createError);
      return;
    }
    
    tabletTypeId = newTabletType.id;
    console.log('✅ Created tablet device type');
  } else {
    tabletTypeId = tabletType.id;
    console.log('✅ Tablet device type exists');
  }

  // Check if Apple tablet brand exists
  const appleTabletBrand = brands.find(b => b.device_type_id === tabletTypeId);
  let appleTabletBrandId;

  if (!appleTabletBrand) {
    console.log('Creating Apple tablet brand...');
    const { data: newAppleBrand, error: createBrandError } = await supabase
      .from('brands')
      .insert({ 
        name: 'apple-tablet', // Use different name to avoid conflict
        display_name: 'Apple', 
        device_type_id: tabletTypeId,
        sort_order: 1 
      })
      .select('id')
      .single();
    
    if (createBrandError) {
      console.error('Error creating Apple tablet brand:', createBrandError);
      return;
    }
    
    appleTabletBrandId = newAppleBrand.id;
    console.log('✅ Created Apple tablet brand');
  } else {
    appleTabletBrandId = appleTabletBrand.id;
    console.log('✅ Apple tablet brand exists');
  }

  // Now move iPad models
  console.log('\n📱 Moving iPad models to tablet category...');
  
  const { data: iPadModels, error: iPadError } = await supabase
    .from('device_models')
    .select('id, name, brand_id')
    .ilike('name', '%ipad%')
    .eq('is_active', true);

  if (iPadError) {
    console.error('Error fetching iPad models:', iPadError);
    return;
  }

  console.log(`Found ${iPadModels.length} iPad models to move`);

  if (iPadModels.length > 0) {
    const { data: movedModels, error: moveError } = await supabase
      .from('device_models')
      .update({ brand_id: appleTabletBrandId })
      .ilike('name', '%ipad%')
      .eq('is_active', true)
      .select('id');

    if (moveError) {
      console.error('Error moving iPad models:', moveError);
    } else {
      console.log(`✅ Moved ${movedModels.length} iPad models to tablet category`);
    }
  }

  // Verify the fix
  console.log('\n📊 Verification - Checking Apple models by device type...');
  
  const { data: verifyModels, error: verifyError } = await supabase
    .from('device_models')
    .select(`
      id, 
      name,
      brands!inner(name, device_types!inner(name))
    `)
    .or('brands.name.eq.apple,brands.name.eq.apple-tablet')
    .eq('is_active', true);

  if (!verifyError) {
    const mobile = verifyModels.filter(m => m.brands.device_types.name === 'mobile');
    const tablet = verifyModels.filter(m => m.brands.device_types.name === 'tablet');
    
    const mobileIphones = mobile.filter(m => m.name.toLowerCase().includes('iphone'));
    const mobileIpads = mobile.filter(m => m.name.toLowerCase().includes('ipad'));
    const tabletIpads = tablet.filter(m => m.name.toLowerCase().includes('ipad'));
    
    console.log(`📱 Mobile category: ${mobile.length} models`);
    console.log(`   - iPhones: ${mobileIphones.length}`);
    console.log(`   - iPads: ${mobileIpads.length} (should be 0)`);
    console.log(`�� Tablet category: ${tablet.length} models`);
    console.log(`   - iPads: ${tabletIpads.length}`);

    if (mobileIpads.length === 0) {
      console.log('\n✅ iPad categorization fix successful!');
    } else {
      console.log('\n⚠️ Some iPads still in mobile category');
    }
  }
}

fixIPadCategorization().catch(console.error);
