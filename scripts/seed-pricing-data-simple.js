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

async function seedPricingDataSimple() {
  console.log('🌱 Seeding Pricing Data (Simple)...\n');

  try {
    // Step 1: Seed Service Categories
    console.log('📂 Step 1: Seeding service categories...');
    await seedServiceCategoriesSimple();
    
    // Step 2: Seed Pricing Tiers
    console.log('💎 Step 2: Seeding pricing tiers...');
    await seedPricingTiersSimple();
    
    console.log('\n🎉 Basic pricing data seeding completed successfully!');
    console.log('\n🔗 You can now test the pricing APIs:');
    console.log('   1. Services: http://localhost:3000/api/pricing/services?deviceType=mobile');
    console.log('   2. Tiers: http://localhost:3000/api/pricing/tiers');
    console.log('   3. Calculate: http://localhost:3000/api/pricing/calculate?deviceType=mobile&brand=apple&model=iPhone%2015%20Pro&service=screen_replacement&tier=standard');
    
  } catch (error) {
    console.error('❌ Error seeding pricing data:', error.message);
    process.exit(1);
  }
}

async function seedServiceCategoriesSimple() {
  const categories = [
    {
      name: 'screen_repair',
      display_name: 'Screen Repair',
      description: 'Screen replacement and display repairs',
      icon_name: 'screen',
      sort_order: 1,
      is_active: true
    },
    {
      name: 'battery_repair',
      display_name: 'Battery Repair',
      description: 'Battery replacement and power-related repairs',
      icon_name: 'battery',
      sort_order: 2,
      is_active: true
    },
    {
      name: 'charging_repair',
      display_name: 'Charging Repair',
      description: 'Charging port and power jack repairs',
      icon_name: 'charging',
      sort_order: 3,
      is_active: true
    },
    {
      name: 'audio_repair',
      display_name: 'Audio Repair',
      description: 'Speaker and microphone repairs',
      icon_name: 'audio',
      sort_order: 4,
      is_active: true
    },
    {
      name: 'camera_repair',
      display_name: 'Camera Repair',
      description: 'Camera module and lens repairs',
      icon_name: 'camera',
      sort_order: 5,
      is_active: true
    },
    {
      name: 'diagnostics',
      display_name: 'Diagnostics',
      description: 'Device diagnostics and assessments',
      icon_name: 'diagnostics',
      sort_order: 6,
      is_active: true
    }
  ];

  for (const category of categories) {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .insert(category)
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`       ⚠️  Category '${category.name}' already exists, skipping...`);
          continue;
        }
        throw error;
      }
      
      console.log(`       ✅ Added category: ${category.display_name}`);
    } catch (err) {
      console.log(`       ⚠️  Error adding category ${category.name}: ${err.message}`);
    }
  }

  console.log('   ✅ Service categories seeded');
}

async function seedPricingTiersSimple() {
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
      sort_order: 1,
      is_active: true
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
      sort_order: 2,
      is_active: true
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
      sort_order: 3,
      is_active: true
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
      sort_order: 4,
      is_active: true
    }
  ];

  for (const tier of tiers) {
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .insert(tier)
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`       ⚠️  Tier '${tier.name}' already exists, skipping...`);
          continue;
        }
        throw error;
      }
      
      console.log(`       ✅ Added tier: ${tier.display_name} (${tier.price_multiplier}x)`);
    } catch (err) {
      console.log(`       ⚠️  Error adding tier ${tier.name}: ${err.message}`);
    }
  }

  console.log('   ✅ Pricing tiers seeded');
}

// Run the seeding
seedPricingDataSimple().catch(console.error); 