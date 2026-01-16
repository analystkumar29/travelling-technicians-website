const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client for the NEW database
const supabase = createClient(
  'https://vrsavtcofatvrvvfglrt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyc2F2dGNvZmF0dnJ2dmZnbHJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTUxODQyMywiZXhwIjoyMDY3MDk0NDIzfQ.mi1uR6frYoK1Bbd-lWcxmsEPR-Uln-1t7XIaPJi6hdM'
);

// Load cleaned MobileActive data
const CLEANED_DATA_PATH = path.join(__dirname, 'mobileactive/tmp/mobileactive-improved-cleaned.json');

async function createFreshDatabaseMigration() {
  console.log('🚀 Creating Fresh Database with MobileActive Data');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Load and analyze MobileActive data
    console.log('\n📊 Step 1: Loading MobileActive data...');
    const mobileactiveData = JSON.parse(fs.readFileSync(CLEANED_DATA_PATH, 'utf8'));
    console.log(`✅ Loaded ${mobileactiveData.length} MobileActive products`);
    
    // Filter valid products (with proper device type detection)
    const validProducts = mobileactiveData.filter(p => 
      p.is_valid && 
      p.device_type !== 'unknown' && 
      p.brand !== 'unknown' && 
      p.service_type !== 'unknown'
    );
    
    console.log(`📋 Valid products for migration: ${validProducts.length}`);
    
    // Analyze data structure
    const analysis = analyzeMobileActiveData(validProducts);
    console.log('\n📊 Data Analysis:');
    console.log(`  Device Types: ${Object.keys(analysis.deviceTypes).join(', ')}`);
    console.log(`  Brands: ${Object.keys(analysis.brands).join(', ')}`);
    console.log(`  Services: ${Object.keys(analysis.services).join(', ')}`);
    console.log(`  Unique Models: ${analysis.uniqueModels.length}`);
    
    // Step 2: Create database schema
    console.log('\n📋 Step 2: Creating database schema...');
    await createDatabaseSchema();
    
    // Step 3: Insert core data based on MobileActive analysis
    console.log('\n📦 Step 3: Inserting core data...');
    await insertCoreData(validProducts, analysis);
    
    // Step 4: Import MobileActive products
    console.log('\n📱 Step 4: Importing MobileActive products...');
    await importMobileActiveProducts(validProducts);
    
    // Step 5: Create device models from MobileActive data
    console.log('\n📱 Step 5: Creating device models...');
    await createDeviceModels(validProducts, analysis);
    
    // Step 6: Create pricing entries
    console.log('\n💰 Step 6: Creating pricing entries...');
    await createPricingEntries(validProducts);
    
    // Step 7: Summary
    console.log('\n📊 FRESH DATABASE SUMMARY');
    console.log('=' .repeat(60));
    await generateSummary();
    
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    console.error(error.stack);
  }
}

function analyzeMobileActiveData(products) {
  const analysis = {
    deviceTypes: {},
    brands: {},
    services: {},
    modelsByBrand: {},
    uniqueModels: [],
    priceRanges: {
      min: Infinity,
      max: 0,
      avg: 0
    }
  };
  
  const prices = [];
  const modelSet = new Set();
  
  products.forEach(product => {
    // Device types
    analysis.deviceTypes[product.device_type] = (analysis.deviceTypes[product.device_type] || 0) + 1;
    
    // Brands
    analysis.brands[product.brand] = (analysis.brands[product.brand] || 0) + 1;
    
    // Services
    analysis.services[product.service_type] = (analysis.services[product.service_type] || 0) + 1;
    
    // Models by brand
    if (!analysis.modelsByBrand[product.brand]) {
      analysis.modelsByBrand[product.brand] = {};
    }
    if (product.model_name && product.model_name !== 'unknown') {
      analysis.modelsByBrand[product.brand][product.model_name] = 
        (analysis.modelsByBrand[product.brand][product.model_name] || 0) + 1;
      
      const modelKey = `${product.brand}-${product.model_name}`;
      modelSet.add(modelKey);
    }
    
    // Price analysis
    if (product.part_price > 0) {
      prices.push(product.part_price);
      analysis.priceRanges.min = Math.min(analysis.priceRanges.min, product.part_price);
      analysis.priceRanges.max = Math.max(analysis.priceRanges.max, product.part_price);
    }
  });
  
  analysis.uniqueModels = Array.from(modelSet);
  analysis.priceRanges.avg = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  
  return analysis;
}

async function createDatabaseSchema() {
  const schemaSQL = `
    -- Drop existing tables if they exist (for fresh start)
    DROP TABLE IF EXISTS dynamic_pricing CASCADE;
    DROP TABLE IF EXISTS device_models CASCADE;
    DROP TABLE IF EXISTS services CASCADE;
    DROP TABLE IF EXISTS brands CASCADE;
    DROP TABLE IF EXISTS pricing_tiers CASCADE;
    DROP TABLE IF EXISTS device_types CASCADE;
    DROP TABLE IF EXISTS mobileactive_products CASCADE;
    DROP TABLE IF EXISTS bookings CASCADE;
    DROP TABLE IF EXISTS service_locations CASCADE;

    -- Device Types
    CREATE TABLE device_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Brands
    CREATE TABLE brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        device_type_id INTEGER REFERENCES device_types(id),
        logo_url VARCHAR(255),
        brand_colors JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Device Models
    CREATE TABLE device_models (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
        device_type_id INTEGER REFERENCES device_types(id),
        image_url VARCHAR(255),
        release_year INTEGER,
        popularity_score DECIMAL(3,2) DEFAULT 0.5,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Services
    CREATE TABLE services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        device_type_id INTEGER REFERENCES device_types(id),
        description TEXT,
        estimated_duration_minutes INTEGER DEFAULT 60,
        warranty_period_days INTEGER DEFAULT 365,
        is_doorstep_eligible BOOLEAN DEFAULT TRUE,
        requires_diagnostics BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Pricing Tiers
    CREATE TABLE pricing_tiers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
        warranty_months INTEGER DEFAULT 6,
        turnaround_hours INTEGER DEFAULT 48,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- MobileActive Products
    CREATE TABLE mobileactive_products (
        id SERIAL PRIMARY KEY,
        mobileactive_id BIGINT UNIQUE NOT NULL,
        product_title VARCHAR(500) NOT NULL,
        brand VARCHAR(50) NOT NULL,
        device_type VARCHAR(50) NOT NULL,
        model_name VARCHAR(100) NOT NULL,
        model_variant VARCHAR(100),
        service_type VARCHAR(50) NOT NULL,
        quality_tier VARCHAR(50) NOT NULL,
        part_cost DECIMAL(10,2) NOT NULL,
        supplier_sku VARCHAR(100),
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT TRUE,
        lead_time_days INTEGER DEFAULT 3,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Dynamic Pricing
    CREATE TABLE dynamic_pricing (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id),
        model_id INTEGER REFERENCES device_models(id),
        pricing_tier_id INTEGER REFERENCES pricing_tiers(id),
        base_price DECIMAL(10,2) NOT NULL,
        discounted_price DECIMAL(10,2),
        cost_price DECIMAL(10,2),
        is_active BOOLEAN DEFAULT TRUE,
        valid_from TIMESTAMP DEFAULT NOW(),
        valid_until TIMESTAMP DEFAULT (NOW() + INTERVAL '1 year'),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(service_id, model_id, pricing_tier_id)
    );

    -- Service Locations
    CREATE TABLE service_locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        postal_code VARCHAR(10) UNIQUE NOT NULL,
        city VARCHAR(100) NOT NULL,
        province VARCHAR(50) NOT NULL,
        price_adjustment_percentage DECIMAL(5,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Bookings
    CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        booking_reference VARCHAR(20) UNIQUE NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        device_type VARCHAR(50) NOT NULL,
        brand VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        service VARCHAR(50) NOT NULL,
        pricing_tier VARCHAR(50) NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        final_price DECIMAL(10,2) NOT NULL,
        customer_address TEXT,
        postal_code VARCHAR(10),
        preferred_date DATE,
        preferred_time_slot VARCHAR(20),
        special_instructions TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Indexes
    CREATE INDEX idx_device_types_active ON device_types(is_active);
    CREATE INDEX idx_brands_device_type ON brands(device_type_id, is_active);
    CREATE INDEX idx_device_models_brand ON device_models(brand_id, is_active);
    CREATE INDEX idx_device_models_device_type ON device_models(device_type_id, is_active);
    CREATE INDEX idx_services_device_type ON services(device_type_id, is_active);
    CREATE INDEX idx_pricing_tiers_active ON pricing_tiers(is_active);
    CREATE INDEX idx_mobileactive_brand_model ON mobileactive_products(brand, model_name);
    CREATE INDEX idx_dynamic_pricing_lookup ON dynamic_pricing(model_id, service_id, pricing_tier_id, is_active);
    CREATE INDEX idx_service_locations_postal_code ON service_locations(postal_code);
    CREATE INDEX idx_bookings_email ON bookings(customer_email);

    -- Triggers
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_device_types_updated_at BEFORE UPDATE ON device_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_device_models_updated_at BEFORE UPDATE ON device_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_mobileactive_products_updated_at BEFORE UPDATE ON mobileactive_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_dynamic_pricing_updated_at BEFORE UPDATE ON dynamic_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_service_locations_updated_at BEFORE UPDATE ON service_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;
  
  // Execute schema creation
  const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL });
  
  if (schemaError) {
    console.error('Error creating schema:', schemaError);
    throw new Error('Failed to create database schema');
  } else {
    console.log('✅ Schema created successfully');
  }
}

async function insertCoreData(products, analysis) {
  // Device Types (based on MobileActive data)
  const deviceTypes = Object.keys(analysis.deviceTypes).map((type, index) => ({
    id: index + 1,
    name: type,
    display_name: type.charAt(0).toUpperCase() + type.slice(1),
    is_active: true,
    sort_order: index + 1
  }));
  
  await supabase.from('device_types').insert(deviceTypes);
  console.log(`✅ Inserted ${deviceTypes.length} device types`);
  
  // Brands (based on MobileActive data)
  const brands = [];
  let brandId = 1;
  
  Object.keys(analysis.brands).forEach(brandName => {
    // Determine device type for this brand (use most common)
    const brandProducts = products.filter(p => p.brand === brandName);
    const deviceTypeCounts = {};
    brandProducts.forEach(p => {
      deviceTypeCounts[p.device_type] = (deviceTypeCounts[p.device_type] || 0) + 1;
    });
    const primaryDeviceType = Object.keys(deviceTypeCounts).reduce((a, b) => 
      deviceTypeCounts[a] > deviceTypeCounts[b] ? a : b
    );
    
    const deviceTypeId = deviceTypes.find(dt => dt.name === primaryDeviceType)?.id || 1;
    
    brands.push({
      id: brandId,
      name: brandName,
      display_name: brandName.charAt(0).toUpperCase() + brandName.slice(1),
      device_type_id: deviceTypeId,
      logo_url: `/images/brands/${brandName}.svg`,
      brand_colors: getBrandColors(brandName),
      is_active: true,
      sort_order: brandId
    });
    brandId++;
  });
  
  await supabase.from('brands').insert(brands);
  console.log(`✅ Inserted ${brands.length} brands`);
  
  // Services (based on MobileActive data)
  const services = [];
  let serviceId = 1;
  
  Object.keys(analysis.services).forEach(serviceName => {
    // Determine device type for this service (use most common)
    const serviceProducts = products.filter(p => p.service_type === serviceName);
    const deviceTypeCounts = {};
    serviceProducts.forEach(p => {
      deviceTypeCounts[p.device_type] = (deviceTypeCounts[p.device_type] || 0) + 1;
    });
    const primaryDeviceType = Object.keys(deviceTypeCounts).reduce((a, b) => 
      deviceTypeCounts[a] > deviceTypeCounts[b] ? a : b
    );
    
    const deviceTypeId = deviceTypes.find(dt => dt.name === primaryDeviceType)?.id || 1;
    
    services.push({
      id: serviceId,
      name: serviceName,
      display_name: serviceName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      device_type_id: deviceTypeId,
      description: getServiceDescription(serviceName),
      estimated_duration_minutes: getServiceDuration(serviceName),
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: getServiceRequiresDiagnostics(serviceName),
      is_active: true,
      sort_order: serviceId
    });
    serviceId++;
  });
  
  await supabase.from('services').insert(services);
  console.log(`✅ Inserted ${services.length} services`);
  
  // Pricing Tiers
  await supabase.from('pricing_tiers').insert([
    { id: 1, name: 'economy', display_name: 'Economy', multiplier: 0.8, warranty_months: 3, turnaround_hours: 72, is_active: true, sort_order: 1 },
    { id: 2, name: 'standard', display_name: 'Standard', multiplier: 1.0, warranty_months: 6, turnaround_hours: 48, is_active: true, sort_order: 2 },
    { id: 3, name: 'premium', display_name: 'Premium', multiplier: 1.25, warranty_months: 12, turnaround_hours: 24, is_active: true, sort_order: 3 },
    { id: 4, name: 'express', display_name: 'Express', multiplier: 1.5, warranty_months: 6, turnaround_hours: 12, is_active: true, sort_order: 4 }
  ]);
  console.log('✅ Inserted pricing tiers');
  
  // Service Locations (Lower Mainland)
  await supabase.from('service_locations').insert([
    { name: 'Vancouver', postal_code: 'V6B', city: 'Vancouver', province: 'BC', price_adjustment_percentage: 5.00, is_active: true },
    { name: 'Burnaby', postal_code: 'V5H', city: 'Burnaby', province: 'BC', price_adjustment_percentage: 0.00, is_active: true },
    { name: 'Surrey', postal_code: 'V3T', city: 'Surrey', province: 'BC', price_adjustment_percentage: 0.00, is_active: true },
    { name: 'Richmond', postal_code: 'V6X', city: 'Richmond', province: 'BC', price_adjustment_percentage: 3.00, is_active: true },
    { name: 'Coquitlam', postal_code: 'V3K', city: 'Coquitlam', province: 'BC', price_adjustment_percentage: 0.00, is_active: true },
    { name: 'North Vancouver', postal_code: 'V7M', city: 'North Vancouver', province: 'BC', price_adjustment_percentage: 2.00, is_active: true },
    { name: 'West Vancouver', postal_code: 'V7V', city: 'West Vancouver', province: 'BC', price_adjustment_percentage: 5.00, is_active: true },
    { name: 'New Westminster', postal_code: 'V3L', city: 'New Westminster', province: 'BC', price_adjustment_percentage: 0.00, is_active: true },
    { name: 'Delta', postal_code: 'V4K', city: 'Delta', province: 'BC', price_adjustment_percentage: 0.00, is_active: true },
    { name: 'Langley', postal_code: 'V2Y', city: 'Langley', province: 'BC', price_adjustment_percentage: 0.00, is_active: true }
  ]);
  console.log('✅ Inserted service locations');
}

async function importMobileActiveProducts(products) {
  const mobileactiveProducts = products.map((product, index) => ({
    mobileactive_id: product.product_id || (index + 1000000),
    product_title: product.product_title,
    brand: product.brand,
    device_type: product.device_type,
    model_name: product.model_name || 'Unknown',
    model_variant: null,
    service_type: product.service_type,
    quality_tier: 'standard', // Default to standard
    part_cost: product.part_price,
    supplier_sku: product.sku,
    image_url: product.image_url,
    is_available: true,
    lead_time_days: 3
  }));
  
  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < mobileactiveProducts.length; i += batchSize) {
    const batch = mobileactiveProducts.slice(i, i + batchSize);
    await supabase.from('mobileactive_products').insert(batch);
    console.log(`✓ Inserted MobileActive batch ${Math.floor(i/batchSize) + 1} (${batch.length} products)`);
  }
  
  console.log(`✅ Imported ${mobileactiveProducts.length} MobileActive products`);
}

async function createDeviceModels(products, analysis) {
  const models = [];
  let modelId = 1;
  
  // Get brands mapping
  const { data: brands } = await supabase.from('brands').select('id, name, device_type_id');
  const brandMap = new Map(brands.map(b => [b.name, b]));
  
  // Get device types mapping
  const { data: deviceTypes } = await supabase.from('device_types').select('id, name');
  const deviceTypeMap = new Map(deviceTypes.map(dt => [dt.name, dt]));
  
  // Create models from MobileActive data
  Object.keys(analysis.modelsByBrand).forEach(brandName => {
    const brand = brandMap.get(brandName);
    if (!brand) return;
    
    Object.keys(analysis.modelsByBrand[brandName]).forEach(modelName => {
      if (modelName === 'unknown') return;
      
      // Determine device type for this model
      const modelProducts = products.filter(p => 
        p.brand === brandName && p.model_name === modelName
      );
      const deviceTypeCounts = {};
      modelProducts.forEach(p => {
        deviceTypeCounts[p.device_type] = (deviceTypeCounts[p.device_type] || 0) + 1;
      });
      const primaryDeviceType = Object.keys(deviceTypeCounts).reduce((a, b) => 
        deviceTypeCounts[a] > deviceTypeCounts[b] ? a : b
      );
      
      const deviceTypeId = deviceTypeMap.get(primaryDeviceType)?.id || brand.device_type_id;
      
      models.push({
        id: modelId,
        name: modelName,
        display_name: modelName,
        brand_id: brand.id,
        device_type_id: deviceTypeId,
        image_url: null,
        release_year: null,
        popularity_score: 0.5,
        is_featured: false,
        is_active: true,
        sort_order: modelId
      });
      modelId++;
    });
  });
  
  // Insert models in batches
  const batchSize = 50;
  for (let i = 0; i < models.length; i += batchSize) {
    const batch = models.slice(i, i + batchSize);
    await supabase.from('device_models').insert(batch);
    console.log(`✓ Inserted models batch ${Math.floor(i/batchSize) + 1} (${batch.length} models)`);
  }
  
  console.log(`✅ Created ${models.length} device models`);
}

async function createPricingEntries(products) {
  // Get mappings
  const { data: services } = await supabase.from('services').select('id, name');
  const { data: models } = await supabase.from('device_models').select('id, name, brand_id, brands(name)');
  const { data: tiers } = await supabase.from('pricing_tiers').select('id, name, multiplier');
  
  const serviceMap = new Map(services.map(s => [s.name, s]));
  const modelMap = new Map(models.map(m => [`${m.brands.name}-${m.name}`, m]));
  const tierMap = new Map(tiers.map(t => [t.name, t]));
  
  const pricingEntries = [];
  
  // Create pricing for each product
  products.forEach(product => {
    const service = serviceMap.get(product.service_type);
    const modelKey = `${product.brand}-${product.model_name}`;
    const model = modelMap.get(modelKey);
    
    if (service && model && product.part_price > 0) {
      // Create pricing for all tiers
      tiers.forEach(tier => {
        const basePrice = Math.round(product.part_price * tier.multiplier);
        
        pricingEntries.push({
          service_id: service.id,
          model_id: model.id,
          pricing_tier_id: tier.id,
          base_price: basePrice,
          cost_price: product.part_price,
          is_active: true
        });
      });
    }
  });
  
  // Insert pricing entries in batches
  const batchSize = 100;
  for (let i = 0; i < pricingEntries.length; i += batchSize) {
    const batch = pricingEntries.slice(i, i + batchSize);
    await supabase.from('dynamic_pricing').insert(batch);
    console.log(`✓ Inserted pricing batch ${Math.floor(i/batchSize) + 1} (${batch.length} entries)`);
  }
  
  console.log(`✅ Created ${pricingEntries.length} pricing entries`);
}

function getBrandColors(brandName) {
  const colors = {
    apple: { primary: "#000000", secondary: "#007AFF" },
    samsung: { primary: "#1428A0", secondary: "#000000" },
    google: { primary: "#4285F4", secondary: "#34A853" },
    huawei: { primary: "#C7000B", secondary: "#000000" },
    oneplus: { primary: "#FF0000", secondary: "#000000" },
    xiaomi: { primary: "#FF6700", secondary: "#000000" },
    asus: { primary: "#000000", secondary: "#FF0000" }
  };
  return colors[brandName] || { primary: "#000000", secondary: "#666666" };
}

function getServiceDescription(serviceName) {
  const descriptions = {
    screen_replacement: 'Professional screen replacement service with quality parts',
    battery_replacement: 'Battery replacement with genuine or high-quality aftermarket batteries',
    charging_port_repair: 'Repair or replacement of charging ports and connectors',
    camera_repair: 'Camera module repair and replacement services',
    speaker_repair: 'Speaker and microphone repair services',
    microphone_repair: 'Microphone repair and replacement services',
    back_cover_replacement: 'Back cover replacement and repair services'
  };
  return descriptions[serviceName] || 'Professional repair service';
}

function getServiceDuration(serviceName) {
  const durations = {
    screen_replacement: 60,
    battery_replacement: 45,
    charging_port_repair: 90,
    camera_repair: 75,
    speaker_repair: 60,
    microphone_repair: 45,
    back_cover_replacement: 30
  };
  return durations[serviceName] || 60;
}

function getServiceRequiresDiagnostics(serviceName) {
  const requiresDiagnostics = [
    'charging_port_repair',
    'camera_repair',
    'microphone_repair'
  ];
  return requiresDiagnostics.includes(serviceName);
}

async function generateSummary() {
  const { data: models } = await supabase.from('device_models').select('id', { count: 'exact' });
  const { data: pricing } = await supabase.from('dynamic_pricing').select('id', { count: 'exact' });
  const { data: products } = await supabase.from('mobileactive_products').select('id', { count: 'exact' });
  const { data: brands } = await supabase.from('brands').select('id', { count: 'exact' });
  const { data: services } = await supabase.from('services').select('id', { count: 'exact' });
  
  console.log(`\n✅ Fresh Database Complete!`);
  console.log(`  Device Models: ${models?.length || 0}`);
  console.log(`  Pricing Entries: ${pricing?.length || 0}`);
  console.log(`  MobileActive Products: ${products?.length || 0}`);
  console.log(`  Brands: ${brands?.length || 0}`);
  console.log(`  Services: ${services?.length || 0}`);
  
  console.log(`\n🎉 Fresh database is ready!`);
  console.log(`  - Complete schema with business logic`);
  console.log(`  - All device types supported (Mobile, Laptop, Tablet)`);
  console.log(`  - Real MobileActive supplier data integration`);
  console.log(`  - Professional pricing structure`);
  console.log(`  - Ready for enhanced UI/UX`);
  
  console.log(`\n📊 Database URL: https://vrsavtcofatvrvvfglrt.supabase.co`);
  console.log(`🔑 Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyc2F2dGNvZmF0dnJ2dmZnbHJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTUxODQyMywiZXhwIjoyMDY3MDk0NDIzfQ.mi1uR6frYoK1Bbd-lWcxmsEPR-Uln-1t7XIaPJi6hdM`);
}

// Run the migration
createFreshDatabaseMigration();
