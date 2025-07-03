#!/usr/bin/env node

/**
 * Enhanced Database Rebuild Script v2.0
 * Complete database reconstruction using Enhanced AI Cleaned MobileActive data
 * 
 * Features:
 * - Support for enhanced cleaned data with Samsung normalization
 * - Multi-device product handling
 * - Enhanced progress tracking and reporting
 * - Better model extraction and normalization
 * - Improved data quality metrics
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

// Enhanced service mappings with more comprehensive coverage
const ENHANCED_SERVICE_MAPPINGS = {
  screen_replacement: {
    name: 'screen_replacement',
    display_name: 'Screen Replacement',
    is_doorstep_eligible: true,
    device_types: ['mobile', 'tablet', 'laptop']
  },
  battery_replacement: {
    name: 'battery_replacement',
    display_name: 'Battery Replacement', 
    is_doorstep_eligible: true,
    device_types: ['mobile', 'tablet', 'laptop']
  },
  charging_port_repair: {
    name: 'charging_port_repair',
    display_name: 'Charging Port Repair',
    is_doorstep_eligible: true,
    device_types: ['mobile', 'tablet', 'laptop']
  },
  camera_repair: {
    name: 'camera_repair',
    display_name: 'Camera Repair',
    is_doorstep_eligible: true,
    device_types: ['mobile', 'tablet']
  },
  speaker_repair: {
    name: 'speaker_repair',
    display_name: 'Speaker/Mic Repair',
    is_doorstep_eligible: true,
    device_types: ['mobile', 'tablet', 'laptop']
  },
  back_cover_replacement: {
    name: 'back_cover_replacement',
    display_name: 'Back Cover Replacement',
    is_doorstep_eligible: true,
    device_types: ['mobile', 'tablet']
  },
  microphone_repair: {
    name: 'microphone_repair',
    display_name: 'Microphone Repair',
    is_doorstep_eligible: true,
    device_types: ['mobile', 'tablet', 'laptop']
  },
  button_repair: {
    name: 'button_repair',
    display_name: 'Button Repair',
    is_doorstep_eligible: true,
    device_types: ['mobile', 'tablet']
  }
};

// Enhanced device type mappings
const ENHANCED_DEVICE_TYPE_MAPPINGS = {
  mobile: { name: 'mobile', display_name: 'Mobile Phone' },
  tablet: { name: 'tablet', display_name: 'Tablet' },
  laptop: { name: 'laptop', display_name: 'Laptop' }
};

// Enhanced brand mappings with proper capitalization
const ENHANCED_BRAND_MAPPINGS = {
  apple: { name: 'Apple', display_name: 'Apple' },
  samsung: { name: 'Samsung', display_name: 'Samsung' },
  google: { name: 'Google', display_name: 'Google' },
  huawei: { name: 'Huawei', display_name: 'Huawei' },
  xiaomi: { name: 'Xiaomi', display_name: 'Xiaomi' },
  oneplus: { name: 'OnePlus', display_name: 'OnePlus' },
  lg: { name: 'LG', display_name: 'LG' },
  sony: { name: 'Sony', display_name: 'Sony' },
  oppo: { name: 'OPPO', display_name: 'OPPO' },
  vivo: { name: 'Vivo', display_name: 'Vivo' },
  motorola: { name: 'Motorola', display_name: 'Motorola' },
  nokia: { name: 'Nokia', display_name: 'Nokia' }
};

// Enhanced pricing tiers (matching current schema)
const ENHANCED_PRICING_TIERS = {
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

function enhancedLog(message, type = 'info') {
  const symbols = { 
    info: '📋', 
    success: '✅', 
    warning: '⚠️', 
    error: '❌', 
    step: '🚀',
    progress: '📈',
    data: '📊'
  };
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`${symbols[type]} [${timestamp}] ${message}`);
}

function displaySection(title) {
  console.log('\n' + '=' .repeat(70));
  console.log(`🎯 ${title}`);
  console.log('=' .repeat(70));
}

async function clearEnhancedDatabase() {
  enhancedLog('Clearing existing database data...', 'step');
  
  try {
    // Clear in dependency order
    await supabase.from('dynamic_pricing').delete().neq('id', 0);
    await supabase.from('device_models').delete().neq('id', 0);
    await supabase.from('services').delete().neq('id', 0);
    await supabase.from('brands').delete().neq('id', 0);
    await supabase.from('pricing_tiers').delete().neq('id', 0);
    await supabase.from('device_types').delete().neq('id', 0);
    
    enhancedLog('Database cleared successfully', 'success');
  } catch (error) {
    enhancedLog(`Error clearing database: ${error.message}`, 'error');
    throw error;
  }
}

async function createEnhancedDeviceTypes(data) {
  enhancedLog('Creating enhanced device types...', 'step');
  
  const deviceTypes = [...new Set(data
    .filter(item => item.device_type && item.device_type !== 'unknown')
    .map(item => item.device_type)
  )];
  
  const deviceTypeRecords = deviceTypes.map(type => ({
    name: type,
    display_name: ENHANCED_DEVICE_TYPE_MAPPINGS[type]?.display_name || type,
    is_active: true
  }));
  
  const { data: created, error } = await supabase
    .from('device_types')
    .insert(deviceTypeRecords)
    .select();
  
  if (error) throw error;
  
  enhancedLog(`Created ${created.length} device types: ${created.map(dt => dt.display_name).join(', ')}`, 'success');
  
  const deviceTypeMap = new Map();
  created.forEach(dt => deviceTypeMap.set(dt.name, dt.id));
  return deviceTypeMap;
}

async function createEnhancedBrands(data, deviceTypeMap) {
  enhancedLog('Creating enhanced brands with device type relationships...', 'step');
  
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
    name: ENHANCED_BRAND_MAPPINGS[item.brand]?.name || item.brand,
    display_name: ENHANCED_BRAND_MAPPINGS[item.brand]?.display_name || item.brand,
    device_type_id: deviceTypeMap.get(item.device_type),
    is_active: true
  })).filter(record => record.device_type_id);
  
  const { data: created, error } = await supabase
    .from('brands')
    .insert(brandRecords)
    .select();
  
  if (error) throw error;
  
  enhancedLog(`Created ${created.length} brand-device combinations`, 'success');
  
  // Group by device type for reporting
  const brandsByDeviceType = {};
  created.forEach(brand => {
    const deviceType = Object.entries(deviceTypeMap).find(([_, id]) => id === brand.device_type_id)?.[0];
    if (!brandsByDeviceType[deviceType]) brandsByDeviceType[deviceType] = [];
    brandsByDeviceType[deviceType].push(brand.display_name);
  });
  
  Object.entries(brandsByDeviceType).forEach(([deviceType, brands]) => {
    enhancedLog(`  ${deviceType}: ${brands.length} brands (${brands.join(', ')})`, 'data');
  });
  
  const brandMap = new Map();
  created.forEach(brand => {
    const key = `${brand.name.toLowerCase()}-${brand.device_type_id}`;
    brandMap.set(key, brand.id);
  });
  
  return brandMap;
}

async function createEnhancedServices(data, deviceTypeMap) {
  enhancedLog('Creating enhanced services with device compatibility...', 'step');
  
  const servicesByDevice = new Map();
  
  data.forEach(item => {
    if (item.service_type && item.service_type !== 'unknown' && 
        item.device_type && item.device_type !== 'unknown') {
      const key = `${item.service_type}-${item.device_type}`;
      if (!servicesByDevice.has(key)) {
        servicesByDevice.set(key, {
          service: item.service_type,
          device_type: item.device_type
        });
      }
    }
  });
  
  const serviceRecords = Array.from(servicesByDevice.values()).map(item => {
    const serviceConfig = ENHANCED_SERVICE_MAPPINGS[item.service];
    if (!serviceConfig) return null;
    
    return {
      name: serviceConfig.name,
      display_name: serviceConfig.display_name,
      device_type_id: deviceTypeMap.get(item.device_type),
      is_doorstep_eligible: serviceConfig.is_doorstep_eligible,
      is_active: true
    };
  }).filter(record => record && record.device_type_id);
  
  const { data: created, error } = await supabase
    .from('services')
    .insert(serviceRecords)
    .select();
  
  if (error) throw error;
  
  enhancedLog(`Created ${created.length} service-device combinations`, 'success');
  
  // Group by device type for reporting
  const servicesByDeviceType = {};
  created.forEach(service => {
    const deviceType = Object.entries(deviceTypeMap).find(([_, id]) => id === service.device_type_id)?.[0];
    if (!servicesByDeviceType[deviceType]) servicesByDeviceType[deviceType] = [];
    servicesByDeviceType[deviceType].push(service.display_name);
  });
  
  Object.entries(servicesByDeviceType).forEach(([deviceType, services]) => {
    enhancedLog(`  ${deviceType}: ${services.length} services`, 'data');
  });
  
  const serviceMap = new Map();
  created.forEach(service => {
    const key = `${service.name}-${service.device_type_id}`;
    serviceMap.set(key, service.id);
  });
  
  return serviceMap;
}

async function createEnhancedDeviceModels(data, brandMap, deviceTypeMap) {
  enhancedLog('Creating enhanced device models with Samsung Galaxy normalization...', 'step');
  
  const modelsByBrand = new Map();
  let samsungGalaxyModels = 0;
  
  data.forEach(item => {
    if (!item.model_name || item.model_name === 'unknown' ||
        !item.brand || item.brand === 'unknown' ||
        !item.device_type || item.device_type === 'unknown') {
      return;
    }
    
    const brandKey = `${item.brand.toLowerCase()}-${deviceTypeMap.get(item.device_type)}`;
    const brandId = brandMap.get(brandKey);
    if (!brandId) return;
    
    const modelKey = `${item.model_name}-${brandId}`;
    
    if (!modelsByBrand.has(modelKey)) {
      modelsByBrand.set(modelKey, {
        model_name: item.model_name,
        brand_id: brandId,
        brand: item.brand,
        device_type: item.device_type,
        count: 0,
        enhanced: !!item.enhanced_metadata?.improvements_made
      });
    }
    
    modelsByBrand.get(modelKey).count++;
    
    // Track Samsung Galaxy models
    if (item.brand === 'samsung' && item.model_name.startsWith('Galaxy')) {
      samsungGalaxyModels++;
    }
  });
  
  const modelRecords = Array.from(modelsByBrand.values()).map(item => ({
    name: item.model_name,
    display_name: item.model_name,
    brand_id: item.brand_id,
    is_featured: item.count > 10,
    is_active: true
  }));
  
  enhancedLog(`Processing ${modelRecords.length} unique device models...`, 'progress');
  enhancedLog(`Samsung Galaxy models: ${samsungGalaxyModels}`, 'data');
  
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
    enhancedLog(`Created models batch ${i + 1}-${Math.min(i + batchSize, modelRecords.length)}/${modelRecords.length}`, 'progress');
  }
  
  enhancedLog(`Created ${created.length} device models`, 'success');
  
  // Group by brand for reporting
  const modelsByBrandName = {};
  Array.from(modelsByBrand.values()).forEach(model => {
    if (!modelsByBrandName[model.brand]) modelsByBrandName[model.brand] = 0;
    modelsByBrandName[model.brand]++;
  });
  
  const topBrands = Object.entries(modelsByBrandName)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  enhancedLog('Top brands by model count:', 'data');
  topBrands.forEach(([brand, count]) => {
    enhancedLog(`  ${brand}: ${count} models`, 'data');
  });
  
  const modelMap = new Map();
  created.forEach(model => {
    const key = `${model.name}-${model.brand_id}`;
    modelMap.set(key, model.id);
  });
  
  return modelMap;
}

async function createEnhancedPricingTiers() {
  enhancedLog('Creating enhanced pricing tiers...', 'step');
  
  const tierRecords = Object.values(ENHANCED_PRICING_TIERS);
  
  const { data: created, error } = await supabase
    .from('pricing_tiers')
    .insert(tierRecords)
    .select();
  
  if (error) throw error;
  
  enhancedLog(`Created ${created.length} pricing tiers:`, 'success');
  created.forEach(tier => {
    enhancedLog(`  ${tier.display_name}: ${tier.price_multiplier}x multiplier`, 'data');
  });
  
  const tierMap = new Map();
  created.forEach(tier => tierMap.set(tier.name, tier.id));
  return tierMap;
}

async function createEnhancedDynamicPricing(data, modelMap, serviceMap, tierMap, deviceTypeMap, brandMap) {
  enhancedLog('Creating enhanced dynamic pricing entries...', 'step');
  
  const pricingRecords = [];
  const processedCombinations = new Set();
  let enhancedProductsUsed = 0;
  
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
    
    // Track enhanced products usage
    if (item.enhanced_metadata?.improvements_made) {
      enhancedProductsUsed++;
    }
    
    Object.keys(ENHANCED_PRICING_TIERS).forEach(tierName => {
      const tierId = tierMap.get(tierName);
      if (!tierId) return;
      
      const combination = `${modelId}-${serviceId}-${tierId}`;
      if (processedCombinations.has(combination)) return;
      
      processedCombinations.add(combination);
      
      const tierConfig = ENHANCED_PRICING_TIERS[tierName];
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
  
  enhancedLog(`Generated ${pricingRecords.length} pricing entries from ${enhancedProductsUsed} enhanced products`, 'progress');
  
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
      enhancedLog(`Error in pricing batch ${i}: ${error.message}`, 'warning');
      continue;
    }
    
    created += batchCreated.length;
    enhancedLog(`Created pricing batch ${i + 1}-${Math.min(i + batchSize, pricingRecords.length)}/${pricingRecords.length}`, 'progress');
  }
  
  enhancedLog(`Created ${created} dynamic pricing entries`, 'success');
  return { created, enhancedUsed: enhancedProductsUsed };
}

async function rebuildEnhancedDatabase() {
  const startTime = Date.now();
  
  displaySection('Enhanced Database Rebuild v2.0');
  
  try {
    // Load enhanced cleaned data
    enhancedLog('Loading enhanced AI-cleaned MobileActive data...', 'step');
    const inputPath = path.join(__dirname, 'mobileactive/tmp/mobileactive-enhanced-cleaned.json');
    
    if (!fs.existsSync(inputPath)) {
      enhancedLog('Enhanced cleaned data not found. Please run ai-data-cleaner-enhanced.js first', 'error');
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    enhancedLog(`Loaded ${data.length} products from enhanced dataset`, 'success');
    
    // Analyze enhanced data quality
    const validData = data.filter(item => item.is_valid);
    const enhancedProducts = data.filter(item => item.enhanced_metadata?.improvements_made);
    const samsungGalaxyProducts = data.filter(item => item.brand === 'samsung' && item.model_name?.startsWith('Galaxy'));
    const multiDeviceProducts = data.filter(item => item.additional_models?.length > 0);
    const unknownModels = data.filter(item => item.model_name === 'unknown');
    
    displaySection('Enhanced Data Quality Analysis');
    enhancedLog(`Total products: ${data.length}`, 'data');
    enhancedLog(`Valid products: ${validData.length} (${(validData.length/data.length*100).toFixed(1)}%)`, 'data');
    enhancedLog(`Enhanced improvements: ${enhancedProducts.length} (${(enhancedProducts.length/data.length*100).toFixed(1)}%)`, 'data');
    enhancedLog(`Samsung Galaxy products: ${samsungGalaxyProducts.length}`, 'data');
    enhancedLog(`Multi-device products: ${multiDeviceProducts.length}`, 'data');
    enhancedLog(`Unknown models remaining: ${unknownModels.length} (${(unknownModels.length/data.length*100).toFixed(1)}%)`, 'data');
    
    // Clear and rebuild database
    displaySection('Database Reconstruction');
    await clearEnhancedDatabase();
    
    const deviceTypeMap = await createEnhancedDeviceTypes(validData);
    const brandMap = await createEnhancedBrands(validData, deviceTypeMap);
    const serviceMap = await createEnhancedServices(validData, deviceTypeMap);
    const modelMap = await createEnhancedDeviceModels(validData, brandMap, deviceTypeMap);
    const tierMap = await createEnhancedPricingTiers();
    
    const pricingResult = await createEnhancedDynamicPricing(
      validData, modelMap, serviceMap, tierMap, deviceTypeMap, brandMap
    );
    
    // Calculate execution time
    const endTime = Date.now();
    const executionTime = Math.round((endTime - startTime) / 1000);
    
    // Final comprehensive report
    displaySection('Enhanced Rebuild Complete!');
    enhancedLog(`Total execution time: ${executionTime} seconds`, 'success');
    enhancedLog('', 'info');
    
    enhancedLog('📊 DATABASE ENTITIES CREATED:', 'success');
    enhancedLog(`   Device Types: ${deviceTypeMap.size}`, 'success');
    enhancedLog(`   Brands: ${brandMap.size}`, 'success');
    enhancedLog(`   Services: ${serviceMap.size}`, 'success');
    enhancedLog(`   Device Models: ${modelMap.size}`, 'success');
    enhancedLog(`   Pricing Tiers: ${tierMap.size}`, 'success');
    enhancedLog(`   Pricing Entries: ${pricingResult.created}`, 'success');
    enhancedLog('', 'info');
    
    enhancedLog('🚀 ENHANCED DATA IMPACT:', 'success');
    enhancedLog(`   Source Products: ${data.length}`, 'success');
    enhancedLog(`   Valid Products: ${validData.length}`, 'success');
    enhancedLog(`   Enhanced Products Used: ${pricingResult.enhancedUsed}`, 'success');
    enhancedLog(`   Samsung Galaxy Models: ${samsungGalaxyProducts.length}`, 'success');
    enhancedLog(`   Multi-Device Products: ${multiDeviceProducts.length}`, 'success');
    
    // Save enhanced rebuild statistics
    const enhancedStats = {
      rebuildVersion: '2.0 Enhanced',
      executionTime: executionTime,
      database: {
        deviceTypes: deviceTypeMap.size,
        brands: brandMap.size,
        services: serviceMap.size,
        models: modelMap.size,
        pricingTiers: tierMap.size,
        pricingEntries: pricingResult.created
      },
      sourceData: {
        totalProducts: data.length,
        validProducts: validData.length,
        enhancedProducts: enhancedProducts.length,
        enhancedUsed: pricingResult.enhancedUsed,
        samsungGalaxyProducts: samsungGalaxyProducts.length,
        multiDeviceProducts: multiDeviceProducts.length,
        unknownModelsRemaining: unknownModels.length
      },
      qualityMetrics: {
        validProductsPercentage: (validData.length/data.length*100).toFixed(1),
        enhancedProductsPercentage: (enhancedProducts.length/data.length*100).toFixed(1),
        unknownModelsPercentage: (unknownModels.length/data.length*100).toFixed(1),
        samsungNormalizationSuccess: (samsungGalaxyProducts.length/data.filter(item => item.brand === 'samsung').length*100).toFixed(1)
      },
      rebuildDate: new Date().toISOString()
    };
    
    const statsPath = path.join(__dirname, 'mobileactive/tmp/enhanced-rebuild-stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(enhancedStats, null, 2));
    enhancedLog(`Enhanced rebuild statistics saved to: ${statsPath}`, 'data');
    
    enhancedLog('🎉 Enhanced database rebuild completed successfully!', 'success');
    enhancedLog('🚀 The Travelling Technicians system is ready with enhanced Samsung normalization!', 'success');
    
  } catch (error) {
    enhancedLog(`Enhanced database rebuild failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  rebuildEnhancedDatabase();
}

module.exports = { 
  rebuildEnhancedDatabase,
  enhancedLog,
  displaySection
};