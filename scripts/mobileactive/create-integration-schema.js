// MobileActive Integration Schema Generator
// Creates fresh data tables that map to current booking system

const fs = require('fs');
const path = require('path');

// Configuration
const CLEANED_DATA_PATH = path.join(process.cwd(), 'tmp/mobileactive-improved-cleaned.json');
const SCHEMA_OUTPUT_PATH = path.join(process.cwd(), 'tmp/integration-schema.sql');
const MAPPING_OUTPUT_PATH = path.join(process.cwd(), 'tmp/data-mapping.json');

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

// Service mapping to existing system
const SERVICE_MAPPING = {
  'screen_replacement': 'screen_replacement',
  'battery_replacement': 'battery_replacement',
  'charging_port_repair': 'charging_port_repair',
  'camera_repair': 'camera_repair',
  'speaker_repair': 'speaker_repair',
  'microphone_repair': 'microphone_repair',
  'back_cover_replacement': 'back_cover_replacement'
};

// Quality tier mapping
const QUALITY_TIER_MAPPING = {
  'economy': 'economy',
  'standard': 'standard',
  'premium': 'premium',
  'express': 'express',
  'aftermarket': 'economy',
  'with_frame': 'premium',
  'refurbished': 'economy',
  'without_frame': 'standard'
};

function generateIntegrationSchema() {
  return `
-- MobileActive Integration Schema
-- Fresh data tables that map to current booking system

-- 1. MobileActive Products Master Table
CREATE TABLE mobileactive_products (
  id SERIAL PRIMARY KEY,
  mobileactive_id VARCHAR(100) UNIQUE NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  device_type VARCHAR(20) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  model_variant VARCHAR(50),
  service_type VARCHAR(50) NOT NULL,
  quality_tier VARCHAR(30) NOT NULL,
  part_cost DECIMAL(10,2) NOT NULL,
  supplier_sku VARCHAR(100),
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  lead_time_days INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Quality Tier Configuration
CREATE TABLE quality_tiers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  multiplier DECIMAL(4,2) NOT NULL,
  warranty_months INTEGER NOT NULL,
  turnaround_hours INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Service Mapping Table
CREATE TABLE service_mappings (
  id SERIAL PRIMARY KEY,
  mobileactive_service VARCHAR(50) NOT NULL,
  system_service VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(mobileactive_service, system_service)
);

-- 4. Brand Mapping Table
CREATE TABLE brand_mappings (
  id SERIAL PRIMARY KEY,
  mobileactive_brand VARCHAR(50) NOT NULL,
  system_brand VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(mobileactive_brand, system_brand)
);

-- 5. Model Mapping Table
CREATE TABLE model_mappings (
  id SERIAL PRIMARY KEY,
  mobileactive_model VARCHAR(100) NOT NULL,
  system_model VARCHAR(100) NOT NULL,
  brand_id INTEGER REFERENCES brand_mappings(id),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(mobileactive_model, system_model, brand_id)
);

-- 6. Pricing Integration Table
CREATE TABLE mobileactive_pricing (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES mobileactive_products(id),
  quality_tier_id INTEGER REFERENCES quality_tiers(id),
  base_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  markup_percentage DECIMAL(5,2) DEFAULT 30.00,
  final_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, quality_tier_id)
);

-- Indexes for performance
CREATE INDEX idx_mobileactive_products_brand_model ON mobileactive_products(brand, model_name);
CREATE INDEX idx_mobileactive_products_service ON mobileactive_products(service_type);
CREATE INDEX idx_mobileactive_products_device_type ON mobileactive_products(device_type);
CREATE INDEX idx_mobileactive_pricing_product ON mobileactive_pricing(product_id);
CREATE INDEX idx_mobileactive_pricing_tier ON mobileactive_pricing(quality_tier_id);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mobileactive_products_updated_at 
  BEFORE UPDATE ON mobileactive_products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobileactive_pricing_updated_at 
  BEFORE UPDATE ON mobileactive_pricing 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default quality tiers
INSERT INTO quality_tiers (name, display_name, multiplier, warranty_months, turnaround_hours, description) VALUES
('economy', 'Economy', 0.80, 3, 72, 'Aftermarket parts with 3-month warranty'),
('standard', 'Standard', 1.00, 6, 48, 'Quality aftermarket parts with 6-month warranty'),
('premium', 'Premium', 1.25, 12, 24, 'OEM parts with 12-month warranty'),
('express', 'Express', 1.50, 6, 12, 'Fast service with 6-month warranty');

-- Insert service mappings
INSERT INTO service_mappings (mobileactive_service, system_service) VALUES
('screen_replacement', 'screen_replacement'),
('battery_replacement', 'battery_replacement'),
('charging_port_repair', 'charging_port_repair'),
('camera_repair', 'camera_repair'),
('speaker_repair', 'speaker_repair'),
('microphone_repair', 'microphone_repair'),
('back_cover_replacement', 'back_cover_replacement');

-- Insert brand mappings
INSERT INTO brand_mappings (mobileactive_brand, system_brand) VALUES
('apple', 'Apple'),
('samsung', 'Samsung'),
('google', 'Google'),
('oneplus', 'OnePlus'),
('huawei', 'Huawei'),
('xiaomi', 'Xiaomi'),
('asus', 'ASUS');
`;
}

function analyzeTop95Percent(data) {
  log('📊 Analyzing top 95% of products...');
  
  // Filter out unknown device types
  const validData = data.filter(product => product.device_type !== 'UNKNOWN');
  
  // Calculate 95% threshold
  const totalProducts = validData.length;
  const threshold95 = Math.floor(totalProducts * 0.95);
  
  // Group by brand and count products
  const brandCounts = {};
  validData.forEach(product => {
    brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
  });
  
  // Sort brands by product count
  const sortedBrands = Object.entries(brandCounts)
    .sort(([,a], [,b]) => b - a);
  
  // Find brands that make up 95% of products
  let cumulativeCount = 0;
  const top95Brands = [];
  
  for (const [brand, count] of sortedBrands) {
    cumulativeCount += count;
    top95Brands.push({ brand, count, cumulativeCount });
    
    if (cumulativeCount >= threshold95) {
      break;
    }
  }
  
  // Filter data to include only top 95% brands
  const top95BrandNames = top95Brands.map(item => item.brand);
  const top95Data = validData.filter(product => top95BrandNames.includes(product.brand));
  
  log(`✅ Top 95% analysis complete:`);
  log(`   Total valid products: ${totalProducts}`);
  log(`   95% threshold: ${threshold95} products`);
  log(`   Top brands: ${top95Brands.length} brands`);
  log(`   Products included: ${top95Data.length} products`);
  
  top95Brands.forEach(({ brand, count, cumulativeCount }) => {
    const percentage = ((count / totalProducts) * 100).toFixed(1);
    log(`   ${brand}: ${count} products (${percentage}%)`);
  });
  
  return {
    top95Data,
    top95Brands,
    threshold95,
    totalProducts
  };
}

function createDataMapping(top95Data) {
  log('🗺️ Creating data mapping...');
  
  const mapping = {
    summary: {
      total_products: top95Data.length,
      brands: [...new Set(top95Data.map(p => p.brand))],
      services: [...new Set(top95Data.map(p => p.service_type))],
      device_types: [...new Set(top95Data.map(p => p.device_type))],
      quality_tiers: [...new Set(top95Data.map(p => p.quality_tier))]
    },
    brand_mapping: {},
    service_mapping: {},
    quality_tier_mapping: {},
    device_type_mapping: {},
    sample_products: []
  };
  
  // Brand mapping
  mapping.brand_mapping = Object.fromEntries(
    [...new Set(top95Data.map(p => p.brand))].map(brand => [brand, brand])
  );
  
  // Service mapping
  mapping.service_mapping = SERVICE_MAPPING;
  
  // Quality tier mapping
  mapping.quality_tier_mapping = QUALITY_TIER_MAPPING;
  
  // Device type mapping
  mapping.device_type_mapping = {
    'mobile': 'mobile',
    'tablet': 'tablet',
    'laptop': 'laptop'
  };
  
  // Sample products for verification
  mapping.sample_products = top95Data.slice(0, 10).map(product => ({
    mobileactive_id: product.id,
    product_title: product.product_title,
    brand: product.brand,
    device_type: product.device_type,
    model_name: product.model_name,
    service_type: product.service_type,
    quality_tier: product.quality_tier,
    part_cost: product.part_price,
    mapped_service: SERVICE_MAPPING[product.service_type] || product.service_type,
    mapped_quality_tier: QUALITY_TIER_MAPPING[product.quality_tier] || 'standard'
  }));
  
  return mapping;
}

async function generateIntegrationFiles() {
  log('🚀 Starting MobileActive integration schema generation...');
  
  try {
    // Load cleaned data
    log('📂 Loading cleaned data...');
    const data = JSON.parse(fs.readFileSync(CLEANED_DATA_PATH, 'utf8'));
    
    // Analyze top 95%
    const { top95Data, top95Brands, threshold95, totalProducts } = analyzeTop95Percent(data);
    
    // Generate schema
    log('🏗️ Generating database schema...');
    const schema = generateIntegrationSchema();
    fs.writeFileSync(SCHEMA_OUTPUT_PATH, schema);
    
    // Create data mapping
    log('🗺️ Creating data mapping...');
    const mapping = createDataMapping(top95Data);
    fs.writeFileSync(MAPPING_OUTPUT_PATH, JSON.stringify(mapping, null, 2));
    
    // Generate summary
    log('');
    log('📊 INTEGRATION SUMMARY');
    log('=====================');
    log(`Total Products: ${totalProducts}`);
    log(`95% Threshold: ${threshold95} products`);
    log(`Top Brands: ${top95Brands.length} brands`);
    log(`Products to Import: ${top95Data.length} products`);
    
    log('');
    log('🏷️ Top Brands (95% coverage):');
    top95Brands.forEach(({ brand, count, cumulativeCount }) => {
      const percentage = ((count / totalProducts) * 100).toFixed(1);
      log(`  ${brand}: ${count} products (${percentage}%)`);
    });
    
    log('');
    log('📁 Generated Files:');
    log(`  Schema: ${SCHEMA_OUTPUT_PATH}`);
    log(`  Mapping: ${MAPPING_OUTPUT_PATH}`);
    
    log('');
    log('🎯 Next Steps:');
    log('1. Run the SQL schema to create tables');
    log('2. Use the mapping file to import data');
    log('3. Update your booking system to use new tables');
    log('4. Test pricing calculations with real supplier data');
    
    log('');
    log('✅ Integration schema generation complete!', 'success');
    
  } catch (error) {
    log(`❌ Schema generation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the schema generation
generateIntegrationFiles(); 