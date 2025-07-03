// MobileActive Data Extraction Script (CommonJS)

const axios = require('axios');
const fs = require('fs/promises');
const YAML = require('yaml');
const pLimit = require('p-limit').default;
const path = require('path');

// Configuration
const CONFIG_PATH = path.join(process.cwd(), 'collections-updated.yaml');
const OUTPUT_DIR = path.join(process.cwd(), 'tmp');
const RAW_DATA_PATH = path.join(OUTPUT_DIR, 'mobileactive-raw.json');
const PROCESSED_DATA_PATH = path.join(OUTPUT_DIR, 'mobileactive-processed.json');
const CSV_OUTPUT_PATH = path.join(OUTPUT_DIR, 'mobileactive-parts.csv');

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
  const url = `https://mobileactive.ca/collections/${handle}/products.json?limit=250&page=${page}`;
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

async function extractMobileActiveData() {
  log('🚀 Starting MobileActive data extraction...');
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

function printSummary(products) {
  log('\n📊 EXTRACTION SUMMARY');
  log('=====================');
  const brandStats = products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {});
  log(`Total Products: ${products.length}`);
  log(`Brands Found: ${Object.keys(brandStats).length}`);
  Object.entries(brandStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([brand, count]) => {
      log(`  ${brand}: ${count} products`);
    });
  const serviceStats = products.reduce((acc, product) => {
    acc[product.service_type] = (acc[product.service_type] || 0) + 1;
    return acc;
  }, {});
  log(`\nService Types:`);
  Object.entries(serviceStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([service, count]) => {
      log(`  ${service}: ${count} products`);
    });
  const prices = products.map(p => p.part_price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  log(`\nPrice Ranges:`);
  log(`  Min: $${minPrice} CAD`);
  log(`  Max: $${maxPrice} CAD`);
  log(`  Average: $${avgPrice} CAD`);
}

if (require.main === module) {
  extractMobileActiveData().catch(console.error);
} 