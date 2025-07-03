const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBrands() {
  console.log('🔍 Checking all brands in database...\n');
  
  try {
    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, name, is_active, device_type_id')
      .order('name');
    
    if (error) {
      console.error('❌ Error fetching brands:', error.message);
      return;
    }
    
    console.log('🏷️  All brands:');
    brands.forEach(brand => {
      console.log(`  ${brand.name} (ID: ${brand.id}, Active: ${brand.is_active}, Device Type: ${brand.device_type_id})`);
    });
    
    // Find Samsung specifically
    const samsungBrands = brands.filter(b => b.name.toLowerCase().includes('samsung'));
    console.log('\n📱 Samsung brands:');
    samsungBrands.forEach(brand => {
      console.log(`  ${brand.name} (ID: ${brand.id})`);
    });
    
    // Get device types
    const { data: deviceTypes, error: dtError } = await supabase
      .from('device_types')
      .select('id, name');
    
    if (!dtError) {
      console.log('\n📱 Device types:');
      deviceTypes.forEach(dt => {
        console.log(`  ${dt.name} (ID: ${dt.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkBrands(); 