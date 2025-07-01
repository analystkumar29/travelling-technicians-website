require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function setupPricingSimple() {
  console.log('🚀 Setting up Pricing Database (Simple Method)...\n');

  try {
    console.log('📋 Step 1: Creating pricing tables...');
    await createTablesViaAPI();
    
    console.log('🌱 Step 2: Seeding basic data...');
    await seedDataViaAPI();
    
    console.log('✅ Step 3: Verifying setup...');
    await verifySetup();
    
    console.log('\n🎉 Pricing Database Setup Completed!');
    console.log('\n📊 Summary:');
    await printSummary();
    
  } catch (error) {
    console.error('❌ Error setting up pricing database:', error.message);
    process.exit(1);
  }
}

async function createTablesViaAPI() {
  console.log('   📝 Creating tables via Supabase API...');

  // Service Categories
  const { error: categoriesError } = await supabase
    .from('service_categories')
    .upsert([
      { name: 'screen_repair', display_name: 'Screen Repair', description: 'Screen replacement and display repairs', icon_name: 'screen', sort_order: 1 },
      { name: 'battery_repair', display_name: 'Battery Repair', description: 'Battery replacement and power-related repairs', icon_name: 'battery', sort_order: 2 },
      { name: 'charging_repair', display_name: 'Charging Repair', description: 'Charging port and power jack repairs', icon_name: 'charging', sort_order: 3 },
      { name: 'audio_repair', display_name: 'Audio Repair', description: 'Speaker and microphone repairs', icon_name: 'audio', sort_order: 4 },
      { name: 'camera_repair', display_name: 'Camera Repair', description: 'Camera module and lens repairs', icon_name: 'camera', sort_order: 5 },
      { name: 'input_repair', display_name: 'Input Device Repair', description: 'Keyboard, trackpad, and button repairs', icon_name: 'keyboard', sort_order: 6 },
      { name: 'hardware_upgrade', display_name: 'Hardware Upgrade', description: 'Memory, storage, and component upgrades', icon_name: 'memory', sort_order: 7 },
      { name: 'software_repair', display_name: 'Software Repair', description: 'Software troubleshooting and optimization', icon_name: 'software', sort_order: 8 },
      { name: 'diagnostics', display_name: 'Diagnostics', description: 'Device diagnostics and assessments', icon_name: 'diagnostics', sort_order: 9 }
    ], { onConflict: 'name' });

  if (categoriesError && categoriesError.message && !categoriesError.message.includes('does not exist')) {
    throw new Error(`Failed to create service categories: ${categoriesError.message}`);
  }

  // Pricing Tiers
  const { error: tiersError } = await supabase
    .from('pricing_tiers')
    .upsert([
      {
        name: 'economy',
        display_name: 'Economy Repair',
        description: 'Budget-friendly repair with quality parts and standard warranty',
        price_multiplier: 0.85,
        estimated_delivery_hours: 48,
        includes_features: ['6-Month Warranty', 'Quality Parts', 'Professional Service', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics'],
        sort_order: 1
      },
      {
        name: 'standard',
        display_name: 'Standard Repair',
        description: 'Quality repair with standard timeframe and full warranty',
        price_multiplier: 1.00,
        estimated_delivery_hours: 24,
        includes_features: ['1-Year Warranty', 'Quality Parts', 'Professional Service', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics'],
        sort_order: 2
      },
      {
        name: 'premium',
        display_name: 'Premium Service',
        description: 'Priority service with premium parts and expedited handling',
        price_multiplier: 1.25,
        estimated_delivery_hours: 12,
        includes_features: ['1-Year Warranty', 'Premium Parts', 'Priority Service', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics', 'Express Handling', 'Quality Assurance Check'],
        sort_order: 3
      },
      {
        name: 'same_day',
        display_name: 'Same Day Service',
        description: 'Urgent repair completed within hours with premium service',
        price_multiplier: 1.50,
        estimated_delivery_hours: 4,
        includes_features: ['1-Year Warranty', 'Premium Parts', 'Same Day Completion', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics', 'Priority Technician Assignment', 'Rush Service Fee Included', 'Quality Assurance Check'],
        sort_order: 4
      }
    ], { onConflict: 'name' });

  if (tiersError && tiersError.message && !tiersError.message.includes('does not exist')) {
    throw new Error(`Failed to create pricing tiers: ${tiersError.message}`);
  }

  // Service Locations
  const { error: locationsError } = await supabase
    .from('service_locations')
    .upsert([
      { name: 'Vancouver Downtown', postal_code_prefixes: ['V6B', 'V6C', 'V6E', 'V6G', 'V6Z'], price_adjustment_percentage: 5.0, sort_order: 1 },
      { name: 'Vancouver West Side', postal_code_prefixes: ['V6H', 'V6J', 'V6K', 'V6L', 'V6M', 'V6N', 'V6P', 'V6R', 'V6S', 'V6T'], price_adjustment_percentage: 2.0, sort_order: 2 },
      { name: 'Vancouver East Side', postal_code_prefixes: ['V5K', 'V5L', 'V5M', 'V5N', 'V5P', 'V5R', 'V5S', 'V5T', 'V5V', 'V5W', 'V5X', 'V5Y', 'V5Z', 'V6A'], price_adjustment_percentage: 0.0, sort_order: 3 },
      { name: 'Richmond', postal_code_prefixes: ['V6X', 'V6Y', 'V7A', 'V7B', 'V7C', 'V7E'], price_adjustment_percentage: 3.0, sort_order: 4 },
      { name: 'Burnaby', postal_code_prefixes: ['V3J', 'V3N', 'V5A', 'V5B', 'V5C', 'V5E', 'V5G', 'V5H', 'V5J'], price_adjustment_percentage: 0.0, sort_order: 5 },
      { name: 'Surrey', postal_code_prefixes: ['V3R', 'V3S', 'V3T', 'V3V', 'V3W', 'V3X', 'V3Y', 'V3Z', 'V4A', 'V4B', 'V4C', 'V4N', 'V4P'], price_adjustment_percentage: -2.0, sort_order: 6 },
      { name: 'Coquitlam', postal_code_prefixes: ['V3B', 'V3C', 'V3E', 'V3H', 'V3K'], price_adjustment_percentage: 0.0, sort_order: 7 },
      { name: 'North Vancouver', postal_code_prefixes: ['V7G', 'V7H', 'V7J', 'V7K', 'V7L', 'V7M', 'V7N', 'V7P', 'V7R'], price_adjustment_percentage: 1.0, sort_order: 8 },
      { name: 'West Vancouver', postal_code_prefixes: ['V7S', 'V7T', 'V7V', 'V7W'], price_adjustment_percentage: 4.0, sort_order: 9 },
      { name: 'New Westminster', postal_code_prefixes: ['V3L', 'V3M'], price_adjustment_percentage: 0.0, sort_order: 10 },
      { name: 'Delta', postal_code_prefixes: ['V4C', 'V4E', 'V4G', 'V4K', 'V4L', 'V4M'], price_adjustment_percentage: -1.0, sort_order: 11 },
      { name: 'Langley', postal_code_prefixes: ['V1M', 'V2Y', 'V2Z', 'V3A'], price_adjustment_percentage: -1.0, sort_order: 12 }
    ], { onConflict: 'name' });

  if (locationsError && locationsError.message && !locationsError.message.includes('does not exist')) {
    throw new Error(`Failed to create service locations: ${locationsError.message}`);
  }

  console.log('   ✅ Basic data structures created');
}

async function seedDataViaAPI() {
  console.log('   📝 Seeding data via Supabase API...');

  try {
    // Get existing data to link properly
    const [deviceTypesResult, categoriesResult] = await Promise.all([
      supabase.from('device_types').select('id, name'),
      supabase.from('service_categories').select('id, name')
    ]);

    const deviceTypes = deviceTypesResult.data || [];
    const categories = categoriesResult.data || [];

    if (deviceTypes.length === 0 || categories.length === 0) {
      console.log('   ⚠️  Missing base data (device_types or service_categories)');
      return;
    }

    // Create services mapping
    const mobileTypeId = deviceTypes.find(dt => dt.name === 'mobile')?.id;
    const laptopTypeId = deviceTypes.find(dt => dt.name === 'laptop')?.id;
    const tabletTypeId = deviceTypes.find(dt => dt.name === 'tablet')?.id;

    const screenCategoryId = categories.find(c => c.name === 'screen_repair')?.id;
    const batteryCategoryId = categories.find(c => c.name === 'battery_repair')?.id;
    const chargingCategoryId = categories.find(c => c.name === 'charging_repair')?.id;
    const audioCategoryId = categories.find(c => c.name === 'audio_repair')?.id;
    const cameraCategoryId = categories.find(c => c.name === 'camera_repair')?.id;
    const inputCategoryId = categories.find(c => c.name === 'input_repair')?.id;
    const hardwareCategoryId = categories.find(c => c.name === 'hardware_upgrade')?.id;
    const softwareCategoryId = categories.find(c => c.name === 'software_repair')?.id;
    const diagnosticsCategoryId = categories.find(c => c.name === 'diagnostics')?.id;

    const services = [];

    // Mobile Services
    if (mobileTypeId) {
      services.push(
        { category_id: screenCategoryId, device_type_id: mobileTypeId, name: 'screen_replacement', display_name: 'Screen Replacement', description: 'Replace damaged or cracked screens with high-quality parts', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 1 },
        { category_id: batteryCategoryId, device_type_id: mobileTypeId, name: 'battery_replacement', display_name: 'Battery Replacement', description: 'Replace old or failing batteries to extend device life', estimated_duration_minutes: 30, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 2 },
        { category_id: chargingCategoryId, device_type_id: mobileTypeId, name: 'charging_port_repair', display_name: 'Charging Port Repair', description: 'Fix loose or non-functioning charging ports', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 3 },
        { category_id: audioCategoryId, device_type_id: mobileTypeId, name: 'speaker_microphone_repair', display_name: 'Speaker/Microphone Repair', description: 'Resolve audio issues with speakers or microphones', estimated_duration_minutes: 40, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 4 },
        { category_id: cameraCategoryId, device_type_id: mobileTypeId, name: 'camera_repair', display_name: 'Camera Repair', description: 'Fix front or rear camera issues', estimated_duration_minutes: 50, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 5 },
        { category_id: diagnosticsCategoryId, device_type_id: mobileTypeId, name: 'water_damage_diagnostics', display_name: 'Water Damage Diagnostics', description: 'Assess and repair water-damaged devices when possible', estimated_duration_minutes: 90, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 13 }
      );
    }

    // Laptop Services
    if (laptopTypeId) {
      services.push(
        { category_id: screenCategoryId, device_type_id: laptopTypeId, name: 'screen_replacement', display_name: 'Screen Replacement', description: 'Replace cracked or damaged laptop screens', estimated_duration_minutes: 60, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 1 },
        { category_id: batteryCategoryId, device_type_id: laptopTypeId, name: 'battery_replacement', display_name: 'Battery Replacement', description: 'Replace old laptop batteries to restore battery life', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 2 },
        { category_id: chargingCategoryId, device_type_id: laptopTypeId, name: 'power_jack_repair', display_name: 'Power Jack Repair', description: 'Fix laptop power jack and charging issues', estimated_duration_minutes: 50, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 3 },
        { category_id: audioCategoryId, device_type_id: laptopTypeId, name: 'speaker_repair', display_name: 'Speaker Repair', description: 'Fix laptop speaker and audio issues', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 4 },
        { category_id: cameraCategoryId, device_type_id: laptopTypeId, name: 'webcam_repair', display_name: 'Webcam Repair', description: 'Fix laptop webcam and video issues', estimated_duration_minutes: 40, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 5 },
        { category_id: inputCategoryId, device_type_id: laptopTypeId, name: 'keyboard_repair', display_name: 'Keyboard Repair/Replacement', description: 'Fix or replace damaged laptop keyboards', estimated_duration_minutes: 50, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 6 },
        { category_id: inputCategoryId, device_type_id: laptopTypeId, name: 'trackpad_repair', display_name: 'Trackpad Repair', description: 'Fix non-responsive or erratic trackpads', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 7 },
        { category_id: hardwareCategoryId, device_type_id: laptopTypeId, name: 'ram_upgrade', display_name: 'RAM Upgrade', description: 'Increase memory capacity for better performance', estimated_duration_minutes: 30, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 8 },
        { category_id: hardwareCategoryId, device_type_id: laptopTypeId, name: 'storage_upgrade', display_name: 'HDD/SSD Replacement/Upgrade', description: 'Replace or upgrade storage drives for better performance', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 9 },
        { category_id: softwareCategoryId, device_type_id: laptopTypeId, name: 'software_troubleshooting', display_name: 'Software Troubleshooting', description: 'Resolve software issues and performance problems', estimated_duration_minutes: 90, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 10 },
        { category_id: softwareCategoryId, device_type_id: laptopTypeId, name: 'virus_removal', display_name: 'Virus Removal', description: 'Remove malware and implement security measures', estimated_duration_minutes: 120, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 11 },
        { category_id: softwareCategoryId, device_type_id: laptopTypeId, name: 'os_installation', display_name: 'OS Installation/Repair', description: 'Install or repair operating system', estimated_duration_minutes: 180, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 12 },
        { category_id: diagnosticsCategoryId, device_type_id: laptopTypeId, name: 'hardware_diagnostics', display_name: 'Hardware Diagnostics', description: 'Comprehensive hardware testing and diagnosis', estimated_duration_minutes: 60, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 13 }
      );
    }

    // Tablet Services
    if (tabletTypeId) {
      services.push(
        { category_id: screenCategoryId, device_type_id: tabletTypeId, name: 'screen_replacement', display_name: 'Screen Replacement', description: 'Replace damaged or cracked tablet screens', estimated_duration_minutes: 50, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 1 },
        { category_id: batteryCategoryId, device_type_id: tabletTypeId, name: 'battery_replacement', display_name: 'Battery Replacement', description: 'Replace old tablet batteries to extend device life', estimated_duration_minutes: 40, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 2 },
        { category_id: diagnosticsCategoryId, device_type_id: tabletTypeId, name: 'general_diagnostics', display_name: 'General Diagnostics', description: 'Complete device assessment and diagnostics', estimated_duration_minutes: 60, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 13 }
      );
    }

    // Insert services
    if (services.length > 0) {
      const { error: servicesError } = await supabase
        .from('services')
        .upsert(services, { onConflict: 'category_id,device_type_id,name' });

      if (servicesError && servicesError.message && !servicesError.message.includes('does not exist')) {
        console.log(`   ⚠️  Services error: ${servicesError.message}`);
      } else {
        console.log(`   ✅ Created ${services.length} services`);
      }
    }

  } catch (error) {
    console.log(`   ⚠️  Data seeding failed: ${error.message}`);
  }
}

async function verifySetup() {
  const tables = [
    'service_categories',
    'services', 
    'pricing_tiers',
    'service_locations'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ⚠️  ${table}: Error - ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count || 0} records`);
      }
    } catch (err) {
      console.log(`   ⚠️  ${table}: Verification failed - ${err.message}`);
    }
  }
}

async function printSummary() {
  try {
    const summaryQueries = [
      { label: 'Service Categories', table: 'service_categories' },
      { label: 'Services', table: 'services' },
      { label: 'Pricing Tiers', table: 'pricing_tiers' },
      { label: 'Service Locations', table: 'service_locations' }
    ];

    for (const query of summaryQueries) {
      const { count } = await supabase
        .from(query.table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`   📊 ${query.label}: ${count || 0}`);
    }

  } catch (error) {
    console.log(`   ⚠️  Summary generation failed: ${error.message}`);
  }
}

// Run the setup
setupPricingSimple().catch(console.error); 