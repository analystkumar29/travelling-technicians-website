// Improved MobileActive Data Cleaning Script (CommonJS)

const fs = require('fs/promises');
const path = require('path');

// Configuration
const RAW_DATA_PATH = path.join(process.cwd(), 'tmp/mobileactive-raw.json');
const IMPROVED_CLEANED_PATH = path.join(process.cwd(), 'tmp/mobileactive-improved-cleaned.json');
const IMPROVED_REPORT_PATH = path.join(process.cwd(), 'tmp/improved-validation-report.json');

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

// Enhanced service type detection patterns
const ENHANCED_SERVICE_PATTERNS = {
  screen_replacement: {
    keywords: ['screen', 'lcd', 'oled', 'display', 'glass', 'assembly', 'digitizer', 'touch'],
    exclude: ['battery', 'camera', 'speaker', 'microphone', 'charging', 'earpiece', 'back cover']
  },
  battery_replacement: {
    keywords: ['battery', 'batteries'],
    exclude: ['screen', 'camera', 'speaker', 'microphone', 'charging', 'earpiece', 'back cover']
  },
  camera_repair: {
    keywords: ['camera', 'lens', 'bc-', 'back camera', 'front camera'],
    exclude: ['screen', 'battery', 'speaker', 'microphone', 'charging', 'earpiece', 'back cover']
  },
  charging_port_repair: {
    keywords: ['charging port', 'cp-', 'usb port', 'connector', 'charging'],
    exclude: ['screen', 'battery', 'camera', 'speaker', 'microphone', 'earpiece', 'back cover']
  },
  speaker_repair: {
    keywords: ['speaker', 'loudspeaker', 'buzzer', 'audio', 'earpiece'],
    exclude: ['screen', 'battery', 'camera', 'microphone', 'charging', 'back cover']
  },
  microphone_repair: {
    keywords: ['microphone', 'mic', 'voice'],
    exclude: ['screen', 'battery', 'camera', 'speaker', 'charging', 'earpiece', 'back cover']
  },
  back_cover_replacement: {
    keywords: ['back cover', 'housing', 'case', 'cover'],
    exclude: ['screen', 'battery', 'camera', 'speaker', 'microphone', 'charging', 'earpiece']
  }
};

// Enhanced model extraction patterns
const ENHANCED_MODEL_PATTERNS = [
  // iPhone patterns (more comprehensive)
  /iphone\s+(\d+(?:\s+pro\s+max?|\s+pro|\s+plus|\s+mini)?)/i,
  /iphone\s+(\d+[a-z]?)/i,
  /iphone\s+(se(?:\s+\d+)?)/i,
  /iphone\s+(xs(?:\s+max)?)/i,
  /iphone\s+(xr)/i,
  
  // Samsung patterns (more comprehensive)
  /galaxy\s+(s\d+(?:\s+fe|\s+plus|\s+ultra)?)/i,
  /galaxy\s+(note\s+\d+)/i,
  /galaxy\s+(a\d+)/i,
  /galaxy\s+(z\s+flip\s+\d+)/i,
  /galaxy\s+(z\s+fold\s+\d+)/i,
  /sgs\s+(s\d+)/i,
  /sgs\s+(s\d+\s+active)/i,
  /sgs\s+(s\d+\s+edge)/i,
  
  // Google Pixel patterns
  /pixel\s+(\d+(?:\s+a|\s+pro|\s+xl)?)/i,
  
  // OnePlus patterns
  /oneplus\s+(\d+(?:\s+pro|\s+t)?)/i,
  
  // Huawei patterns
  /huawei\s+(p\d+)/i,
  /huawei\s+(mate\s+\d+)/i,
  
  // Xiaomi patterns
  /xiaomi\s+(mi\s+\d+)/i,
  /redmi\s+(\d+)/i,
  
  // MacBook patterns
  /macbook\s+(air|pro)/i,
  
  // iPad patterns (more comprehensive)
  /ipad\s+(air(?:\s+\d+)?)/i,
  /ipad\s+(pro(?:\s+\d+)?)/i,
  /ipad\s+(mini(?:\s+\d+)?)/i,
  /ipad\s+(\d+)/i,
  
  // Surface patterns
  /surface\s+(laptop\s+\d+)/i,
  /surface\s+(pro\s+\d+)/i
];

// Relaxed pricing rules for better validation
const RELAXED_PRICING_RULES = {
  min_price: 0.01,
  max_price: 2000,
  suspicious_low: 0.50,  // Lowered from $1.00
  suspicious_high: 1000,
  screen_replacement: { min: 10, max: 800 },  // Lowered minimum
  battery_replacement: { min: 3, max: 200 },  // Lowered minimum
  camera_repair: { min: 1, max: 150 },        // Lowered minimum
  charging_port_repair: { min: 2, max: 100 }, // Lowered minimum
  speaker_repair: { min: 1, max: 80 },        // Lowered minimum
  microphone_repair: { min: 0.50, max: 50 },  // Lowered minimum
  back_cover_replacement: { min: 2, max: 100 }
};

function detectBrand(product) {
  const title = (product.title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  const vendor = (product.vendor || '').toLowerCase();
  
  // Enhanced brand detection with better patterns
  if (title.includes('iphone') || title.includes('ipad') || title.includes('macbook') || 
      tags.some(tag => tag.includes('apple')) || vendor.includes('apple')) {
    return 'apple';
  }
  
  if (title.includes('galaxy') || title.includes('samsung') || title.includes('sgs') || 
      tags.some(tag => tag.includes('samsung')) || vendor.includes('samsung')) {
    return 'samsung';
  }
  
  if (title.includes('pixel') || tags.some(tag => tag.includes('google'))) {
    return 'google';
  }
  
  if (title.includes('oneplus') || title.includes('one plus')) {
    return 'oneplus';
  }
  
  if (title.includes('huawei') || title.includes('honor')) {
    return 'huawei';
  }
  
  if (title.includes('xiaomi') || title.includes('mi ') || title.includes('redmi')) {
    return 'xiaomi';
  }
  
  if (title.includes('asus') || title.includes('zenfone')) {
    return 'asus';
  }
  
  return 'unknown';
}

function detectServiceType(product) {
  const title = (product.title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  
  // Enhanced service detection with better logic
  for (const [service, pattern] of Object.entries(ENHANCED_SERVICE_PATTERNS)) {
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
  
  // Fallback detection based on SKU patterns
  const sku = (product.variants?.[0]?.sku || '').toLowerCase();
  if (sku.startsWith('bc-')) return 'camera_repair';
  if (sku.startsWith('cp-')) return 'charging_port_repair';
  if (sku.includes('battery')) return 'battery_replacement';
  if (sku.includes('screen') || sku.includes('lcd')) return 'screen_replacement';
  
  return 'unknown';
}

function detectDeviceType(product) {
  const title = (product.title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  
  // Enhanced device type detection
  if (title.includes('iphone') || title.includes('galaxy') || title.includes('pixel') || 
      title.includes('oneplus') || title.includes('huawei') || title.includes('xiaomi') ||
      title.includes('phone') || tags.some(tag => tag.includes('phone'))) {
    return 'mobile';
  }
  
  if (title.includes('ipad') || title.includes('tablet') || title.includes('tab')) {
    return 'tablet';
  }
  
  if (title.includes('macbook') || title.includes('laptop') || title.includes('surface')) {
    return 'laptop';
  }
  
  return 'unknown';
}

function extractModelName(product) {
  const title = product.title || '';
  
  // Try enhanced patterns
  for (const pattern of ENHANCED_MODEL_PATTERNS) {
    const match = title.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  // Fallback: extract from SKU patterns
  const sku = product.variants?.[0]?.sku || '';
  if (sku) {
    // Common SKU patterns
    const skuPatterns = [
      /(\d{2}[a-z]+)/i,  // e.g., 15pm, 15p
      /(\d{2}[a-z]+\d+)/i,  // e.g., s23ultra
      /(\d{2}[a-z]+)/i   // e.g., s23, a54
    ];
    
    for (const pattern of skuPatterns) {
      const match = sku.match(pattern);
      if (match) {
        return match[1].toUpperCase();
      }
    }
  }
  
  return 'unknown';
}

function validatePrice(price, serviceType) {
  const numPrice = parseFloat(price);
  
  if (isNaN(numPrice)) {
    return { valid: false, reason: 'Invalid price format' };
  }
  
  if (numPrice < RELAXED_PRICING_RULES.min_price) {
    return { valid: false, reason: 'Price too low' };
  }
  
  if (numPrice > RELAXED_PRICING_RULES.max_price) {
    return { valid: false, reason: 'Price too high' };
  }
  
  if (numPrice < RELAXED_PRICING_RULES.suspicious_low) {
    return { valid: true, reason: 'Suspiciously low price', warning: true };
  }
  
  if (numPrice > RELAXED_PRICING_RULES.suspicious_high) {
    return { valid: true, reason: 'Suspiciously high price', warning: true };
  }
  
  // Service-specific validation with relaxed rules
  if (serviceType && RELAXED_PRICING_RULES[serviceType]) {
    const serviceRules = RELAXED_PRICING_RULES[serviceType];
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
  
  // Determine if product is valid (relaxed criteria)
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
  
  if (priceValidation.warning) {
    issues.push(`Price warning: ${priceValidation.reason}`);
  }
  
  // Relaxed validation: only require brand and service type
  cleaned.validation_issues = issues;
  cleaned.is_valid = cleaned.brand !== 'unknown' && 
                     cleaned.service_type !== 'unknown' && 
                     priceValidation.valid;
  
  return cleaned;
}

async function improvedCleanAndValidateData() {
  try {
    log('🔍 Loading raw data...');
    const rawData = JSON.parse(await fs.readFile(RAW_DATA_PATH, 'utf8'));
    log(`📊 Loaded ${rawData.length} raw products`);
    
    log('🧹 Cleaning and validating products with improved logic...');
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
    log('💾 Saving improved cleaned data...');
    await fs.writeFile(IMPROVED_CLEANED_PATH, JSON.stringify(validProducts, null, 2));
    
    // Save validation report
    const validationReport = {
      timestamp: new Date().toISOString(),
      statistics: stats,
      invalid_products_sample: invalidProducts.slice(0, 10),
      validation_issues_summary: stats.validation_issues
    };
    
    await fs.writeFile(IMPROVED_REPORT_PATH, JSON.stringify(validationReport, null, 2));
    
    // Display summary
    log('📊 IMPROVED CLEANING AND VALIDATION SUMMARY', 'success');
    log('==============================================');
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
    
    log('✅ Improved data cleaning and validation completed!', 'success');
    log(`📁 Improved cleaned data: ${IMPROVED_CLEANED_PATH}`);
    log(`📁 Improved validation report: ${IMPROVED_REPORT_PATH}`);
    
    return {
      validProducts,
      invalidProducts,
      stats
    };
    
  } catch (error) {
    log(`❌ Error during improved data cleaning: ${error.message}`, 'error');
    throw error;
  }
}

// Run the improved cleaning process
if (require.main === module) {
  improvedCleanAndValidateData()
    .then(() => {
      log('🎉 Improved data cleaning process completed successfully!', 'success');
      process.exit(0);
    })
    .catch((error) => {
      log(`💥 Improved data cleaning process failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { improvedCleanAndValidateData }; 