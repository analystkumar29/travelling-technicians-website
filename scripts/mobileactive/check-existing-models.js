const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExistingModels() {
  console.log('🔍 Checking your existing device models...\n');
  
  try {
    // Get brands
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, device_type_id')
      .eq('is_active', true)
      .order('name');
    
    if (brandsError) {
      console.error('❌ Error fetching brands:', brandsError.message);
      return;
    }
    
    console.log('🏷️  Your existing brands:');
    brands.forEach(brand => {
      console.log(`  ${brand.name} (ID: ${brand.id})`);
    });
    
    // Get models
    const { data: models, error: modelsError } = await supabase
      .from('device_models')
      .select('id, name, display_name, brand_id, brands(name)')
      .eq('is_active', true)
      .order('name');
    
    if (modelsError) {
      console.error('❌ Error fetching models:', modelsError.message);
      return;
    }
    
    console.log('\n📱 Your existing mobile models (Top 30):');
    const mobileModels = models.filter(m => 
      m.brands.name.toLowerCase() === 'apple' || 
      m.brands.name.toLowerCase() === 'samsung' || 
      m.brands.name.toLowerCase() === 'google'
    );
    
    mobileModels.slice(0, 30).forEach(model => {
      console.log(`  ${model.brands.name} ${model.name} (ID: ${model.id})`);
    });
    
    console.log(`\n📊 Total models in your system: ${models.length}`);
    console.log(`📱 Mobile models: ${mobileModels.length}`);
    
    // Show Apple models specifically
    const appleModels = models.filter(m => m.brands.name.toLowerCase() === 'apple');
    console.log('\n🍎 Apple models:');
    appleModels.slice(0, 15).forEach(model => {
      console.log(`  ${model.name} (ID: ${model.id})`);
    });
    
    // Show Samsung models specifically
    const samsungModels = models.filter(m => m.brands.name.toLowerCase() === 'samsung');
    console.log('\n📱 Samsung models:');
    samsungModels.slice(0, 15).forEach(model => {
      console.log(`  ${model.name} (ID: ${model.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkExistingModels(); 