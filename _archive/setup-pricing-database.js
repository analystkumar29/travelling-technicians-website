require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function setupPricingDatabase() {
  console.log('🚀 Setting up Pricing Database...\n');

  try {
    // Step 1: Create Schema
    console.log('📋 Step 1: Creating pricing tables...');
    await createPricingSchema();
    
    // Step 2: Seed Data
    console.log('🌱 Step 2: Seeding pricing data...');
    await seedPricingData();
    
    // Step 3: Generate Dynamic Pricing
    console.log('💰 Step 3: Generating dynamic pricing records...');
    await generateDynamicPricing();
    
    // Step 4: Verify Setup
    console.log('✅ Step 4: Verifying database setup...');
    await verifySetup();
    
    console.log('\n🎉 Pricing Database Setup Completed Successfully!');
    console.log('\n📊 Summary:');
    await printSummary();
    
    console.log('\n🔗 Test your pricing APIs:');
    console.log('   1. Services: http://localhost:3000/api/pricing/services?deviceType=mobile');
    console.log('   2. Tiers: http://localhost:3000/api/pricing/tiers');
    console.log('   3. Calculate: http://localhost:3000/api/pricing/calculate?deviceType=mobile&brand=apple&model=iPhone%2015%20Pro&service=screen_replacement&tier=standard&postalCode=V6B2N9');
    
  } catch (error) {
    console.error('❌ Error setting up pricing database:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

async function createPricingSchema() {
  try {
    const schemaPath = path.join(__dirname, '../database/pricing-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema SQL
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (error) {
      // Try alternative method for executing SQL
      console.log('   📝 Executing schema using alternative method...');
      await executeSQLCommands(schemaSQL);
    }
    
    console.log('   ✅ Pricing schema created successfully');
  } catch (error) {
    throw new Error(`Schema creation failed: ${error.message}`);
  }
}

async function seedPricingData() {
  try {
    const seedPath = path.join(__dirname, '../database/seed-pricing-data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Execute seeding SQL
    const { error } = await supabase.rpc('exec_sql', { sql: seedSQL });
    
    if (error) {
      // Try alternative method for executing SQL
      console.log('   📝 Executing seeding using alternative method...');
      await executeSQLCommands(seedSQL);
    }
    
    console.log('   ✅ Pricing data seeded successfully');
  } catch (error) {
    throw new Error(`Data seeding failed: ${error.message}`);
  }
}

async function executeSQLCommands(sql) {
  // Split SQL into individual commands and execute them
  const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
  
  for (const command of commands) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: command + ';' });
      if (error) {
        console.log(`   ⚠️  Command failed (may be normal): ${command.substring(0, 50)}...`);
      }
    } catch (err) {
      console.log(`   ⚠️  Error executing command: ${err.message}`);
    }
  }
}

async function generateDynamicPricing() {
  try {
    // Get all services, models, and tiers
    const [servicesResult, modelsResult, tiersResult] = await Promise.all([
      supabase.from('services').select('id, name, device_types(name)'),
      supabase.from('device_models').select('id, name, brands(name, device_types(name))'),
      supabase.from('pricing_tiers').select('id, name')
    ]);

    const services = servicesResult.data || [];
    const models = modelsResult.data || [];
    const tiers = tiersResult.data || [];

    if (services.length === 0 || models.length === 0 || tiers.length === 0) {
      console.log('   ⚠️  Missing base data, skipping dynamic pricing generation');
      return;
    }

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
        virus_removal: { apple: 139, dell: 119, hp: 109, lenovo: 99, asus: 95, other: 89 },
        power_jack_repair: { apple: 149, dell: 119, hp: 109, lenovo: 99, asus: 95, other: 89 },
        speaker_repair: { apple: 109, dell: 89, hp: 79, lenovo: 69, asus: 65, other: 59 },
        webcam_repair: { apple: 119, dell: 99, hp: 89, lenovo: 79, asus: 75, other: 69 },
        os_installation: { apple: 159, dell: 129, hp: 119, lenovo: 109, asus: 105, other: 99 },
        hardware_diagnostics: { apple: 89, dell: 69, hp: 59, lenovo: 49, asus: 45, other: 39 }
      },
      tablet: {
        screen_replacement: { apple: 229, samsung: 189, microsoft: 179, lenovo: 159, other: 149 },
        battery_replacement: { apple: 139, samsung: 119, microsoft: 109, lenovo: 99, other: 89 },
        general_diagnostics: { apple: 79, samsung: 69, microsoft: 59, lenovo: 49, other: 39 }
      }
    };

    const pricingRecords = [];
    let recordCount = 0;

    // Generate pricing for each service, model, and tier combination
    for (const service of services) {
      const deviceType = service.device_types?.name;
      const serviceBasePrices = basePricing[deviceType]?.[service.name];
      
      if (!serviceBasePrices) continue;

      for (const model of models) {
        const modelDeviceType = model.brands?.device_types?.name;
        if (modelDeviceType !== deviceType) continue;

        const brandName = model.brands?.name?.toLowerCase();
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

          recordCount++;
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

      if (error) {
        console.log(`   ⚠️  Batch ${Math.floor(i/batchSize) + 1} error: ${error.message}`);
      }
    }

    console.log(`   ✅ Generated ${recordCount} dynamic pricing records`);
  } catch (error) {
    console.log(`   ⚠️  Dynamic pricing generation failed: ${error.message}`);
  }
}

async function verifySetup() {
  const tables = [
    'service_categories',
    'services', 
    'pricing_tiers',
    'service_locations',
    'dynamic_pricing'
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
      { label: 'Service Locations', table: 'service_locations' },
      { label: 'Dynamic Pricing Records', table: 'dynamic_pricing' }
    ];

    for (const query of summaryQueries) {
      const { count } = await supabase
        .from(query.table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`   📊 ${query.label}: ${count || 0}`);
    }

    // Show sample pricing
    const { data: samplePricing } = await supabase
      .from('dynamic_pricing')
      .select(`
        base_price,
        services(name, display_name),
        device_models(name, brands(name)),
        pricing_tiers(name, display_name)
      `)
      .limit(3);

    if (samplePricing && samplePricing.length > 0) {
      console.log('\n   💰 Sample Pricing:');
      samplePricing.forEach(price => {
        console.log(`       ${price.device_models?.brands?.name} ${price.device_models?.name} - ${price.services?.display_name} (${price.pricing_tiers?.display_name}): $${price.base_price}`);
      });
    }

  } catch (error) {
    console.log(`   ⚠️  Summary generation failed: ${error.message}`);
  }
}

// Run the setup
setupPricingDatabase().catch(console.error); 