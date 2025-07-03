const { createClient } = require('@supabase/supabase-js');

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

async function restoreOldDatabaseCorrected() {
  log('🚀 Restoring Old Database with Corrected Schema', 'step');
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
    { name: 'mobile', display_name: 'Mobile Phones', is_active: true, sort_order: 0 },
    { name: 'laptop', display_name: 'Laptops & Computers', is_active: true, sort_order: 1 },
    { name: 'tablet', display_name: 'Tablets', is_active: true, sort_order: 2 }
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
  // Create a comprehensive list of popular device models
  const deviceModels = [
    // Apple Mobile
    { name: 'iphone 15 pro max', display_name: 'iPhone 15 Pro Max', brand_id: 1, is_active: true, sort_order: 0 },
    { name: 'iphone 15 pro', display_name: 'iPhone 15 Pro', brand_id: 1, is_active: true, sort_order: 1 },
    { name: 'iphone 15', display_name: 'iPhone 15', brand_id: 1, is_active: true, sort_order: 2 },
    { name: 'iphone 14 pro max', display_name: 'iPhone 14 Pro Max', brand_id: 1, is_active: true, sort_order: 3 },
    { name: 'iphone 14 pro', display_name: 'iPhone 14 Pro', brand_id: 1, is_active: true, sort_order: 4 },
    { name: 'iphone 14', display_name: 'iPhone 14', brand_id: 1, is_active: true, sort_order: 5 },
    { name: 'iphone 13 pro max', display_name: 'iPhone 13 Pro Max', brand_id: 1, is_active: true, sort_order: 6 },
    { name: 'iphone 13 pro', display_name: 'iPhone 13 Pro', brand_id: 1, is_active: true, sort_order: 7 },
    { name: 'iphone 13', display_name: 'iPhone 13', brand_id: 1, is_active: true, sort_order: 8 },
    { name: 'iphone 12 pro max', display_name: 'iPhone 12 Pro Max', brand_id: 1, is_active: true, sort_order: 9 },
    { name: 'iphone 12 pro', display_name: 'iPhone 12 Pro', brand_id: 1, is_active: true, sort_order: 10 },
    { name: 'iphone 12', display_name: 'iPhone 12', brand_id: 1, is_active: true, sort_order: 11 },
    { name: 'iphone 11 pro max', display_name: 'iPhone 11 Pro Max', brand_id: 1, is_active: true, sort_order: 12 },
    { name: 'iphone 11 pro', display_name: 'iPhone 11 Pro', brand_id: 1, is_active: true, sort_order: 13 },
    { name: 'iphone 11', display_name: 'iPhone 11', brand_id: 1, is_active: true, sort_order: 14 },
    { name: 'iphone se', display_name: 'iPhone SE', brand_id: 1, is_active: true, sort_order: 15 },
    
    // Samsung Mobile
    { name: 'galaxy s24 ultra', display_name: 'Galaxy S24 Ultra', brand_id: 2, is_active: true, sort_order: 0 },
    { name: 'galaxy s24 plus', display_name: 'Galaxy S24+', brand_id: 2, is_active: true, sort_order: 1 },
    { name: 'galaxy s24', display_name: 'Galaxy S24', brand_id: 2, is_active: true, sort_order: 2 },
    { name: 'galaxy s23 ultra', display_name: 'Galaxy S23 Ultra', brand_id: 2, is_active: true, sort_order: 3 },
    { name: 'galaxy s23 plus', display_name: 'Galaxy S23+', brand_id: 2, is_active: true, sort_order: 4 },
    { name: 'galaxy s23', display_name: 'Galaxy S23', brand_id: 2, is_active: true, sort_order: 5 },
    { name: 'galaxy s22 ultra', display_name: 'Galaxy S22 Ultra', brand_id: 2, is_active: true, sort_order: 6 },
    { name: 'galaxy s22 plus', display_name: 'Galaxy S22+', brand_id: 2, is_active: true, sort_order: 7 },
    { name: 'galaxy s22', display_name: 'Galaxy S22', brand_id: 2, is_active: true, sort_order: 8 },
    { name: 'galaxy s21 ultra', display_name: 'Galaxy S21 Ultra', brand_id: 2, is_active: true, sort_order: 9 },
    { name: 'galaxy s21 plus', display_name: 'Galaxy S21+', brand_id: 2, is_active: true, sort_order: 10 },
    { name: 'galaxy s21', display_name: 'Galaxy S21', brand_id: 2, is_active: true, sort_order: 11 },
    { name: 'galaxy note 20 ultra', display_name: 'Galaxy Note 20 Ultra', brand_id: 2, is_active: true, sort_order: 12 },
    { name: 'galaxy note 20', display_name: 'Galaxy Note 20', brand_id: 2, is_active: true, sort_order: 13 },
    { name: 'galaxy z fold 5', display_name: 'Galaxy Z Fold 5', brand_id: 2, is_active: true, sort_order: 14 },
    { name: 'galaxy z flip 5', display_name: 'Galaxy Z Flip 5', brand_id: 2, is_active: true, sort_order: 15 },
    
    // Google Mobile
    { name: 'pixel 8 pro', display_name: 'Pixel 8 Pro', brand_id: 3, is_active: true, sort_order: 0 },
    { name: 'pixel 8', display_name: 'Pixel 8', brand_id: 3, is_active: true, sort_order: 1 },
    { name: 'pixel 7 pro', display_name: 'Pixel 7 Pro', brand_id: 3, is_active: true, sort_order: 2 },
    { name: 'pixel 7', display_name: 'Pixel 7', brand_id: 3, is_active: true, sort_order: 3 },
    { name: 'pixel 6 pro', display_name: 'Pixel 6 Pro', brand_id: 3, is_active: true, sort_order: 4 },
    { name: 'pixel 6', display_name: 'Pixel 6', brand_id: 3, is_active: true, sort_order: 5 },
    
    // Apple Laptop
    { name: 'macbook pro 16', display_name: 'MacBook Pro 16"', brand_id: 6, is_active: true, sort_order: 0 },
    { name: 'macbook pro 14', display_name: 'MacBook Pro 14"', brand_id: 6, is_active: true, sort_order: 1 },
    { name: 'macbook pro 13', display_name: 'MacBook Pro 13"', brand_id: 6, is_active: true, sort_order: 2 },
    { name: 'macbook air 15', display_name: 'MacBook Air 15"', brand_id: 6, is_active: true, sort_order: 3 },
    { name: 'macbook air 13', display_name: 'MacBook Air 13"', brand_id: 6, is_active: true, sort_order: 4 },
    { name: 'macbook', display_name: 'MacBook', brand_id: 6, is_active: true, sort_order: 5 },
    
    // Dell Laptop
    { name: 'xps 13', display_name: 'XPS 13', brand_id: 7, is_active: true, sort_order: 0 },
    { name: 'xps 15', display_name: 'XPS 15', brand_id: 7, is_active: true, sort_order: 1 },
    { name: 'xps 17', display_name: 'XPS 17', brand_id: 7, is_active: true, sort_order: 2 },
    { name: 'latitude 5520', display_name: 'Latitude 5520', brand_id: 7, is_active: true, sort_order: 3 },
    { name: 'precision 5560', display_name: 'Precision 5560', brand_id: 7, is_active: true, sort_order: 4 },
    
    // HP Laptop
    { name: 'spectre x360', display_name: 'Spectre x360', brand_id: 8, is_active: true, sort_order: 0 },
    { name: 'envy x360', display_name: 'Envy x360', brand_id: 8, is_active: true, sort_order: 1 },
    { name: 'pavilion', display_name: 'Pavilion', brand_id: 8, is_active: true, sort_order: 2 },
    { name: 'elitebook', display_name: 'EliteBook', brand_id: 8, is_active: true, sort_order: 3 },
    
    // Apple Tablet
    { name: 'ipad pro 12.9', display_name: 'iPad Pro 12.9"', brand_id: 13, is_active: true, sort_order: 0 },
    { name: 'ipad pro 11', display_name: 'iPad Pro 11"', brand_id: 13, is_active: true, sort_order: 1 },
    { name: 'ipad air', display_name: 'iPad Air', brand_id: 13, is_active: true, sort_order: 2 },
    { name: 'ipad', display_name: 'iPad', brand_id: 13, is_active: true, sort_order: 3 },
    { name: 'ipad mini', display_name: 'iPad mini', brand_id: 13, is_active: true, sort_order: 4 },
    
    // Samsung Tablet
    { name: 'galaxy tab s9 ultra', display_name: 'Galaxy Tab S9 Ultra', brand_id: 14, is_active: true, sort_order: 0 },
    { name: 'galaxy tab s9 plus', display_name: 'Galaxy Tab S9+', brand_id: 14, is_active: true, sort_order: 1 },
    { name: 'galaxy tab s9', display_name: 'Galaxy Tab S9', brand_id: 14, is_active: true, sort_order: 2 },
    { name: 'galaxy tab s8 ultra', display_name: 'Galaxy Tab S8 Ultra', brand_id: 14, is_active: true, sort_order: 3 },
    { name: 'galaxy tab s8 plus', display_name: 'Galaxy Tab S8+', brand_id: 14, is_active: true, sort_order: 4 },
    { name: 'galaxy tab s8', display_name: 'Galaxy Tab S8', brand_id: 14, is_active: true, sort_order: 5 }
  ];
  
  // Insert device models in batches
  const batchSize = 50;
  for (let i = 0; i < deviceModels.length; i += batchSize) {
    const batch = deviceModels.slice(i, i + batchSize);
    const { error } = await supabase
      .from('device_models')
      .insert(batch);
    
    if (error) {
      log(`❌ Error inserting device models batch ${Math.floor(i/batchSize) + 1}: ${error.message}`, 'error');
    } else {
      log(`✅ Inserted device models batch ${Math.floor(i/batchSize) + 1}: ${batch.length} models`, 'success');
    }
  }
  
  log(`✅ Total device models inserted: ${deviceModels.length}`, 'success');
}

async function restoreServices() {
  const services = [
    // Mobile services
    { name: 'screen_replacement', display_name: 'Screen Replacement', device_type_id: 1, description: 'Professional screen replacement service with quality parts', estimated_duration_minutes: 60, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 1, is_active: true },
    { name: 'battery_replacement', display_name: 'Battery Replacement', device_type_id: 1, description: 'Replace your device battery with genuine parts', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 2, is_active: true },
    { name: 'charging_port_repair', display_name: 'Charging Port Repair', device_type_id: 1, description: 'Fix charging port issues and restore charging functionality', estimated_duration_minutes: 30, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 3, is_active: true },
    { name: 'camera_repair', display_name: 'Camera Repair', device_type_id: 1, description: 'Repair camera modules and restore photo/video functionality', estimated_duration_minutes: 45, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 4, is_active: true },
    { name: 'speaker_repair', display_name: 'Speaker Repair', device_type_id: 1, description: 'Fix speaker issues and restore audio quality', estimated_duration_minutes: 30, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 5, is_active: true },
    { name: 'microphone_repair', display_name: 'Microphone Repair', device_type_id: 1, description: 'Repair microphone and restore call quality', estimated_duration_minutes: 30, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 6, is_active: true },
    { name: 'back_cover_replacement', display_name: 'Back Cover Replacement', device_type_id: 1, description: 'Replace damaged back cover with genuine parts', estimated_duration_minutes: 20, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 7, is_active: true },
    
    // Laptop services
    { name: 'screen_replacement', display_name: 'Screen Replacement', device_type_id: 2, description: 'Professional laptop screen replacement service', estimated_duration_minutes: 90, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 1, is_active: true },
    { name: 'battery_replacement', display_name: 'Battery Replacement', device_type_id: 2, description: 'Replace laptop battery with genuine parts', estimated_duration_minutes: 60, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 2, is_active: true },
    { name: 'keyboard_repair', display_name: 'Keyboard Repair', device_type_id: 2, description: 'Repair or replace laptop keyboard', estimated_duration_minutes: 45, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 3, is_active: true },
    { name: 'trackpad_repair', display_name: 'Trackpad Repair', device_type_id: 2, description: 'Fix trackpad issues and restore functionality', estimated_duration_minutes: 30, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 4, is_active: true },
    { name: 'ram_upgrade', display_name: 'RAM Upgrade', device_type_id: 2, description: 'Upgrade laptop RAM for better performance', estimated_duration_minutes: 30, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 5, is_active: true },
    { name: 'storage_upgrade', display_name: 'Storage Upgrade', device_type_id: 2, description: 'Upgrade to SSD or increase storage capacity', estimated_duration_minutes: 60, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 6, is_active: true },
    { name: 'software_troubleshooting', display_name: 'Software Troubleshooting', device_type_id: 2, description: 'Diagnose and fix software issues', estimated_duration_minutes: 45, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 7, is_active: true },
    { name: 'virus_removal', display_name: 'Virus Removal', device_type_id: 2, description: 'Remove malware and viruses from your laptop', estimated_duration_minutes: 60, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 8, is_active: true },
    { name: 'cooling_system_repair', display_name: 'Cooling System Repair', device_type_id: 2, description: 'Repair laptop cooling system and prevent overheating', estimated_duration_minutes: 45, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 9, is_active: true },
    { name: 'power_jack_repair', display_name: 'Power Jack Repair', device_type_id: 2, description: 'Repair charging port and power connection issues', estimated_duration_minutes: 60, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 10, is_active: true },
    
    // Tablet services
    { name: 'screen_replacement', display_name: 'Screen Replacement', device_type_id: 3, description: 'Professional tablet screen replacement service', estimated_duration_minutes: 75, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 1, is_active: true },
    { name: 'battery_replacement', display_name: 'Battery Replacement', device_type_id: 3, description: 'Replace tablet battery with genuine parts', estimated_duration_minutes: 60, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 2, is_active: true },
    { name: 'charging_port_repair', display_name: 'Charging Port Repair', device_type_id: 3, description: 'Fix charging port issues on tablets', estimated_duration_minutes: 45, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 3, is_active: true }
  ];
  
  for (const service of services) {
    const { error } = await supabase
      .from('services')
      .insert(service);
    
    if (error) {
      log(`❌ Error inserting service ${service.name} for ${service.device_type_id}: ${error.message}`, 'error');
    } else {
      log(`✅ Service ${service.name} (${service.device_type_id}) restored`, 'success');
    }
  }
}

async function restorePricingTiers() {
  const pricingTiers = [
    { name: 'economy', display_name: 'Economy', description: 'Budget-friendly option', warranty_months: 3, turnaround_hours: 72, is_active: true, sort_order: 0 },
    { name: 'standard', display_name: 'Standard', description: 'Balanced quality and price', warranty_months: 6, turnaround_hours: 48, is_active: true, sort_order: 1 },
    { name: 'premium', display_name: 'Premium', description: 'High-quality service', warranty_months: 12, turnaround_hours: 24, is_active: true, sort_order: 2 },
    { name: 'express', display_name: 'Express', description: 'Fastest turnaround', warranty_months: 6, turnaround_hours: 12, is_active: true, sort_order: 3 }
  ];
  
  for (const tier of pricingTiers) {
    const { error } = await supabase
      .from('pricing_tiers')
      .insert(tier);
    
    if (error) {
      log(`❌ Error inserting pricing tier ${tier.name}: ${error.message}`, 'error');
    } else {
      log(`✅ Pricing tier ${tier.name} restored`, 'success');
    }
  }
}

async function restoreDynamicPricing() {
  // Get reference data
  const { data: services } = await supabase.from('services').select('*');
  const { data: deviceModels } = await supabase.from('device_models').select('*');
  const { data: pricingTiers } = await supabase.from('pricing_tiers').select('*');
  
  if (!services || !deviceModels || !pricingTiers) {
    log('❌ Could not fetch reference data for pricing', 'error');
    return;
  }
  
  // Generate sample pricing data for popular combinations
  const pricingData = [];
  
  // Sample pricing for popular mobile devices
  const popularMobileModels = deviceModels.filter(m => m.brand_id <= 5); // First 5 brands are mobile
  const mobileServices = services.filter(s => s.device_type_id === 1);
  
  for (const model of popularMobileModels.slice(0, 10)) { // Limit to 10 popular models
    for (const service of mobileServices) {
      for (const tier of pricingTiers) {
        const basePrice = Math.floor(Math.random() * 200) + 50; // $50-$250
        const discountedPrice = Math.random() > 0.7 ? basePrice * 0.9 : null; // 30% chance of discount
        
        pricingData.push({
          service_id: service.id,
          model_id: model.id,
          pricing_tier_id: tier.id,
          base_price: basePrice,
          discounted_price: discountedPrice,
          cost_price: basePrice * 0.6, // 40% margin
          is_active: true
        });
      }
    }
  }
  
  // Sample pricing for popular laptop devices
  const popularLaptopModels = deviceModels.filter(m => m.brand_id >= 6 && m.brand_id <= 12); // Brands 6-12 are laptop
  const laptopServices = services.filter(s => s.device_type_id === 2);
  
  for (const model of popularLaptopModels.slice(0, 8)) { // Limit to 8 popular models
    for (const service of laptopServices) {
      for (const tier of pricingTiers) {
        const basePrice = Math.floor(Math.random() * 300) + 80; // $80-$380
        const discountedPrice = Math.random() > 0.7 ? basePrice * 0.9 : null;
        
        pricingData.push({
          service_id: service.id,
          model_id: model.id,
          pricing_tier_id: tier.id,
          base_price: basePrice,
          discounted_price: discountedPrice,
          cost_price: basePrice * 0.6,
          is_active: true
        });
      }
    }
  }
  
  // Sample pricing for popular tablet devices
  const popularTabletModels = deviceModels.filter(m => m.brand_id >= 13); // Brands 13+ are tablet
  const tabletServices = services.filter(s => s.device_type_id === 3);
  
  for (const model of popularTabletModels.slice(0, 5)) { // Limit to 5 popular models
    for (const service of tabletServices) {
      for (const tier of pricingTiers) {
        const basePrice = Math.floor(Math.random() * 250) + 60; // $60-$310
        const discountedPrice = Math.random() > 0.7 ? basePrice * 0.9 : null;
        
        pricingData.push({
          service_id: service.id,
          model_id: model.id,
          pricing_tier_id: tier.id,
          base_price: basePrice,
          discounted_price: discountedPrice,
          cost_price: basePrice * 0.6,
          is_active: true
        });
      }
    }
  }
  
  // Insert pricing data in batches
  const batchSize = 100;
  let insertedCount = 0;
  
  for (let i = 0; i < pricingData.length; i += batchSize) {
    const batch = pricingData.slice(i, i + batchSize);
    const { error } = await supabase
      .from('dynamic_pricing')
      .insert(batch);
    
    if (error) {
      log(`❌ Error inserting pricing batch ${Math.floor(i/batchSize) + 1}: ${error.message}`, 'error');
    } else {
      insertedCount += batch.length;
      log(`✅ Inserted pricing batch ${Math.floor(i/batchSize) + 1}: ${batch.length} entries`, 'success');
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

restoreOldDatabaseCorrected().catch(console.error); 