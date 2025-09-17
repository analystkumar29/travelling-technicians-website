const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDataQualityIssues() {
  console.log('🔧 Fixing data quality issues...\n');

  let fixedCount = 0;

  // 1. Deactivate "unknown" models
  console.log('1️⃣ Deactivating "unknown" models...');
  const { data: unknownUpdated, error: unknownError } = await supabase
    .from('device_models')
    .update({ 
      is_active: false, 
      quality_score: 0,
      needs_review: true 
    })
    .eq('name', 'unknown')
    .select('id');

  if (unknownError) {
    console.error('Error deactivating unknown models:', unknownError);
  } else {
    console.log(`   ✅ Deactivated ${unknownUpdated.length} "unknown" models`);
    fixedCount += unknownUpdated.length;
  }

  // 2. Fix iPad categorization - get tablet device type ID first
  console.log('\n2️⃣ Fixing iPad categorization...');
  
  const { data: tabletType, error: tabletError } = await supabase
    .from('device_types')
    .select('id')
    .eq('name', 'tablet')
    .single();

  if (tabletError || !tabletType) {
    console.log('   ❌ Tablet device type not found, creating it...');
    
    const { data: newTabletType, error: createError } = await supabase
      .from('device_types')
      .insert({ name: 'tablet', display_name: 'Tablet', sort_order: 3 })
      .select('id')
      .single();
    
    if (createError) {
      console.error('Error creating tablet device type:', createError);
      return;
    }
    
    console.log('   ✅ Created tablet device type');
    tabletType = newTabletType;
  }

  // Get or create Apple tablet brand
  const { data: tabletBrand, error: tabletBrandError } = await supabase
    .from('brands')
    .select('id')
    .eq('name', 'apple')
    .eq('device_type_id', tabletType.id)
    .single();

  let appleTabletBrandId;
  
  if (tabletBrandError || !tabletBrand) {
    console.log('   Creating Apple tablet brand...');
    
    const { data: newTabletBrand, error: createBrandError } = await supabase
      .from('brands')
      .insert({ 
        name: 'apple', 
        display_name: 'Apple', 
        device_type_id: tabletType.id,
        sort_order: 1 
      })
      .select('id')
      .single();
    
    if (createBrandError) {
      console.error('Error creating Apple tablet brand:', createBrandError);
      return;
    }
    
    appleTabletBrandId = newTabletBrand.id;
    console.log('   ✅ Created Apple tablet brand');
  } else {
    appleTabletBrandId = tabletBrand.id;
  }

  // Move iPad models to tablet brand
  const { data: iPadModels, error: iPadError } = await supabase
    .from('device_models')
    .select('id, name')
    .ilike('name', '%ipad%')
    .eq('is_active', true);

  if (iPadError) {
    console.error('Error fetching iPad models:', iPadError);
  } else {
    console.log(`   Found ${iPadModels.length} iPad models to move`);
    
    const { data: movedModels, error: moveError } = await supabase
      .from('device_models')
      .update({ brand_id: appleTabletBrandId })
      .ilike('name', '%ipad%')
      .eq('is_active', true)
      .select('id');

    if (moveError) {
      console.error('Error moving iPad models:', moveError);
    } else {
      console.log(`   ✅ Moved ${movedModels.length} iPad models to tablet category`);
      fixedCount += movedModels.length;
    }
  }

  // 3. Fix short/generic names
  console.log('\n3️⃣ Fixing short/generic model names...');
  
  const shortNames = ['SE 2020', 'SE 2022'];
  for (const shortName of shortNames) {
    const { data: updated, error: updateError } = await supabase
      .from('device_models')
      .update({ 
        name: `iPhone ${shortName}`,
        display_name: `iPhone ${shortName}`,
        quality_score: 95
      })
      .eq('name', shortName)
      .select('id');

    if (updateError) {
      console.error(`Error updating ${shortName}:`, updateError);
    } else if (updated.length > 0) {
      console.log(`   ✅ Updated "${shortName}" to "iPhone ${shortName}"`);
      fixedCount += updated.length;
    }
  }

  // 4. Update quality audit patterns to catch these issues
  console.log('\n4️⃣ Summary of fixes applied:');
  console.log(`   Total models fixed: ${fixedCount}`);
  
  // Show current status
  const { data: currentAppleModels, error: statusError } = await supabase
    .from('device_models')
    .select(`
      id, 
      name,
      brands!inner(name, device_types!inner(name))
    `)
    .eq('brands.name', 'apple')
    .eq('is_active', true);

  if (!statusError) {
    const mobile = currentAppleModels.filter(m => m.brands.device_types.name === 'mobile');
    const tablet = currentAppleModels.filter(m => m.brands.device_types.name === 'tablet');
    
    const mobileIphones = mobile.filter(m => m.name.toLowerCase().includes('iphone'));
    const mobileIpads = mobile.filter(m => m.name.toLowerCase().includes('ipad'));
    const mobileUnknown = mobile.filter(m => m.name.toLowerCase() === 'unknown');
    
    console.log(`\n📊 Current Apple Models Status:`);
    console.log(`   Mobile category: ${mobile.length} models`);
    console.log(`     - iPhones: ${mobileIphones.length}`);
    console.log(`     - iPads: ${mobileIpads.length}`);
    console.log(`     - Unknown: ${mobileUnknown.length}`);
    console.log(`   Tablet category: ${tablet.length} models`);
  }

  console.log('\n✅ Data quality fixes completed!');
}

fixDataQualityIssues().catch(console.error);
