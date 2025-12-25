// MobileActive Data Cleaning and Validation Script (CommonJS)

const fs = require('fs/promises');
const path = require('path');

// Configuration
const RAW_DATA_PATH = path.join(process.cwd(), 'tmp/mobileactive-raw.json');
const CLEANED_DATA_PATH = path.join(process.cwd(), 'tmp/mobileactive-cleaned.json');
const VALIDATION_REPORT_PATH = path.join(process.cwd(), 'tmp/validation-report.json');

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

// Brand detection patterns
const BRAND_PATTERNS = {
  apple: {
    keywords: ['iphone', 'ipad', 'macbook', 'apple'],
    models: ['iphone', 'ipad', 'macbook', 'airpods', 'apple watch'],
    exclude: ['samsung', 'galaxy', 'huawei', 'oneplus', 'pixel', 'xiaomi']
  },
  samsung: {
    keywords: ['samsung', 'galaxy', 'sgs', 'note', 's series'],
    models: ['galaxy s', 'galaxy note', 'galaxy a', 'galaxy z', 'sgs'],
    exclude: ['iphone', 'ipad', 'macbook', 'apple']
  },
  huawei: {
    keywords: ['huawei', 'p series', 'mate series'],
    models: ['huawei p', 'huawei mate', 'honor'],
    exclude: ['iphone', 'galaxy', 'samsung']
  },
  oneplus: {
    keywords: ['oneplus', 'one plus'],
    models: ['oneplus'],
    exclude: ['iphone', 'galaxy', 'samsung']
  },
  google: {
    keywords: ['pixel', 'google'],
    models: ['pixel'],
    exclude: ['iphone', 'galaxy', 'samsung']
  },
  xiaomi: {
    keywords: ['xiaomi', 'mi ', 'redmi'],
    models: ['xiaomi', 'mi ', 'redmi'],
    exclude: ['iphone', 'galaxy', 'samsung']
  },
  asus: {
    keywords: ['asus', 'zenfone'],
    models: ['asus', 'zenfone'],
    exclude: ['iphone', 'galaxy', 'samsung']
  }
};

// Service type detection patterns
const SERVICE_PATTERNS = {
  screen_replacement: {
    keywords: ['screen', 'lcd', 'oled', 'display', 'glass', 'assembly', 'digitizer'],
    exclude: ['battery', 'camera', 'speaker', 'microphone', 'charging']
  },
  battery_replacement: {
    keywords: ['battery', 'batteries'],
    exclude: ['screen', 'camera', 'speaker', 'microphone', 'charging']
  },
  camera_repair: {
    keywords: ['camera', 'lens', 'bc-', 'back camera', 'front camera'],
    exclude: ['screen', 'battery', 'speaker', 'microphone', 'charging']
  },
  charging_port_repair: {
    keywords: ['charging port', 'cp-', 'usb port', 'connector'],
    exclude: ['screen', 'battery', 'camera', 'speaker', 'microphone']
  },
  speaker_repair: {
    keywords: ['speaker', 'loudspeaker', 'buzzer', 'audio'],
    exclude: ['screen', 'battery', 'camera', 'microphone', 'charging']
  },
  microphone_repair: {
    keywords: ['microphone', 'mic', 'voice'],
    exclude: ['screen', 'battery', 'camera', 'speaker', 'charging']
  }
};

// Device type detection patterns
const DEVICE_PATTERNS = {
  mobile: {
    keywords: ['iphone', 'galaxy', 'pixel', 'oneplus', 'huawei', 'xiaomi', 'phone'],
    exclude: ['ipad', 'macbook', 'laptop', 'tablet']
  },
  tablet: {
    keywords: ['ipad', 'tablet', 'tab'],
    exclude: ['iphone', 'galaxy s', 'pixel', 'phone']
  },
  laptop: {
    keywords: ['macbook', 'laptop', 'surface'],
    exclude: ['iphone', 'ipad', 'phone', 'tablet']
  }
};

// Pricing validation rules
const PRICING_RULES = {
  min_price: 0.01,
  max_price: 2000,
  suspicious_low: 1.00,  // Prices below $1 are suspicious
  suspicious_high: 1000, // Prices above $1000 need verification
  screen_replacement: { min: 20, max: 800 },
  battery_replacement: { min: 5, max: 200 },
  camera_repair: { min: 2, max: 150 },
  charging_port_repair: { min: 3, max: 100 },
  speaker_repair: { min: 2, max: 80 },
  microphone_repair: { min: 1, max: 50 }
};

function detectBrand(product) {
  const title = (product.title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  const vendor = (product.vendor || '').toLowerCase();
  
  for (const [brand, pattern] of Object.entries(BRAND_PATTERNS)) {
    // Check if any exclusion keywords are present
    const hasExclusion = pattern.exclude.some(exclude => 
      title.includes(exclude) || tags.some(tag => tag.includes(exclude))
    );
    
    if (hasExclusion) continue;
    
    // Check if brand keywords are present
    const hasKeywords = pattern.keywords.some(keyword => 
      title.includes(keyword) || tags.some(tag => tag.includes(keyword))
    );
    
    if (hasKeywords) return brand;
  }
  
  return 'unknown';
}

function detectServiceType(product) {
  const title = (product.title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  
  for (const [service, pattern] of Object.entries(SERVICE_PATTERNS)) {
    // Check if any exclusion keywords are present
    const hasExclusion = pattern.exclude.some(exclude => 
      title.includes(exclude) || tags.some(tag => tag.includes(exclude))
    );
    
    if (hasExclusion) continue;
    
    // Check if service keywords are present
    const hasKeywords = pattern.keywords.some(keyword => 
      title.includes(keyword) || tags.some(tag => tag.includes(keyword))
    );
    
    if (hasKeywords) return service;
  }
  
  return 'unknown';
}

function detectDeviceType(product) {
  const title = (product.title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  
  for (const [deviceType, pattern] of Object.entries(DEVICE_PATTERNS)) {
    // Check if any exclusion keywords are present
    const hasExclusion = pattern.exclude.some(exclude => 
      title.includes(exclude) || tags.some(tag => tag.includes(exclude))
    );
    
    if (hasExclusion) continue;
    
    // Check if device keywords are present
    const hasKeywords = pattern.keywords.some(keyword => 
      title.includes(keyword) || tags.some(tag => tag.includes(keyword))
    );
    
    if (hasKeywords) return deviceType;
  }
  
  return 'unknown';
}

function extractModelName(product) {
  const title = product.title || '';
  
  // Common model extraction patterns
  const patterns = [
    // iPhone patterns
    /iphone\s+(\d+(?:\s+pro\s+max?|\s+pro|\s+plus|\s+mini)?)/i,
    /iphone\s+(\d+[a-z]?)/i,
    
    // Samsung patterns
    /galaxy\s+(s\d+(?:\s+fe|\s+plus|\s+ultra)?)/i,
    /galaxy\s+(note\s+\d+)/i,
    /galaxy\s+(a\d+)/i,
    /galaxy\s+(z\s+flip\s+\d+)/i,
    /galaxy\s+(z\s+fold\s+\d+)/i,
    /sgs\s+(s\d+)/i,
    
    // Other patterns
    /pixel\s+(\d+(?:\s+a|\s+pro|\s+xl)?)/i,
    /oneplus\s+(\d+(?:\s+pro|\s+t)?)/i,
    /huawei\s+(p\d+)/i,
    /huawei\s+(mate\s+\d+)/i,
    /xiaomi\s+(mi\s+\d+)/i,
    /redmi\s+(\d+)/i,
    
    // MacBook patterns
    /macbook\s+(air|pro)/i,
    
    // iPad patterns
    /ipad\s+(air|pro|mini)?\s*(\d+)?/i
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return 'unknown';
}

function validatePrice(price, serviceType) {
  const numPrice = parseFloat(price);
  
  if (isNaN(numPrice)) {
    return { valid: false, reason: 'Invalid price format' };
  }
  
  if (numPrice < PRICING_RULES.min_price) {
    return { valid: false, reason: 'Price too low' };
  }
  
  if (numPrice > PRICING_RULES.max_price) {
    return { valid: false, reason: 'Price too high' };
  }
  
  if (numPrice < PRICING_RULES.suspicious_low) {
    return { valid: true, reason: 'Suspiciously low price', warning: true };
  }
  
  if (numPrice > PRICING_RULES.suspicious_high) {
    return { valid: true, reason: 'Suspiciously high price', warning: true };
  }
  
  // Service-specific validation
  if (serviceType && PRICING_RULES[serviceType]) {
    const serviceRules = PRICING_RULES[serviceType];
    if (numPrice < serviceRules.min) {
      return { valid: false, reason: `Price below minimum for ${serviceType}` };
    }
    if (numPrice > serviceRules.max) {
      return { valid: false, reason: `Price above maximum for ${serviceType}` };
    }
  }
  
  return { valid: true, reason: 'Valid price' };
}

function cleanProductData(product) {
  const cleaned = {
    product_id: product.id,
    product_title: product.title?.trim(),
    product_handle: product.handle,
    sku: product.variants?.[0]?.sku,
    part_price: parseFloat(product.variants?.[0]?.price || 0),
    image_url: product.images?.[0]?.src,
    created_at: product.created_at,
    updated_at: product.updated_at,
    vendor: product.vendor,
    tags: product.tags || [],
    
    // Detected fields
    brand: detectBrand(product),
    device_type: detectDeviceType(product),
    service_type: detectServiceType(product),
    model_name: extractModelName(product),
    
    // Validation fields
    price_validation: null,
    is_valid: false,
    validation_issues: []
  };
  
  // Validate price
  const priceValidation = validatePrice(cleaned.part_price, cleaned.service_type);
  cleaned.price_validation = priceValidation;
  
  // Determine if product is valid
  const issues = [];
  
  if (!cleaned.product_title) {
    issues.push('Missing product title');
  }
  
  if (!priceValidation.valid) {
    issues.push(`Price validation failed: ${priceValidation.reason}`);
  }
  
  if (cleaned.brand === 'unknown') {
    issues.push('Could not detect brand');
  }
  
  if (cleaned.service_type === 'unknown') {
    issues.push('Could not detect service type');
  }
  
  if (cleaned.device_type === 'unknown') {
    issues.push('Could not detect device type');
  }
  
  if (cleaned.model_name === 'unknown') {
    issues.push('Could not extract model name');
  }
  
  if (priceValidation.warning) {
    issues.push(`Price warning: ${priceValidation.reason}`);
  }
  
  cleaned.validation_issues = issues;
  cleaned.is_valid = issues.length === 0 || (issues.length === 1 && issues[0].includes('Price warning'));
  
  return cleaned;
}

async function cleanAndValidateData() {
  try {
    log('🔍 Loading raw data...');
    const rawData = JSON.parse(await fs.readFile(RAW_DATA_PATH, 'utf8'));
    log(`📊 Loaded ${rawData.length} raw products`);
    
    log('🧹 Cleaning and validating products...');
    const cleanedProducts = rawData.map(cleanProductData);
    
    // Separate valid and invalid products
    const validProducts = cleanedProducts.filter(p => p.is_valid);
    const invalidProducts = cleanedProducts.filter(p => !p.is_valid);
    
    // Generate statistics
    const stats = {
      total_products: rawData.length,
      valid_products: validProducts.length,
      invalid_products: invalidProducts.length,
      validation_rate: ((validProducts.length / rawData.length) * 100).toFixed(2) + '%',
      
      brands: {},
      device_types: {},
      service_types: {},
      price_ranges: {
        min: Math.min(...validProducts.map(p => p.part_price)),
        max: Math.max(...validProducts.map(p => p.part_price)),
        avg: (validProducts.reduce((sum, p) => sum + p.part_price, 0) / validProducts.length).toFixed(2)
      },
      
      validation_issues: {}
    };
    
    // Count brands, device types, service types
    validProducts.forEach(product => {
      stats.brands[product.brand] = (stats.brands[product.brand] || 0) + 1;
      stats.device_types[product.device_type] = (stats.device_types[product.device_type] || 0) + 1;
      stats.service_types[product.service_type] = (stats.service_types[product.service_type] || 0) + 1;
    });
    
    // Count validation issues
    cleanedProducts.forEach(product => {
      product.validation_issues.forEach(issue => {
        stats.validation_issues[issue] = (stats.validation_issues[issue] || 0) + 1;
      });
    });
    
    // Save cleaned data
    log('💾 Saving cleaned data...');
    await fs.writeFile(CLEANED_DATA_PATH, JSON.stringify(validProducts, null, 2));
    
    // Save validation report
    const validationReport = {
      timestamp: new Date().toISOString(),
      statistics: stats,
      invalid_products_sample: invalidProducts.slice(0, 10), // First 10 invalid products
      validation_issues_summary: stats.validation_issues
    };
    
    await fs.writeFile(VALIDATION_REPORT_PATH, JSON.stringify(validationReport, null, 2));
    
    // Display summary
    log('📊 CLEANING AND VALIDATION SUMMARY', 'success');
    log('=====================================');
    log(`Total Products: ${stats.total_products}`);
    log(`Valid Products: ${stats.valid_products} (${stats.validation_rate})`);
    log(`Invalid Products: ${stats.invalid_products}`);
    log('');
    log('Brands Found:');
    Object.entries(stats.brands).forEach(([brand, count]) => {
      log(`  ${brand}: ${count} products`);
    });
    log('');
    log('Device Types:');
    Object.entries(stats.device_types).forEach(([type, count]) => {
      log(`  ${type}: ${count} products`);
    });
    log('');
    log('Service Types:');
    Object.entries(stats.service_types).forEach(([service, count]) => {
      log(`  ${service}: ${count} products`);
    });
    log('');
    log('Price Range:');
    log(`  Min: $${stats.price_ranges.min}`);
    log(`  Max: $${stats.price_ranges.max}`);
    log(`  Avg: $${stats.price_ranges.avg}`);
    log('');
    log('Top Validation Issues:');
    Object.entries(stats.validation_issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([issue, count]) => {
        log(`  ${issue}: ${count} products`);
      });
    
    log('✅ Data cleaning and validation completed!', 'success');
    log(`📁 Cleaned data: ${CLEANED_DATA_PATH}`);
    log(`📁 Validation report: ${VALIDATION_REPORT_PATH}`);
    
    return {
      validProducts,
      invalidProducts,
      stats
    };
    
  } catch (error) {
    log(`❌ Error during data cleaning: ${error.message}`, 'error');
    throw error;
  }
}

// Run the cleaning process
if (require.main === module) {
  cleanAndValidateData()
    .then(() => {
      log('🎉 Data cleaning process completed successfully!', 'success');
      process.exit(0);
    })
    .catch((error) => {
      log(`💥 Data cleaning process failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { cleanAndValidateData, detectBrand, detectServiceType, detectDeviceType, validatePrice }; 