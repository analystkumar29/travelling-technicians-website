#!/usr/bin/env node

/**
 * Simple Database Import Script
 * Imports MobileActive enhanced data into our current database schema
 * Works with the current Supabase setup
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const BATCH_SIZE = 100;
const MAX_RETRIES = 3;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Logging functions
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

// Service type mappings
const SERVICE_MAPPINGS = {
  'screen replacement': 'screen-replacement',
  'battery replacement': 'battery-replacement',
  'charging port repair': 'charging-port-repair',
  'camera repair': 'camera-repair',
  'speaker repair': 'speaker-repair',
  'microphone repair': 'microphone-repair',
  'back cover replacement': 'back-cover-replacement',
  'digitizer replacement': 'screen-replacement',
  'lcd replacement': 'screen-replacement',
  'display replacement': 'screen-replacement'
};

// Quality tier mappings
const QUALITY_MAPPINGS = {
  'aftermarket': 'aftermarket',
  'oem': 'oem',
  'premium': 'premium',
  'economy': 'economy',
  'refurbished': 'refurbished',
  'original': 'oem',
  'replacement': 'aftermarket'
};

// Brand name normalization
function normalizeBrandName(brand) {
  const brandMap = {
    'apple': 'apple',
    'samsung': 'samsung',
    'google': 'google',
    'oneplus': 'oneplus',
    'xiaomi': 'xiaomi',
    'huawei': 'huawei',
    'lg': 'lg',
    'htc': 'htc',
    'sony': 'sony',
    'motorola': 'motorola',
    'nokia': 'nokia'
  };
  
  const normalized = brand.toLowerCase().trim();
  return brandMap[normalized] || 'other';
}

// Service name normalization  
function normalizeServiceName(service) {
  const normalized = service.toLowerCase().trim();
  
  // Direct mappings
  if (SERVICE_MAPPINGS[normalized]) {
    return SERVICE_MAPPINGS[normalized];
  }
  
  // Pattern matching
  if (normalized.includes('screen') || normalized.includes('display') || normalized.includes('lcd')) {
    return 'screen-replacement';
  }
  if (normalized.includes('battery')) {
    return 'battery-replacement';
  }
  if (normalized.includes('charging') || normalized.includes('port')) {
    return 'charging-port-repair';
  }
  if (normalized.includes('camera')) {
    return 'camera-repair';
  }
  if (normalized.includes('speaker')) {
    return 'speaker-repair';
  }
  
  return 'other-repair';
}

// Quality tier normalization
function normalizeQualityTier(quality) {
  const normalized = quality.toLowerCase().trim();
  return QUALITY_MAPPINGS[normalized] || 'aftermarket';
}

// Load data from file
async function loadEnhancedData() {
  try {
    const dataPath = path.join(__dirname, 'tmp/mobileactive-enhanced-v3.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error('Enhanced data file not found. Please run the data cleaning pipeline first.');
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    log(`Loaded ${data.length} products from enhanced data file`);
    return data;
  } catch (error) {
    log(`Failed to load enhanced data: ${error.message}`, 'error');
    throw error;
  }
}

// Get or create brand
async function getOrCreateBrand(brandName, deviceTypeId) {
  try {
    const normalizedBrand = normalizeBrandName(brandName);
    
    // Try to find existing brand
    const { data: existingBrand, error: searchError } = await supabase
      .from('brands')
      .select('id, name')
      .eq('name', normalizedBrand)
      .eq('device_type_id', deviceTypeId)
      .single();
    
    if (existingBrand && !searchError) {
      return existingBrand.id;
    }
    
    // Create new brand
    const { data: newBrand, error: createError } = await supabase
      .from('brands')
      .insert({
        name: normalizedBrand,
        display_name: brandName,
        device_type_id: deviceTypeId,
        is_active: true
      })
      .select('id')
      .single();
    
    if (createError) {
      log(`Failed to create brand ${brandName}: ${createError.message}`, 'warning');
      return null;
    }
    
    log(`Created new brand: ${brandName} (${normalizedBrand})`, 'success');
    return newBrand.id;
    
  } catch (error) {
    log(`Error handling brand ${brandName}: ${error.message}`, 'warning');
    return null;
  }
}

// Get or create device model
async function getOrCreateDeviceModel(modelName, brandId, deviceTypeId) {
  try {
    // Try to find existing model
    const { data: existingModel, error: searchError } = await supabase
      .from('device_models')
      .select('id, name')
      .eq('name', modelName)
      .eq('brand_id', brandId)
      .single();
    
    if (existingModel && !searchError) {
      return existingModel.id;
    }
    
    // Create new model
    const { data: newModel, error: createError } = await supabase
      .from('device_models')
      .insert({
        name: modelName,
        display_name: modelName,
        brand_id: brandId,
        device_type_id: deviceTypeId,
        is_active: true,
        quality_score: 85, // Default quality score for scraped data
        data_source: 'scraped',
        needs_review: false
      })
      .select('id')
      .single();
    
    if (createError) {
      log(`Failed to create model ${modelName}: ${createError.message}`, 'warning');
      return null;
    }
    
    log(`Created new model: ${modelName}`, 'success');
    return newModel.id;
    
  } catch (error) {
    log(`Error handling model ${modelName}: ${error.message}`, 'warning');
    return null;
  }
}

// Get service ID
async function getServiceId(serviceName, deviceTypeId) {
  try {
    const normalizedService = normalizeServiceName(serviceName);
    
    const { data: service, error } = await supabase
      .from('services')
      .select('id')
      .eq('name', normalizedService)
      .eq('device_type_id', deviceTypeId)
      .single();
    
    if (error || !service) {
      log(`Service not found: ${serviceName} -> ${normalizedService}`, 'warning');
      return null;
    }
    
    return service.id;
  } catch (error) {
    log(`Error getting service ${serviceName}: ${error.message}`, 'warning');
    return null;
  }
}

// Get pricing tier ID
async function getPricingTierId(tierName) {
  try {
    const { data: tier, error } = await supabase
      .from('pricing_tiers')
      .select('id')
      .eq('name', tierName)
      .single();
    
    if (error || !tier) {
      // Default to standard tier
      const { data: defaultTier } = await supabase
        .from('pricing_tiers')
        .select('id')
        .eq('name', 'standard')
        .single();
      
      return defaultTier?.id || 2; // Fallback to ID 2
    }
    
    return tier.id;
  } catch (error) {
    log(`Error getting pricing tier: ${error.message}`, 'warning');
    return 2; // Default to standard tier
  }
}

// Import MobileActive products
async function importMobileActiveProducts(products) {
  log('Starting import of MobileActive products...');
  
  const stats = {
    total: products.length,
    processed: 0,
    imported: 0,
    skipped: 0,
    errors: 0
  };
  
  // Get device type ID for mobile (assuming most data is mobile)
  const { data: deviceType } = await supabase
    .from('device_types')
    .select('id')
    .eq('name', 'mobile')
    .single();
  
  const deviceTypeId = deviceType?.id || 1;
  
  // Process in batches
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    
    log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)}`);
    
    for (const product of batch) {
      try {
        stats.processed++;
        
        // Skip invalid products (adapt to actual data structure)
        if (!product.clean_brand || !product.clean_model || !product.service_type || !product.price) {
          stats.skipped++;
          continue;
        }
        
        // Get or create brand (use clean_brand from data)
        const brandId = await getOrCreateBrand(product.clean_brand, deviceTypeId);
        if (!brandId) {
          stats.skipped++;
          continue;
        }
        
        // Get or create device model (use clean_model from data)
        const modelId = await getOrCreateDeviceModel(product.clean_model, brandId, deviceTypeId);
        if (!modelId) {
          stats.skipped++;
          continue;
        }
        
        // Get service ID
        const serviceId = await getServiceId(product.service_type, deviceTypeId);
        if (!serviceId) {
          stats.skipped++;
          continue;
        }
        
        // Get pricing tier ID
        const pricingTierId = await getPricingTierId('standard');
        
        // Calculate pricing (use price from data)
        const costPrice = parseFloat(product.price);
        const basePrice = Math.max(costPrice * 2.0, 75); // 100% markup, minimum $75
        
        // Insert into MobileActive products table
        const { error: productError } = await supabase
          .from('mobileactive_products')
          .insert({
            mobileactive_id: product.product_id,
            product_title: product.product_title || product.raw_title,
            brand: product.clean_brand,
            device_type: product.clean_type || 'mobile',
            model_name: product.clean_model,
            model_variant: null,
            service_type: product.service_type,
            quality_tier: normalizeQualityTier('aftermarket'),
            part_cost: costPrice,
            supplier_sku: product.sku,
            image_url: null,
            is_available: true,
            raw_data: product
          });
        
        if (productError) {
          // Ignore duplicate errors
          if (!productError.message.includes('duplicate key')) {
            log(`Failed to insert product ${product.product_id}: ${productError.message}`, 'warning');
            stats.errors++;
          }
          continue;
        }
        
        // Insert into dynamic pricing (if not exists)
        const { error: pricingError } = await supabase
          .from('dynamic_pricing')
          .insert({
            service_id: serviceId,
            model_id: modelId,
            pricing_tier_id: pricingTierId,
            base_price: basePrice,
            cost_price: costPrice,
            is_active: true
          });
        
        if (pricingError && !pricingError.message.includes('duplicate key')) {
          log(`Failed to insert pricing for model ${modelId}: ${pricingError.message}`, 'warning');
        }
        
        stats.imported++;
        
        // Progress update
        if (stats.processed % 50 === 0) {
          log(`Progress: ${stats.processed}/${stats.total} (${Math.round(stats.processed / stats.total * 100)}%)`);
        }
        
      } catch (error) {
        log(`Error processing product ${product.product_id}: ${error.message}`, 'error');
        stats.errors++;
      }
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return stats;
}

// Main import function
async function main() {
  try {
    log('🚀 Starting MobileActive Database Import');
    log('=====================================');
    
    // Load data
    const products = await loadEnhancedData();
    
    // Filter for valid products (adapt to actual data structure)
    const validProducts = products.filter(p => 
      p.clean_brand && 
      p.clean_model && 
      p.service_type && 
      p.price &&
      p.price > 0
    );
    
    log(`Found ${validProducts.length} valid products out of ${products.length} total`);
    
    // Import products
    const stats = await importMobileActiveProducts(validProducts);
    
    // Display results
    log('');
    log('📊 Import Results');
    log('=================');
    log(`Total Products: ${stats.total}`);
    log(`Processed: ${stats.processed}`);
    log(`Successfully Imported: ${stats.imported}`);
    log(`Skipped: ${stats.skipped}`);
    log(`Errors: ${stats.errors}`);
    log(`Success Rate: ${Math.round(stats.imported / stats.processed * 100)}%`);
    
    // Verify import
    const { data: importedCount } = await supabase
      .from('mobileactive_products')
      .select('id', { count: 'exact' });
    
    const { data: pricingCount } = await supabase
      .from('dynamic_pricing')
      .select('id', { count: 'exact' });
      
    log('');
    log('📈 Database Status');
    log('==================');
    log(`MobileActive Products: ${importedCount?.length || 0}`);
    log(`Dynamic Pricing Entries: ${pricingCount?.length || 0}`);
    
    log('✅ Import completed successfully!', 'success');
    
  } catch (error) {
    log(`❌ Import failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  main();
}

module.exports = { main };
