require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function populatePricingData() {
  console.log('🚀 Populating Pricing Data...\n');

  try {
    // 1. Service Categories
    console.log('📋 1. Inserting service categories...');
    const { data: categoriesData, error: categoriesError } = await supabase
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
      ], { onConflict: 'name' })
      .select();

    if (categoriesError) {
      console.log(`   ⚠️  Categories error: ${categoriesError.message}`);
    } else {
      console.log(`   ✅ Categories: ${categoriesData?.length || 0} records`);
    }

    // 2. Pricing Tiers
    console.log('📋 2. Inserting pricing tiers...');
    const { data: tiersData, error: tiersError } = await supabase
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
      ], { onConflict: 'name' })
      .select();

    if (tiersError) {
      console.log(`   ⚠️  Tiers error: ${tiersError.message}`);
    } else {
      console.log(`   ✅ Tiers: ${tiersData?.length || 0} records`);
    }

    // 3. Service Locations
    console.log('📋 3. Inserting service locations...');
    const { data: locationsData, error: locationsError } = await supabase
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
      ], { onConflict: 'name' })
      .select();

    if (locationsError) {
      console.log(`   ⚠️  Locations error: ${locationsError.message}`);
    } else {
      console.log(`   ✅ Locations: ${locationsData?.length || 0} records`);
    }

    // 4. Services
    console.log('📋 4. Inserting services...');
    
    // Get IDs for foreign keys
    const { data: deviceTypes } = await supabase.from('device_types').select('id, name');
    const { data: categories } = await supabase.from('service_categories').select('id, name');

    if (!deviceTypes || !categories || deviceTypes.length === 0 || categories.length === 0) {
      console.log('   ⚠️  Missing device types or categories for services');
      return;
    }

    const mobileId = deviceTypes.find(dt => dt.name === 'mobile')?.id;
    const laptopId = deviceTypes.find(dt => dt.name === 'laptop')?.id;
    const tabletId = deviceTypes.find(dt => dt.name === 'tablet')?.id;

    const getCatId = (name) => categories.find(c => c.name === name)?.id;

    const services = [];

    // Mobile services
    if (mobileId) {
      services.push(
        { category_id: getCatId('screen_repair'), device_type_id: mobileId, name: 'screen_replacement', display_name: 'Screen Replacement', description: 'Replace damaged or cracked screens with high-quality parts', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 1 },
        { category_id: getCatId('battery_repair'), device_type_id: mobileId, name: 'battery_replacement', display_name: 'Battery Replacement', description: 'Replace old or failing batteries to extend device life', estimated_duration_minutes: 30, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 2 },
        { category_id: getCatId('charging_repair'), device_type_id: mobileId, name: 'charging_port_repair', display_name: 'Charging Port Repair', description: 'Fix loose or non-functioning charging ports', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 3 },
        { category_id: getCatId('audio_repair'), device_type_id: mobileId, name: 'speaker_microphone_repair', display_name: 'Speaker/Microphone Repair', description: 'Resolve audio issues with speakers or microphones', estimated_duration_minutes: 40, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 4 },
        { category_id: getCatId('camera_repair'), device_type_id: mobileId, name: 'camera_repair', display_name: 'Camera Repair', description: 'Fix front or rear camera issues', estimated_duration_minutes: 50, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 5 },
        { category_id: getCatId('diagnostics'), device_type_id: mobileId, name: 'water_damage_diagnostics', display_name: 'Water Damage Diagnostics', description: 'Assess and repair water-damaged devices when possible', estimated_duration_minutes: 90, warranty_period_days: 180, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 13 }
      );
    }

    // Laptop services
    if (laptopId) {
      services.push(
        { category_id: getCatId('screen_repair'), device_type_id: laptopId, name: 'screen_replacement', display_name: 'Screen Replacement', description: 'Replace cracked or damaged laptop screens', estimated_duration_minutes: 60, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 1 },
        { category_id: getCatId('battery_repair'), device_type_id: laptopId, name: 'battery_replacement', display_name: 'Battery Replacement', description: 'Replace old laptop batteries to restore battery life', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 2 },
        { category_id: getCatId('charging_repair'), device_type_id: laptopId, name: 'power_jack_repair', display_name: 'Power Jack Repair', description: 'Fix laptop power jack and charging issues', estimated_duration_minutes: 50, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 3 },
        { category_id: getCatId('audio_repair'), device_type_id: laptopId, name: 'speaker_repair', display_name: 'Speaker Repair', description: 'Fix laptop speaker and audio issues', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 4 },
        { category_id: getCatId('camera_repair'), device_type_id: laptopId, name: 'webcam_repair', display_name: 'Webcam Repair', description: 'Fix laptop webcam and video issues', estimated_duration_minutes: 40, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 5 },
        { category_id: getCatId('input_repair'), device_type_id: laptopId, name: 'keyboard_repair', display_name: 'Keyboard Repair/Replacement', description: 'Fix or replace damaged laptop keyboards', estimated_duration_minutes: 50, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 6 },
        { category_id: getCatId('input_repair'), device_type_id: laptopId, name: 'trackpad_repair', display_name: 'Trackpad Repair', description: 'Fix non-responsive or erratic trackpads', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 7 },
        { category_id: getCatId('hardware_upgrade'), device_type_id: laptopId, name: 'ram_upgrade', display_name: 'RAM Upgrade', description: 'Increase memory capacity for better performance', estimated_duration_minutes: 30, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 8 },
        { category_id: getCatId('hardware_upgrade'), device_type_id: laptopId, name: 'storage_upgrade', display_name: 'HDD/SSD Replacement/Upgrade', description: 'Replace or upgrade storage drives for better performance', estimated_duration_minutes: 45, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 9 },
        { category_id: getCatId('software_repair'), device_type_id: laptopId, name: 'software_troubleshooting', display_name: 'Software Troubleshooting', description: 'Resolve software issues and performance problems', estimated_duration_minutes: 90, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 10 },
        { category_id: getCatId('software_repair'), device_type_id: laptopId, name: 'virus_removal', display_name: 'Virus Removal', description: 'Remove malware and implement security measures', estimated_duration_minutes: 120, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 11 },
        { category_id: getCatId('software_repair'), device_type_id: laptopId, name: 'os_installation', display_name: 'OS Installation/Repair', description: 'Install or repair operating system', estimated_duration_minutes: 180, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 12 },
        { category_id: getCatId('diagnostics'), device_type_id: laptopId, name: 'hardware_diagnostics', display_name: 'Hardware Diagnostics', description: 'Comprehensive hardware testing and diagnosis', estimated_duration_minutes: 60, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 13 }
      );
    }

    // Tablet services
    if (tabletId) {
      services.push(
        { category_id: getCatId('screen_repair'), device_type_id: tabletId, name: 'screen_replacement', display_name: 'Screen Replacement', description: 'Replace damaged or cracked tablet screens', estimated_duration_minutes: 50, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 1 },
        { category_id: getCatId('battery_repair'), device_type_id: tabletId, name: 'battery_replacement', display_name: 'Battery Replacement', description: 'Replace old tablet batteries to extend device life', estimated_duration_minutes: 40, warranty_period_days: 365, is_doorstep_eligible: true, requires_diagnostics: false, sort_order: 2 },
        { category_id: getCatId('diagnostics'), device_type_id: tabletId, name: 'general_diagnostics', display_name: 'General Diagnostics', description: 'Complete device assessment and diagnostics', estimated_duration_minutes: 60, warranty_period_days: 90, is_doorstep_eligible: true, requires_diagnostics: true, sort_order: 13 }
      );
    }

    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .upsert(services, { onConflict: 'category_id,device_type_id,name' })
      .select();

    if (servicesError) {
      console.log(`   ⚠️  Services error: ${servicesError.message}`);
    } else {
      console.log(`   ✅ Services: ${servicesData?.length || 0} records`);
    }

    console.log('\n🎉 Pricing Data Population Completed!');
    
    // Final verification
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    console.log('\n📊 Final verification:');
    const tables = ['service_categories', 'pricing_tiers', 'service_locations', 'services'];
    for (const table of tables) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      console.log(`   📊 ${table}: ${count || 0} records`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

populatePricingData().catch(console.error); 