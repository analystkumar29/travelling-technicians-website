const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Load MobileActive data
const CLEANED_DATA_PATH = path.join(__dirname, 'tmp/mobileactive-improved-cleaned.json');

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

async function addMissingModels() {
  console.log('🔧 Step 1: Adding missing Samsung models...\n');
  
  try {
    // Load missing models data
    const missingModelsPath = path.join(__dirname, 'tmp/missing-samsung-models.json');
    if (!fs.existsSync(missingModelsPath)) {
      console.log('❌ Missing models data not found. Run identify-missing-models.js first.');
      return false;
    }
    
    const missingData = JSON.parse(fs.readFileSync(missingModelsPath, 'utf8'));
    const samsungBrandId = BRAND_IDS.samsung.mobile; // Use mobile brand ID
    
    console.log(`📱 Processing ${missingData.models.length} Samsung models...`);
    
    // Get existing Samsung models to avoid duplicates
    const { data: existingSamsungModels, error: existingError } = await supabase
      .from('device_models')
      .select('name')
      .eq('brand_id', samsungBrandId);
    
    if (existingError) {
      console.log(`❌ Error fetching existing models: ${existingError.message}`);
      return false;
    }
    
    const existingNames = existingSamsungModels.map(m => m.name.toLowerCase());
    
    // Filter out models that already exist
    const newModels = missingData.models.filter(model => 
      !existingNames.includes(model.name.toLowerCase())
    );
    
    console.log(`📱 Found ${newModels.length} new Samsung models to add`);
    
    if (newModels.length === 0) {
      console.log('✅ All Samsung models already exist\n');
      return true;
    }
    
    // Prepare models for insertion
    const modelsToInsert = newModels.map(model => ({
      brand_id: samsungBrandId,
      name: model.name,
      display_name: model.display_name,
      is_active: true,
      sort_order: 1000 // High sort order to put them at the end
    }));
    
    // Insert in batches
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < modelsToInsert.length; i += batchSize) {
      const batch = modelsToInsert.slice(i, i + batchSize);
      
      const { data: inserted, error } = await supabase
        .from('device_models')
        .insert(batch)
        .select('id, name');
      
      if (error) {
        console.log(`❌ Batch insert failed (${i}-${i + batchSize}): ${error.message}`);
        continue;
      }
      
      insertedCount += inserted.length;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${inserted.length} models`);
    }
    
    console.log(`✅ Successfully added ${insertedCount} Samsung models\n`);
    return true;
    
  } catch (error) {
    console.error('❌ Error adding missing models:', error.message);
    return false;
  }
}

async function importMobileActiveData() {
  console.log('📦 Step 2: Importing MobileActive data...\n');
  
  try {
    const data = JSON.parse(fs.readFileSync(CLEANED_DATA_PATH, 'utf8'));
    console.log(`📊 Loaded ${data.length} products from MobileActive data`);
    
    // Filter for mobile products with real model names
    const mobileData = data.filter(product => 
      product.device_type === 'mobile' && 
      product.model_name !== 'unknown' &&
      product.part_price > 0
    );
    
    console.log(`📱 Found ${mobileData.length} mobile products with valid pricing and model names`);
    
    // Insert into mobileactive_products table
    const productsToInsert = mobileData.map(product => ({
      mobileactive_id: product.product_id?.toString() || `MA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product_title: product.product_title,
      brand: product.brand.toLowerCase(),
      device_type: product.device_type,
      model_name: product.model_name,
      model_variant: product.model_variant || null,
      service_type: product.service_type,
      quality_tier: product.quality_tier || 'standard',
      part_cost: parseFloat(product.part_price),
      supplier_sku: product.sku || null,
      image_url: product.image_url || null,
      is_available: product.is_available !== false,
      lead_time_days: product.lead_time_days || 3
    }));
    
    // Clear existing data first
    const { error: deleteError } = await supabase
      .from('mobileactive_products')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.log(`⚠️ Could not clear existing data: ${deleteError.message}`);
    } else {
      console.log('🗑️ Cleared existing MobileActive products');
    }
    
    // Batch insert with upsert to handle duplicates
    const batchSize = 500; // Smaller batch size
    let insertedCount = 0;
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      
      const { data: inserted, error } = await supabase
        .from('mobileactive_products')
        .upsert(batch, { 
          onConflict: 'mobileactive_id',
          ignoreDuplicates: false 
        })
        .select('id, mobileactive_id');
      
      if (error) {
        console.log(`❌ Batch insert failed (${i}-${i + batchSize}): ${error.message}`);
        continue;
      }
      
      insertedCount += inserted.length;
      console.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}: ${inserted.length} products`);
    }
    
    console.log(`✅ Successfully imported ${insertedCount} MobileActive products\n`);
    return true;
    
  } catch (error) {
    console.error('❌ Data import error:', error.message);
    return false;
  }
}

async function createPricingEntries() {
  console.log('💰 Step 3: Creating pricing entries with improved mapping...\n');
  
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
    
    // Insert pricing entries in batches
    const batchSize = 500;
    let insertedCount = 0;
    
    for (let i = 0; i < pricingEntries.length; i += batchSize) {
      const batch = pricingEntries.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('dynamic_pricing')
        .upsert(batch, { 
          onConflict: 'service_id,model_id,pricing_tier_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.log(`❌ Pricing batch insert failed (${i}-${i + batchSize}): ${error.message}`);
        continue;
      }
      
      insertedCount += batch.length;
      console.log(`💰 Inserted pricing batch ${Math.floor(i / batchSize) + 1}: ${batch.length} entries`);
    }
    
    console.log(`✅ Successfully created ${insertedCount} pricing entries\n`);
    return true;
    
  } catch (error) {
    console.error('❌ Pricing creation error:', error.message);
    return false;
  }
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

async function runFixedHybridIntegration() {
  console.log('🚀 Starting Fixed Hybrid Integration Solution');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Add missing models
    const modelsAdded = await addMissingModels();
    if (!modelsAdded) {
      console.log('❌ Failed to add missing models');
      return false;
    }
    
    // Step 2: Import MobileActive data
    const dataImported = await importMobileActiveData();
    if (!dataImported) {
      console.log('❌ Failed to import MobileActive data');
      return false;
    }
    
    // Step 3: Create pricing entries
    const pricingCreated = await createPricingEntries();
    if (!pricingCreated) {
      console.log('❌ Failed to create pricing entries');
      return false;
    }
    
    console.log('🎉 Fixed Hybrid Integration completed successfully!');
    console.log('=' .repeat(60));
    console.log('📊 Summary:');
    console.log('  ✅ Added missing Samsung models (avoiding duplicates)');
    console.log('  ✅ Imported MobileActive data with real model names');
    console.log('  ✅ Created pricing entries with improved mapping');
    console.log('  ✅ Used both exact and fuzzy matching strategies');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('  • Test the booking system with new supplier pricing');
    console.log('  • Verify pricing calculations in admin panel');
    console.log('  • Monitor mapping accuracy and adjust if needed');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Fixed hybrid integration failed: ${error.message}`);
    return false;
  }
}

// Run the fixed hybrid integration
runFixedHybridIntegration(); 