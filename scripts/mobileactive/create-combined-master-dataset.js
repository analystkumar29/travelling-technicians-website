// Combined Master Dataset Generator
// Merges MobileActive and MobileSentrix data into unified master dataset

const fs = require('fs/promises');
const path = require('path');

// Configuration
const MOBILEACTIVE_CLEANED_PATH = path.join(process.cwd(), 'tmp/mobileactive-improved-cleaned.json');
const MOBILESENTRIX_CLEANED_PATH = path.join(process.cwd(), 'tmp/mobilesentrix-cleaned.json');
const COMBINED_MASTER_PATH = path.join(process.cwd(), 'tmp/combined-master-dataset.json');
const COMBINED_CSV_PATH = path.join(process.cwd(), 'tmp/combined-master-dataset.csv');
const SUPPLIER_COMPARISON_PATH = path.join(process.cwd(), 'tmp/supplier-comparison.json');

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

// Service type mapping between suppliers
const SERVICE_MAPPINGS = {
  // MobileActive mappings
  'screen_replacement': 'screen_replacement',
  'battery_replacement': 'battery_replacement',
  'charging_port_repair': 'charging_port_repair',
  'speaker_repair': 'speaker_repair',
  'camera_repair': 'camera_repair',
  'microphone_repair': 'microphone_repair',
  'keyboard_repair': 'keyboard_repair',
  'trackpad_repair': 'trackpad_repair',
  'cooling_repair': 'cooling_repair',
  
  // MobileSentrix mappings (should be the same)
  'screen_replacement': 'screen_replacement',
  'battery_replacement': 'battery_replacement',
  'charging_port_repair': 'charging_port_repair',
  'speaker_repair': 'speaker_repair',
  'camera_repair': 'camera_replacement',
  'microphone_repair': 'microphone_repair',
  'keyboard_repair': 'keyboard_repair',
  'trackpad_repair': 'trackpad_repair',
  'cooling_repair': 'cooling_repair'
};

// Quality tier mapping
const QUALITY_TIER_MAPPINGS = {
  // MobileActive
  'economy': 'economy',
  'premium': 'premium',
  'aftermarket': 'aftermarket',
  'with_frame': 'with_frame',
  'refurbished': 'refurbished',
  'standard': 'standard',
  'without_frame': 'without_frame',
  
  // MobileSentrix
  'oem': 'premium',
  'genuine': 'premium',
  'premium': 'premium',
  'aftermarket': 'aftermarket',
  'refurbished': 'refurbished',
  'economy': 'economy',
  'with_frame': 'with_frame',
  'without_frame': 'without_frame',
  'complete_assembly': 'complete_assembly',
  'screen_only': 'screen_only',
  'standard': 'standard'
};

function normalizeServiceType(serviceType) {
  return SERVICE_MAPPINGS[serviceType] || serviceType;
}

function normalizeQualityTier(qualityTier) {
  return QUALITY_TIER_MAPPINGS[qualityTier] || 'standard';
}

function createMasterRecord(product, supplier) {
  return {
    // Core identification
    master_id: `${supplier}_${product.product_id || product.id}`,
    supplier: supplier,
    supplier_product_id: product.product_id || product.id,
    supplier_sku: product.sku || product.supplier_sku,
    
    // Product information
    product_title: product.product_title || product.title,
    product_handle: product.product_handle || product.handle,
    image_url: product.image_url || product.image,
    
    // Device classification
    device_type: product.device_type,
    brand: product.brand,
    model_name: product.model_name || product.model,
    model_variant: product.model_variant || product.variant,
    
    // Service classification
    service_type: normalizeServiceType(product.service_type),
    quality_tier: normalizeQualityTier(product.quality_tier),
    
    // Pricing information
    part_cost: product.part_price || product.cost_price,
    supplier_price: product.part_price || product.supplier_price,
    
    // Availability and lead time
    is_available: product.is_available !== false,
    lead_time_days: product.lead_time_days || 3,
    stock_quantity: product.stock_quantity || null,
    
    // Metadata
    tags: product.tags || [],
    created_at: product.created_at,
    updated_at: product.updated_at,
    
    // Supplier-specific data
    supplier_data: {
      original_service_type: product.service_type,
      original_quality_tier: product.quality_tier,
      original_price: product.part_price,
      ...product
    }
  };
}

function mergeDuplicateProducts(products) {
  const grouped = {};
  
  products.forEach(product => {
    const key = `${product.brand}_${product.model_name}_${product.service_type}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(product);
  });
  
  const merged = [];
  
  Object.values(grouped).forEach(group => {
    if (group.length === 1) {
      merged.push(group[0]);
    } else {
      // Merge multiple suppliers for same product
      const primary = group[0];
      const suppliers = group.map(p => p.supplier);
      
      const mergedProduct = {
        ...primary,
        master_id: `multi_${primary.brand}_${primary.model_name}_${primary.service_type}`,
        supplier: 'multiple',
        suppliers: suppliers,
        supplier_data: {
          suppliers: suppliers.map(supplier => {
            const supplierProduct = group.find(p => p.supplier === supplier);
            return {
              supplier: supplier,
              product_id: supplierProduct.supplier_product_id,
              sku: supplierProduct.supplier_sku,
              price: supplierProduct.supplier_price,
              quality_tier: supplierProduct.quality_tier,
              is_available: supplierProduct.is_available
            };
          })
        },
        // Use best availability and pricing
        is_available: group.some(p => p.is_available),
        supplier_price: Math.min(...group.map(p => p.supplier_price)),
        part_cost: Math.min(...group.map(p => p.part_cost))
      };
      
      merged.push(mergedProduct);
    }
  });
  
  return merged;
}

async function createCombinedMasterDataset() {
  log('🚀 Starting combined master dataset creation...');
  
  try {
    // Load cleaned data from both suppliers
    log('📂 Loading MobileActive data...');
    const mobileactiveData = await fs.readFile(MOBILEACTIVE_CLEANED_PATH, 'utf8');
    const mobileactiveProducts = JSON.parse(mobileactiveData);
    
    log('📂 Loading MobileSentrix data...');
    const mobilesentrixData = await fs.readFile(MOBILESENTRIX_CLEANED_PATH, 'utf8');
    const mobilesentrixProducts = JSON.parse(mobilesentrixData);
    
    log('🔄 Converting to master format...');
    
    // Convert both datasets to master format
    const mobileactiveMaster = mobileactiveProducts.map(product => 
      createMasterRecord(product, 'mobileactive')
    );
    
    const mobilesentrixMaster = mobilesentrixProducts.map(product => 
      createMasterRecord(product, 'mobilesentrix')
    );
    
    // Combine all products
    const allProducts = [...mobileactiveMaster, ...mobilesentrixMaster];
    
    log('🔗 Merging duplicate products...');
    const mergedProducts = mergeDuplicateProducts(allProducts);
    
    // Generate supplier comparison
    const comparison = {
      mobileactive: {
        total_products: mobileactiveProducts.length,
        brands: [...new Set(mobileactiveProducts.map(p => p.brand))],
        services: [...new Set(mobileactiveProducts.map(p => p.service_type))],
        price_range: {
          min: Math.min(...mobileactiveProducts.map(p => p.part_price)),
          max: Math.max(...mobileactiveProducts.map(p => p.part_price)),
          average: (mobileactiveProducts.reduce((sum, p) => sum + p.part_price, 0) / mobileactiveProducts.length).toFixed(2)
        }
      },
      mobilesentrix: {
        total_products: mobilesentrixProducts.length,
        brands: [...new Set(mobilesentrixProducts.map(p => p.brand))],
        services: [...new Set(mobilesentrixProducts.map(p => p.service_type))],
        price_range: {
          min: Math.min(...mobilesentrixProducts.map(p => p.part_price)),
          max: Math.max(...mobilesentrixProducts.map(p => p.part_price)),
          average: (mobilesentrixProducts.reduce((sum, p) => sum + p.part_price, 0) / mobilesentrixProducts.length).toFixed(2)
        }
      },
      combined: {
        total_products: mergedProducts.length,
        unique_products: mergedProducts.filter(p => p.supplier !== 'multiple').length,
        multi_supplier_products: mergedProducts.filter(p => p.supplier === 'multiple').length,
        brands: [...new Set(mergedProducts.map(p => p.brand))],
        services: [...new Set(mergedProducts.map(p => p.service_type))],
        quality_tiers: [...new Set(mergedProducts.map(p => p.quality_tier))]
      }
    };
    
    // Save combined master dataset
    log('💾 Saving combined master dataset...');
    await fs.writeFile(COMBINED_MASTER_PATH, JSON.stringify(mergedProducts, null, 2));
    await fs.writeFile(SUPPLIER_COMPARISON_PATH, JSON.stringify(comparison, null, 2));
    
    // Generate CSV
    await generateCombinedCSV(mergedProducts, COMBINED_CSV_PATH);
    
    // Print summary
    printCombinedSummary(comparison, mergedProducts);
    
    log('🎉 Combined master dataset created successfully!', 'success');
    log(`📁 Combined master: ${COMBINED_MASTER_PATH}`);
    log(`📁 Supplier comparison: ${SUPPLIER_COMPARISON_PATH}`);
    log(`📁 Combined CSV: ${COMBINED_CSV_PATH}`);
    
  } catch (error) {
    log(`❌ Combined dataset creation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function generateCombinedCSV(products, outputPath) {
  const headers = [
    'master_id', 'supplier', 'brand', 'device_type', 'model_name', 'service_type',
    'quality_tier', 'part_cost', 'is_available', 'lead_time_days'
  ];
  
  const csvRows = [headers.join(',')];
  
  products.forEach(product => {
    const row = headers.map(header => {
      const value = product[header];
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      return value;
    });
    csvRows.push(row.join(','));
  });
  
  await fs.writeFile(outputPath, csvRows.join('\n'));
}

function printCombinedSummary(comparison, products) {
  log('');
  log('📊 COMBINED MASTER DATASET SUMMARY');
  log('==================================');
  
  log('');
  log('Supplier Comparison:');
  log(`  MobileActive: ${comparison.mobileactive.total_products} products`);
  log(`  MobileSentrix: ${comparison.mobilesentrix.total_products} products`);
  log(`  Combined: ${comparison.combined.total_products} products`);
  log(`  Unique Products: ${comparison.combined.unique_products}`);
  log(`  Multi-Supplier Products: ${comparison.combined.multi_supplier_products}`);
  
  log('');
  log('Brand Coverage:');
  comparison.combined.brands.forEach(brand => {
    const brandProducts = products.filter(p => p.brand === brand);
    log(`  ${brand}: ${brandProducts.length} products`);
  });
  
  log('');
  log('Service Coverage:');
  comparison.combined.services.forEach(service => {
    const serviceProducts = products.filter(p => p.service_type === service);
    log(`  ${service}: ${serviceProducts.length} products`);
  });
  
  log('');
  log('Quality Tier Distribution:');
  const tierCounts = {};
  products.forEach(product => {
    tierCounts[product.quality_tier] = (tierCounts[product.quality_tier] || 0) + 1;
  });
  Object.entries(tierCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([tier, count]) => {
      log(`  ${tier}: ${count} products`);
    });
  
  log('');
  log('Price Analysis:');
  const prices = products.map(p => p.part_cost).filter(p => p > 0);
  log(`  Min: $${Math.min(...prices)} CAD`);
  log(`  Max: $${Math.max(...prices)} CAD`);
  log(`  Average: $${(prices.reduce((sum, p) => sum + p, 0) / prices.length).toFixed(2)} CAD`);
  
  log('');
  log('Availability:');
  const available = products.filter(p => p.is_available);
  const unavailable = products.filter(p => !p.is_available);
  log(`  Available: ${available.length} products`);
  log(`  Unavailable: ${unavailable.length} products`);
  log(`  Availability Rate: ${((available.length / products.length) * 100).toFixed(2)}%`);
}

// Run the combined dataset creation
createCombinedMasterDataset(); 