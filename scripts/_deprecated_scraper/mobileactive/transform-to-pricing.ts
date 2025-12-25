#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import Fuse from 'fuse.js';

// Types
interface ProcessedProduct {
  product_id: number;
  product_title: string;
  brand: string;
  device_type: string;
  service_type: string;
  model_name: string;
  model_variant: string | null;
  part_price: number;
  service_prices: {
    economy: number;
    standard: number;
    premium: number;
    express: number;
  };
  sku: string;
}

interface DatabaseModel {
  id: number;
  name: string;
  display_name: string;
  brand_id: number;
}

interface DatabaseBrand {
  id: number;
  name: string;
  display_name: string;
  device_type_id: number;
}

interface DatabaseService {
  id: number;
  name: string;
  display_name: string;
  device_type_id: number;
}

interface DatabasePricingTier {
  id: number;
  name: string;
  display_name: string;
}

interface PricingEntry {
  service_id: number;
  model_id: number;
  pricing_tier_id: number;
  base_price: number;
  cost_price: number;
  existing_id?: number;
}

// Configuration
const PROCESSED_DATA_PATH = path.join(process.cwd(), 'tmp/mobileactive-processed.json');
const MAPPING_LOG_PATH = path.join(process.cwd(), 'tmp/mobileactive-mapping-log.json');
const FAILED_MAPPINGS_PATH = path.join(process.cwd(), 'tmp/mobileactive-failed-mappings.json');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Utility functions
const log = (message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[level];
  console.log(`${timestamp} ${emoji} ${message}`);
};

// Load database reference data
async function loadDatabaseData() {
  log('📋 Loading database reference data...');
  
  // Load device types
  const { data: deviceTypes, error: deviceTypesError } = await supabase
    .from('device_types')
    .select('*')
    .eq('is_active', true);
  
  if (deviceTypesError) throw new Error(`Failed to load device types: ${deviceTypesError.message}`);
  
  // Load brands
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true);
  
  if (brandsError) throw new Error(`Failed to load brands: ${brandsError.message}`);
  
  // Load models
  const { data: models, error: modelsError } = await supabase
    .from('device_models')
    .select('*')
    .eq('is_active', true);
  
  if (modelsError) throw new Error(`Failed to load models: ${modelsError.message}`);
  
  // Load services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true);
  
  if (servicesError) throw new Error(`Failed to load services: ${servicesError.message}`);
  
  // Load pricing tiers
  const { data: pricingTiers, error: pricingTiersError } = await supabase
    .from('pricing_tiers')
    .select('*')
    .eq('is_active', true);
  
  if (pricingTiersError) throw new Error(`Failed to load pricing tiers: ${pricingTiersError.message}`);
  
  // Load existing pricing entries
  const { data: existingPricing, error: existingPricingError } = await supabase
    .from('dynamic_pricing')
    .select('*')
    .eq('is_active', true);
  
  if (existingPricingError) throw new Error(`Failed to load existing pricing: ${existingPricingError.message}`);
  
  log(`✅ Loaded ${deviceTypes?.length || 0} device types, ${brands?.length || 0} brands, ${models?.length || 0} models, ${services?.length || 0} services, ${pricingTiers?.length || 0} pricing tiers`);
  
  return {
    deviceTypes: deviceTypes || [],
    brands: brands || [],
    models: models || [],
    services: services || [],
    pricingTiers: pricingTiers || [],
    existingPricing: existingPricing || []
  };
}

// Create fuzzy search for model matching
function createModelMatcher(models: DatabaseModel[]) {
  return new Fuse(models, {
    keys: ['name', 'display_name'],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 3
  });
}

// Normalize model name for matching
function normalizeModelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Find matching model in database
function findMatchingModel(modelName: string, modelVariant: string | null, models: DatabaseModel[], brands: DatabaseBrand[], targetBrandId: number): DatabaseModel | null {
  // Create full model name with variant
  const fullModelName = modelVariant ? `${modelName} ${modelVariant}` : modelName;
  const normalizedFullName = normalizeModelName(fullModelName);
  const normalizedName = normalizeModelName(modelName);
  
  // First, try exact match with full name
  let exactMatch = models.find(model => 
    model.brand_id === targetBrandId && 
    normalizeModelName(model.name) === normalizedFullName
  );
  
  if (exactMatch) return exactMatch;
  
  // Try exact match with base name
  exactMatch = models.find(model => 
    model.brand_id === targetBrandId && 
    normalizeModelName(model.name) === normalizedName
  );
  
  if (exactMatch) return exactMatch;
  
  // Use fuzzy search
  const matcher = createModelMatcher(models.filter(m => m.brand_id === targetBrandId));
  const results = matcher.search(normalizedFullName);
  
  if (results.length > 0 && results[0].score! < 0.4) {
    return results[0].item;
  }
  
  // Try fuzzy search with base name
  const baseResults = matcher.search(normalizedName);
  if (baseResults.length > 0 && baseResults[0].score! < 0.4) {
    return baseResults[0].item;
  }
  
  return null;
}

// Find matching service in database
function findMatchingService(serviceType: string, deviceType: string, services: DatabaseService[], deviceTypes: any[]): DatabaseService | null {
  const deviceTypeId = deviceTypes.find(dt => dt.name === deviceType)?.id;
  if (!deviceTypeId) return null;
  
  // Try exact match first
  let service = services.find(s => 
    s.device_type_id === deviceTypeId && 
    s.name === serviceType
  );
  
  if (service) return service;
  
  // Try partial match
  service = services.find(s => 
    s.device_type_id === deviceTypeId && 
    s.name.includes(serviceType.replace('_', ' '))
  );
  
  return service || null;
}

// Transform products to pricing entries
async function transformToPricingEntries(products: ProcessedProduct[], dbData: any) {
  log('🔄 Transforming products to pricing entries...');
  
  const pricingEntries: PricingEntry[] = [];
  const mappingLog: any[] = [];
  const failedMappings: any[] = [];
  
  for (const product of products) {
    try {
      // Find device type
      const deviceType = dbData.deviceTypes.find((dt: any) => dt.name === product.device_type);
      if (!deviceType) {
        failedMappings.push({
          product,
          reason: 'Device type not found',
          device_type: product.device_type
        });
        continue;
      }
      
      // Find brand
      const brand = dbData.brands.find((b: any) => 
        b.device_type_id === deviceType.id && 
        b.name.toLowerCase() === product.brand.toLowerCase()
      );
      if (!brand) {
        failedMappings.push({
          product,
          reason: 'Brand not found',
          brand: product.brand,
          device_type_id: deviceType.id
        });
        continue;
      }
      
      // Find model
      const model = findMatchingModel(
        product.model_name, 
        product.model_variant, 
        dbData.models, 
        dbData.brands, 
        brand.id
      );
      if (!model) {
        failedMappings.push({
          product,
          reason: 'Model not found',
          model_name: product.model_name,
          model_variant: product.model_variant,
          brand_id: brand.id
        });
        continue;
      }
      
      // Find service
      const service = findMatchingService(
        product.service_type, 
        product.device_type, 
        dbData.services, 
        dbData.deviceTypes
      );
      if (!service) {
        failedMappings.push({
          product,
          reason: 'Service not found',
          service_type: product.service_type,
          device_type: product.device_type
        });
        continue;
      }
      
      // Create pricing entries for each tier
      const tierMapping = {
        economy: 1,
        standard: 2,
        premium: 3,
        express: 4
      };
      
      for (const [tierName, tierId] of Object.entries(tierMapping)) {
        const basePrice = product.service_prices[tierName as keyof typeof product.service_prices];
        
        // Check if pricing entry already exists
        const existingEntry = dbData.existingPricing.find((p: any) => 
          p.service_id === service.id && 
          p.model_id === model.id && 
          p.pricing_tier_id === tierId
        );
        
        const pricingEntry: PricingEntry = {
          service_id: service.id,
          model_id: model.id,
          pricing_tier_id: tierId,
          base_price: basePrice,
          cost_price: product.part_price
        };
        
        if (existingEntry) {
          pricingEntry.existing_id = existingEntry.id;
        }
        
        pricingEntries.push(pricingEntry);
      }
      
      // Log successful mapping
      mappingLog.push({
        product_title: product.product_title,
        brand: brand.display_name,
        model: model.display_name,
        service: service.display_name,
        part_price: product.part_price,
        service_prices: product.service_prices,
        mapped: true
      });
      
    } catch (error: any) {
      failedMappings.push({
        product,
        reason: 'Processing error',
        error: error.message
      });
    }
  }
  
  log(`✅ Transformed ${pricingEntries.length} pricing entries`);
  log(`📊 Mapping results: ${mappingLog.length} successful, ${failedMappings.length} failed`);
  
  // Save mapping logs
  await fs.writeFile(MAPPING_LOG_PATH, JSON.stringify(mappingLog, null, 2));
  await fs.writeFile(FAILED_MAPPINGS_PATH, JSON.stringify(failedMappings, null, 2));
  
  return pricingEntries;
}

// Upload pricing entries to database
async function uploadPricingEntries(pricingEntries: PricingEntry[]) {
  log('📤 Uploading pricing entries to database...');
  
  const CHUNK_SIZE = 100;
  let uploaded = 0;
  let errors = 0;
  
  for (let i = 0; i < pricingEntries.length; i += CHUNK_SIZE) {
    const chunk = pricingEntries.slice(i, i + CHUNK_SIZE);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/management/dynamic-pricing-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': process.env.ADMIN_TOKEN || 'admin-token'
        },
        body: JSON.stringify({ entries: chunk })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        log(`❌ Failed to upload chunk ${Math.floor(i / CHUNK_SIZE) + 1}: ${errorText}`, 'error');
        errors += chunk.length;
        continue;
      }
      
      const result = await response.json();
      uploaded += result.succeeded || 0;
      errors += result.failed || 0;
      
      log(`✅ Uploaded chunk ${Math.floor(i / CHUNK_SIZE) + 1}: ${result.succeeded || 0} succeeded, ${result.failed || 0} failed`);
      
    } catch (error: any) {
      log(`❌ Error uploading chunk ${Math.floor(i / CHUNK_SIZE) + 1}: ${error.message}`, 'error');
      errors += chunk.length;
    }
    
    // Small delay between chunks
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  log(`📊 Upload complete: ${uploaded} succeeded, ${errors} failed`, uploaded > 0 ? 'success' : 'error');
  
  return { uploaded, errors };
}

// Main transformation function
async function transformMobileActiveData() {
  log('🚀 Starting MobileActive data transformation...');
  
  try {
    // Load processed data
    log('📂 Loading processed data...');
    const processedData = JSON.parse(await fs.readFile(PROCESSED_DATA_PATH, 'utf8'));
    log(`✅ Loaded ${processedData.length} processed products`);
    
    // Load database reference data
    const dbData = await loadDatabaseData();
    
    // Transform to pricing entries
    const pricingEntries = await transformToPricingEntries(processedData, dbData);
    
    if (pricingEntries.length === 0) {
      log('⚠️ No pricing entries to upload', 'warning');
      return;
    }
    
    // Upload to database
    const uploadResult = await uploadPricingEntries(pricingEntries);
    
    // Print summary
    log('\n📊 TRANSFORMATION SUMMARY');
    log('========================');
    log(`Total Products Processed: ${processedData.length}`);
    log(`Pricing Entries Created: ${pricingEntries.length}`);
    log(`Successfully Uploaded: ${uploadResult.uploaded}`);
    log(`Upload Errors: ${uploadResult.errors}`);
    log(`Mapping Log: ${MAPPING_LOG_PATH}`);
    log(`Failed Mappings: ${FAILED_MAPPINGS_PATH}`);
    
    if (uploadResult.errors > 0) {
      log('⚠️ Some entries failed to upload. Check the logs for details.', 'warning');
    } else {
      log('🎉 All pricing entries uploaded successfully!', 'success');
    }
    
  } catch (error: any) {
    log(`❌ Transformation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the transformation
if (require.main === module) {
  transformMobileActiveData().catch(console.error);
} 