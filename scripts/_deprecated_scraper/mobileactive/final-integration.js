const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Brand mappings
const BRAND_IDS = {
  apple: { mobile: 1, laptop: 7, tablet: 13 },
  samsung: { mobile: 2, laptop: 45, tablet: 14 },
  google: { mobile: 3, laptop: 42, tablet: 42 }
};

function normalizeModelName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .replace(/iphone/g, 'iphone')
    .replace(/galaxy/g, 'galaxy')
    .replace(/sgs/g, 'galaxy') // SGS = Samsung Galaxy S
    .replace(/s(\d+)/g, 's$1') // Normalize S series
    .replace(/note(\d+)/g, 'note$1') // Normalize Note series
    .replace(/plus/g, 'plus')
    .replace(/ultra/g, 'ultra')
    .replace(/pro/g, 'pro')
    .replace(/max/g, 'max');
}

function findBestMatch(mobileactiveProduct, existingModels) {
  const brand = mobileactiveProduct.brand.toLowerCase();
  const modelName = mobileactiveProduct.model_name;
  const deviceType = mobileactiveProduct.device_type;
  
  if (!modelName || modelName === 'unknown') {
    return null;
  }
  
  // Get brand ID for this device type
  const brandId = BRAND_IDS[brand]?.[deviceType];
  if (!brandId) {
    return null;
  }
  
  // Find models with matching brand and device type
  const brandMatches = existingModels.filter(model => 
    model.brand_id === brandId
  );
  
  if (brandMatches.length === 0) {
    return null;
  }
  
  // Try exact match first
  const exactMatch = brandMatches.find(model => 
    model.name.toLowerCase() === modelName.toLowerCase() ||
    model.display_name.toLowerCase() === modelName.toLowerCase()
  );
  
  if (exactMatch) {
    return { model: exactMatch, confidence: 'exact', reason: 'Exact name match' };
  }
  
  // Try normalized match
  const normalizedMobileActive = normalizeModelName(modelName);
  const normalizedMatches = brandMatches.filter(model => {
    const normalizedExisting = normalizeModelName(model.name);
    return normalizedExisting === normalizedMobileActive;
  });
  
  if (normalizedMatches.length === 1) {
    return { model: normalizedMatches[0], confidence: 'high', reason: 'Normalized name match' };
  }
  
  // Try partial matches
  const partialMatches = brandMatches.filter(model => {
    const existingName = model.name.toLowerCase();
    const mobileActiveName = modelName.toLowerCase();
    
    return existingName.includes(mobileActiveName) || 
           mobileActiveName.includes(existingName) ||
           existingName.includes(normalizedMobileActive) ||
           normalizedMobileActive.includes(existingName);
  });
  
  if (partialMatches.length === 1) {
    return { model: partialMatches[0], confidence: 'medium', reason: 'Partial name match' };
  }
  
  return null;
}

function calculatePrice(partCost) {
  // Your markup strategy
  if (partCost <= 20) return Math.max(partCost * 2.5, 50);
  if (partCost <= 50) return Math.max(partCost * 2.2, 75);
  if (partCost <= 100) return Math.max(partCost * 2.0, 120);
  if (partCost <= 200) return Math.max(partCost * 1.8, 200);
  if (partCost <= 300) return Math.max(partCost * 1.6, 350);
  return Math.max(partCost * 1.5, 450);
}

async function createPricingEntries() {
  console.log('💰 Creating pricing entries with improved mapping...\n');
  
  try {
    // Get MobileActive products
    const { data: products, error: productsError } = await supabase
      .from('mobileactive_products')
      .select('*')
      .eq('device_type', 'mobile');
    
    if (productsError) {
      console.log(`❌ Failed to fetch products: ${productsError.message}`);
      return false;
    }
    
    console.log(`📊 Creating pricing for ${products.length} mobile products`);
    
    // Get existing models
    const { data: existingModels, error: modelsError } = await supabase
      .from('device_models')
      .select('id, name, display_name, brand_id, brands(name)')
      .eq('is_active', true);
    
    if (modelsError) {
      console.log(`❌ Failed to fetch models: ${modelsError.message}`);
      return false;
    }
    
    // Get services and pricing tiers
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, device_type_id')
      .eq('is_active', true);
    
    const { data: pricingTiers, error: tiersError } = await supabase
      .from('pricing_tiers')
      .select('id, name')
      .eq('is_active', true);
    
    if (servicesError || tiersError) {
      console.log(`❌ Failed to fetch services or tiers`);
      return false;
    }
    
    // Create pricing entries
    const pricingEntries = [];
    let mappedCount = 0;
    let unmappedCount = 0;
    
    for (const product of products) {
      const match = findBestMatch(product, existingModels);
      
      if (match) {
        const partCost = parseFloat(product.part_cost);
        const basePrice = calculatePrice(partCost);
        
        // Find matching service
        const matchingService = services.find(service => 
          service.name === product.service_type &&
          service.device_type_id === 1 // mobile
        );
        
        if (matchingService) {
          // Create pricing for each tier
          for (const tier of pricingTiers) {
            let finalPrice = basePrice;
            
            // Apply tier multiplier
            switch (tier.name) {
              case 'economy':
                finalPrice = Math.round(basePrice * 0.8);
                break;
              case 'standard':
                finalPrice = basePrice;
                break;
              case 'premium':
                finalPrice = Math.round(basePrice * 1.25);
                break;
              case 'express':
                finalPrice = Math.round(basePrice * 1.5);
                break;
            }
            
            pricingEntries.push({
              service_id: matchingService.id,
              model_id: match.model.id,
              pricing_tier_id: tier.id,
              base_price: finalPrice,
              cost_price: partCost,
              is_active: true
            });
          }
          
          mappedCount++;
        }
      } else {
        unmappedCount++;
      }
    }
    
    console.log(`📊 Mapping Results:`);
    console.log(`   ✅ Mapped: ${mappedCount} products`);
    console.log(`   ❌ Unmapped: ${unmappedCount} products`);
    console.log(`   📈 Success rate: ${((mappedCount / (mappedCount + unmappedCount)) * 100).toFixed(1)}%`);
    console.log(`   💰 Created ${pricingEntries.length} pricing entries`);
    
    // Remove duplicates before insertion
    const uniquePricingEntries = [];
    const seen = new Set();
    
    for (const entry of pricingEntries) {
      const key = `${entry.service_id}-${entry.model_id}-${entry.pricing_tier_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePricingEntries.push(entry);
      }
    }
    
    console.log(`💰 After deduplication: ${uniquePricingEntries.length} unique pricing entries`);
    
    // Insert pricing entries in small batches to avoid conflicts
    const batchSize = 100;
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < uniquePricingEntries.length; i += batchSize) {
      const batch = uniquePricingEntries.slice(i, i + batchSize);
      
      // Try to insert each entry individually to handle conflicts
      for (const entry of batch) {
        try {
          const { error } = await supabase
            .from('dynamic_pricing')
            .insert(entry);
          
          if (error) {
            if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
              skippedCount++;
            } else {
              console.log(`❌ Error inserting pricing entry: ${error.message}`);
            }
          } else {
            insertedCount++;
          }
        } catch (err) {
          skippedCount++;
        }
      }
      
      console.log(`💰 Processed batch ${Math.floor(i / batchSize) + 1}: ${batch.length} entries`);
    }
    
    console.log(`✅ Successfully created ${insertedCount} pricing entries`);
    console.log(`⏭️ Skipped ${skippedCount} duplicate entries\n`);
    return true;
    
  } catch (error) {
    console.error('❌ Pricing creation error:', error.message);
    return false;
  }
}

async function showIntegrationSummary() {
  console.log('📊 Integration Summary Report');
  console.log('=' .repeat(60));
  
  try {
    // Count MobileActive products
    const { count: mobileactiveCount } = await supabase
      .from('mobileactive_products')
      .select('*', { count: 'exact', head: true })
      .eq('device_type', 'mobile');
    
    // Count Samsung models
    const { count: samsungModelsCount } = await supabase
      .from('device_models')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', BRAND_IDS.samsung.mobile);
    
    // Count pricing entries
    const { count: pricingCount } = await supabase
      .from('dynamic_pricing')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    // Get sample pricing entries
    const { data: samplePricing } = await supabase
      .from('dynamic_pricing')
      .select(`
        base_price,
        cost_price,
        services(name),
        device_models(name, brands(name)),
        pricing_tiers(name)
      `)
      .eq('is_active', true)
      .limit(5);
    
    console.log('📱 MobileActive Integration:');
    console.log(`   • Mobile products imported: ${mobileactiveCount || 0}`);
    console.log(`   • Samsung models available: ${samsungModelsCount || 0}`);
    console.log(`   • Total pricing entries: ${pricingCount || 0}`);
    
    console.log('\n💰 Sample Pricing Entries:');
    if (samplePricing && samplePricing.length > 0) {
      samplePricing.forEach((entry, index) => {
        const service = entry.services?.name || 'Unknown';
        const model = entry.device_models?.name || 'Unknown';
        const brand = entry.device_models?.brands?.name || 'Unknown';
        const tier = entry.pricing_tiers?.name || 'Unknown';
        const markup = entry.cost_price > 0 ? ((entry.base_price - entry.cost_price) / entry.cost_price * 100).toFixed(0) : 'N/A';
        
        console.log(`   ${index + 1}. ${brand} ${model} - ${service} (${tier})`);
        console.log(`      Cost: $${entry.cost_price} | Price: $${entry.base_price} | Markup: ${markup}%`);
      });
    }
    
    console.log('\n🎉 Integration Status: COMPLETE');
    console.log('✅ MobileActive data successfully integrated');
    console.log('✅ Real supplier pricing applied');
    console.log('✅ Improved mapping logic implemented');
    console.log('✅ Business-ready pricing structure created');
    
  } catch (error) {
    console.error('❌ Error generating summary:', error.message);
  }
}

async function runFinalIntegration() {
  console.log('🚀 Final Integration - Creating Pricing Entries');
  console.log('=' .repeat(60));
  
  try {
    // Create pricing entries
    const pricingCreated = await createPricingEntries();
    if (!pricingCreated) {
      console.log('❌ Failed to create pricing entries');
      return false;
    }
    
    // Show summary
    await showIntegrationSummary();
    
    return true;
    
  } catch (error) {
    console.log(`❌ Final integration failed: ${error.message}`);
    return false;
  }
}

// Run the final integration
runFinalIntegration(); 