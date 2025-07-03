const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupMobileActiveSchemaFixed() {
  console.log('🚀 Setting Up MobileActive-Based Schema (Fixed)');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Clear existing data (but keep tables)
    console.log('\n🧹 Step 1: Clearing existing data...');
    
    await supabase.from('dynamic_pricing').delete().neq('id', 0);
    await supabase.from('device_models').delete().neq('id', 0);
    await supabase.from('services').delete().neq('id', 0);
    await supabase.from('brands').delete().neq('id', 0);
    await supabase.from('pricing_tiers').delete().neq('id', 0);
    await supabase.from('device_types').delete().neq('id', 0);
    
    console.log('✅ Existing data cleared');
    
    // Step 2: Insert core data
    console.log('\n📦 Step 2: Inserting core data...');
    
    // Device Types
    await supabase.from('device_types').insert({
      id: 1,
      name: 'mobile',
      display_name: 'Mobile Phones',
      is_active: true
    });
    
    // Brands
    await supabase.from('brands').insert([
      {
        id: 1,
        name: 'samsung',
        display_name: 'Samsung',
        device_type_id: 1,
        logo_url: '/images/brands/samsung.svg',
        brand_colors: { primary: "#1428A0", secondary: "#000000" },
        is_active: true,
        sort_order: 1
      },
      {
        id: 2,
        name: 'apple',
        display_name: 'Apple',
        device_type_id: 1,
        logo_url: '/images/brands/apple.svg',
        brand_colors: { primary: "#000000", secondary: "#007AFF" },
        is_active: true,
        sort_order: 2
      }
    ]);
    
    // Services
    await supabase.from('services').insert([
      {
        id: 1,
        name: 'screen_replacement',
        display_name: 'Screen Replacement',
        device_type_id: 1,
        description: 'Professional screen replacement service with quality parts',
        is_active: true,
        sort_order: 1
      },
      {
        id: 2,
        name: 'battery_replacement',
        display_name: 'Battery Replacement',
        device_type_id: 1,
        description: 'Battery replacement with genuine or high-quality aftermarket batteries',
        is_active: true,
        sort_order: 2
      },
      {
        id: 3,
        name: 'charging_port_repair',
        display_name: 'Charging Port Repair',
        device_type_id: 1,
        description: 'Repair or replacement of charging ports and connectors',
        is_active: true,
        sort_order: 3
      },
      {
        id: 4,
        name: 'camera_repair',
        display_name: 'Camera Repair',
        device_type_id: 1,
        description: 'Camera module repair and replacement services',
        is_active: true,
        sort_order: 4
      }
    ]);
    
    // Pricing Tiers
    await supabase.from('pricing_tiers').insert([
      {
        id: 1,
        name: 'economy',
        display_name: 'Economy',
        multiplier: 0.8,
        warranty_months: 3,
        turnaround_hours: 72,
        is_active: true,
        sort_order: 1
      },
      {
        id: 2,
        name: 'standard',
        display_name: 'Standard',
        multiplier: 1.0,
        warranty_months: 6,
        turnaround_hours: 48,
        is_active: true,
        sort_order: 2
      },
      {
        id: 3,
        name: 'premium',
        display_name: 'Premium',
        multiplier: 1.25,
        warranty_months: 12,
        turnaround_hours: 24,
        is_active: true,
        sort_order: 3
      },
      {
        id: 4,
        name: 'express',
        display_name: 'Express',
        multiplier: 1.5,
        warranty_months: 6,
        turnaround_hours: 12,
        is_active: true,
        sort_order: 4
      }
    ]);
    
    console.log('✅ Core data inserted successfully');
    
    // Step 3: Get existing MobileActive products
    console.log('\n📱 Step 3: Processing MobileActive products...');
    const { data: products, error: productsError } = await supabase
      .from('mobileactive_products')
      .select('*');
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return;
    }
    
    console.log(`Found ${products.length} MobileActive products`);
    
    // Step 4: Extract unique models and create device models
    console.log('\n📱 Step 4: Creating device models...');
    
    const samsungProducts = products.filter(p => p.brand === 'samsung');
    const appleProducts = products.filter(p => p.brand === 'apple');
    
    const samsungModels = [...new Set(samsungProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
    const appleModels = [...new Set(appleProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
    
    console.log(`Samsung models: ${samsungModels.length}`);
    console.log(`Apple models: ${appleModels.length}`);
    
    // Create model mappings
    const modelMappings = {};
    let modelId = 1;
    
    // Insert Samsung models
    for (const model of samsungModels) {
      await supabase.from('device_models').insert({
        id: modelId,
        name: model,
        display_name: model,
        brand_id: 1,
        is_active: true,
        sort_order: modelId
      });
      
      modelMappings[`samsung-${model}`] = modelId;
      console.log(`✓ Created Samsung model: ${model} (ID: ${modelId})`);
      modelId++;
    }
    
    // Insert Apple models
    for (const model of appleModels) {
      await supabase.from('device_models').insert({
        id: modelId,
        name: model,
        display_name: model,
        brand_id: 2,
        is_active: true,
        sort_order: modelId
      });
      
      modelMappings[`apple-${model}`] = modelId;
      console.log(`✓ Created Apple model: ${model} (ID: ${modelId})`);
      modelId++;
    }
    
    // Step 5: Create pricing entries
    console.log('\n💰 Step 5: Creating pricing entries...');
    
    const serviceIdMap = {
      'screen_replacement': 1,
      'battery_replacement': 2,
      'charging_port_repair': 3,
      'camera_repair': 4
    };
    
    const pricingEntries = [];
    
    for (const product of products) {
      const modelKey = `${product.brand}-${product.model_name}`;
      const modelId = modelMappings[modelKey];
      
      if (!modelId) {
        console.log(`⚠️  Skipping product - no model mapping: ${modelKey}`);
        continue;
      }
      
      const serviceId = serviceIdMap[product.service_type];
      if (!serviceId) {
        console.log(`⚠️  Skipping product - unknown service type: ${product.service_type}`);
        continue;
      }
      
      // Calculate pricing for all tiers
      const tiers = [
        { id: 1, name: 'economy', multiplier: 0.8 },
        { id: 2, name: 'standard', multiplier: 1.0 },
        { id: 3, name: 'premium', multiplier: 1.25 },
        { id: 4, name: 'express', multiplier: 1.5 }
      ];
      
      for (const tier of tiers) {
        const basePrice = Math.round(product.part_cost * tier.multiplier);
        
        pricingEntries.push({
          service_id: serviceId,
          model_id: modelId,
          pricing_tier_id: tier.id,
          base_price: basePrice,
          cost_price: product.part_cost,
          supplier_product_id: product.id,
          is_active: true
        });
      }
    }
    
    // Insert pricing entries in batches
    console.log(`\nInserting ${pricingEntries.length} pricing entries...`);
    const batchSize = 50;
    
    for (let i = 0; i < pricingEntries.length; i += batchSize) {
      const batch = pricingEntries.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('dynamic_pricing')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting pricing batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        console.log(`✓ Inserted pricing batch ${Math.floor(i/batchSize) + 1} (${batch.length} entries)`);
      }
    }
    
    // Step 6: Summary
    console.log('\n📊 MOBILEACTIVE SCHEMA SUMMARY');
    console.log('=' .repeat(60));
    
    const { data: finalModels } = await supabase
      .from('device_models')
      .select('id', { count: 'exact' });
    
    const { data: finalPricing } = await supabase
      .from('dynamic_pricing')
      .select('id', { count: 'exact' });
    
    const { data: finalProducts } = await supabase
      .from('mobileactive_products')
      .select('id', { count: 'exact' });
    
    console.log(`\n✅ MobileActive Schema Complete!`);
    console.log(`  Device Models: ${finalModels?.length || 0}`);
    console.log(`  Pricing Entries: ${finalPricing?.length || 0}`);
    console.log(`  MobileActive Products: ${finalProducts?.length || 0}`);
    
    // Calculate coverage
    const totalPossibleCombinations = (samsungModels.length + appleModels.length) * 4 * 4;
    const actualCombinations = finalPricing?.length || 0;
    const coveragePercentage = (actualCombinations / totalPossibleCombinations * 100).toFixed(1);
    
    console.log(`\n📈 Coverage Analysis:`);
    console.log(`  Total Possible Combinations: ${totalPossibleCombinations}`);
    console.log(`  Actual Pricing Entries: ${actualCombinations}`);
    console.log(`  Coverage: ${coveragePercentage}%`);
    
    // Show sample pricing
    console.log(`\n💰 Sample Pricing Entries:`);
    const { data: samplePricing } = await supabase
      .from('dynamic_pricing')
      .select(`
        base_price,
        cost_price,
        services(name),
        device_models(name, brands(name)),
        pricing_tiers(name)
      `)
      .limit(5);
    
    samplePricing?.forEach(pricing => {
      const markupPercentage = ((pricing.base_price - pricing.cost_price) / pricing.cost_price * 100).toFixed(1);
      console.log(`  ${pricing.device_models.brands.name} ${pricing.device_models.name} - ${pricing.services.name} (${pricing.pricing_tiers.name}): $${pricing.base_price} (Cost: $${pricing.cost_price}, Markup: ${markupPercentage}%)`);
    });
    
    console.log(`\n🎉 MobileActive schema is ready!`);
    console.log(`  - Clean, focused database`);
    console.log(`  - Real supplier data integration`);
    console.log(`  - Professional pricing structure`);
    console.log(`  - Ready for enhanced UI/UX`);
    
  } catch (error) {
    console.error('❌ Schema setup failed:', error.message);
  }
}

// Run the schema setup
setupMobileActiveSchemaFixed(); 