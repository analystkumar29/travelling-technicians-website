#!/usr/bin/env tsx

import axios from 'axios';
import fs from 'fs/promises';
import YAML from 'yaml';
import pLimit from 'p-limit';
import path from 'path';

// Types
interface Product {
  id: number;
  title: string;
  handle: string;
  product_type: string;
  vendor: string;
  tags: string[];
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string;
    available: boolean;
  }>;
  images: Array<{
    id: number;
    src: string;
    alt: string;
  }>;
  created_at: string;
  updated_at: string;
  published_at: string;
  __meta?: {
    brand: string;
    device_type: string;
    category: string;
  };
}

interface Collection {
  handle: string;
  brand: string;
  device_type: string;
  category: string;
}

interface Config {
  collections: Collection[];
  services: Array<{
    name: string;
    keywords: string[];
    priority: number;
  }>;
  pricing: {
    labour_markup: number;
    tier_multipliers: Record<string, number>;
  };
}

// Configuration
const CONFIG_PATH = path.join(process.cwd(), 'scripts/mobileactive/collections.yaml');
const OUTPUT_DIR = path.join(process.cwd(), 'tmp');
const RAW_DATA_PATH = path.join(OUTPUT_DIR, 'mobileactive-raw.json');
const PROCESSED_DATA_PATH = path.join(OUTPUT_DIR, 'mobileactive-processed.json');
const CSV_OUTPUT_PATH = path.join(OUTPUT_DIR, 'mobileactive-parts.csv');

// Rate limiting
const limit = pLimit(3); // 3 concurrent requests
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second

// Utility functions
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

// Fetch collection page
async function fetchCollectionPage(handle: string, page = 1): Promise<Product[]> {
  const url = `https://mobileactive.ca/collections/${handle}.json?limit=250&page=${page}`;
  
  try {
    log(`Fetching ${handle} page ${page}...`);
    const { data } = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TravellingTechnicians/1.0)'
      }
    });
    
    return data.products || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      log(`Collection ${handle} not found (404)`, 'warning');
      return [];
    }
    log(`Error fetching ${handle} page ${page}: ${error.message}`, 'error');
    throw error;
  }
}

// Fetch all products from a collection
async function fetchAllProducts(handle: string): Promise<Product[]> {
  let allProducts: Product[] = [];
  let page = 1;
  
  while (true) {
    const products = await fetchCollectionPage(handle, page);
    
    if (products.length === 0) {
      break; // No more products
    }
    
    allProducts.push(...products);
    log(`  Collected ${products.length} products from page ${page}`);
    
    if (products.length < 250) {
      break; // Last page
    }
    
    page++;
    await sleep(DELAY_BETWEEN_REQUESTS); // Be polite to their server
  }
  
  return allProducts;
}

// Main extraction function
async function extractMobileActiveData() {
  log('🚀 Starting MobileActive data extraction...');
  
  try {
    // Load configuration
    log('📋 Loading configuration...');
    const configFile = await fs.readFile(CONFIG_PATH, 'utf8');
    const config: Config = YAML.parse(configFile);
    
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // Extract products from all collections
    log(`📦 Extracting from ${config.collections.length} collections...`);
    const allProducts: Product[] = [];
    
    await Promise.all(
      config.collections.map((collection) =>
        limit(async () => {
          try {
            const products = await fetchAllProducts(collection.handle);
            
            // Tag products with metadata
            products.forEach(product => {
              product.__meta = {
                brand: collection.brand,
                device_type: collection.device_type,
                category: collection.category
              };
            });
            
            allProducts.push(...products);
            log(`✅ ${collection.handle}: ${products.length} products`, 'success');
            
          } catch (error: any) {
            log(`❌ Failed to fetch ${collection.handle}: ${error.message}`, 'error');
          }
        })
      )
    );
    
    // Save raw data
    log(`💾 Saving ${allProducts.length} products to raw data file...`);
    await fs.writeFile(RAW_DATA_PATH, JSON.stringify(allProducts, null, 2));
    
    // Process and categorize products
    log('🔍 Processing and categorizing products...');
    const processedProducts = processProducts(allProducts, config);
    
    // Save processed data
    await fs.writeFile(PROCESSED_DATA_PATH, JSON.stringify(processedProducts, null, 2));
    
    // Generate CSV for easy viewing
    await generateCSV(processedProducts, CSV_OUTPUT_PATH);
    
    // Print summary
    printSummary(processedProducts);
    
    log('🎉 Data extraction completed successfully!', 'success');
    log(`📁 Raw data: ${RAW_DATA_PATH}`);
    log(`📁 Processed data: ${PROCESSED_DATA_PATH}`);
    log(`📁 CSV summary: ${CSV_OUTPUT_PATH}`);
    
  } catch (error: any) {
    log(`❌ Extraction failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Process and categorize products
function processProducts(products: Product[], config: Config) {
  const processed: any[] = [];
  
  for (const product of products) {
    // Extract service type from product title
    const serviceType = identifyServiceType(product.title, config.services);
    
    if (!serviceType) {
      continue; // Skip products that don't match our service types
    }
    
    // Extract model information
    const modelInfo = extractModelInfo(product.title, product.__meta!);
    
    // Get price from first available variant
    const availableVariant = product.variants.find(v => v.available);
    if (!availableVariant) {
      continue; // Skip products without available variants
    }
    
    const partPrice = parseFloat(availableVariant.price);
    if (isNaN(partPrice) || partPrice <= 0) {
      continue; // Skip products with invalid prices
    }
    
    // Calculate service prices for different tiers
    const servicePrices = calculateServicePrices(partPrice, config.pricing);
    
    processed.push({
      product_id: product.id,
      product_title: product.title,
      product_handle: product.handle,
      brand: product.__meta!.brand,
      device_type: product.__meta!.device_type,
      category: product.__meta!.category,
      service_type: serviceType,
      model_name: modelInfo.modelName,
      model_variant: modelInfo.modelVariant,
      part_price: partPrice,
      service_prices: servicePrices,
      sku: availableVariant.sku,
      image_url: product.images[0]?.src || null,
      created_at: product.created_at,
      updated_at: product.updated_at
    });
  }
  
  return processed;
}

// Identify service type from product title
function identifyServiceType(title: string, services: Config['services']): string | null {
  const lowerTitle = title.toLowerCase();
  
  for (const service of services) {
    for (const keyword of service.keywords) {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        return service.name;
      }
    }
  }
  
  return null;
}

// Extract model information from product title
function extractModelInfo(title: string, meta: any) {
  // Remove common prefixes
  let modelName = title
    .replace(/^(LCD Assembly|Screen Assembly|Display Assembly)\s+(for|with)\s+/i, '')
    .replace(/^(Battery|Charging Port|Speaker|Camera|Microphone)\s+(for|replacement)\s+/i, '')
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\[[^\]]*\]/g, '') // Remove bracket content
    .trim();
  
  // Extract variant information (Pro, Max, Plus, etc.)
  const variantMatch = modelName.match(/\b(Pro|Max|Plus|Mini|Ultra|SE|Lite)\b/i);
  const modelVariant = variantMatch ? variantMatch[1] : null;
  
  // Clean up model name
  modelName = modelName
    .replace(/\b(Pro|Max|Plus|Mini|Ultra|SE|Lite)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return {
    modelName,
    modelVariant
  };
}

// Calculate service prices for different tiers
function calculateServicePrices(partPrice: number, pricing: Config['pricing']) {
  const baseServicePrice = partPrice + pricing.labour_markup;
  
  return {
    economy: Math.round(baseServicePrice * pricing.tier_multipliers.economy),
    standard: Math.round(baseServicePrice * pricing.tier_multipliers.standard),
    premium: Math.round(baseServicePrice * pricing.tier_multipliers.premium),
    express: Math.round(baseServicePrice * pricing.tier_multipliers.express)
  };
}

// Generate CSV file for easy viewing
async function generateCSV(products: any[], outputPath: string) {
  const headers = [
    'Brand',
    'Device Type',
    'Model Name',
    'Model Variant',
    'Service Type',
    'Part Price (CAD)',
    'Economy Price',
    'Standard Price',
    'Premium Price',
    'Express Price',
    'Product Title',
    'SKU'
  ];
  
  const csvRows = [headers.join(',')];
  
  for (const product of products) {
    const row = [
      product.brand,
      product.device_type,
      product.model_name,
      product.model_variant || '',
      product.service_type,
      product.part_price,
      product.service_prices.economy,
      product.service_prices.standard,
      product.service_prices.premium,
      product.service_prices.express,
      `"${product.product_title.replace(/"/g, '""')}"`,
      product.sku || ''
    ];
    
    csvRows.push(row.join(','));
  }
  
  await fs.writeFile(outputPath, csvRows.join('\n'));
}

// Print summary statistics
function printSummary(products: any[]) {
  log('\n📊 EXTRACTION SUMMARY');
  log('=====================');
  
  // Group by brand
  const brandStats = products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  log(`Total Products: ${products.length}`);
  log(`Brands Found: ${Object.keys(brandStats).length}`);
  
  Object.entries(brandStats)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .forEach(([brand, count]) => {
      log(`  ${brand}: ${count} products`);
    });
  
  // Group by service type
  const serviceStats = products.reduce((acc, product) => {
    acc[product.service_type] = (acc[product.service_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  log(`\nService Types:`);
  Object.entries(serviceStats)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .forEach(([service, count]) => {
      log(`  ${service}: ${count} products`);
    });
  
  // Price ranges
  const prices = products.map(p => p.part_price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  
  log(`\nPrice Ranges:`);
  log(`  Min: $${minPrice} CAD`);
  log(`  Max: $${maxPrice} CAD`);
  log(`  Average: $${avgPrice} CAD`);
}

// Run the extraction
if (require.main === module) {
  extractMobileActiveData().catch(console.error);
} 