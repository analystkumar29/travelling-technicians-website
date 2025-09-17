const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUnclearModels() {
  console.log('🔍 Investigating unclear Apple model names...\n');

  // Get Apple models that are not iPhone or iPad
  const { data: appleModels, error } = await supabase
    .from('device_models')
    .select(`
      id, 
      name, 
      display_name,
      quality_score,
      data_source,
      brands!inner(name, device_types!inner(name))
    `)
    .eq('brands.name', 'apple')
    .eq('brands.device_types.name', 'mobile')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const others = appleModels.filter(model => 
    !model.name.toLowerCase().includes('iphone') && 
    !model.name.toLowerCase().includes('ipad')
  );

  console.log(`📱 Found ${others.length} unclear Apple models in mobile category:`);
  console.log('=======================================================');

  // Group by patterns
  const patterns = {};
  
  others.forEach(model => {
    const name = model.name.toLowerCase();
    
    if (name === 'unknown' || name === '' || name === 'null') {
      if (!patterns['Unknown/Empty']) patterns['Unknown/Empty'] = [];
      patterns['Unknown/Empty'].push(model);
    } else if (name.includes('macbook')) {
      if (!patterns['MacBook (should be laptop)']) patterns['MacBook (should be laptop)'] = [];
      patterns['MacBook (should be laptop)'].push(model);
    } else if (name.includes('watch')) {
      if (!patterns['Apple Watch']) patterns['Apple Watch'] = [];
      patterns['Apple Watch'].push(model);
    } else if (name.includes('airpods') || name.includes('headphone')) {
      if (!patterns['Audio Devices']) patterns['Audio Devices'] = [];
      patterns['Audio Devices'].push(model);
    } else if (name.includes('imac') || name.includes('mac mini') || name.includes('mac pro')) {
      if (!patterns['Desktop Macs']) patterns['Desktop Macs'] = [];
      patterns['Desktop Macs'].push(model);
    } else if (name.length < 5 || /^[a-z0-9\s\-]{1,10}$/.test(name)) {
      if (!patterns['Short/Generic Names']) patterns['Short/Generic Names'] = [];
      patterns['Short/Generic Names'].push(model);
    } else {
      if (!patterns['Other Unclear']) patterns['Other Unclear'] = [];
      patterns['Other Unclear'].push(model);
    }
  });

  Object.keys(patterns).forEach(pattern => {
    const models = patterns[pattern];
    console.log(`\n📱 ${pattern}: ${models.length} models`);
    
    models.slice(0, 10).forEach(model => {
      console.log(`   - "${model.name}" (${model.data_source}, score: ${model.quality_score})`);
    });
    
    if (models.length > 10) {
      console.log(`   ... and ${models.length - 10} more`);
    }
  });

  console.log(`\n📊 Summary of Issues:`);
  Object.keys(patterns).forEach(pattern => {
    console.log(`  ${pattern}: ${patterns[pattern].length} models`);
  });
}

checkUnclearModels().catch(console.error);
