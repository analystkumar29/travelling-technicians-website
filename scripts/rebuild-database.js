#!/usr/bin/env node

/**
 * Database Rebuild Script
 * Complete database reconstruction using cleaned MobileActive data
 * 
 * Features:
 * - Clean database reset
 * - Smart data mapping and normalization
 * - Hierarchical data creation (device types → brands → models → services → pricing)
 * - Batch processing for efficiency
 * - Comprehensive validation and error handling
 * - Progress tracking and statistics
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Service mappings
const SERVICE_MAPPINGS = {
  screen_replacement: {
    name: 'screen_replacement',
    display_name: 'Screen Replacement',
    is_doorstep_eligible: true
  },
  battery_replacement: {
    name: 'battery_replacement',
    display_name: 'Battery Replacement',
    is_doorstep_eligible: true
  },
  charging_port_repair: {
    name: 'charging_port_repair',
    display_name: 'Charging Port Repair',
    is_doorstep_eligible: true
  },
  camera_repair: {
    name: 'camera_repair',
    display_name: 'Camera Repair',
    is_doorstep_eligible: true
  },
  speaker_repair: {
    name: 'speaker_repair',
    display_name: 'Speaker/Mic Repair',
    is_doorstep_eligible: true
  },
  back_cover_replacement: {
    name: 'back_cover_replacement',
    display_name: 'Back Cover Replacement',
    is_doorstep_eligible: true
  }
};

// Device type mappings
const DEVICE_TYPE_MAPPINGS = {
  mobile: { name: 'mobile', display_name: 'Mobile Phone' },
  tablet: { name: 'tablet', display_name: 'Tablet' },
  laptop: { name: 'laptop', display_name: 'Laptop' }
};

// Brand mappings
const BRAND_MAPPINGS = {
  apple: { name: 'Apple', display_name: 'Apple' },
  samsung: { name: 'Samsung', display_name: 'Samsung' },
  google: { name: 'Google', display_name: 'Google' },
  huawei: { name: 'Huawei', display_name: 'Huawei' },
  xiaomi: { name: 'Xiaomi', display_name: 'Xiaomi' },
  oneplus: { name: 'OnePlus', display_name: 'OnePlus' }
};

// Pricing tiers (matching current schema)
const PRICING_TIERS = {
  economy: {
    name: 'economy',
    display_name: 'Economy',
    price_multiplier: 0.8,
    estimated_delivery_hours: 72
  },
  standard: {
    name: 'standard',
    display_name: 'Standard',
    price_multiplier: 1.0,
    estimated_delivery_hours: 48
  },
  premium: {
    name: 'premium',
    display_name: 'Premium',
    price_multiplier: 1.25,
    estimated_delivery_hours: 24
  },
  express: {
    name: 'express',
    display_name: 'Express',
    price_multiplier: 1.5,
    estimated_delivery_hours: 12
  }
};

function log(message, type = 'info') {
  const symbols = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', step: '🚀' };
  console.log(`${symbols[type]} ${message}`);
}

async function clearDatabase() {
  log('Clearing existing database data...', 'step');
  
  try {
    await supabase.from('dynamic_pricing').delete().neq('id', 0);
    await supabase.from('device_models').delete().neq('id', 0);
    await supabase.from('services').delete().neq('id', 0);
    await supabase.from('brands').delete().neq('id', 0);
    await supabase.from('pricing_tiers').delete().neq('id', 0);
    await supabase.from('device_types').delete().neq('id', 0);
    
    log('Database cleared successfully', 'success');
  } catch (error) {
    log(`Error clearing database: ${error.message}`, 'error');
    throw error;
  }
}

async function createDeviceTypes(data) {
  log('Creating device types...', 'step');
  
  const deviceTypes = [...new Set(data
    .filter(item => item.device_type && item.device_type !== 'unknown')
    .map(item => item.device_type)
  )];
  
  const deviceTypeRecords = deviceTypes.map(type => ({
    name: type,
    display_name: DEVICE_TYPE_MAPPINGS[type]?.display_name || type,
    is_active: true
  }));
  
  const { data: created, error } = await supabase
    .from('device_types')
    .insert(deviceTypeRecords)
    .select();
  
  if (error) throw error;
  
  log(`Created ${created.length} device types`, 'success');
  
  const deviceTypeMap = new Map();
  created.forEach(dt => deviceTypeMap.set(dt.name, dt.id));
  return deviceTypeMap;
}

async function createBrands(data, deviceTypeMap) {
  log('Creating brands...', 'step');
  
  const brandsByDevice = new Map();
  
  data.forEach(item => {
    if (item.brand && item.brand !== 'unknown' && 
        item.device_type && item.device_type !== 'unknown') {
      const key = `${item.brand}-${item.device_type}`;
      if (!brandsByDevice.has(key)) {
        brandsByDevice.set(key, {
          brand: item.brand,
          device_type: item.device_type
        });
      }
    }
  });
  
  const brandRecords = Array.from(brandsByDevice.values()).map(item => ({
    name: BRAND_MAPPINGS[item.brand]?.name || item.brand,
    display_name: BRAND_MAPPINGS[item.brand]?.display_name || item.brand,
    device_type_id: deviceTypeMap.get(item.device_type),
    is_active: true
  })).filter(record => record.device_type_id);
  
  const { data: created, error } = await supabase
    .from('brands')
    .insert(brandRecords)
    .select();
  
  if (error) throw error;
  
  log(`Created ${created.length} brands`, 'success');
  
  const brandMap = new Map();
  created.forEach(brand => {
    const key = `${brand.name.toLowerCase()}-${brand.device_type_id}`;
    brandMap.set(key, brand.id);
  });
  
  return brandMap;
}

async function createServices(data, deviceTypeMap) {
  log('Creating services...', 'step');
  
  const servicesByDevice = new Map();
  
  data.forEach(item => {
    if (item.service_type && item.service_type !== 'unknown' && 
        item.device_type && item.device_type !== 'unknown') {
      const key = `${item.service_type}-${item.device_type}`;
      if (!servicesByDevice.has(key)) {
        servicesByDevice.set(key, {
          service_type: item.service_type,
          device_type: item.device_type
        });
      }
    }
  });
  
  const serviceRecords = Array.from(servicesByDevice.values()).map(item => ({
    name: item.service_type,
    display_name: SERVICE_MAPPINGS[item.service_type]?.display_name || item.service_type,
    device_type_id: deviceTypeMap.get(item.device_type),
    category_id: 1,
    is_doorstep_eligible: SERVICE_MAPPINGS[item.service_type]?.is_doorstep_eligible || true,
    estimated_duration_minutes: 60,
    is_active: true
  })).filter(record => record.device_type_id);
  
  const { data: created, error } = await supabase
    .from('services')
    .insert(serviceRecords)
    .select();
  
  if (error) throw error;
  
  log(`Created ${created.length} services`, 'success');
  
  const serviceMap = new Map();
  created.forEach(service => {
    const key = `${service.name}-${service.device_type_id}`;
    serviceMap.set(key, service.id);
  });
  
  return serviceMap;
}

async function createDeviceModels(data, brandMap, deviceTypeMap) {
  log('Creating device models...', 'step');
  
  const modelsByBrand = new Map();
  
  data.forEach(item => {
    if (item.model_name && item.model_name !== 'unknown' && 
        item.brand && item.brand !== 'unknown' &&
        item.device_type && item.device_type !== 'unknown') {
      
      const brandKey = `${item.brand.toLowerCase()}-${deviceTypeMap.get(item.device_type)}`;
      const brandId = brandMap.get(brandKey);
      
      if (brandId) {
        const modelKey = `${item.model_name}-${brandId}`;
        if (!modelsByBrand.has(modelKey)) {
          modelsByBrand.set(modelKey, {
            model_name: item.model_name,
            brand_id: brandId,
            count: 0
          });
        }
        modelsByBrand.get(modelKey).count++;
      }
    }
  });
  
  const modelRecords = Array.from(modelsByBrand.values()).map(item => ({
    name: item.model_name,
    display_name: item.model_name,
    brand_id: item.brand_id,
    is_featured: item.count > 10,
    is_active: true
  }));
  
  // Batch insert models
  const batchSize = 1000;
  const created = [];
  
  for (let i = 0; i < modelRecords.length; i += batchSize) {
    const batch = modelRecords.slice(i, i + batchSize);
    const { data: batchCreated, error } = await supabase
      .from('device_models')
      .insert(batch)
      .select();
    
    if (error) throw error;
    created.push(...batchCreated);
    log(`Created models batch ${i + 1}-${Math.min(i + batchSize, modelRecords.length)}/${modelRecords.length}`, 'info');
  }
  
  log(`Created ${created.length} device models`, 'success');
  
  const modelMap = new Map();
  created.forEach(model => {
    const key = `${model.name}-${model.brand_id}`;
    modelMap.set(key, model.id);
  });
  
  return modelMap;
}

async function createPricingTiers() {
  log('Creating pricing tiers...', 'step');
  
  const tierRecords = Object.values(PRICING_TIERS);
  
  const { data: created, error } = await supabase
    .from('pricing_tiers')
    .insert(tierRecords)
    .select();
  
  if (error) throw error;
  
  log(`Created ${created.length} pricing tiers`, 'success');
  
  const tierMap = new Map();
  created.forEach(tier => tierMap.set(tier.name, tier.id));
  return tierMap;
}

async function createDynamicPricing(data, modelMap, serviceMap, tierMap, deviceTypeMap, brandMap) {
  log('Creating dynamic pricing entries...', 'step');
  
  const pricingRecords = [];
  const processedCombinations = new Set();
  
  data.forEach(item => {
    if (!item.is_valid || 
        !item.model_name || item.model_name === 'unknown' ||
        !item.brand || item.brand === 'unknown' ||
        !item.service_type || item.service_type === 'unknown' ||
        !item.device_type || item.device_type === 'unknown' ||
        !item.part_price || item.part_price <= 0) {
      return;
    }
    
    const brandKey = `${item.brand.toLowerCase()}-${deviceTypeMap.get(item.device_type)}`;
    const brandId = brandMap.get(brandKey);
    if (!brandId) return;
    
    const modelKey = `${item.model_name}-${brandId}`;
    const modelId = modelMap.get(modelKey);
    if (!modelId) return;
    
    const serviceKey = `${item.service_type}-${deviceTypeMap.get(item.device_type)}`;
    const serviceId = serviceMap.get(serviceKey);
    if (!serviceId) return;
    
    Object.keys(PRICING_TIERS).forEach(tierName => {
      const tierId = tierMap.get(tierName);
      if (!tierId) return;
      
      const combination = `${modelId}-${serviceId}-${tierId}`;
      if (processedCombinations.has(combination)) return;
      
      processedCombinations.add(combination);
      
      const tierConfig = PRICING_TIERS[tierName];
      const basePrice = parseFloat(item.part_price);
      const adjustedPrice = Math.round(basePrice * tierConfig.price_multiplier * 100) / 100;
      
      pricingRecords.push({
        model_id: modelId,
        service_id: serviceId,
        pricing_tier_id: tierId,
        base_price: adjustedPrice,
        cost_price: Math.round(basePrice * 0.7 * 100) / 100,
        is_active: true
      });
    });
  });
  
  log(`Generated ${pricingRecords.length} pricing entries`, 'info');
  
  // Batch insert pricing
  const batchSize = 1000;
  let created = 0;
  
  for (let i = 0; i < pricingRecords.length; i += batchSize) {
    const batch = pricingRecords.slice(i, i + batchSize);
    const { data: batchCreated, error } = await supabase
      .from('dynamic_pricing')
      .insert(batch)
      .select();
    
    if (error) {
      log(`Error in batch ${i}: ${error.message}`, 'warning');
      continue;
    }
    
    created += batchCreated.length;
    log(`Created pricing batch ${i + 1}-${Math.min(i + batchSize, pricingRecords.length)}/${pricingRecords.length}`, 'info');
  }
  
  log(`Created ${created} dynamic pricing entries`, 'success');
  return created;
}

async function rebuildDatabase() {
  const startTime = Date.now();
  
  try {
    log('🚀 Starting Database Rebuild Process', 'step');
    console.log('=' .repeat(60));
    
    // Determine data source (enhanced vs standard)
    const useEnhanced = process.argv.includes('--use-enhanced');
    const inputPath = useEnhanced 
      ? path.join(__dirname, 'mobileactive/tmp/mobileactive-enhanced-cleaned.json')
      : path.join(__dirname, 'mobileactive/tmp/mobileactive-improved-cleaned.json');
    
    // Load cleaned data
    log(`Loading ${useEnhanced ? 'enhanced' : 'standard'} cleaned MobileActive data...`, 'step');
    
    if (!fs.existsSync(inputPath)) {
      log(`Data file not found: ${inputPath}`, 'error');
      log('Please run the appropriate data cleaner first', 'error');
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    log(`Loaded ${data.length} products from ${useEnhanced ? 'enhanced' : 'standard'} dataset`, 'success');
    
    // Display enhanced data quality metrics
    if (useEnhanced) {
      const enhanced = data.filter(item => item.enhanced_metadata?.improvements_made);
      const samsungGalaxy = data.filter(item => item.brand === 'samsung' && item.model_name?.startsWith('Galaxy'));
      const multiDevice = data.filter(item => item.additional_models?.length > 0);
      const unknownModels = data.filter(item => item.model_name === 'unknown');
      
      log(`📊 Enhanced Data Quality Metrics:`, 'info');
      log(`   Enhanced improvements: ${enhanced.length} (${(enhanced.length/data.length*100).toFixed(1)}%)`, 'info');
      log(`   Samsung Galaxy products: ${samsungGalaxy.length}`, 'info');
      log(`   Multi-device products: ${multiDevice.length}`, 'info');
      log(`   Unknown models remaining: ${unknownModels.length} (${(unknownModels.length/data.length*100).toFixed(1)}%)`, 'info');
    }
    
    const validData = data.filter(item => item.is_valid);
    log(`Valid products: ${validData.length}/${data.length}`, 'info');
    
    // Clear and rebuild
    await clearDatabase();
    
    const deviceTypeMap = await createDeviceTypes(validData);
    const brandMap = await createBrands(validData, deviceTypeMap);
    const serviceMap = await createServices(validData, deviceTypeMap);
    const modelMap = await createDeviceModels(validData, brandMap, deviceTypeMap);
    const tierMap = await createPricingTiers();
    
    const pricingCount = await createDynamicPricing(
      validData, modelMap, serviceMap, tierMap, deviceTypeMap, brandMap
    );
    
    // Final report
    log('Database Rebuild Complete!', 'success');
    log(`✅ Device Types: ${deviceTypeMap.size}`, 'success');
    log(`✅ Brands: ${brandMap.size}`, 'success');
    log(`✅ Services: ${serviceMap.size}`, 'success');
    log(`✅ Models: ${modelMap.size}`, 'success');
    log(`✅ Pricing Entries: ${pricingCount}`, 'success');
    
    const finalStats = {
      deviceTypes: deviceTypeMap.size,
      brands: brandMap.size,
      services: serviceMap.size,
      models: modelMap.size,
      pricingEntries: pricingCount,
      sourceProducts: data.length,
      validProducts: validData.length,
      rebuildDate: new Date().toISOString()
    };
    
    const statsPath = path.join(__dirname, 'tmp/rebuild-stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(finalStats, null, 2));
    log(`Rebuild statistics saved to: ${statsPath}`, 'info');
    
  } catch (error) {
    log(`Database rebuild failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  rebuildDatabase();
}

module.exports = { rebuildDatabase }; 