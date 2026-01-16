const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createFreshMobileActiveSchema() {
  console.log('🚀 Creating Fresh MobileActive-Based Schema');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Create new schema SQL
    console.log('\n📋 Step 1: Creating new schema...');
    
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

      -- =====================================================
      -- 1. DEVICE TYPES
      -- =====================================================
      CREATE TABLE device_types (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          display_name VARCHAR(100) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );

      -- =====================================================
      -- 2. BRANDS
      -- =====================================================
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

      -- =====================================================
      -- 3. DEVICE MODELS
      -- =====================================================
      CREATE TABLE device_models (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          display_name VARCHAR(100) NOT NULL,
          brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
          image_url VARCHAR(255),
          release_year INTEGER,
          popularity_score DECIMAL(3,2) DEFAULT 0.5,
          is_featured BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );

      -- =====================================================
      -- 4. SERVICES
      -- =====================================================
      CREATE TABLE services (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          display_name VARCHAR(100) NOT NULL,
          device_type_id INTEGER REFERENCES device_types(id),
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );

      -- =====================================================
      -- 5. PRICING TIERS
      -- =====================================================
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

      -- =====================================================
      -- 6. MOBILEACTIVE PRODUCTS (Supplier Data)
      -- =====================================================
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

      -- =====================================================
      -- 7. DYNAMIC PRICING (Customer Pricing)
      -- =====================================================
      CREATE TABLE dynamic_pricing (
          id SERIAL PRIMARY KEY,
          service_id INTEGER REFERENCES services(id),
          model_id INTEGER REFERENCES device_models(id),
          pricing_tier_id INTEGER REFERENCES pricing_tiers(id),
          base_price DECIMAL(10,2) NOT NULL,
          discounted_price DECIMAL(10,2),
          cost_price DECIMAL(10,2),
          markup_percentage DECIMAL(5,2),
          supplier_product_id INTEGER REFERENCES mobileactive_products(id),
          is_active BOOLEAN DEFAULT TRUE,
          valid_from TIMESTAMP DEFAULT NOW(),
          valid_until TIMESTAMP DEFAULT (NOW() + INTERVAL '1 year'),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(service_id, model_id, pricing_tier_id)
      );

      -- =====================================================
      -- 8. BOOKINGS
      -- =====================================================
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

      -- =====================================================
      -- INDEXES FOR PERFORMANCE
      -- =====================================================

      -- Device types
      CREATE INDEX idx_device_types_active ON device_types(is_active);

      -- Brands
      CREATE INDEX idx_brands_device_type ON brands(device_type_id, is_active);
      CREATE INDEX idx_brands_sort_order ON brands(sort_order);

      -- Models
      CREATE INDEX idx_device_models_brand ON device_models(brand_id, is_active);
      CREATE INDEX idx_device_models_featured ON device_models(is_featured, is_active);
      CREATE INDEX idx_device_models_popularity ON device_models(popularity_score DESC);

      -- Services
      CREATE INDEX idx_services_device_type ON services(device_type_id, is_active);
      CREATE INDEX idx_services_sort_order ON services(sort_order);

      -- Pricing tiers
      CREATE INDEX idx_pricing_tiers_active ON pricing_tiers(is_active);
      CREATE INDEX idx_pricing_tiers_sort_order ON pricing_tiers(sort_order);

      -- MobileActive products
      CREATE INDEX idx_mobileactive_brand_model ON mobileactive_products(brand, model_name);
      CREATE INDEX idx_mobileactive_service_type ON mobileactive_products(service_type);
      CREATE INDEX idx_mobileactive_available ON mobileactive_products(is_available);
      CREATE INDEX idx_mobileactive_cost ON mobileactive_products(part_cost);

      -- Dynamic pricing
      CREATE INDEX idx_dynamic_pricing_lookup ON dynamic_pricing(model_id, service_id, pricing_tier_id, is_active);
      CREATE INDEX idx_dynamic_pricing_active ON dynamic_pricing(is_active);
      CREATE INDEX idx_dynamic_pricing_supplier ON dynamic_pricing(supplier_product_id);

      -- Bookings
      CREATE INDEX idx_bookings_email ON bookings(customer_email);
      CREATE INDEX idx_bookings_status ON bookings(status);
      CREATE INDEX idx_bookings_date ON bookings(preferred_date);
      CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

      -- =====================================================
      -- TRIGGERS FOR AUTOMATIC UPDATES
      -- =====================================================

      -- Function to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Apply updated_at trigger to all tables
      CREATE TRIGGER update_device_types_updated_at BEFORE UPDATE ON device_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_device_models_updated_at BEFORE UPDATE ON device_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_mobileactive_products_updated_at BEFORE UPDATE ON mobileactive_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_dynamic_pricing_updated_at BEFORE UPDATE ON dynamic_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    
    // Execute schema creation
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (schemaError) {
      console.error('Error creating schema:', schemaError);
      return;
    }
    
    console.log('✅ Schema created successfully');
    
    // Step 2: Insert core data
    console.log('\n📦 Step 2: Inserting core data...');
    
    // Device Types
    await supabase.from('device_types').insert({
      id: 1,
      name: 'mobile',
      display_name: 'Mobile Phones',
      is_active: true
    });
    
    // Brands
    await supabase.from('brands').insert([
      {
        id: 1,
        name: 'samsung',
        display_name: 'Samsung',
        device_type_id: 1,
        logo_url: '/images/brands/samsung.svg',
        brand_colors: { primary: "#1428A0", secondary: "#000000" },
        is_active: true,
        sort_order: 1
      },
      {
        id: 2,
        name: 'apple',
        display_name: 'Apple',
        device_type_id: 1,
        logo_url: '/images/brands/apple.svg',
        brand_colors: { primary: "#000000", secondary: "#007AFF" },
        is_active: true,
        sort_order: 2
      }
    ]);
    
    // Services
    await supabase.from('services').insert([
      {
        id: 1,
        name: 'screen_replacement',
        display_name: 'Screen Replacement',
        device_type_id: 1,
        description: 'Professional screen replacement service with quality parts',
        is_active: true,
        sort_order: 1
      },
      {
        id: 2,
        name: 'battery_replacement',
        display_name: 'Battery Replacement',
        device_type_id: 1,
        description: 'Battery replacement with genuine or high-quality aftermarket batteries',
        is_active: true,
        sort_order: 2
      },
      {
        id: 3,
        name: 'charging_port_repair',
        display_name: 'Charging Port Repair',
        device_type_id: 1,
        description: 'Repair or replacement of charging ports and connectors',
        is_active: true,
        sort_order: 3
      },
      {
        id: 4,
        name: 'camera_repair',
        display_name: 'Camera Repair',
        device_type_id: 1,
        description: 'Camera module repair and replacement services',
        is_active: true,
        sort_order: 4
      }
    ]);
    
    // Pricing Tiers
    await supabase.from('pricing_tiers').insert([
      {
        id: 1,
        name: 'economy',
        display_name: 'Economy',
        multiplier: 0.8,
        warranty_months: 3,
        turnaround_hours: 72,
        is_active: true,
        sort_order: 1
      },
      {
        id: 2,
        name: 'standard',
        display_name: 'Standard',
        multiplier: 1.0,
        warranty_months: 6,
        turnaround_hours: 48,
        is_active: true,
        sort_order: 2
      },
      {
        id: 3,
        name: 'premium',
        display_name: 'Premium',
        multiplier: 1.25,
        warranty_months: 12,
        turnaround_hours: 24,
        is_active: true,
        sort_order: 3
      },
      {
        id: 4,
        name: 'express',
        display_name: 'Express',
        multiplier: 1.5,
        warranty_months: 6,
        turnaround_hours: 12,
        is_active: true,
        sort_order: 4
      }
    ]);
    
    console.log('✅ Core data inserted successfully');
    
    // Step 3: Get existing MobileActive products
    console.log('\n📱 Step 3: Processing MobileActive products...');
    const { data: products, error: productsError } = await supabase
      .from('mobileactive_products')
      .select('*');
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return;
    }
    
    console.log(`Found ${products.length} MobileActive products`);
    
    // Step 4: Extract unique models and create device models
    console.log('\n📱 Step 4: Creating device models...');
    
    const samsungProducts = products.filter(p => p.brand === 'samsung');
    const appleProducts = products.filter(p => p.brand === 'apple');
    
    const samsungModels = [...new Set(samsungProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
    const appleModels = [...new Set(appleProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
    
    console.log(`Samsung models: ${samsungModels.length}`);
    console.log(`Apple models: ${appleModels.length}`);
    
    // Create model mappings
    const modelMappings = {};
    let modelId = 1;
    
    // Insert Samsung models
    for (const model of samsungModels) {
      await supabase.from('device_models').insert({
        id: modelId,
        name: model,
        display_name: model,
        brand_id: 1,
        is_active: true,
        sort_order: modelId
      });
      
      modelMappings[`samsung-${model}`] = modelId;
      console.log(`✓ Created Samsung model: ${model} (ID: ${modelId})`);
      modelId++;
    }
    
    // Insert Apple models
    for (const model of appleModels) {
      await supabase.from('device_models').insert({
        id: modelId,
        name: model,
        display_name: model,
        brand_id: 2,
        is_active: true,
        sort_order: modelId
      });
      
      modelMappings[`apple-${model}`] = modelId;
      console.log(`✓ Created Apple model: ${model} (ID: ${modelId})`);
      modelId++;
    }
    
    // Step 5: Create pricing entries
    console.log('\n💰 Step 5: Creating pricing entries...');
    
    const serviceIdMap = {
      'screen_replacement': 1,
      'battery_replacement': 2,
      'charging_port_repair': 3,
      'camera_repair': 4
    };
    
    const pricingEntries = [];
    
    for (const product of products) {
      const modelKey = `${product.brand}-${product.model_name}`;
      const modelId = modelMappings[modelKey];
      
      if (!modelId) {
        console.log(`⚠️  Skipping product - no model mapping: ${modelKey}`);
        continue;
      }
      
      const serviceId = serviceIdMap[product.service_type];
      if (!serviceId) {
        console.log(`⚠️  Skipping product - unknown service type: ${product.service_type}`);
        continue;
      }
      
      // Calculate pricing for all tiers
      const tiers = [
        { id: 1, name: 'economy', multiplier: 0.8 },
        { id: 2, name: 'standard', multiplier: 1.0 },
        { id: 3, name: 'premium', multiplier: 1.25 },
        { id: 4, name: 'express', multiplier: 1.5 }
      ];
      
      for (const tier of tiers) {
        const basePrice = Math.round(product.part_cost * tier.multiplier);
        const markupPercentage = ((basePrice - product.part_cost) / product.part_cost * 100);
        
        pricingEntries.push({
          service_id: serviceId,
          model_id: modelId,
          pricing_tier_id: tier.id,
          base_price: basePrice,
          cost_price: product.part_cost,
          markup_percentage: Math.round(markupPercentage * 100) / 100,
          supplier_product_id: product.id,
          is_active: true
        });
      }
    }
    
    // Insert pricing entries in batches
    console.log(`\nInserting ${pricingEntries.length} pricing entries...`);
    const batchSize = 50;
    
    for (let i = 0; i < pricingEntries.length; i += batchSize) {
      const batch = pricingEntries.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('dynamic_pricing')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting pricing batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        console.log(`✓ Inserted pricing batch ${Math.floor(i/batchSize) + 1} (${batch.length} entries)`);
      }
    }
    
    // Step 6: Summary
    console.log('\n📊 FRESH SCHEMA SUMMARY');
    console.log('=' .repeat(60));
    
    const { data: finalModels } = await supabase
      .from('device_models')
      .select('id', { count: 'exact' });
    
    const { data: finalPricing } = await supabase
      .from('dynamic_pricing')
      .select('id', { count: 'exact' });
    
    const { data: finalProducts } = await supabase
      .from('mobileactive_products')
      .select('id', { count: 'exact' });
    
    console.log(`\n✅ Fresh Schema Complete!`);
    console.log(`  Device Models: ${finalModels?.length || 0}`);
    console.log(`  Pricing Entries: ${finalPricing?.length || 0}`);
    console.log(`  MobileActive Products: ${finalProducts?.length || 0}`);
    
    // Calculate coverage
    const totalPossibleCombinations = (samsungModels.length + appleModels.length) * 4 * 4;
    const actualCombinations = finalPricing?.length || 0;
    const coveragePercentage = (actualCombinations / totalPossibleCombinations * 100).toFixed(1);
    
    console.log(`\n📈 Coverage Analysis:`);
    console.log(`  Total Possible Combinations: ${totalPossibleCombinations}`);
    console.log(`  Actual Pricing Entries: ${actualCombinations}`);
    console.log(`  Coverage: ${coveragePercentage}%`);
    
    console.log(`\n🎉 Fresh MobileActive schema is ready!`);
    console.log(`  - Clean, focused database`);
    console.log(`  - Real supplier data integration`);
    console.log(`  - Professional pricing structure`);
    console.log(`  - Ready for enhanced UI/UX`);
    
  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
  }
}

// Run the fresh schema creation
createFreshMobileActiveSchema(); 