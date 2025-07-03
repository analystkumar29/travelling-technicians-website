const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client using environment variables (old database)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility functions
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    step: '🔧'
  }[level] || 'ℹ️';
  
  console.log(`${timestamp} ${emoji} ${message}`);
};

async function restoreOldDatabase() {
  log('🚀 Restoring Old Database with Complete MobileActive Data', 'step');
  log('📊 Database URL: ' + supabaseUrl, 'info');
  
  try {
    // Step 1: Clear existing data (except service_locations)
    log('Step 1: Clearing existing data...', 'step');
    await clearExistingData();
    
    // Step 2: Restore device types
    log('Step 2: Restoring device types...', 'step');
    await restoreDeviceTypes();
    
    // Step 3: Restore brands
    log('Step 3: Restoring brands...', 'step');
    await restoreBrands();
    
    // Step 4: Restore device models
    log('Step 4: Restoring device models...', 'step');
    await restoreDeviceModels();
    
    // Step 5: Restore services
    log('Step 5: Restoring services...', 'step');
    await restoreServices();
    
    // Step 6: Restore pricing tiers
    log('Step 6: Restoring pricing tiers...', 'step');
    await restorePricingTiers();
    
    // Step 7: Restore dynamic pricing
    log('Step 7: Restoring dynamic pricing...', 'step');
    await restoreDynamicPricing();
    
    // Step 8: Verify restoration
    log('Step 8: Verifying restoration...', 'step');
    await verifyRestoration();
    
    log('🎉 Database restoration completed successfully!', 'success');
    
  } catch (error) {
    log(`❌ Restoration failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

async function clearExistingData() {
  const tablesToClear = ['dynamic_pricing', 'pricing_tiers', 'device_models', 'brands'];
  
  for (const table of tablesToClear) {
    try {
      const { error } = await supabase.from(table).delete().neq('id', 0);
      if (error) {
        log(`⚠️ Could not clear ${table}: ${error.message}`, 'warning');
      } else {
        log(`✅ Cleared ${table}`, 'success');
      }
    } catch (err) {
      log(`⚠️ Error clearing ${table}: ${err.message}`, 'warning');
    }
  }
}

async function restoreDeviceTypes() {
  const deviceTypes = [
    { name: 'mobile', display_name: 'Mobile Phones', icon: '📱', is_active: true, sort_order: 0 },
    { name: 'laptop', display_name: 'Laptops & Computers', icon: '💻', is_active: true, sort_order: 1 },
    { name: 'tablet', display_name: 'Tablets', icon: '📱', is_active: true, sort_order: 2 }
  ];
  
  for (const deviceType of deviceTypes) {
    const { error } = await supabase
      .from('device_types')
      .upsert(deviceType, { onConflict: 'name' });
    
    if (error) {
      log(`❌ Error inserting device type ${deviceType.name}: ${error.message}`, 'error');
    } else {
      log(`✅ Device type ${deviceType.name} restored`, 'success');
    }
  }
}

async function restoreBrands() {
  const brands = [
    // Mobile brands
    { name: 'apple', display_name: 'Apple', logo_url: '/images/brands/apple.svg', device_type_id: 1, is_active: true, sort_order: 0 },
    { name: 'samsung', display_name: 'Samsung', logo_url: '/images/brands/samsung.svg', device_type_id: 1, is_active: true, sort_order: 1 },
    { name: 'google', display_name: 'Google', logo_url: '/images/brands/google.svg', device_type_id: 1, is_active: true, sort_order: 2 },
    { name: 'huawei', display_name: 'Huawei', logo_url: '/images/brands/huawei.svg', device_type_id: 1, is_active: true, sort_order: 3 },
    { name: 'oneplus', display_name: 'OnePlus', logo_url: '/images/brands/oneplus.svg', device_type_id: 1, is_active: true, sort_order: 4 },
    
    // Laptop brands
    { name: 'apple', display_name: 'Apple', logo_url: '/images/brands/apple.svg', device_type_id: 2, is_active: true, sort_order: 0 },
    { name: 'dell', display_name: 'Dell', logo_url: '/images/brands/dell.svg', device_type_id: 2, is_active: true, sort_order: 1 },
    { name: 'hp', display_name: 'HP', logo_url: '/images/brands/hp.svg', device_type_id: 2, is_active: true, sort_order: 2 },
    { name: 'lenovo', display_name: 'Lenovo', logo_url: '/images/brands/lenovo.svg', device_type_id: 2, is_active: true, sort_order: 3 },
    { name: 'asus', display_name: 'ASUS', logo_url: '/images/brands/asus.svg', device_type_id: 2, is_active: true, sort_order: 4 },
    { name: 'acer', display_name: 'Acer', logo_url: '/images/brands/acer.svg', device_type_id: 2, is_active: true, sort_order: 5 },
    { name: 'microsoft', display_name: 'Microsoft', logo_url: '/images/brands/microsoft.svg', device_type_id: 2, is_active: true, sort_order: 6 },
    
    // Tablet brands
    { name: 'apple', display_name: 'Apple', logo_url: '/images/brands/apple.svg', device_type_id: 3, is_active: true, sort_order: 0 },
    { name: 'samsung', display_name: 'Samsung', logo_url: '/images/brands/samsung.svg', device_type_id: 3, is_active: true, sort_order: 1 },
    { name: 'google', display_name: 'Google', logo_url: '/images/brands/google.svg', device_type_id: 3, is_active: true, sort_order: 2 },
    { name: 'microsoft', display_name: 'Microsoft', logo_url: '/images/brands/microsoft.svg', device_type_id: 3, is_active: true, sort_order: 3 }
  ];
  
  for (const brand of brands) {
    const { error } = await supabase
      .from('brands')
      .upsert(brand, { onConflict: 'name,device_type_id' });
    
    if (error) {
      log(`❌ Error inserting brand ${brand.name} for ${brand.device_type_id}: ${error.message}`, 'error');
    } else {
      log(`✅ Brand ${brand.name} (${brand.device_type_id}) restored`, 'success');
    }
  }
}

async function restoreDeviceModels() {
  // Load MobileActive data
  const mobileactiveDataPath = path.join(__dirname, 'mobileactive', 'cleaned-mobileactive-data.json');
  
  if (!fs.existsSync(mobileactiveDataPath)) {
    log('❌ MobileActive data file not found. Please run the data extraction first.', 'error');
    process.exit(1);
  }
  
  const mobileactiveData = JSON.parse(fs.readFileSync(mobileactiveDataPath, 'utf8'));
  
  // Get device types and brands for mapping
  const { data: deviceTypes } = await supabase.from('device_types').select('*');
  const { data: brands } = await supabase.from('brands').select('*');
  
  const deviceTypeMap = {};
  deviceTypes.forEach(dt => {
    deviceTypeMap[dt.name] = dt.id;
  });
  
  const brandMap = {};
  brands.forEach(b => {
    brandMap[`${b.name}-${b.device_type_id}`] = b.id;
  });
  
  // Process and insert device models
  let insertedCount = 0;
  const batchSize = 100;
  
  for (let i = 0; i < mobileactiveData.length; i += batchSize) {
    const batch = mobileactiveData.slice(i, i + batchSize);
    const modelsToInsert = [];
    
    for (const item of batch) {
      const deviceTypeId = deviceTypeMap[item.device_type];
      const brandKey = `${item.brand}-${deviceTypeId}`;
      const brandId = brandMap[brandKey];
      
      if (deviceTypeId && brandId) {
        modelsToInsert.push({
          name: item.model.toLowerCase(),
          display_name: item.model,
          brand_id: brandId,
          device_type_id: deviceTypeId,
          is_active: true,
          is_featured: item.is_featured || false,
          sort_order: item.sort_order || 0
        });
      }
    }
    
    if (modelsToInsert.length > 0) {
      const { error } = await supabase
        .from('device_models')
        .insert(modelsToInsert);
      
      if (error) {
        log(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}: ${error.message}`, 'error');
      } else {
        insertedCount += modelsToInsert.length;
        log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${modelsToInsert.length} models`, 'success');
      }
    }
  }
  
  log(`✅ Total device models inserted: ${insertedCount}`, 'success');
}

async function restoreServices() {
  const services = [
    // Mobile services
    { name: 'screen_replacement', display_name: 'Screen Replacement', device_type_id: 1, is_active: true, sort_order: 0 },
    { name: 'battery_replacement', display_name: 'Battery Replacement', device_type_id: 1, is_active: true, sort_order: 1 },
    { name: 'charging_port_repair', display_name: 'Charging Port Repair', device_type_id: 1, is_active: true, sort_order: 2 },
    { name: 'camera_repair', display_name: 'Camera Repair', device_type_id: 1, is_active: true, sort_order: 3 },
    { name: 'speaker_repair', display_name: 'Speaker Repair', device_type_id: 1, is_active: true, sort_order: 4 },
    { name: 'microphone_repair', display_name: 'Microphone Repair', device_type_id: 1, is_active: true, sort_order: 5 },
    { name: 'back_cover_replacement', display_name: 'Back Cover Replacement', device_type_id: 1, is_active: true, sort_order: 6 },
    
    // Laptop services
    { name: 'screen_replacement', display_name: 'Screen Replacement', device_type_id: 2, is_active: true, sort_order: 0 },
    { name: 'battery_replacement', display_name: 'Battery Replacement', device_type_id: 2, is_active: true, sort_order: 1 },
    { name: 'keyboard_repair', display_name: 'Keyboard Repair', device_type_id: 2, is_active: true, sort_order: 2 },
    { name: 'trackpad_repair', display_name: 'Trackpad Repair', device_type_id: 2, is_active: true, sort_order: 3 },
    { name: 'ram_upgrade', display_name: 'RAM Upgrade', device_type_id: 2, is_active: true, sort_order: 4 },
    { name: 'storage_upgrade', display_name: 'Storage Upgrade', device_type_id: 2, is_active: true, sort_order: 5 },
    { name: 'software_troubleshooting', display_name: 'Software Troubleshooting', device_type_id: 2, is_active: true, sort_order: 6 },
    { name: 'virus_removal', display_name: 'Virus Removal', device_type_id: 2, is_active: true, sort_order: 7 },
    { name: 'cooling_system_repair', display_name: 'Cooling System Repair', device_type_id: 2, is_active: true, sort_order: 8 },
    { name: 'power_jack_repair', display_name: 'Power Jack Repair', device_type_id: 2, is_active: true, sort_order: 9 },
    
    // Tablet services
    { name: 'screen_replacement', display_name: 'Screen Replacement', device_type_id: 3, is_active: true, sort_order: 0 },
    { name: 'battery_replacement', display_name: 'Battery Replacement', device_type_id: 3, is_active: true, sort_order: 1 },
    { name: 'charging_port_repair', display_name: 'Charging Port Repair', device_type_id: 3, is_active: true, sort_order: 2 }
  ];
  
  for (const service of services) {
    const { error } = await supabase
      .from('services')
      .upsert(service, { onConflict: 'name,device_type_id' });
    
    if (error) {
      log(`❌ Error inserting service ${service.name} for ${service.device_type_id}: ${error.message}`, 'error');
    } else {
      log(`✅ Service ${service.name} (${service.device_type_id}) restored`, 'success');
    }
  }
}

async function restorePricingTiers() {
  const pricingTiers = [
    { name: 'economy', display_name: 'Economy', description: 'Budget-friendly option', multiplier: 0.8, warranty_months: 3, turnaround_hours: 72, is_active: true, sort_order: 0 },
    { name: 'standard', display_name: 'Standard', description: 'Balanced quality and price', multiplier: 1.0, warranty_months: 6, turnaround_hours: 48, is_active: true, sort_order: 1 },
    { name: 'premium', display_name: 'Premium', description: 'High-quality service', multiplier: 1.25, warranty_months: 12, turnaround_hours: 24, is_active: true, sort_order: 2 },
    { name: 'express', display_name: 'Express', description: 'Fastest turnaround', multiplier: 1.5, warranty_months: 6, turnaround_hours: 12, is_active: true, sort_order: 3 }
  ];
  
  for (const tier of pricingTiers) {
    const { error } = await supabase
      .from('pricing_tiers')
      .upsert(tier, { onConflict: 'name' });
    
    if (error) {
      log(`❌ Error inserting pricing tier ${tier.name}: ${error.message}`, 'error');
    } else {
      log(`✅ Pricing tier ${tier.name} restored`, 'success');
    }
  }
}

async function restoreDynamicPricing() {
  // Load MobileActive pricing data
  const pricingDataPath = path.join(__dirname, 'mobileactive', 'mobileactive-pricing-data.json');
  
  if (!fs.existsSync(pricingDataPath)) {
    log('❌ MobileActive pricing data file not found. Please run the data extraction first.', 'error');
    process.exit(1);
  }
  
  const pricingData = JSON.parse(fs.readFileSync(pricingDataPath, 'utf8'));
  
  // Get reference data
  const { data: services } = await supabase.from('services').select('*');
  const { data: deviceModels } = await supabase.from('device_models').select('*');
  const { data: pricingTiers } = await supabase.from('pricing_tiers').select('*');
  
  const serviceMap = {};
  services.forEach(s => {
    serviceMap[`${s.name}-${s.device_type_id}`] = s.id;
  });
  
  const modelMap = {};
  deviceModels.forEach(m => {
    modelMap[`${m.name}-${m.brand_id}`] = m.id;
  });
  
  const tierMap = {};
  pricingTiers.forEach(t => {
    tierMap[t.name] = t.id;
  });
  
  // Process and insert pricing data
  let insertedCount = 0;
  const batchSize = 100;
  
  for (let i = 0; i < pricingData.length; i += batchSize) {
    const batch = pricingData.slice(i, i + batchSize);
    const pricingToInsert = [];
    
    for (const item of batch) {
      const serviceKey = `${item.service}-${item.device_type_id}`;
      const modelKey = `${item.model}-${item.brand_id}`;
      const serviceId = serviceMap[serviceKey];
      const modelId = modelMap[modelKey];
      const tierId = tierMap[item.tier];
      
      if (serviceId && modelId && tierId) {
        pricingToInsert.push({
          service_id: serviceId,
          model_id: modelId,
          pricing_tier_id: tierId,
          base_price: item.base_price,
          discounted_price: item.discounted_price || null,
          cost_price: item.cost_price || null,
          is_active: true
        });
      }
    }
    
    if (pricingToInsert.length > 0) {
      const { error } = await supabase
        .from('dynamic_pricing')
        .insert(pricingToInsert);
      
      if (error) {
        log(`❌ Error inserting pricing batch ${Math.floor(i/batchSize) + 1}: ${error.message}`, 'error');
      } else {
        insertedCount += pricingToInsert.length;
        log(`✅ Inserted pricing batch ${Math.floor(i/batchSize) + 1}: ${pricingToInsert.length} entries`, 'success');
      }
    }
  }
  
  log(`✅ Total pricing entries inserted: ${insertedCount}`, 'success');
}

async function verifyRestoration() {
  log('Verifying database restoration...', 'step');
  
  const tables = [
    'device_types', 'brands', 'device_models', 'services', 
    'pricing_tiers', 'dynamic_pricing', 'service_locations'
  ];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      log(`❌ ${table}: ${error.message}`, 'error');
    } else {
      log(`✅ ${table}: ${count || 0} records`, 'success');
    }
  }
  
  log('🎉 Database verification completed!', 'success');
}

restoreOldDatabase().catch(console.error); 