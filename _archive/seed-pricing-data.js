require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function seedPricingData() {
  console.log('🌱 Seeding Pricing Data...\n');

  try {
    // Step 1: Seed Service Categories
    console.log('📂 Step 1: Seeding service categories...');
    await seedServiceCategories();
    
    // Step 2: Seed Services
    console.log('🔧 Step 2: Seeding services...');
    await seedServices();
    
    // Step 3: Seed Pricing Tiers
    console.log('💎 Step 3: Seeding pricing tiers...');
    await seedPricingTiers();
    
    // Step 4: Seed Service Locations
    console.log('📍 Step 4: Seeding service locations...');
    await seedServiceLocations();
    
    // Step 5: Seed Dynamic Pricing
    console.log('💰 Step 5: Seeding dynamic pricing...');
    await seedDynamicPricing();
    
    console.log('\n🎉 Pricing data seeding completed successfully!');
    console.log('\n🔗 You can now test the pricing APIs:');
    console.log('   1. Services: http://localhost:3000/api/pricing/services?deviceType=mobile');
    console.log('   2. Tiers: http://localhost:3000/api/pricing/tiers');
    console.log('   3. Calculate: http://localhost:3000/api/pricing/calculate?deviceType=mobile&brand=apple&model=iPhone%2015%20Pro&service=screen_replacement&tier=standard');
    
  } catch (error) {
    console.error('❌ Error seeding pricing data:', error.message);
    process.exit(1);
  }
}

async function seedServiceCategories() {
  const categories = [
    {
      name: 'screen_repair',
      display_name: 'Screen Repair',
      description: 'Screen replacement and display repairs',
      icon_name: 'screen',
      sort_order: 1
    },
    {
      name: 'battery_repair',
      display_name: 'Battery Repair',
      description: 'Battery replacement and power-related repairs',
      icon_name: 'battery',
      sort_order: 2
    },
    {
      name: 'charging_repair',
      display_name: 'Charging Repair',
      description: 'Charging port and power jack repairs',
      icon_name: 'charging',
      sort_order: 3
    },
    {
      name: 'audio_repair',
      display_name: 'Audio Repair',
      description: 'Speaker and microphone repairs',
      icon_name: 'audio',
      sort_order: 4
    },
    {
      name: 'camera_repair',
      display_name: 'Camera Repair',
      description: 'Camera module and lens repairs',
      icon_name: 'camera',
      sort_order: 5
    },
    {
      name: 'input_repair',
      display_name: 'Input Device Repair',
      description: 'Keyboard, trackpad, and button repairs',
      icon_name: 'keyboard',
      sort_order: 6
    },
    {
      name: 'hardware_upgrade',
      display_name: 'Hardware Upgrade',
      description: 'Memory, storage, and component upgrades',
      icon_name: 'memory',
      sort_order: 7
    },
    {
      name: 'software_repair',
      display_name: 'Software Repair',
      description: 'Software troubleshooting and optimization',
      icon_name: 'software',
      sort_order: 8
    },
    {
      name: 'diagnostics',
      display_name: 'Diagnostics',
      description: 'Device diagnostics and assessments',
      icon_name: 'diagnostics',
      sort_order: 9
    }
  ];

  for (const category of categories) {
    const { error } = await supabase
      .from('service_categories')
      .upsert(category, { onConflict: 'name' });

    if (error && !error.message.includes('duplicate key')) {
      throw error;
    }
  }

  console.log('   ✅ Service categories seeded');
}

async function seedServices() {
  // Get device types and categories first
  const { data: deviceTypes } = await supabase
    .from('device_types')
    .select('id, name');

  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name');

  const getDeviceTypeId = (name) => deviceTypes.find(dt => dt.name === name)?.id;
  const getCategoryId = (name) => categories.find(c => c.name === name)?.id;

  const services = [
    // Mobile Services
    {
      category_id: getCategoryId('screen_repair'),
      device_type_id: getDeviceTypeId('mobile'),
      name: 'screen_replacement',
      display_name: 'Screen Replacement',
      description: 'Replace damaged or cracked screens with high-quality parts',
      estimated_duration_minutes: 45,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 1
    },
    {
      category_id: getCategoryId('battery_repair'),
      device_type_id: getDeviceTypeId('mobile'),
      name: 'battery_replacement',
      display_name: 'Battery Replacement',
      description: 'Replace old or failing batteries to extend device life',
      estimated_duration_minutes: 30,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 2
    },
    {
      category_id: getCategoryId('charging_repair'),
      device_type_id: getDeviceTypeId('mobile'),
      name: 'charging_port_repair',
      display_name: 'Charging Port Repair',
      description: 'Fix loose or non-functioning charging ports',
      estimated_duration_minutes: 45,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 3
    },
    {
      category_id: getCategoryId('audio_repair'),
      device_type_id: getDeviceTypeId('mobile'),
      name: 'speaker_microphone_repair',
      display_name: 'Speaker/Microphone Repair',
      description: 'Resolve audio issues with speakers or microphones',
      estimated_duration_minutes: 40,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 4
    },
    {
      category_id: getCategoryId('camera_repair'),
      device_type_id: getDeviceTypeId('mobile'),
      name: 'camera_repair',
      display_name: 'Camera Repair',
      description: 'Fix front or rear camera issues',
      estimated_duration_minutes: 50,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 5
    },
    {
      category_id: getCategoryId('diagnostics'),
      device_type_id: getDeviceTypeId('mobile'),
      name: 'water_damage_diagnostics',
      display_name: 'Water Damage Diagnostics',
      description: 'Assess and repair water-damaged devices when possible',
      estimated_duration_minutes: 90,
      warranty_period_days: 180,
      is_doorstep_eligible: true,
      requires_diagnostics: true,
      sort_order: 6
    },

    // Laptop Services
    {
      category_id: getCategoryId('screen_repair'),
      device_type_id: getDeviceTypeId('laptop'),
      name: 'screen_replacement',
      display_name: 'Screen Replacement',
      description: 'Replace cracked or damaged laptop screens',
      estimated_duration_minutes: 60,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 1
    },
    {
      category_id: getCategoryId('battery_repair'),
      device_type_id: getDeviceTypeId('laptop'),
      name: 'battery_replacement',
      display_name: 'Battery Replacement',
      description: 'Replace old laptop batteries to restore battery life',
      estimated_duration_minutes: 45,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 2
    },
    {
      category_id: getCategoryId('input_repair'),
      device_type_id: getDeviceTypeId('laptop'),
      name: 'keyboard_repair',
      display_name: 'Keyboard Repair/Replacement',
      description: 'Fix or replace damaged laptop keyboards',
      estimated_duration_minutes: 50,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 3
    },
    {
      category_id: getCategoryId('input_repair'),
      device_type_id: getDeviceTypeId('laptop'),
      name: 'trackpad_repair',
      display_name: 'Trackpad Repair',
      description: 'Fix non-responsive or erratic trackpads',
      estimated_duration_minutes: 45,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 4
    },
    {
      category_id: getCategoryId('hardware_upgrade'),
      device_type_id: getDeviceTypeId('laptop'),
      name: 'ram_upgrade',
      display_name: 'RAM Upgrade',
      description: 'Increase memory capacity for better performance',
      estimated_duration_minutes: 30,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 5
    },
    {
      category_id: getCategoryId('hardware_upgrade'),
      device_type_id: getDeviceTypeId('laptop'),
      name: 'storage_upgrade',
      display_name: 'HDD/SSD Replacement/Upgrade',
      description: 'Replace or upgrade storage drives for better performance',
      estimated_duration_minutes: 45,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 6
    },
    {
      category_id: getCategoryId('software_repair'),
      device_type_id: getDeviceTypeId('laptop'),
      name: 'software_troubleshooting',
      display_name: 'Software Troubleshooting',
      description: 'Resolve software issues and performance problems',
      estimated_duration_minutes: 90,
      warranty_period_days: 90,
      is_doorstep_eligible: true,
      requires_diagnostics: true,
      sort_order: 7
    },
    {
      category_id: getCategoryId('software_repair'),
      device_type_id: getDeviceTypeId('laptop'),
      name: 'virus_removal',
      display_name: 'Virus Removal',
      description: 'Remove malware and implement security measures',
      estimated_duration_minutes: 120,
      warranty_period_days: 90,
      is_doorstep_eligible: true,
      requires_diagnostics: true,
      sort_order: 8
    },

    // Tablet Services
    {
      category_id: getCategoryId('screen_repair'),
      device_type_id: getDeviceTypeId('tablet'),
      name: 'screen_replacement',
      display_name: 'Screen Replacement',
      description: 'Replace damaged or cracked tablet screens',
      estimated_duration_minutes: 50,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 1
    },
    {
      category_id: getCategoryId('battery_repair'),
      device_type_id: getDeviceTypeId('tablet'),
      name: 'battery_replacement',
      display_name: 'Battery Replacement',
      description: 'Replace old tablet batteries to extend device life',
      estimated_duration_minutes: 40,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      sort_order: 2
    }
  ];

  for (const service of services) {
    const { error } = await supabase
      .from('services')
      .upsert(service, { onConflict: 'category_id,device_type_id,name' });

    if (error && !error.message.includes('duplicate key')) {
      throw error;
    }
  }

  console.log('   ✅ Services seeded');
}

async function seedPricingTiers() {
  const tiers = [
    {
      name: 'economy',
      display_name: 'Economy Repair',
      description: 'Budget-friendly repair with quality parts and standard warranty',
      price_multiplier: 0.85,
      estimated_delivery_hours: 48,
      includes_features: [
        '6-Month Warranty',
        'Quality Parts',
        'Professional Service',
        'Free Pickup & Delivery (Doorstep)',
        'Free Diagnostics'
      ],
      sort_order: 1
    },
    {
      name: 'standard',
      display_name: 'Standard Repair',
      description: 'Quality repair with standard timeframe and full warranty',
      price_multiplier: 1.0,
      estimated_delivery_hours: 24,
      includes_features: [
        '1-Year Warranty',
        'Quality Parts',
        'Professional Service',
        'Free Pickup & Delivery (Doorstep)',
        'Free Diagnostics'
      ],
      sort_order: 2
    },
    {
      name: 'premium',
      display_name: 'Premium Service',
      description: 'Priority service with premium parts and expedited handling',
      price_multiplier: 1.25,
      estimated_delivery_hours: 12,
      includes_features: [
        '1-Year Warranty',
        'Premium Parts',
        'Priority Service',
        'Free Pickup & Delivery (Doorstep)',
        'Free Diagnostics',
        'Express Handling',
        'Quality Assurance Check'
      ],
      sort_order: 3
    },
    {
      name: 'same_day',
      display_name: 'Same Day Service',
      description: 'Urgent repair completed within hours with premium service',
      price_multiplier: 1.5,
      estimated_delivery_hours: 4,
      includes_features: [
        '1-Year Warranty',
        'Premium Parts',
        'Same Day Completion',
        'Free Pickup & Delivery (Doorstep)',
        'Free Diagnostics',
        'Priority Technician Assignment',
        'Rush Service Fee Included',
        'Quality Assurance Check'
      ],
      sort_order: 4
    }
  ];

  for (const tier of tiers) {
    const { error } = await supabase
      .from('pricing_tiers')
      .upsert(tier, { onConflict: 'name' });

    if (error && !error.message.includes('duplicate key')) {
      throw error;
    }
  }

  console.log('   ✅ Pricing tiers seeded');
}

async function seedServiceLocations() {
  const locations = [
    {
      name: 'Vancouver Downtown',
      postal_code_prefixes: ['V6B', 'V6C', 'V6E', 'V6G', 'V6Z'],
      price_adjustment_percentage: 5.0,
      sort_order: 1
    },
    {
      name: 'Vancouver West Side',
      postal_code_prefixes: ['V6H', 'V6J', 'V6K', 'V6L', 'V6M', 'V6N', 'V6P', 'V6R', 'V6S', 'V6T'],
      price_adjustment_percentage: 2.0,
      sort_order: 2
    },
    {
      name: 'Vancouver East Side',
      postal_code_prefixes: ['V5K', 'V5L', 'V5M', 'V5N', 'V5P', 'V5R', 'V5S', 'V5T', 'V5V', 'V5W', 'V5X', 'V5Y', 'V5Z', 'V6A'],
      price_adjustment_percentage: 0.0,
      sort_order: 3
    },
    {
      name: 'Richmond',
      postal_code_prefixes: ['V6X', 'V6Y', 'V7A', 'V7B', 'V7C', 'V7E'],
      price_adjustment_percentage: 3.0,
      sort_order: 4
    },
    {
      name: 'Burnaby',
      postal_code_prefixes: ['V3J', 'V3N', 'V5A', 'V5B', 'V5C', 'V5E', 'V5G', 'V5H', 'V5J'],
      price_adjustment_percentage: 0.0,
      sort_order: 5
    },
    {
      name: 'Surrey',
      postal_code_prefixes: ['V3R', 'V3S', 'V3T', 'V3V', 'V3W', 'V3X', 'V3Y', 'V3Z', 'V4A', 'V4B', 'V4C', 'V4N', 'V4P'],
      price_adjustment_percentage: -2.0,
      sort_order: 6
    },
    {
      name: 'Coquitlam',
      postal_code_prefixes: ['V3B', 'V3C', 'V3E', 'V3H', 'V3K'],
      price_adjustment_percentage: 0.0,
      sort_order: 7
    },
    {
      name: 'North Vancouver',
      postal_code_prefixes: ['V7G', 'V7H', 'V7J', 'V7K', 'V7L', 'V7M', 'V7N', 'V7P', 'V7R'],
      price_adjustment_percentage: 1.0,
      sort_order: 8
    },
    {
      name: 'West Vancouver',
      postal_code_prefixes: ['V7S', 'V7T', 'V7V', 'V7W'],
      price_adjustment_percentage: 4.0,
      sort_order: 9
    }
  ];

  for (const location of locations) {
    const { error } = await supabase
      .from('service_locations')
      .upsert(location, { onConflict: 'name' });

    if (error && !error.message.includes('duplicate key')) {
      throw error;
    }
  }

  console.log('   ✅ Service locations seeded');
}

async function seedDynamicPricing() {
  // Get all the necessary data first
  const { data: services } = await supabase
    .from('services')
    .select('id, name, device_types(name)');

  const { data: models } = await supabase
    .from('device_models')
    .select('id, name, brands(name, device_types(name))');

  const { data: tiers } = await supabase
    .from('pricing_tiers')
    .select('id, name');

  // Base pricing matrix
  const basePricing = {
    mobile: {
      screen_replacement: { apple: 179, samsung: 149, google: 139, oneplus: 129, xiaomi: 119, other: 109 },
      battery_replacement: { apple: 99, samsung: 89, google: 79, oneplus: 75, xiaomi: 69, other: 65 },
      charging_port_repair: { apple: 119, samsung: 109, google: 99, oneplus: 95, xiaomi: 89, other: 85 },
      speaker_microphone_repair: { apple: 109, samsung: 99, google: 89, oneplus: 85, xiaomi: 79, other: 75 },
      camera_repair: { apple: 129, samsung: 119, google: 109, oneplus: 105, xiaomi: 99, other: 95 },
      water_damage_diagnostics: { apple: 149, samsung: 139, google: 129, oneplus: 125, xiaomi: 119, other: 115 }
    },
    laptop: {
      screen_replacement: { apple: 329, dell: 249, hp: 229, lenovo: 219, asus: 209, other: 199 },
      battery_replacement: { apple: 179, dell: 139, hp: 129, lenovo: 119, asus: 115, other: 109 },
      keyboard_repair: { apple: 199, dell: 159, hp: 149, lenovo: 139, asus: 135, other: 129 },
      trackpad_repair: { apple: 159, dell: 129, hp: 119, lenovo: 109, asus: 105, other: 99 },
      ram_upgrade: { apple: 149, dell: 119, hp: 109, lenovo: 99, asus: 95, other: 89 },
      storage_upgrade: { apple: 199, dell: 179, hp: 169, lenovo: 159, asus: 155, other: 149 },
      software_troubleshooting: { apple: 119, dell: 99, hp: 89, lenovo: 79, asus: 75, other: 69 },
      virus_removal: { apple: 139, dell: 119, hp: 109, lenovo: 99, asus: 95, other: 89 }
    },
    tablet: {
      screen_replacement: { apple: 229, samsung: 189, microsoft: 179, lenovo: 159, other: 149 },
      battery_replacement: { apple: 139, samsung: 119, microsoft: 109, lenovo: 99, other: 89 }
    }
  };

  const pricingRecords = [];

  // Generate pricing for each service, model, and tier combination
  for (const service of services) {
    const deviceType = service.device_types.name;
    const serviceBasePrices = basePricing[deviceType]?.[service.name];
    
    if (!serviceBasePrices) continue;

    for (const model of models) {
      const modelDeviceType = model.brands.device_types.name;
      if (modelDeviceType !== deviceType) continue;

      const brandName = model.brands.name.toLowerCase();
      const basePrice = serviceBasePrices[brandName] || serviceBasePrices.other || 99;

      for (const tier of tiers) {
        // Add some randomization to prices (±10%)
        const randomFactor = 0.9 + (Math.random() * 0.2);
        const adjustedBasePrice = Math.round(basePrice * randomFactor);

        // Occasionally add discounted prices (20% chance)
        const hasDiscount = Math.random() < 0.2;
        const discountedPrice = hasDiscount ? Math.round(adjustedBasePrice * 0.85) : null;

        pricingRecords.push({
          service_id: service.id,
          model_id: model.id,
          pricing_tier_id: tier.id,
          base_price: adjustedBasePrice,
          discounted_price: discountedPrice,
          cost_price: Math.round(adjustedBasePrice * 0.6), // 40% margin
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        });
      }
    }
  }

  // Insert in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < pricingRecords.length; i += batchSize) {
    const batch = pricingRecords.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('dynamic_pricing')
      .upsert(batch, { onConflict: 'service_id,model_id,pricing_tier_id' });

    if (error && !error.message.includes('duplicate key')) {
      throw error;
    }
  }

  console.log(`   ✅ Dynamic pricing seeded (${pricingRecords.length} records)`);
}

// Run the seeding
seedPricingData().catch(console.error); 