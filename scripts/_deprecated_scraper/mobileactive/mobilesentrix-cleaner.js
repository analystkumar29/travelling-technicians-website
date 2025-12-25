// MobileSentrix Data Cleaner & Validator
// Cleans and validates extracted MobileSentrix data

const fs = require('fs/promises');
const path = require('path');

// Configuration
const PROCESSED_DATA_PATH = path.join(process.cwd(), 'tmp/mobilesentrix-processed.json');
const CLEANED_DATA_PATH = path.join(process.cwd(), 'tmp/mobilesentrix-cleaned.json');
const VALIDATION_REPORT_PATH = path.join(process.cwd(), 'tmp/mobilesentrix-validation-report.json');

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

// Brand name normalization
const BRAND_MAPPINGS = {
  'apple': 'Apple',
  'samsung': 'Samsung',
  'google': 'Google',
  'huawei': 'Huawei',
  'oneplus': 'OnePlus',
  'xiaomi': 'Xiaomi',
  'oppo': 'Oppo',
  'vivo': 'Vivo',
  'lg': 'LG',
  'motorola': 'Motorola',
  'nokia': 'Nokia',
  'sony': 'Sony',
  'htc': 'HTC',
  'blackberry': 'BlackBerry',
  'asus': 'ASUS',
  'acer': 'Acer',
  'dell': 'Dell',
  'hp': 'HP',
  'lenovo': 'Lenovo',
  'toshiba': 'Toshiba',
  'msi': 'MSI',
  'razer': 'Razer',
  'gigabyte': 'Gigabyte'
};

// Service type normalization
const SERVICE_MAPPINGS = {
  'screen_replacement': 'screen_replacement',
  'battery_replacement': 'battery_replacement',
  'charging_port_repair': 'charging_port_repair',
  'speaker_repair': 'speaker_repair',
  'camera_repair': 'camera_repair',
  'microphone_repair': 'microphone_repair',
  'keyboard_repair': 'keyboard_repair',
  'trackpad_repair': 'trackpad_repair',
  'cooling_repair': 'cooling_repair'
};

// Model name patterns for validation
const MODEL_PATTERNS = {
  apple: [
    /iphone\s*\d+/i,
    /iphone\s*(se|mini|plus|pro|max|ultra)/i,
    /ipad\s*\d+/i,
    /ipad\s*(air|pro|mini)/i,
    /macbook\s*(air|pro)/i,
    /imac/i,
    /mac\s*mini/i,
    /mac\s*pro/i
  ],
  samsung: [
    /galaxy\s*(s|note|a|m|tab|book)\s*\d+/i,
    /galaxy\s*(s|note|a|m|tab|book)\s*(fe|ultra|plus|mini)/i,
    /galaxy\s*(fold|flip)/i,
    /galaxy\s*(buds|watch)/i
  ],
  google: [
    /pixel\s*\d+/i,
    /pixel\s*(a|pro|xl)/i,
    /chromebook/i,
    /nexus\s*\d+/i
  ],
  huawei: [
    /p\d+/i,
    /mate\s*\d+/i,
    /nova\s*\d+/i,
    /honor\s*\d+/i,
    /y\d+/i
  ],
  oneplus: [
    /oneplus\s*\d+/i,
    /oneplus\s*(nord|ce)/i
  ]
};

function normalizeBrand(brand) {
  const lowerBrand = brand.toLowerCase();
  return BRAND_MAPPINGS[lowerBrand] || brand;
}

function normalizeService(service) {
  const lowerService = service.toLowerCase();
  return SERVICE_MAPPINGS[lowerService] || service;
}

function validateModelName(modelName, brand) {
  if (!modelName || modelName.length < 2) return false;
  
  const patterns = MODEL_PATTERNS[brand.toLowerCase()];
  if (!patterns) return true; // Unknown brand, accept any model
  
  return patterns.some(pattern => pattern.test(modelName));
}

function extractQualityTier(title, tags) {
  const lowerTitle = title.toLowerCase();
  const lowerTags = (tags || []).map(tag => tag.toLowerCase());
  
  // Quality indicators
  if (lowerTitle.includes('oem') || lowerTags.includes('oem')) return 'oem';
  if (lowerTitle.includes('genuine') || lowerTags.includes('genuine')) return 'genuine';
  if (lowerTitle.includes('premium') || lowerTags.includes('premium')) return 'premium';
  if (lowerTitle.includes('aftermarket') || lowerTags.includes('aftermarket')) return 'aftermarket';
  if (lowerTitle.includes('refurbished') || lowerTags.includes('refurbished')) return 'refurbished';
  if (lowerTitle.includes('economy') || lowerTags.includes('economy')) return 'economy';
  
  // Assembly type indicators
  if (lowerTitle.includes('with frame') || lowerTags.includes('with frame')) return 'with_frame';
  if (lowerTitle.includes('without frame') || lowerTags.includes('without frame')) return 'without_frame';
  if (lowerTitle.includes('complete assembly') || lowerTags.includes('complete assembly')) return 'complete_assembly';
  if (lowerTitle.includes('screen only') || lowerTags.includes('screen only')) return 'screen_only';
  
  return 'standard';
}

function cleanAndValidateProduct(product) {
  const cleaned = {
    ...product,
    brand: normalizeBrand(product.brand),
    service_type: normalizeService(product.service_type),
    quality_tier: extractQualityTier(product.product_title, product.tags),
    is_valid: false,
    validation_errors: []
  };
  
  // Validation checks
  if (!cleaned.brand || cleaned.brand === 'Various') {
    cleaned.validation_errors.push('Invalid or missing brand');
  }
  
  if (!cleaned.service_type) {
    cleaned.validation_errors.push('Invalid or missing service type');
  }
  
  if (!validateModelName(cleaned.model_name, cleaned.brand)) {
    cleaned.validation_errors.push('Invalid model name for brand');
  }
  
  if (!cleaned.part_price || cleaned.part_price <= 0) {
    cleaned.validation_errors.push('Invalid part price');
  }
  
  if (!cleaned.sku) {
    cleaned.validation_errors.push('Missing SKU');
  }
  
  // Mark as valid if no errors
  if (cleaned.validation_errors.length === 0) {
    cleaned.is_valid = true;
  }
  
  return cleaned;
}

async function cleanMobileSentrixData() {
  log('🧹 Starting MobileSentrix data cleaning...');
  
  try {
    // Load processed data
    log('📂 Loading processed data...');
    const rawData = await fs.readFile(PROCESSED_DATA_PATH, 'utf8');
    const products = JSON.parse(rawData);
    
    log(`🔍 Cleaning ${products.length} products...`);
    
    // Clean and validate each product
    const cleanedProducts = products.map(cleanAndValidateProduct);
    
    // Generate validation report
    const validProducts = cleanedProducts.filter(p => p.is_valid);
    const invalidProducts = cleanedProducts.filter(p => !p.is_valid);
    
    const validationReport = {
      total_products: products.length,
      valid_products: validProducts.length,
      invalid_products: invalidProducts.length,
      validation_rate: ((validProducts.length / products.length) * 100).toFixed(2),
      brand_distribution: {},
      service_distribution: {},
      quality_tier_distribution: {},
      price_ranges: {
        min: Math.min(...validProducts.map(p => p.part_price)),
        max: Math.max(...validProducts.map(p => p.part_price)),
        average: (validProducts.reduce((sum, p) => sum + p.part_price, 0) / validProducts.length).toFixed(2)
      },
      common_validation_errors: {}
    };
    
    // Analyze distributions
    validProducts.forEach(product => {
      validationReport.brand_distribution[product.brand] = (validationReport.brand_distribution[product.brand] || 0) + 1;
      validationReport.service_distribution[product.service_type] = (validationReport.service_distribution[product.service_type] || 0) + 1;
      validationReport.quality_tier_distribution[product.quality_tier] = (validationReport.quality_tier_distribution[product.quality_tier] || 0) + 1;
    });
    
    // Analyze validation errors
    invalidProducts.forEach(product => {
      product.validation_errors.forEach(error => {
        validationReport.common_validation_errors[error] = (validationReport.common_validation_errors[error] || 0) + 1;
      });
    });
    
    // Save cleaned data
    log('💾 Saving cleaned data...');
    await fs.writeFile(CLEANED_DATA_PATH, JSON.stringify(validProducts, null, 2));
    await fs.writeFile(VALIDATION_REPORT_PATH, JSON.stringify(validationReport, null, 2));
    
    // Print summary
    log('');
    log('📊 CLEANING SUMMARY');
    log('===================');
    log(`Total Products: ${validationReport.total_products}`);
    log(`Valid Products: ${validationReport.valid_products} (${validationReport.validation_rate}%)`);
    log(`Invalid Products: ${validationReport.invalid_products}`);
    
    log('');
    log('Brand Distribution:');
    Object.entries(validationReport.brand_distribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([brand, count]) => {
        log(`  ${brand}: ${count} products`);
      });
    
    log('');
    log('Service Distribution:');
    Object.entries(validationReport.service_distribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([service, count]) => {
        log(`  ${service}: ${count} products`);
      });
    
    log('');
    log('Quality Tier Distribution:');
    Object.entries(validationReport.quality_tier_distribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([tier, count]) => {
        log(`  ${tier}: ${count} products`);
      });
    
    log('');
    log('Price Ranges:');
    log(`  Min: $${validationReport.price_ranges.min} CAD`);
    log(`  Max: $${validationReport.price_ranges.max} CAD`);
    log(`  Average: $${validationReport.price_ranges.average} CAD`);
    
    if (Object.keys(validationReport.common_validation_errors).length > 0) {
      log('');
      log('Common Validation Errors:');
      Object.entries(validationReport.common_validation_errors)
        .sort(([,a], [,b]) => b - a)
        .forEach(([error, count]) => {
          log(`  ${error}: ${count} products`);
        });
    }
    
    log('');
    log('🎉 Data cleaning completed successfully!', 'success');
    log(`📁 Cleaned data: ${CLEANED_DATA_PATH}`);
    log(`📁 Validation report: ${VALIDATION_REPORT_PATH}`);
    
  } catch (error) {
    log(`❌ Cleaning failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the cleaning process
cleanMobileSentrixData(); 