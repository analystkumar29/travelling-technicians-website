// Final CSV Export Script for MobileActive Data (CommonJS)

const fs = require('fs/promises');
const path = require('path');

// Configuration
const CLEANED_DATA_PATH = path.join(process.cwd(), 'tmp/mobileactive-improved-cleaned.json');
const FINAL_CSV_PATH = path.join(process.cwd(), 'tmp/mobileactive-final-pricing.csv');
const SUMMARY_REPORT_PATH = path.join(process.cwd(), 'tmp/final-export-summary.json');

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

// Brand mapping to your database brands
const BRAND_MAPPING = {
  'apple': 'Apple',
  'samsung': 'Samsung',
  'google': 'Google',
  'oneplus': 'OnePlus',
  'huawei': 'Huawei',
  'xiaomi': 'Xiaomi',
  'asus': 'ASUS'
};

// Service type mapping to your database services
const SERVICE_MAPPING = {
  'screen_replacement': 'Screen Replacement',
  'battery_replacement': 'Battery Replacement',
  'camera_repair': 'Camera Repair',
  'charging_port_repair': 'Charging Port Repair',
  'speaker_repair': 'Speaker Repair',
  'microphone_repair': 'Microphone Repair',
  'back_cover_replacement': 'Back Cover Replacement'
};

// Model name standardization
function standardizeModelName(modelName, brand) {
  if (!modelName || modelName === 'unknown') return 'Unknown';
  
  const model = modelName.toLowerCase();
  
  // Apple models
  if (brand === 'apple') {
    // iPhone models
    if (model.includes('iphone')) {
      // Extract iPhone number and variant
      const match = model.match(/iphone\s*(\d+)(?:\s*(pro|plus|mini|max))?/i);
      if (match) {
        const number = match[1];
        const variant = match[2] || '';
        return `iPhone ${number}${variant ? ' ' + variant : ''}`;
      }
    }
    
    // iPad models
    if (model.includes('ipad')) {
      const match = model.match(/ipad\s*(air|pro|mini)?\s*(\d+)?/i);
      if (match) {
        const type = match[1] || '';
        const number = match[2] || '';
        return `iPad${type ? ' ' + type : ''}${number ? ' ' + number : ''}`.trim();
      }
    }
    
    // MacBook models
    if (model.includes('macbook')) {
      const match = model.match(/macbook\s*(air|pro)/i);
      if (match) {
        return `MacBook ${match[1]}`;
      }
    }
  }
  
  // Samsung models
  if (brand === 'samsung') {
    // Galaxy S series
    if (model.includes('galaxy s') || model.includes('sgs')) {
      const match = model.match(/(?:galaxy\s*)?s(\d+)(?:\s*(fe|plus|ultra))?/i);
      if (match) {
        const number = match[1];
        const variant = match[2] || '';
        return `Galaxy S${number}${variant ? ' ' + variant : ''}`;
      }
    }
    
    // Galaxy Note series
    if (model.includes('galaxy note') || model.includes('note')) {
      const match = model.match(/(?:galaxy\s*)?note\s*(\d+)/i);
      if (match) {
        return `Galaxy Note ${match[1]}`;
      }
    }
    
    // Galaxy A series
    if (model.includes('galaxy a')) {
      const match = model.match(/galaxy\s*a(\d+)/i);
      if (match) {
        return `Galaxy A${match[1]}`;
      }
    }
    
    // Galaxy Z series
    if (model.includes('galaxy z')) {
      const match = model.match(/galaxy\s*z\s*(flip|fold)\s*(\d+)/i);
      if (match) {
        return `Galaxy Z ${match[1]} ${match[2]}`;
      }
    }
  }
  
  // Google Pixel models
  if (brand === 'google') {
    if (model.includes('pixel')) {
      const match = model.match(/pixel\s*(\d+)(?:\s*(a|pro|xl))?/i);
      if (match) {
        const number = match[1];
        const variant = match[2] || '';
        return `Pixel ${number}${variant ? ' ' + variant.toUpperCase() : ''}`;
      }
    }
  }
  
  // OnePlus models
  if (brand === 'oneplus') {
    if (model.includes('oneplus')) {
      const match = model.match(/oneplus\s*(\d+)(?:\s*(pro|t))?/i);
      if (match) {
        const number = match[1];
        const variant = match[2] || '';
        return `OnePlus ${number}${variant ? ' ' + variant.toUpperCase() : ''}`;
      }
    }
  }
  
  // Return original if no pattern matches
  return modelName;
}

// Price tier calculation based on price
function calculatePriceTier(price) {
  if (price <= 20) return 'Economy';
  if (price <= 100) return 'Standard';
  if (price <= 300) return 'Premium';
  return 'Express';
}

// Generate pricing entries for different tiers
function generatePricingEntries(product) {
  const basePrice = product.part_price;
  const entries = [];
  
  // Calculate tier prices (you can adjust these multipliers)
  const tierMultipliers = {
    'Economy': 0.8,
    'Standard': 1.0,
    'Premium': 1.25,
    'Express': 1.5
  };
  
  for (const [tier, multiplier] of Object.entries(tierMultipliers)) {
    const tierPrice = Math.round(basePrice * multiplier * 100) / 100; // Round to 2 decimal places
    
    entries.push({
      brand: BRAND_MAPPING[product.brand] || product.brand,
      device_type: product.device_type === 'unknown' ? 'Mobile' : product.device_type.charAt(0).toUpperCase() + product.device_type.slice(1),
      model: standardizeModelName(product.model_name, product.brand),
      service: SERVICE_MAPPING[product.service_type] || product.service_type,
      pricing_tier: tier,
      base_price: tierPrice,
      source_price: basePrice,
      source: 'MobileActive.ca',
      product_id: product.product_id,
      sku: product.sku,
      notes: `Imported from MobileActive.ca - ${product.product_title}`
    });
  }
  
  return entries;
}

async function exportFinalCSV() {
  try {
    log('🔍 Loading cleaned data...');
    const cleanedData = JSON.parse(await fs.readFile(CLEANED_DATA_PATH, 'utf8'));
    log(`📊 Loaded ${cleanedData.length} cleaned products`);
    
    log('🔄 Generating pricing entries...');
    const allPricingEntries = [];
    const summary = {
      total_products: cleanedData.length,
      total_pricing_entries: 0,
      brands: {},
      device_types: {},
      service_types: {},
      price_ranges: {
        min: Infinity,
        max: 0,
        avg: 0
      }
    };
    
    let totalPrice = 0;
    
    cleanedData.forEach(product => {
      const entries = generatePricingEntries(product);
      allPricingEntries.push(...entries);
      
      // Update summary statistics
      summary.total_pricing_entries += entries.length;
      summary.brands[product.brand] = (summary.brands[product.brand] || 0) + 1;
      summary.device_types[product.device_type] = (summary.device_types[product.device_type] || 0) + 1;
      summary.service_types[product.service_type] = (summary.service_types[product.service_type] || 0) + 1;
      
      totalPrice += product.part_price;
      summary.price_ranges.min = Math.min(summary.price_ranges.min, product.part_price);
      summary.price_ranges.max = Math.max(summary.price_ranges.max, product.part_price);
    });
    
    summary.price_ranges.avg = (totalPrice / cleanedData.length).toFixed(2);
    
    log('📝 Generating CSV...');
    
    // CSV Headers
    const csvHeaders = [
      'Brand',
      'Device Type',
      'Model',
      'Service',
      'Pricing Tier',
      'Base Price',
      'Source Price',
      'Source',
      'Product ID',
      'SKU',
      'Notes'
    ];
    
    // Generate CSV content
    const csvRows = [csvHeaders.join(',')];
    
    allPricingEntries.forEach(entry => {
      const row = [
        `"${entry.brand}"`,
        `"${entry.device_type}"`,
        `"${entry.model}"`,
        `"${entry.service}"`,
        `"${entry.pricing_tier}"`,
        entry.base_price,
        entry.source_price,
        `"${entry.source}"`,
        entry.product_id,
        `"${entry.sku || ''}"`,
        `"${entry.notes}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    log('💾 Saving final CSV...');
    await fs.writeFile(FINAL_CSV_PATH, csvContent);
    
    // Save summary report
    const summaryReport = {
      timestamp: new Date().toISOString(),
      summary: summary,
      sample_entries: allPricingEntries.slice(0, 5)
    };
    
    await fs.writeFile(SUMMARY_REPORT_PATH, JSON.stringify(summaryReport, null, 2));
    
    // Display final summary
    log('📊 FINAL CSV EXPORT SUMMARY', 'success');
    log('============================');
    log(`Total Products Processed: ${summary.total_products}`);
    log(`Total Pricing Entries Generated: ${summary.total_pricing_entries}`);
    log(`CSV File: ${FINAL_CSV_PATH}`);
    log('');
    log('Brands in Export:');
    Object.entries(summary.brands).forEach(([brand, count]) => {
      log(`  ${brand}: ${count} products`);
    });
    log('');
    log('Device Types:');
    Object.entries(summary.device_types).forEach(([type, count]) => {
      log(`  ${type}: ${count} products`);
    });
    log('');
    log('Service Types:');
    Object.entries(summary.service_types).forEach(([service, count]) => {
      log(`  ${service}: ${count} products`);
    });
    log('');
    log('Price Range:');
    log(`  Min: $${summary.price_ranges.min}`);
    log(`  Max: $${summary.price_ranges.max}`);
    log(`  Avg: $${summary.price_ranges.avg}`);
    log('');
    log('CSV Format:');
    log('  - 4 pricing tiers per product (Economy, Standard, Premium, Express)');
    log('  - Tier prices calculated with multipliers: 0.8x, 1.0x, 1.25x, 1.5x');
    log('  - Standardized brand and model names');
    log('  - Mapped service types to your database format');
    log('');
    log('✅ Final CSV export completed successfully!', 'success');
    log(`📁 CSV file: ${FINAL_CSV_PATH}`);
    log(`📁 Summary report: ${SUMMARY_REPORT_PATH}`);
    
    return {
      totalProducts: summary.total_products,
      totalEntries: summary.total_pricing_entries,
      csvPath: FINAL_CSV_PATH,
      summary: summary
    };
    
  } catch (error) {
    log(`❌ Error during CSV export: ${error.message}`, 'error');
    throw error;
  }
}

// Run the export process
if (require.main === module) {
  exportFinalCSV()
    .then(() => {
      log('🎉 Final CSV export process completed successfully!', 'success');
      process.exit(0);
    })
    .catch((error) => {
      log(`💥 Final CSV export process failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { exportFinalCSV }; 