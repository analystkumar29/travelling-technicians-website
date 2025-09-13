// Comprehensive Multi-Brand Scraper for MobileActive.ca
// Extracts all available brands from the product catalog

const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const YAML = require('yaml');

// Configuration
const OUTPUT_DIR = path.join(process.cwd(), 'tmp');
const RAW_DATA_PATH = path.join(OUTPUT_DIR, 'mobileactive-all-brands-raw.json');
const PROCESSED_DATA_PATH = path.join(OUTPUT_DIR, 'mobileactive-all-brands-processed.json');
const CSV_OUTPUT_PATH = path.join(OUTPUT_DIR, 'mobileactive-all-brands.csv');
const BRAND_REPORT_PATH = path.join(OUTPUT_DIR, 'brand-coverage-report.json');

const limit = require('p-limit').default(3); // 3 concurrent requests
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

// Target brands configuration
const TARGET_BRANDS = {
  apple: {
    name: 'Apple',
    patterns: [/iphone/i, /ipad/i, /macbook/i, /apple/i],
    priority: 1
  },
  samsung: {
    name: 'Samsung',
    patterns: [/galaxy/i, /samsung/i, /note/i, /s[0-9]/i, /a[0-9]/i],
    priority: 1
  },
  motorola: {
    name: 'Motorola',
    patterns: [/motorola/i, /moto/i],
    priority: 2
  },
  lg: {
    name: 'LG',
    patterns: [/lg/i, /g[0-9]/i, /v[0-9]/i],
    priority: 2
  },
  huawei: {
    name: 'Huawei',
    patterns: [/huawei/i, /p[0-9]/i, /mate/i],
    priority: 2
  },
  google: {
    name: 'Google',
    patterns: [/google/i, /pixel/i],
    priority: 2
  },
  microsoft: {
    name: 'Microsoft',
    patterns: [/microsoft/i, /surface/i],
    priority: 3
  },
  xiaomi: {
    name: 'Xiaomi',
    patterns: [/xiaomi/i, /mi[0-9]/i, /redmi/i],
    priority: 3
  },
  oppo: {
    name: 'Oppo',
    patterns: [/oppo/i, /find/i, /reno/i],
    priority: 3
  },
  oneplus: {
    name: 'OnePlus',
    patterns: [/oneplus/i, /one plus/i],
    priority: 3
  },
  asus: {
    name: 'Asus',
    patterns: [/asus/i, /zenfone/i],
    priority: 3
  },
  sony: {
    name: 'Sony',
    patterns: [/sony/i, /xperia/i],
    priority: 3
  }
};

// Service type patterns
const SERVICE_PATTERNS = {
  screen_replacement: {
    keywords: ['screen', 'lcd', 'oled', 'display'],
    priority: 1
  },
  battery_replacement: {
    keywords: ['battery'],
    priority: 1
  },
  charging_port: {
    keywords: ['charging', 'port', 'usb'],
    priority: 2
  },
  camera: {
    keywords: ['camera', 'lens'],
    priority: 2
  },
  speaker: {
    keywords: ['speaker', 'audio'],
    priority: 3
  },
  sim_tray: {
    keywords: ['sim', 'tray'],
    priority: 3
  }
};

async function fetchProductsPage(page = 1, attempt = 1) {
  const url = `https://mobileactive.ca/products.json?limit=250&page=${page}`;
  const maxAttempts = 5;
  const baseDelay = 2000; // 2 seconds
  
  try {
    log(`Fetching products page ${page} (attempt ${attempt})...`);
    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TravellingTechnicians/1.0)'
      }
    });
    return data.products || [];
  } catch (error) {
    if (error.response?.status === 404) {
      log(`Page ${page} not found (404)`, 'warning');
      return [];
    }
    if (error.response?.status === 429 && attempt < maxAttempts) {
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      log(`Rate limited (429) for page ${page}, retrying in ${Math.round(delay/1000)}s...`, 'warning');
      await sleep(delay);
      return fetchProductsPage(page, attempt + 1);
    }
    if (attempt < maxAttempts) {
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      log(`Error fetching page ${page} (attempt ${attempt}): ${error.message}. Retrying in ${Math.round(delay/1000)}s...`, 'warning');
      await sleep(delay);
      return fetchProductsPage(page, attempt + 1);
    }
    log(`Error fetching page ${page} after ${maxAttempts} attempts: ${error.message}`, 'error');
    return [];
  }
}

function detectBrand(title) {
  const lowerTitle = title.toLowerCase();
  
  for (const [brandKey, brandInfo] of Object.entries(TARGET_BRANDS)) {
    for (const pattern of brandInfo.patterns) {
      if (pattern.test(lowerTitle)) {
        return {
          brand: brandKey,
          brandName: brandInfo.name,
          confidence: 'high',
          priority: brandInfo.priority
        };
      }
    }
  }
  
  return {
    brand: 'other',
    brandName: 'Other',
    confidence: 'low',
    priority: 4
  };
}

function detectServiceType(title) {
  const lowerTitle = title.toLowerCase();
  
  for (const [serviceKey, serviceInfo] of Object.entries(SERVICE_PATTERNS)) {
    for (const keyword of serviceInfo.keywords) {
      if (lowerTitle.includes(keyword)) {
        return {
          service: serviceKey,
          confidence: 'high',
          priority: serviceInfo.priority
        };
      }
    }
  }
  
  return {
    service: 'unknown',
    confidence: 'low',
    priority: 5
  };
}

function detectDeviceType(title, brand) {
  const lowerTitle = title.toLowerCase();
  
  // Device type patterns
  if (brand === 'microsoft' || lowerTitle.includes('surface')) {
    return 'laptop';
  }
  
  if (lowerTitle.includes('ipad')) {
    return 'tablet';
  }
  
  if (lowerTitle.includes('macbook')) {
    return 'laptop';
  }
  
  // Default to mobile for phones
  return 'mobile';
}

function extractModelInfo(title, detectedBrand) {
  let modelName = title
    .replace(/^(LCD Assembly|Screen Assembly|Display Assembly|OLED Assembly)\s+(for|with)\s+/i, '')
    .replace(/^(Battery|Charging Port|Speaker|Camera|Microphone|Sim Card Tray|Back Camera)\s+(for|replacement)\s+/i, '')
    .replace(/^(Replacement Battery|Sim Tray|Dual Sim Card Tray)\s+(for)\s+/i, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/(Premium|Aftermarket|Refurbished|Service Pack|Grade A|Used OEM Pull)/gi, '')
    .trim();
  
  // Brand-specific model extraction patterns
  const modelPatterns = {
    apple: /(iphone|ipad|macbook)\s*([0-9]+(?:\s*(?:pro|max|plus|mini|ultra|se))?)/i,
    samsung: /(galaxy\s*)?(s|note|a|z|fold|flip)\s*([0-9]+(?:\s*(?:fe|ultra|plus|lite))?)/i,
    motorola: /(moto\s*)?(g|e|x|edge)\s*([0-9]+(?:\s*(?:plus|play|power))?)/i,
    google: /(pixel)\s*([0-9]+(?:\s*(?:pro|xl|a))?)/i,
    microsoft: /(surface)\s*(pro|go|book|laptop)\s*([0-9]+)?/i,
    lg: /(lg|g|v)\s*([0-9]+)/i,
    huawei: /(p|mate)\s*([0-9]+)/i,
    xiaomi: /(mi|redmi)\s*([0-9]+)/i,
    oppo: /(find|reno)\s*([0-9]+)/i,
    oneplus: /(oneplus|one plus)\s*([0-9]+)/i,
    asus: /(zenfone)\s*([0-9]+)/i,
    sony: /(xperia)\s*([0-9]+)/i
  };
  
  const pattern = modelPatterns[detectedBrand.brand];
  if (pattern) {
    const match = modelName.match(pattern);
    if (match) {
      return {
        modelName: match[0].trim(),
        modelVariant: null,
        confidence: 'high'
      };
    }
  }
  
  // Generic model extraction
  const variantMatch = modelName.match(/\b(Pro|Max|Plus|Mini|Ultra|SE|Lite|XL|FE)\b/i);
  const modelVariant = variantMatch ? variantMatch[1] : null;
  
  return {
    modelName: modelName.replace(/\b(Pro|Max|Plus|Mini|Ultra|SE|Lite|XL|FE)\b/gi, '').trim(),
    modelVariant,
    confidence: 'medium'
  };
}

function calculateServicePrices(partPrice) {
  // Default pricing structure (can be customized)
  const baseServicePrice = partPrice + 50; // $50 labor markup
  return {
    economy: Math.round(baseServicePrice * 1.0),
    standard: Math.round(baseServicePrice * 1.2),
    premium: Math.round(baseServicePrice * 1.4),
    express: Math.round(baseServicePrice * 1.6)
  };
}

async function scrapeAllBrands() {
  log('🚀 Starting comprehensive brand scraping for MobileActive.ca...');
  
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    const allProducts = [];
    const brandStats = {};
    const filteredProducts = [];
    
    // Initialize brand stats
    for (const brandKey of Object.keys(TARGET_BRANDS)) {
      brandStats[brandKey] = {
        count: 0,
        products: [],
        models: new Set(),
        categories: new Set()
      };
    }
    
    let page = 1;
    let totalProducts = 0;
    let processedProducts = 0;
    
    while (true) {
      const products = await fetchProductsPage(page);
      if (products.length === 0) {
        log(`No more products found at page ${page}`, 'info');
        break;
      }
      
      log(`Processing ${products.length} products from page ${page}...`);
      
      for (const product of products) {
        totalProducts++;
        
        // Detect brand
        const brandInfo = detectBrand(product.title);
        
        // Skip if not a target brand
        if (brandInfo.brand === 'other') {
          continue;
        }
        
        // Skip tools, accessories, and non-device items
        const lowerTitle = product.title.toLowerCase();
        if (lowerTitle.includes('tool') || 
            lowerTitle.includes('protectionpro') || 
            lowerTitle.includes('game console') ||
            lowerTitle.includes('cable') ||
            lowerTitle.includes('charger') ||
            lowerTitle.includes('case') ||
            lowerTitle.includes('tempered glass') ||
            lowerTitle.includes('screen protector')) {
          continue;
        }
        
        // Detect service type
        const serviceInfo = detectServiceType(product.title);
        
        // Extract model info
        const modelInfo = extractModelInfo(product.title, brandInfo);
        
        // Get available variant and price
        const availableVariant = product.variants.find(v => v.available);
        if (!availableVariant) {
          continue; // Skip products without available variants
        }
        
        const partPrice = parseFloat(availableVariant.price);
        if (isNaN(partPrice) || partPrice <= 0) {
          continue; // Skip products without valid pricing
        }
        
        // Store product with metadata
        const productWithMeta = {
          ...product,
          __meta: {
            detectedBrand: brandInfo,
            serviceInfo,
            modelInfo,
            confidence: brandInfo.confidence
          }
        };
        
        allProducts.push(productWithMeta);
        
        // Update brand stats
        const brandKey = brandInfo.brand;
        if (!brandStats[brandKey]) {
          brandStats[brandKey] = { count: 0, products: [], models: new Set(), categories: new Set() };
        }
        
        brandStats[brandKey].count++;
        brandStats[brandKey].products.push(productWithMeta);
        brandStats[brandKey].models.add(modelInfo.modelName);
        brandStats[brandKey].categories.add(serviceInfo.service);
        
        // Create processed product entry
        const processedProduct = {
          product_id: product.id,
          product_title: product.title,
          product_handle: product.handle,
          brand: brandInfo.brand,
          brand_name: brandInfo.name,
          device_type: detectDeviceType(product.title, brandInfo.brand),
          category: serviceInfo.service,
          service_type: serviceInfo.service,
          model_name: modelInfo.modelName,
          model_variant: modelInfo.modelVariant,
          part_price: partPrice,
          service_prices: calculateServicePrices(partPrice),
          sku: availableVariant.sku,
          image_url: product.images[0]?.src || null,
          created_at: product.created_at,
          updated_at: product.updated_at,
          confidence: brandInfo.confidence,
          priority: brandInfo.priority
        };
        
        filteredProducts.push(processedProduct);
        processedProducts++;
      }
      
      log(`✅ Page ${page}: ${products.length} products processed (Total: ${totalProducts}, Filtered: ${processedProducts})`, 'success');
      
      if (products.length < 250) {
        log('Reached last page', 'info');
        break;
      }
      
      page++;
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
    
    // Generate brand coverage report
    const brandReport = {
      timestamp: new Date().toISOString(),
      totalProducts,
      processedProducts,
      brandCoverage: {},
      summary: {
        totalBrands: 0,
        confirmedBrands: [],
        missingBrands: []
      }
    };
    
    // Process brand stats
    for (const [brandKey, stats] of Object.entries(brandStats)) {
      if (stats.count > 0) {
        brandReport.brandCoverage[brandKey] = {
          brandName: TARGET_BRANDS[brandKey]?.name || brandKey,
          productCount: stats.count,
          uniqueModels: Array.from(stats.models).length,
          categories: Array.from(stats.categories),
          sampleProducts: stats.products.slice(0, 5).map(p => ({
            title: p.title,
            model: p.__meta.modelInfo.modelName,
            category: p.__meta.serviceInfo.service
          }))
        };
        
        brandReport.summary.totalBrands++;
        
        if (TARGET_BRANDS[brandKey]) {
          brandReport.summary.confirmedBrands.push(brandKey);
        }
      }
    }
    
    // Identify missing brands
    for (const targetBrand of Object.keys(TARGET_BRANDS)) {
      if (!brandReport.summary.confirmedBrands.includes(targetBrand)) {
        brandReport.summary.missingBrands.push(targetBrand);
      }
    }
    
    // Save results
    log('💾 Saving scraping results...');
    await fs.writeFile(RAW_DATA_PATH, JSON.stringify(allProducts, null, 2));
    await fs.writeFile(PROCESSED_DATA_PATH, JSON.stringify(filteredProducts, null, 2));
    await fs.writeFile(BRAND_REPORT_PATH, JSON.stringify(brandReport, null, 2));
    
    // Generate CSV
    await generateCSV(filteredProducts, CSV_OUTPUT_PATH);
    
    // Print summary
    printScrapingSummary(brandReport);
    
    log('🎉 Comprehensive brand scraping completed successfully!', 'success');
    log(`📁 Raw data: ${RAW_DATA_PATH}`);
    log(`📁 Processed data: ${PROCESSED_DATA_PATH}`);
    log(`📁 Brand report: ${BRAND_REPORT_PATH}`);
    log(`📁 CSV summary: ${CSV_OUTPUT_PATH}`);
    
    return {
      allProducts,
      filteredProducts,
      brandReport
    };
    
  } catch (error) {
    log(`❌ Comprehensive scraping failed: ${error.message}`, 'error');
    throw error;
  }
}

async function generateCSV(products, outputPath) {
  const csvHeader = [
    'product_id',
    'product_title',
    'brand',
    'brand_name',
    'device_type',
    'category',
    'service_type',
    'model_name',
    'model_variant',
    'part_price',
    'service_prices_economy',
    'service_prices_standard',
    'service_prices_premium',
    'service_prices_express',
    'sku',
    'image_url',
    'confidence',
    'priority'
  ].join(',');
  
  const csvRows = products.map(product => [
    product.product_id,
    `"${product.product_title.replace(/"/g, '""')}"`,
    product.brand,
    product.brand_name,
    product.device_type,
    product.category,
    product.service_type,
    `"${product.model_name.replace(/"/g, '""')}"`,
    product.model_variant || '',
    product.part_price,
    product.service_prices.economy,
    product.service_prices.standard,
    product.service_prices.premium,
    product.service_prices.express,
    product.sku || '',
    product.image_url || '',
    product.confidence,
    product.priority
  ].join(','));
  
  const csvContent = [csvHeader, ...csvRows].join('\n');
  await fs.writeFile(outputPath, csvContent);
  log(`📊 CSV generated with ${products.length} products`, 'success');
}

function printScrapingSummary(report) {
  console.log('\n📊 COMPREHENSIVE SCRAPING SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Products Scanned: ${report.totalProducts}`);
  console.log(`Products Processed: ${report.processedProducts}`);
  console.log(`Total Brands Found: ${report.summary.totalBrands}`);
  
  console.log('\n🎯 BRAND COVERAGE:');
  console.log('-' .repeat(40));
  
  const sortedBrands = Object.entries(report.brandCoverage)
    .sort(([,a], [,b]) => b.productCount - a.productCount);
  
  for (const [brandKey, coverage] of sortedBrands) {
    const status = report.summary.confirmedBrands.includes(brandKey) ? '✅' : '❌';
    console.log(`${status} ${coverage.brandName}: ${coverage.productCount} products (${coverage.uniqueModels} models)`);
  }
  
  if (report.summary.missingBrands.length > 0) {
    console.log('\n❌ MISSING BRANDS:');
    console.log('-' .repeat(20));
    for (const missingBrand of report.summary.missingBrands) {
      console.log(`- ${missingBrand}`);
    }
  }
  
  console.log('\n📈 TOP 5 BRANDS BY PRODUCT COUNT:');
  console.log('-' .repeat(40));
  
  for (const [brandKey, coverage] of sortedBrands.slice(0, 5)) {
    console.log(`${coverage.brandName}: ${coverage.productCount} products`);
  }
}

// Run the scraper
if (require.main === module) {
  scrapeAllBrands()
    .then(() => {
      log('Comprehensive brand scraping completed!', 'success');
      process.exit(0);
    })
    .catch((error) => {
      log(`Comprehensive brand scraping failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { scrapeAllBrands, detectBrand, detectServiceType, extractModelInfo }; 