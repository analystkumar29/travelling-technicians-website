// MobileSentrix Data Extraction Script (CommonJS)

const axios = require('axios');
const fs = require('fs/promises');
const YAML = require('yaml');
const pLimit = require('p-limit').default;
const path = require('path');

// Configuration
const CONFIG_PATH = path.join(process.cwd(), 'mobilesentrix-collections.yaml');
const OUTPUT_DIR = path.join(process.cwd(), 'tmp');
const RAW_DATA_PATH = path.join(OUTPUT_DIR, 'mobilesentrix-raw.json');
const PROCESSED_DATA_PATH = path.join(OUTPUT_DIR, 'mobilesentrix-processed.json');
const CSV_OUTPUT_PATH = path.join(OUTPUT_DIR, 'mobilesentrix-parts.csv');

const limit = pLimit(3); // 3 concurrent requests
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

async function fetchCollectionPage(handle, page = 1, attempt = 1) {
  const url = `https://mobilesentrix.ca/collections/${handle}/products.json?limit=250&page=${page}`;
  const maxAttempts = 5;
  const baseDelay = 2000; // 2 seconds
  
  try {
    log(`Fetching ${handle} page ${page} (attempt ${attempt})...`);
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TravellingTechnicians/1.0)'
      }
    });
    return data.products || [];
  } catch (error) {
    if (error.response?.status === 404) {
      log(`Collection ${handle} not found (404)`, 'warning');
      return [];
    }
    if (error.response?.status === 429 && attempt < maxAttempts) {
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      log(`Rate limited (429) for ${handle} page ${page}, retrying in ${Math.round(delay/1000)}s...`, 'warning');
      await sleep(delay);
      return fetchCollectionPage(handle, page, attempt + 1);
    }
    if (attempt < maxAttempts) {
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      log(`Error fetching ${handle} page ${page} (attempt ${attempt}): ${error.message}. Retrying in ${Math.round(delay/1000)}s...`, 'warning');
      await sleep(delay);
      return fetchCollectionPage(handle, page, attempt + 1);
    }
    log(`Error fetching ${handle} page ${page} after ${maxAttempts} attempts: ${error.message}`, 'error');
    return [];
  }
}

async function fetchAllProducts(handle) {
  let allProducts = [];
  let page = 1;
  
  while (true) {
    const products = await fetchCollectionPage(handle, page);
    if (products.length === 0) break;
    allProducts.push(...products);
    log(`  Collected ${products.length} products from page ${page}`);
    if (products.length < 250) break;
    page++;
    await sleep(DELAY_BETWEEN_REQUESTS);
  }
  
  return allProducts;
}

async function extractMobileSentrixData() {
  log('🚀 Starting MobileSentrix data extraction...');
  
  try {
    log('📋 Loading configuration...');
    const configFile = await fs.readFile(CONFIG_PATH, 'utf8');
    const config = YAML.parse(configFile);
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    log(`📦 Extracting from ${config.collections.length} collections...`);
    const allProducts = [];
    
    await Promise.all(
      config.collections.map((collection) =>
        limit(async () => {
          try {
            const products = await fetchAllProducts(collection.handle);
            products.forEach(product => {
              product.__meta = {
                brand: collection.brand,
                device_type: collection.device_type,
                category: collection.category
              };
            });
            allProducts.push(...products);
            log(`✅ ${collection.handle}: ${products.length} products`, 'success');
          } catch (error) {
            log(`❌ Failed to fetch ${collection.handle}: ${error.message}`, 'error');
          }
        })
      )
    );
    
    log(`💾 Saving ${allProducts.length} products to raw data file...`);
    await fs.writeFile(RAW_DATA_PATH, JSON.stringify(allProducts, null, 2));
    
    log('🔍 Processing and categorizing products...');
    const processedProducts = processProducts(allProducts, config);
    await fs.writeFile(PROCESSED_DATA_PATH, JSON.stringify(processedProducts, null, 2));
    await generateCSV(processedProducts, CSV_OUTPUT_PATH);
    printSummary(processedProducts);
    
    log('🎉 Data extraction completed successfully!', 'success');
    log(`📁 Raw data: ${RAW_DATA_PATH}`);
    log(`📁 Processed data: ${PROCESSED_DATA_PATH}`);
    log(`📁 CSV summary: ${CSV_OUTPUT_PATH}`);
    
  } catch (error) {
    log(`❌ Extraction failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

function processProducts(products, config) {
  const processed = [];
  
  for (const product of products) {
    const serviceType = identifyServiceType(product.title, config.services);
    if (!serviceType) continue;
    
    const modelInfo = extractModelInfo(product.title, product.__meta);
    const availableVariant = product.variants.find(v => v.available);
    if (!availableVariant) continue;
    
    const partPrice = parseFloat(availableVariant.price);
    if (isNaN(partPrice) || partPrice <= 0) continue;
    
    const servicePrices = calculateServicePrices(partPrice, config.pricing);
    
    processed.push({
      product_id: product.id,
      product_title: product.title,
      product_handle: product.handle,
      brand: product.__meta.brand,
      device_type: product.__meta.device_type,
      category: product.__meta.category,
      service_type: serviceType,
      model_name: modelInfo.modelName,
      model_variant: modelInfo.modelVariant,
      part_price: partPrice,
      service_prices: servicePrices,
      sku: availableVariant.sku,
      image_url: product.images[0]?.src || null,
      tags: product.tags || [],
      created_at: product.created_at,
      updated_at: product.updated_at
    });
  }
  
  return processed;
}

function identifyServiceType(title, services) {
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

function extractModelInfo(title, meta) {
  let modelName = title
    .replace(/^(LCD Assembly|Screen Assembly|Display Assembly)\s+(for|with)\s+/i, '')
    .replace(/^(Battery|Charging Port|Speaker|Camera|Microphone)\s+(for|replacement)\s+/i, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .trim();
  
  const variantMatch = modelName.match(/\b(Pro|Max|Plus|Mini|Ultra|SE|Lite)\b/i);
  const modelVariant = variantMatch ? variantMatch[1] : null;
  
  modelName = modelName
    .replace(/\b(Pro|Max|Plus|Mini|Ultra|SE|Lite)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return {
    modelName,
    modelVariant
  };
}

function calculateServicePrices(partPrice, pricing) {
  const baseServicePrice = partPrice + pricing.labour_markup;
  return {
    economy: Math.round(baseServicePrice * pricing.tier_multipliers.economy),
    standard: Math.round(baseServicePrice * pricing.tier_multipliers.standard),
    premium: Math.round(baseServicePrice * pricing.tier_multipliers.premium),
    express: Math.round(baseServicePrice * pricing.tier_multipliers.express)
  };
}

async function generateCSV(products, outputPath) {
  const headers = [
    'product_id', 'product_title', 'brand', 'device_type', 'service_type',
    'model_name', 'model_variant', 'part_price', 'sku', 'image_url'
  ];
  
  const csvRows = [headers.join(',')];
  
  products.forEach(product => {
    const row = headers.map(header => {
      const value = product[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    });
    csvRows.push(row.join(','));
  });
  
  await fs.writeFile(outputPath, csvRows.join('\n'));
}

function printSummary(products) {
  log('');
  log('📊 EXTRACTION SUMMARY');
  log('=====================');
  log(`Total Products: ${products.length}`);
  
  const brands = {};
  const services = {};
  const deviceTypes = {};
  let totalPrice = 0;
  let minPrice = Infinity;
  let maxPrice = 0;
  
  products.forEach(product => {
    brands[product.brand] = (brands[product.brand] || 0) + 1;
    services[product.service_type] = (services[product.service_type] || 0) + 1;
    deviceTypes[product.device_type] = (deviceTypes[product.device_type] || 0) + 1;
    
    totalPrice += product.part_price;
    minPrice = Math.min(minPrice, product.part_price);
    maxPrice = Math.max(maxPrice, product.part_price);
  });
  
  log(`Brands Found: ${Object.keys(brands).length}`);
  Object.entries(brands).forEach(([brand, count]) => {
    log(`  ${brand}: ${count} products`);
  });
  
  log('');
  log('Service Types:');
  Object.entries(services).forEach(([service, count]) => {
    log(`  ${service}: ${count} products`);
  });
  
  log('');
  log('Price Ranges:');
  log(`  Min: $${minPrice.toFixed(2)} CAD`);
  log(`  Max: $${maxPrice.toFixed(2)} CAD`);
  log(`  Average: $${(totalPrice / products.length).toFixed(2)} CAD`);
}

// Run the extraction
extractMobileSentrixData(); 