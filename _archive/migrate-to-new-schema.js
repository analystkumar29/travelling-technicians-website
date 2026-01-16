const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateToNewSchema() {
  console.log('🚀 Migrating to New MobileActive-Based Schema');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Get all MobileActive products
    console.log('\n📦 Step 1: Fetching MobileActive products...');
    const { data: products, error: productsError } = await supabase
      .from('mobileactive_products')
      .select('*');
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return;
    }
    
    console.log(`Found ${products.length} MobileActive products`);
    
    // Step 2: Extract unique models
    console.log('\n📱 Step 2: Extracting unique models...');
    const samsungProducts = products.filter(p => p.brand === 'samsung');
    const appleProducts = products.filter(p => p.brand === 'apple');
    
    const samsungModels = [...new Set(samsungProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
    const appleModels = [...new Set(appleProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
    
    console.log(`Samsung models: ${samsungModels.length}`);
    console.log(`Apple models: ${appleModels.length}`);
    console.log(`Total models: ${samsungModels.length + appleModels.length}`);
    
    // Step 3: Insert device models
    console.log('\n📱 Step 3: Inserting device models...');
    
    let modelId = 1;
    const modelMappings = {};
    
    // Insert Samsung models
    for (const model of samsungModels) {
      const { data, error } = await supabase
        .from('device_models')
        .insert({
          id: modelId,
          name: model,
          display_name: model,
          brand_id: 1, // Samsung
          is_active: true,
          sort_order: modelId
        })
        .select();
      
      if (error) {
        console.error(`Error inserting Samsung model ${model}:`, error);
      } else {
        modelMappings[`samsung-${model}`] = modelId;
        console.log(`✓ Inserted Samsung model: ${model} (ID: ${modelId})`);
        modelId++;
      }
    }
    
    // Insert Apple models
    for (const model of appleModels) {
      const { data, error } = await supabase
        .from('device_models')
        .insert({
          id: modelId,
          name: model,
          display_name: model,
          brand_id: 2, // Apple
          is_active: true,
          sort_order: modelId
        })
        .select();
      
      if (error) {
        console.error(`Error inserting Apple model ${model}:`, error);
      } else {
        modelMappings[`apple-${model}`] = modelId;
        console.log(`✓ Inserted Apple model: ${model} (ID: ${modelId})`);
        modelId++;
      }
    }
    
    // Step 4: Create pricing entries
    console.log('\n💰 Step 4: Creating pricing entries...');
    
    let pricingCount = 0;
    const pricingEntries = [];
    
    // Process each product to create pricing entries
    for (const product of products) {
      const modelKey = `${product.brand}-${product.model_name}`;
      const modelId = modelMappings[modelKey];
      
      if (!modelId) {
        console.log(`⚠️  Skipping product - no model mapping: ${modelKey}`);
        continue;
      }
      
      // Map service type to service ID
      const serviceIdMap = {
        'screen_replacement': 1,
        'battery_replacement': 2,
        'charging_port_repair': 3,
        'camera_repair': 4
      };
      
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
        const markupPercentage = ((basePrice - product.part_cost) / product.part_cost * 100);
        
        pricingEntries.push({
          service_id: serviceId,
          model_id: modelId,
          pricing_tier_id: tier.id,
          base_price: basePrice,
          cost_price: product.part_cost,
          markup_percentage: Math.round(markupPercentage * 100) / 100,
          supplier_product_id: product.id,
          is_active: true
        });
        
        pricingCount++;
      }
    }
    
    // Insert pricing entries in batches
    console.log(`\nInserting ${pricingEntries.length} pricing entries...`);
    const batchSize = 50;
    
    for (let i = 0; i < pricingEntries.length; i += batchSize) {
      const batch = pricingEntries.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('dynamic_pricing')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting pricing batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        console.log(`✓ Inserted pricing batch ${Math.floor(i/batchSize) + 1} (${batch.length} entries)`);
      }
    }
    
    // Step 5: Generate summary report
    console.log('\n📊 MIGRATION SUMMARY');
    console.log('=' .repeat(60));
    
    // Get final counts
    const { data: finalModels } = await supabase
      .from('device_models')
      .select('id', { count: 'exact' });
    
    const { data: finalPricing } = await supabase
      .from('dynamic_pricing')
      .select('id', { count: 'exact' });
    
    const { data: finalProducts } = await supabase
      .from('mobileactive_products')
      .select('id', { count: 'exact' });
    
    console.log(`\n✅ Migration Complete!`);
    console.log(`  Device Models: ${finalModels?.length || 0}`);
    console.log(`  Pricing Entries: ${finalPricing?.length || 0}`);
    console.log(`  MobileActive Products: ${finalProducts?.length || 0}`);
    
    // Calculate coverage
    const totalPossibleCombinations = (samsungModels.length + appleModels.length) * 4 * 4; // models × services × tiers
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
        markup_percentage,
        services(name),
        device_models(name, brands(name)),
        pricing_tiers(name)
      `)
      .limit(5);
    
    samplePricing?.forEach(pricing => {
      console.log(`  ${pricing.device_models.brands.name} ${pricing.device_models.name} - ${pricing.services.name} (${pricing.pricing_tiers.name}): $${pricing.base_price} (Cost: $${pricing.cost_price}, Markup: ${pricing.markup_percentage}%)`);
    });
    
    console.log(`\n🎉 New schema is ready!`);
    console.log(`  - Much more manageable: ${totalPossibleCombinations} vs 10,376 combinations`);
    console.log(`  - Focused on actual supplier data`);
    console.log(`  - Real pricing based on MobileActive costs`);
    console.log(`  - Professional brand/model display ready`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Run the migration
migrateToNewSchema(); 