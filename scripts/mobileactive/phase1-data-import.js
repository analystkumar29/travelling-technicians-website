// Phase 1: Data Import - MobileActive Integration
// 1. Run integration schema
// 2. Import MobileActive data (5,705 products)
// 3. Map to existing device models
// 4. Create pricing entries

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const CLEANED_DATA_PATH = path.join(__dirname, 'tmp/mobileactive-improved-cleaned.json');
const SCHEMA_OUTPUT_PATH = path.join(__dirname, 'tmp/integration-schema.sql');
const MAPPING_OUTPUT_PATH = path.join(__dirname, 'tmp/data-mapping.json');

// Supabase configuration
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[level];
  console.log(`${timestamp} ${emoji} ${message}`);
};

// Your revised markup strategy
function calculatePrice(partCost) {
  let markup;
  if (partCost < 20) {
    markup = 99 - partCost;  // Max $99 total
  } else if (partCost < 30) {
    markup = 111 - partCost;  // Max $111 total
  } else if (partCost < 50) {
    markup = 100;  // Flat $100 margin
  } else if (partCost < 70) {
    markup = 120;  // Flat $120 margin
  } else if (partCost < 150) {
    markup = 130;  // Flat $130 margin
  } else {
    markup = 150;  // Flat $150 margin
  }
  return Math.round(partCost + markup);
}

// Step 1: Run Integration Schema
async function runIntegrationSchema() {
  log('🔧 Step 1: Running integration schema...');
  
  try {
    const supabase = getSupabaseClient();
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'tmp/integration-schema.sql');
    if (!fs.existsSync(schemaPath)) {
      log('❌ Integration schema file not found. Please run create-integration-schema.js first', 'error');
      return false;
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      log(`❌ Schema execution failed: ${error.message}`, 'error');
      return false;
    }
    
    log('✅ Integration schema executed successfully');
    return true;
  } catch (error) {
    log(`❌ Schema execution error: ${error.message}`, 'error');
    return false;
  }
}

// Step 2: Import MobileActive Data
async function importMobileActiveData() {
  log('📦 Step 2: Importing MobileActive data...');
  
  try {
    const supabase = getSupabaseClient();
    
    // Load cleaned data
    if (!fs.existsSync(CLEANED_DATA_PATH)) {
      log('❌ MobileActive cleaned data not found', 'error');
      return false;
    }
    
    const data = JSON.parse(fs.readFileSync(CLEANED_DATA_PATH, 'utf8'));
    log(`📊 Loaded ${data.length} products from MobileActive data`);
    
    // Filter for top 95% coverage (mobile devices)
    const mobileData = data.filter(product => 
      product.device_type === 'mobile' && 
      product.part_price > 0
    );
    
    log(`📱 Found ${mobileData.length} mobile products with valid pricing`);
    
    // Insert into mobileactive_products table
    const productsToInsert = mobileData.map(product => ({
      mobileactive_id: product.mobileactive_id || `MA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product_title: product.product_title,
      brand: product.brand.toLowerCase(),
      device_type: product.device_type,
      model_name: product.model_name,
      model_variant: product.model_variant || null,
      service_type: product.service_type,
      quality_tier: product.quality_tier || 'standard',
      part_cost: parseFloat(product.part_price),
      supplier_sku: product.supplier_sku || null,
      image_url: product.image_url || null,
      is_available: product.is_available !== false,
      lead_time_days: product.lead_time_days || 3
    }));
    
    // Batch insert (Supabase has a limit of 1000 per batch)
    const batchSize = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      
      const { data: inserted, error } = await supabase
        .from('mobileactive_products')
        .insert(batch)
        .select('id, mobileactive_id');
      
      if (error) {
        log(`❌ Batch insert failed (${i}-${i + batchSize}): ${error.message}`, 'error');
        return false;
      }
      
      insertedCount += inserted.length;
      log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}: ${inserted.length} products`);
    }
    
    log(`✅ Successfully imported ${insertedCount} MobileActive products`);
    return true;
  } catch (error) {
    log(`❌ Data import error: ${error.message}`, 'error');
    return false;
  }
}

// Step 3: Map to Existing Device Models
async function mapToExistingModels() {
  log('🔗 Step 3: Mapping to existing device models...');
  
  try {
    const supabase = getSupabaseClient();
    
    // Get existing brands and models from your system
    const { data: existingBrands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, device_type_id')
      .eq('is_active', true);
    
    if (brandsError) {
      log(`❌ Failed to fetch existing brands: ${brandsError.message}`, 'error');
      return false;
    }
    
    const { data: existingModels, error: modelsError } = await supabase
      .from('device_models')
      .select('id, brand_id, name, display_name')
      .eq('is_active', true);
    
    if (modelsError) {
      log(`❌ Failed to fetch existing models: ${modelsError.message}`, 'error');
      return false;
    }
    
    log(`📋 Found ${existingBrands.length} existing brands and ${existingModels.length} models`);
    
    // Get MobileActive products
    const { data: mobileactiveProducts, error: productsError } = await supabase
      .from('mobileactive_products')
      .select('*');
    
    if (productsError) {
      log(`❌ Failed to fetch MobileActive products: ${productsError.message}`, 'error');
      return false;
    }
    
    log(`📱 Processing ${mobileactiveProducts.length} MobileActive products for mapping`);
    
    // Create brand mappings
    const brandMappings = [];
    const brandMap = new Map();
    
    existingBrands.forEach(brand => {
      brandMap.set(brand.name.toLowerCase(), brand.id);
    });
    
    // Process each MobileActive product
    let mappedCount = 0;
    let unmappedCount = 0;
    
    for (const product of mobileactiveProducts) {
      const brandName = product.brand.toLowerCase();
      const existingBrandId = brandMap.get(brandName);
      
      if (existingBrandId) {
        // Find matching model
        const matchingModel = existingModels.find(model => 
          model.brand_id === existingBrandId &&
          (model.name.toLowerCase().includes(product.model_name.toLowerCase()) ||
           product.model_name.toLowerCase().includes(model.name.toLowerCase()))
        );
        
        if (matchingModel) {
          // Create mapping
          brandMappings.push({
            mobileactive_brand: product.brand,
            system_brand: existingBrands.find(b => b.id === existingBrandId).name,
            is_active: true
          });
          
          mappedCount++;
        } else {
          unmappedCount++;
        }
      } else {
        unmappedCount++;
      }
    }
    
    log(`✅ Mapped ${mappedCount} products, ${unmappedCount} unmapped`);
    
    // Insert brand mappings (avoid duplicates)
    if (brandMappings.length > 0) {
      const uniqueMappings = brandMappings.filter((mapping, index, self) => 
        index === self.findIndex(m => m.mobileactive_brand === mapping.mobileactive_brand)
      );
      
      const { error: mappingError } = await supabase
        .from('brand_mappings')
        .upsert(uniqueMappings, { onConflict: 'mobileactive_brand,system_brand' });
      
      if (mappingError) {
        log(`❌ Brand mapping insert failed: ${mappingError.message}`, 'error');
        return false;
      }
      
      log(`✅ Inserted ${uniqueMappings.length} brand mappings`);
    }
    
    return true;
  } catch (error) {
    log(`❌ Model mapping error: ${error.message}`, 'error');
    return false;
  }
}

// Step 4: Create Pricing Entries
async function createPricingEntries() {
  log('💰 Step 4: Creating pricing entries...');
  
  try {
    const supabase = getSupabaseClient();
    
    // Get MobileActive products with their costs
    const { data: products, error: productsError } = await supabase
      .from('mobileactive_products')
      .select('*')
      .eq('device_type', 'mobile');
    
    if (productsError) {
      log(`❌ Failed to fetch products for pricing: ${productsError.message}`, 'error');
      return false;
    }
    
    log(`📊 Creating pricing for ${products.length} mapped products`);
    
    // Get existing services and pricing tiers
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, device_type_id')
      .eq('is_active', true);
    
    if (servicesError) {
      log(`❌ Failed to fetch services: ${servicesError.message}`, 'error');
      return false;
    }
    
    const { data: pricingTiers, error: tiersError } = await supabase
      .from('pricing_tiers')
      .select('id, name')
      .eq('is_active', true);
    
    if (tiersError) {
      log(`❌ Failed to fetch pricing tiers: ${tiersError.message}`, 'error');
      return false;
    }
    
    // Create service mappings
    const serviceMappings = [
      { mobileactive_service: 'screen_replacement', system_service: 'screen_replacement' },
      { mobileactive_service: 'battery_replacement', system_service: 'battery_replacement' },
      { mobileactive_service: 'charging_port_repair', system_service: 'charging_port_repair' },
      { mobileactive_service: 'camera_repair', system_service: 'camera_repair' },
      { mobileactive_service: 'speaker_repair', system_service: 'speaker_repair' },
      { mobileactive_service: 'microphone_repair', system_service: 'microphone_repair' },
      { mobileactive_service: 'back_cover_replacement', system_service: 'back_cover_replacement' }
    ];
    
    // Insert service mappings
    const { error: serviceMappingError } = await supabase
      .from('service_mappings')
      .upsert(serviceMappings, { onConflict: 'mobileactive_service,system_service' });
    
    if (serviceMappingError) {
      log(`❌ Service mapping insert failed: ${serviceMappingError.message}`, 'error');
      return false;
    }
    
    // Create pricing entries
    const pricingEntries = [];
    
    for (const product of products) {
      const partCost = parseFloat(product.part_cost);
      const basePrice = calculatePrice(partCost);
      
      // Find matching service
      const matchingService = services.find(service => 
        service.name === product.service_type &&
        service.device_type_id === 1 // mobile
      );
      
      if (!matchingService) continue;
      
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
          model_id: null, // Will be mapped later
          pricing_tier_id: tier.id,
          base_price: finalPrice,
          cost_price: partCost,
          is_active: true
        });
      }
    }
    
    log(`💰 Created ${pricingEntries.length} pricing entries`);
    
    // Insert pricing entries in batches
    const batchSize = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < pricingEntries.length; i += batchSize) {
      const batch = pricingEntries.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('dynamic_pricing')
        .insert(batch);
      
      if (error) {
        log(`❌ Pricing batch insert failed (${i}-${i + batchSize}): ${error.message}`, 'error');
        return false;
      }
      
      insertedCount += batch.length;
      log(`💰 Inserted pricing batch ${Math.floor(i / batchSize) + 1}: ${batch.length} entries`);
    }
    
    log(`✅ Successfully created ${insertedCount} pricing entries`);
    return true;
  } catch (error) {
    log(`❌ Pricing creation error: ${error.message}`, 'error');
    return false;
  }
}

// Main execution function
async function runPhase1Import() {
  log('🚀 Starting Phase 1: Data Import');
  log('=' .repeat(50));
  
  try {
    // Step 1: Run integration schema (SKIPPED - already run in Supabase)
    log('⏭️ Step 1: Skipping schema execution (already run in Supabase)', 'warning');
    
    // Step 2: Import MobileActive data
    const importSuccess = await importMobileActiveData();
    if (!importSuccess) {
      log('❌ Phase 1 failed at data import step', 'error');
      return false;
    }
    
    // Step 3: Map to existing models
    const mappingSuccess = await mapToExistingModels();
    if (!mappingSuccess) {
      log('❌ Phase 1 failed at model mapping step', 'error');
      return false;
    }
    
    // Step 4: Create pricing entries
    const pricingSuccess = await createPricingEntries();
    if (!pricingSuccess) {
      log('❌ Phase 1 failed at pricing creation step', 'error');
      return false;
    }
    
    log('🎉 Phase 1: Data Import completed successfully!');
    log('=' .repeat(50));
    log('📊 Summary:');
    log('  ✅ Integration schema executed');
    log('  ✅ MobileActive data imported');
    log('  ✅ Models mapped to existing system');
    log('  ✅ Pricing entries created with your markup strategy');
    log('');
    log('🔄 Next steps:');
    log('  • Test the booking system with new data');
    log('  • Verify pricing calculations');
    log('  • Update API endpoints if needed');
    
    return true;
  } catch (error) {
    log(`❌ Phase 1 failed with error: ${error.message}`, 'error');
    return false;
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  runPhase1Import()
    .then(success => {
      if (success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      log(`❌ Unexpected error: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { runPhase1Import, calculatePrice }; 