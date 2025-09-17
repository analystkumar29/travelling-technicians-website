const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateDeviceTypes() {
  console.log('🔍 Investigating device type categorization issues...\n');

  // Check Apple models by device type
  const { data: appleModels, error } = await supabase
    .from('device_models')
    .select(`
      id, 
      name, 
      data_source,
      brands!inner(name, device_types!inner(name))
    `)
    .eq('brands.name', 'apple')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`📱 Found ${appleModels.length} Apple models total\n`);

  // Group by device type
  const byDeviceType = {};
  const ipadInMobile = [];
  const iphoneInNonMobile = [];

  appleModels.forEach(model => {
    const deviceType = model.brands.device_types.name;
    if (!byDeviceType[deviceType]) {
      byDeviceType[deviceType] = [];
    }
    byDeviceType[deviceType].push(model);

    // Check for misclassified models
    if (model.name.toLowerCase().includes('ipad') && deviceType === 'mobile') {
      ipadInMobile.push(model);
    }
    if (model.name.toLowerCase().includes('iphone') && deviceType !== 'mobile') {
      iphoneInNonMobile.push(model);
    }
  });

  console.log('📊 Models by Device Type:');
  console.log('=========================');
  Object.keys(byDeviceType).forEach(deviceType => {
    const models = byDeviceType[deviceType];
    console.log(`\n${deviceType.toUpperCase()}: ${models.length} models`);
    
    const iphones = models.filter(m => m.name.toLowerCase().includes('iphone'));
    const ipads = models.filter(m => m.name.toLowerCase().includes('ipad'));
    const others = models.filter(m => !m.name.toLowerCase().includes('iphone') && !m.name.toLowerCase().includes('ipad'));
    
    console.log(`  - iPhones: ${iphones.length}`);
    console.log(`  - iPads: ${ipads.length}`);
    console.log(`  - Others: ${others.length}`);
    
    if (iphones.length > 0) {
      console.log(`  Sample iPhones: ${iphones.slice(0, 3).map(m => m.name).join(', ')}`);
    }
    if (ipads.length > 0) {
      console.log(`  Sample iPads: ${ipads.slice(0, 3).map(m => m.name).join(', ')}`);
    }
  });

  if (ipadInMobile.length > 0) {
    console.log('\n🚨 PROBLEM: iPads categorized as mobile devices:');
    console.log('=============================================');
    ipadInMobile.slice(0, 10).forEach(model => {
      console.log(`  - ${model.name} (${model.data_source})`);
    });
  }

  if (iphoneInNonMobile.length > 0) {
    console.log('\n🚨 PROBLEM: iPhones categorized as non-mobile devices:');
    console.log('=================================================');
    iphoneInNonMobile.forEach(model => {
      console.log(`  - ${model.name} in ${model.brands.device_types.name} (${model.data_source})`);
    });
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Total misclassified iPads in mobile: ${ipadInMobile.length}`);
  console.log(`  Total misclassified iPhones in non-mobile: ${iphoneInNonMobile.length}`);
}

investigateDeviceTypes().catch(console.error);
