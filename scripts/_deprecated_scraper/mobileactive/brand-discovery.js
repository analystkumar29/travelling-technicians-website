// Brand Discovery Script for MobileActive.ca
// Scans entire product catalog to identify available brands

const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(process.cwd(), 'tmp');
const BRAND_REPORT_PATH = path.join(OUTPUT_DIR, 'brand-coverage-report.json');
const ALL_PRODUCTS_PATH = path.join(OUTPUT_DIR, 'mobileactive-all-products.json');

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

// Target brands to look for
const TARGET_BRANDS = {
  apple: ['iphone', 'ipad', 'macbook', 'apple'],
  samsung: ['galaxy', 'samsung', 'note', 's[0-9]', 'a[0-9]'],
  motorola: ['motorola', 'moto'],
  lg: ['lg', 'g[0-9]', 'v[0-9]'],
  huawei: ['huawei', 'p[0-9]', 'mate'],
  google: ['google', 'pixel'],
  microsoft: ['microsoft', 'surface'],
  xiaomi: ['xiaomi', 'mi[0-9]', 'redmi'],
  oppo: ['oppo', 'find', 'reno'],
  oneplus: ['oneplus', 'one plus'],
  asus: ['asus', 'zenfone'],
  sony: ['sony', 'xperia'],
  blackberry: ['blackberry', 'black berry']
};

// Brand detection patterns
const BRAND_PATTERNS = {
  apple: {
    patterns: [/iphone/i, /ipad/i, /macbook/i, /apple/i],
    name: 'Apple'
  },
  samsung: {
    patterns: [/galaxy/i, /samsung/i, /note/i, /s[0-9]/i, /a[0-9]/i],
    name: 'Samsung'
  },
  motorola: {
    patterns: [/motorola/i, /moto/i],
    name: 'Motorola'
  },
  lg: {
    patterns: [/lg/i, /g[0-9]/i, /v[0-9]/i],
    name: 'LG'
  },
  huawei: {
    patterns: [/huawei/i, /p[0-9]/i, /mate/i],
    name: 'Huawei'
  },
  google: {
    patterns: [/google/i, /pixel/i],
    name: 'Google'
  },
  microsoft: {
    patterns: [/microsoft/i, /surface/i],
    name: 'Microsoft'
  },
  xiaomi: {
    patterns: [/xiaomi/i, /mi[0-9]/i, /redmi/i],
    name: 'Xiaomi'
  },
  oppo: {
    patterns: [/oppo/i, /find/i, /reno/i],
    name: 'Oppo'
  },
  oneplus: {
    patterns: [/oneplus/i, /one plus/i],
    name: 'OnePlus'
  },
  asus: {
    patterns: [/asus/i, /zenfone/i],
    name: 'Asus'
  },
  sony: {
    patterns: [/sony/i, /xperia/i],
    name: 'Sony'
  },
  blackberry: {
    patterns: [/blackberry/i, /black berry/i],
    name: 'BlackBerry'
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
  
  for (const [brandKey, brandInfo] of Object.entries(BRAND_PATTERNS)) {
    for (const pattern of brandInfo.patterns) {
      if (pattern.test(lowerTitle)) {
        return {
          brand: brandKey,
          brandName: brandInfo.name,
          confidence: 'high'
        };
      }
    }
  }
  
  // Check for generic patterns
  if (lowerTitle.includes('screen') || lowerTitle.includes('lcd') || lowerTitle.includes('battery')) {
    return {
      brand: 'unknown',
      brandName: 'Unknown',
      confidence: 'low'
    };
  }
  
  return {
    brand: 'other',
    brandName: 'Other',
    confidence: 'medium'
  };
}

function extractModelInfo(title, detectedBrand) {
  let modelName = title
    .replace(/^(LCD Assembly|Screen Assembly|Display Assembly|OLED Assembly)\s+(for|with)\s+/i, '')
    .replace(/^(Battery|Charging Port|Speaker|Camera|Microphone|Sim Card Tray|Back Camera)\s+(for|replacement)\s+/i, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .trim();
  
  // Extract common model patterns
  const modelPatterns = {
    apple: /(iphone|ipad|macbook)\s*([0-9]+(?:\s*(?:pro|max|plus|mini|ultra|se))?)/i,
    samsung: /(galaxy\s*)?(s|note|a|z|fold|flip)\s*([0-9]+(?:\s*(?:fe|ultra|plus|lite))?)/i,
    motorola: /(moto\s*)?(g|e|x|edge)\s*([0-9]+(?:\s*(?:plus|play|power))?)/i,
    google: /(pixel)\s*([0-9]+(?:\s*(?:pro|xl|a))?)/i,
    microsoft: /(surface)\s*(pro|go|book|laptop)\s*([0-9]+)?/i
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

async function discoverBrands() {
  log('🚀 Starting brand discovery for MobileActive.ca...');
  
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    const allProducts = [];
    const brandStats = {};
    const unknownProducts = [];
    
    // Initialize brand stats
    for (const brandKey of Object.keys(BRAND_PATTERNS)) {
      brandStats[brandKey] = {
        count: 0,
        products: [],
        models: new Set(),
        categories: new Set()
      };
    }
    brandStats.unknown = { count: 0, products: [], models: new Set(), categories: new Set() };
    brandStats.other = { count: 0, products: [], models: new Set(), categories: new Set() };
    
    let page = 1;
    let totalProducts = 0;
    
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
        
        // Extract model info
        const modelInfo = extractModelInfo(product.title, brandInfo);
        
        // Determine category
        const lowerTitle = product.title.toLowerCase();
        let category = 'unknown';
        if (lowerTitle.includes('screen') || lowerTitle.includes('lcd') || lowerTitle.includes('oled')) {
          category = 'screen_replacement';
        } else if (lowerTitle.includes('battery')) {
          category = 'battery_replacement';
        } else if (lowerTitle.includes('charging') || lowerTitle.includes('port')) {
          category = 'charging_port';
        } else if (lowerTitle.includes('camera')) {
          category = 'camera';
        } else if (lowerTitle.includes('speaker')) {
          category = 'speaker';
        } else if (lowerTitle.includes('sim') || lowerTitle.includes('tray')) {
          category = 'sim_tray';
        }
        
        // Store product with metadata
        const productWithMeta = {
          ...product,
          __meta: {
            detectedBrand: brandInfo,
            modelInfo,
            category,
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
        brandStats[brandKey].categories.add(category);
        
        // Track unknown products for analysis
        if (brandInfo.confidence === 'low') {
          unknownProducts.push(productWithMeta);
        }
      }
      
      log(`✅ Page ${page}: ${products.length} products processed (Total: ${totalProducts})`, 'success');
      
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
      brandCoverage: {},
      summary: {
        totalBrands: 0,
        confirmedBrands: [],
        missingBrands: [],
        unknownProducts: unknownProducts.length
      }
    };
    
    // Process brand stats
    for (const [brandKey, stats] of Object.entries(brandStats)) {
      if (stats.count > 0) {
        brandReport.brandCoverage[brandKey] = {
          brandName: BRAND_PATTERNS[brandKey]?.name || brandKey,
          productCount: stats.count,
          uniqueModels: Array.from(stats.models).length,
          categories: Array.from(stats.categories),
          sampleProducts: stats.products.slice(0, 5).map(p => ({
            title: p.title,
            model: p.__meta.modelInfo.modelName,
            category: p.__meta.category
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
    log('💾 Saving brand discovery results...');
    await fs.writeFile(BRAND_REPORT_PATH, JSON.stringify(brandReport, null, 2));
    await fs.writeFile(ALL_PRODUCTS_PATH, JSON.stringify(allProducts, null, 2));
    
    // Print summary
    printBrandSummary(brandReport);
    
    log('🎉 Brand discovery completed successfully!', 'success');
    log(`📁 Brand report: ${BRAND_REPORT_PATH}`);
    log(`📁 All products: ${ALL_PRODUCTS_PATH}`);
    
    return brandReport;
    
  } catch (error) {
    log(`❌ Brand discovery failed: ${error.message}`, 'error');
    throw error;
  }
}

function printBrandSummary(report) {
  console.log('\n📊 BRAND DISCOVERY SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total Products: ${report.totalProducts}`);
  console.log(`Total Brands Found: ${report.summary.totalBrands}`);
  console.log(`Unknown Products: ${report.summary.unknownProducts}`);
  
  console.log('\n🎯 TARGET BRANDS STATUS:');
  console.log('-' .repeat(30));
  
  for (const [brandKey, coverage] of Object.entries(report.brandCoverage)) {
    const status = report.summary.confirmedBrands.includes(brandKey) ? '✅' : '❌';
    console.log(`${status} ${coverage.brandName}: ${coverage.productCount} products`);
  }
  
  if (report.summary.missingBrands.length > 0) {
    console.log('\n❌ MISSING BRANDS:');
    console.log('-' .repeat(20));
    for (const missingBrand of report.summary.missingBrands) {
      console.log(`- ${missingBrand}`);
    }
  }
  
  console.log('\n📈 TOP BRANDS BY PRODUCT COUNT:');
  console.log('-' .repeat(35));
  
  const sortedBrands = Object.entries(report.brandCoverage)
    .sort(([,a], [,b]) => b.productCount - a.productCount)
    .slice(0, 10);
  
  for (const [brandKey, coverage] of sortedBrands) {
    console.log(`${coverage.brandName}: ${coverage.productCount} products`);
  }
}

// Run the discovery
if (require.main === module) {
  discoverBrands()
    .then(() => {
      log('Brand discovery completed!', 'success');
      process.exit(0);
    })
    .catch((error) => {
      log(`Brand discovery failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { discoverBrands, detectBrand, extractModelInfo }; 