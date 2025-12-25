// Master Dataset Generator for The Travelling Technicians
// Creates standardized dataset from MobileActive data with availability tracking

const fs = require('fs/promises');
const path = require('path');

// Configuration
const CLEANED_DATA_PATH = path.join(process.cwd(), 'tmp/mobileactive-improved-cleaned.json');
const MASTER_DATASET_PATH = path.join(process.cwd(), 'tmp/master-dataset.json');
const MASTER_CSV_PATH = path.join(process.cwd(), 'tmp/master-dataset.csv');
const SUPPLIER_SUMMARY_PATH = path.join(process.cwd(), 'tmp/supplier-summary.json');

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

// Standardized device type mapping
const DEVICE_TYPE_MAPPING = {
  'mobile': 'mobile',
  'phone': 'mobile',
  'smartphone': 'mobile',
  'laptop': 'laptop',
  'notebook': 'laptop',
  'tablet': 'tablet',
  'ipad': 'tablet',
  'unknown': 'unknown'
};

// Standardized service mapping
const SERVICE_MAPPING = {
  'screen_replacement': 'screen_replacement',
  'display_replacement': 'screen_replacement',
  'lcd_replacement': 'screen_replacement',
  'battery_replacement': 'battery_replacement',
  'charging_port_repair': 'charging_port_repair',
  'usb_port_repair': 'charging_port_repair',
  'camera_repair': 'camera_repair',
  'speaker_repair': 'speaker_repair',
  'microphone_repair': 'microphone_repair',
  'back_cover_replacement': 'back_cover_replacement',
  'housing_replacement': 'back_cover_replacement'
};

// Quality tier detection
function detectQualityTier(product) {
  const title = (product.product_title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  const allText = `${title} ${tags.join(' ')}`;
  
  // Quality indicators
  if (allText.includes('oem') || allText.includes('original') || allText.includes('genuine')) {
    return 'oem';
  }
  if (allText.includes('premium') || allText.includes('high quality')) {
    return 'premium';
  }
  if (allText.includes('refurbished') || allText.includes('refurb')) {
    return 'refurbished';
  }
  if (allText.includes('aftermarket') || allText.includes('compatible')) {
    return 'aftermarket';
  }
  if (allText.includes('economy') || allText.includes('budget') || allText.includes('cheap')) {
    return 'economy';
  }
  
  // Default based on price
  const price = product.part_price;
  if (price < 30) return 'economy';
  if (price < 80) return 'aftermarket';
  if (price < 150) return 'premium';
  return 'oem';
}

// Assembly type detection
function detectAssemblyType(product) {
  const title = (product.product_title || '').toLowerCase();
  
  if (title.includes('with frame') || title.includes('assembly') || title.includes('complete')) {
    return 'with_frame';
  }
  if (title.includes('without frame') || title.includes('screen only') || title.includes('lcd only')) {
    return 'screen_only';
  }
  if (title.includes('digitizer only') || title.includes('glass only')) {
    return 'digitizer_only';
  }
  
  return 'unknown';
}

// Availability detection
function detectAvailability(product) {
  const title = (product.product_title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  const allText = `${title} ${tags.join(' ')}`;
  
  // Check for availability indicators
  if (allText.includes('out of stock') || allText.includes('discontinued')) {
    return 'out_of_stock';
  }
  if (allText.includes('limited stock') || allText.includes('low stock')) {
    return 'limited_stock';
  }
  if (allText.includes('in stock') || allText.includes('available')) {
    return 'in_stock';
  }
  
  // Default to available if we have a price
  return product.part_price > 0 ? 'in_stock' : 'unknown';
}

// Create standardized master record
function createMasterRecord(product, supplier = 'mobileactive') {
  const qualityTier = detectQualityTier(product);
  const assemblyType = detectAssemblyType(product);
  const availability = detectAvailability(product);
  
  // Extract model info
  const modelInfo = extractModelInfo(product);
  
  return {
    // Core identifiers
    master_id: `${supplier}_${product.product_id}`,
    supplier: supplier,
    supplier_product_id: product.product_id,
    supplier_sku: product.sku || null,
    
    // Device information
    device_type: DEVICE_TYPE_MAPPING[product.device_type] || 'unknown',
    brand: product.brand?.toLowerCase() || 'unknown',
    model_name: modelInfo.modelName,
    model_variant: modelInfo.modelVariant,
    model_year: modelInfo.modelYear,
    
    // Service information
    service_type: SERVICE_MAPPING[product.service_type] || product.service_type,
    
    // Part information
    part_title: product.product_title,
    part_description: product.product_title, // Could be enhanced with description
    quality_tier: qualityTier,
    assembly_type: assemblyType,
    
    // Pricing information
    cost_price: product.part_price,
    suggested_retail_price: Math.round(product.part_price * 1.3), // 30% markup
    currency: 'CAD',
    
    // Availability information
    availability_status: availability,
    stock_quantity: availability === 'in_stock' ? 'available' : 'check_supplier',
    lead_time_days: availability === 'in_stock' ? 1 : 7,
    
    // Supplier information
    supplier_url: `https://mobileactive.ca/products/${product.product_handle}`,
    supplier_image_url: product.image_url,
    
    // Metadata
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    data_source: 'mobileactive_extraction',
    
    // Raw data for reference
    raw_data: {
      original_title: product.product_title,
      original_price: product.part_price,
      original_tags: product.tags || [],
      original_handle: product.product_handle
    }
  };
}

// Enhanced model extraction
function extractModelInfo(product) {
  let modelName = product.model_name || '';
  let modelVariant = null;
  let modelYear = null;
  
  // Extract from title if model_name is not available
  if (!modelName && product.product_title) {
    const title = product.product_title;
    
    // Extract year
    const yearMatch = title.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      modelYear = parseInt(yearMatch[1]);
    }
    
    // Extract variant
    const variantMatch = title.match(/\b(Pro|Max|Plus|Mini|Ultra|SE|Lite|XL|FE)\b/i);
    if (variantMatch) {
      modelVariant = variantMatch[1];
    }
    
    // Extract model name
    modelName = title
      .replace(/^(LCD Assembly|Screen Assembly|Display Assembly|Battery|Charging Port|Speaker|Camera|Microphone)\s+(for|with|replacement)\s+/i, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\b(Pro|Max|Plus|Mini|Ultra|SE|Lite|XL|FE)\b/gi, '')
      .replace(/\b(20\d{2})\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  return {
    modelName: modelName || 'unknown',
    modelVariant,
    modelYear
  };
}

// Generate master dataset
async function generateMasterDataset() {
  try {
    log('🔍 Loading cleaned MobileActive data...');
    const cleanedData = JSON.parse(await fs.readFile(CLEANED_DATA_PATH, 'utf8'));
    log(`📊 Loaded ${cleanedData.length} products from MobileActive`);
    
    log('🔄 Creating master dataset...');
    const masterRecords = [];
    const supplierSummary = {
      supplier: 'mobileactive',
      total_products: cleanedData.length,
      processed_products: 0,
      skipped_products: 0,
      device_types: {},
      brands: {},
      services: {},
      quality_tiers: {},
      availability_status: {},
      price_ranges: {
        min: Infinity,
        max: 0,
        avg: 0
      }
    };
    
    let totalPrice = 0;
    let validPriceCount = 0;
    
    cleanedData.forEach(product => {
      try {
        const masterRecord = createMasterRecord(product, 'mobileactive');
        masterRecords.push(masterRecord);
        supplierSummary.processed_products++;
        
        // Update summary statistics
        const deviceType = masterRecord.device_type;
        const brand = masterRecord.brand;
        const service = masterRecord.service_type;
        const qualityTier = masterRecord.quality_tier;
        const availability = masterRecord.availability_status;
        const price = masterRecord.cost_price;
        
        supplierSummary.device_types[deviceType] = (supplierSummary.device_types[deviceType] || 0) + 1;
        supplierSummary.brands[brand] = (supplierSummary.brands[brand] || 0) + 1;
        supplierSummary.services[service] = (supplierSummary.services[service] || 0) + 1;
        supplierSummary.quality_tiers[qualityTier] = (supplierSummary.quality_tiers[qualityTier] || 0) + 1;
        supplierSummary.availability_status[availability] = (supplierSummary.availability_status[availability] || 0) + 1;
        
        if (price > 0) {
          supplierSummary.price_ranges.min = Math.min(supplierSummary.price_ranges.min, price);
          supplierSummary.price_ranges.max = Math.max(supplierSummary.price_ranges.max, price);
          totalPrice += price;
          validPriceCount++;
        }
        
      } catch (error) {
        log(`⚠️ Skipping product ${product.product_id}: ${error.message}`, 'warning');
        supplierSummary.skipped_products++;
      }
    });
    
    // Calculate average price
    if (validPriceCount > 0) {
      supplierSummary.price_ranges.avg = Math.round(totalPrice / validPriceCount);
    }
    
    // Sort brands and services by count
    supplierSummary.brands = Object.fromEntries(
      Object.entries(supplierSummary.brands).sort(([,a], [,b]) => b - a)
    );
    supplierSummary.services = Object.fromEntries(
      Object.entries(supplierSummary.services).sort(([,a], [,b]) => b - a)
    );
    
    log('💾 Saving master dataset...');
    await fs.writeFile(MASTER_DATASET_PATH, JSON.stringify(masterRecords, null, 2));
    await fs.writeFile(SUPPLIER_SUMMARY_PATH, JSON.stringify(supplierSummary, null, 2));
    
    // Generate CSV
    log('📝 Generating CSV export...');
    const csvHeaders = [
      'master_id', 'supplier', 'supplier_product_id', 'supplier_sku',
      'device_type', 'brand', 'model_name', 'model_variant', 'model_year',
      'service_type', 'part_title', 'quality_tier', 'assembly_type',
      'cost_price', 'suggested_retail_price', 'currency',
      'availability_status', 'stock_quantity', 'lead_time_days',
      'supplier_url', 'created_at'
    ];
    
    const csvRows = [csvHeaders.join(',')];
    masterRecords.forEach(record => {
      const row = csvHeaders.map(header => {
        const value = record[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(row.join(','));
    });
    
    await fs.writeFile(MASTER_CSV_PATH, csvRows.join('\n'));
    
    // Print summary
    log('✅ MASTER DATASET GENERATION COMPLETE');
    log('=====================================');
    log(`📊 Total Records: ${masterRecords.length}`);
    log(`📊 Device Types: ${Object.keys(supplierSummary.device_types).length}`);
    log(`📊 Brands: ${Object.keys(supplierSummary.brands).length}`);
    log(`📊 Services: ${Object.keys(supplierSummary.services).length}`);
    log(`📊 Price Range: $${supplierSummary.price_ranges.min} - $${supplierSummary.price_ranges.max}`);
    log(`📊 Average Price: $${supplierSummary.price_ranges.avg}`);
    log('');
    log('📁 Files Generated:');
    log(`   Master Dataset: ${MASTER_DATASET_PATH}`);
    log(`   CSV Export: ${MASTER_CSV_PATH}`);
    log(`   Supplier Summary: ${SUPPLIER_SUMMARY_PATH}`);
    log('');
    log('🎯 Next Steps:');
    log('   1. Review the master dataset structure');
    log('   2. Add MobileSentrix data to the same format');
    log('   3. Create database tables based on the master structure');
    log('   4. Import only available parts to your pricing system');
    
  } catch (error) {
    log(`❌ Master dataset generation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the generator
generateMasterDataset(); 