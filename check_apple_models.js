const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppleModels() {
  console.log('🔍 Checking Apple mobile models in database...\n');

  // Get Apple brand for mobile device type
  const { data: brands, error: brandError } = await supabase
    .from('brands')
    .select(`
      id, 
      name,
      device_types!inner(id, name)
    `)
    .eq('device_types.name', 'mobile')
    .ilike('name', '%apple%');

  if (brandError) {
    console.error('Error fetching brands:', brandError);
    return;
  }

  console.log('📱 Found Apple brands:', brands);

  if (brands.length === 0) {
    console.log('❌ No Apple brands found for mobile device type');
    return;
  }

  const appleBrand = brands[0];

  // Get models for Apple brand
  const { data: models, error: modelsError } = await supabase
    .from('device_models')
    .select('id, name, display_name, quality_score, data_source, is_active')
    .eq('brand_id', appleBrand.id)
    .eq('is_active', true)
    .limit(20);

  if (modelsError) {
    console.error('Error fetching models:', modelsError);
    return;
  }

  console.log(`\n📱 Found ${models.length} Apple mobile models:`);
  console.log('=====================================');
  
  models.forEach((model, index) => {
    console.log(`${index + 1}. ${model.name} (Score: ${model.quality_score}, Source: ${model.data_source})`);
  });

  // Check if we have iPhone models specifically
  const iPhoneModels = models.filter(m => m.name.toLowerCase().includes('iphone'));
  const iPadModels = models.filter(m => m.name.toLowerCase().includes('ipad'));
  
  console.log(`\n📊 Model Types:`);
  console.log(`   iPhone models: ${iPhoneModels.length}`);
  console.log(`   iPad models: ${iPadModels.length}`);
  console.log(`   Other models: ${models.length - iPhoneModels.length - iPadModels.length}`);

  if (iPhoneModels.length > 0) {
    console.log('\n📱 Sample iPhone models:');
    iPhoneModels.slice(0, 5).forEach(model => {
      console.log(`   - ${model.name}`);
    });
  }

  if (iPadModels.length > 0) {
    console.log('\n📟 Sample iPad models:');
    iPadModels.slice(0, 5).forEach(model => {
      console.log(`   - ${model.name}`);
    });
  }
}

checkAppleModels().catch(console.error);
