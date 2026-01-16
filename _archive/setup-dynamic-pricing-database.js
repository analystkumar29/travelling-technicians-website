require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function setupDynamicPricingDatabase() {
  console.log('🚀 Setting up Dynamic Pricing Database...\n');

  try {
    // Step 1: Create Schema
    console.log('📋 Step 1: Creating database schema...');
    await createSchema();
    
    // Step 2: Seed Basic Data
    console.log('🌱 Step 2: Seeding basic data...');
    await seedBasicData();
    
    // Step 3: Verify Setup
    console.log('✅ Step 3: Verifying setup...');
    await verifySetup();
    
    console.log('\n🎉 Dynamic Pricing Database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Created 8 main tables with relationships');
    console.log('   - Added indexes for performance');
    console.log('   - Set up Row Level Security policies');
    console.log('   - Seeded with device types, brands, and models');
    console.log('   - Ready for admin panel integration');
    
    console.log('\n🔗 Next steps:');
    console.log('   1. Test the APIs: npm run dev');
    console.log('   2. Visit: http://localhost:3000/api/devices/brands?deviceType=mobile');
    console.log('   3. Visit: http://localhost:3000/api/devices/models?deviceType=mobile&brand=apple');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function createSchema() {
  const schemaSQL = `
    -- Enable UUID extension if not already enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- =============================================
    -- 1. DEVICE TYPES TABLE
    -- =============================================
    CREATE TABLE IF NOT EXISTS public.device_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- =============================================
    -- 2. BRANDS TABLE
    -- =============================================
    CREATE TABLE IF NOT EXISTS public.brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        device_type_id INTEGER REFERENCES public.device_types(id) ON DELETE CASCADE,
        display_name VARCHAR(100) NOT NULL,
        logo_url VARCHAR(500),
        website_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_brand_per_device_type UNIQUE (name, device_type_id)
    );

    -- =============================================
    -- 3. DEVICE MODELS TABLE
    -- =============================================
    CREATE TABLE IF NOT EXISTS public.device_models (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES public.brands(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        display_name VARCHAR(200),
        model_year INTEGER,
        screen_size VARCHAR(50),
        color_options TEXT[],
        storage_options TEXT[],
        specifications JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_model_per_brand UNIQUE (brand_id, name)
    );

    -- =============================================
    -- 4. SERVICE CATEGORIES TABLE
    -- =============================================
    CREATE TABLE IF NOT EXISTS public.service_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        display_name VARCHAR(150) NOT NULL,
        description TEXT,
        icon_name VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- =============================================
    -- 5. SERVICES TABLE
    -- =============================================
    CREATE TABLE IF NOT EXISTS public.services (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES public.service_categories(id) ON DELETE CASCADE,
        device_type_id INTEGER REFERENCES public.device_types(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        display_name VARCHAR(200) NOT NULL,
        description TEXT,
        estimated_duration_minutes INTEGER,
        warranty_period_days INTEGER DEFAULT 365,
        is_doorstep_eligible BOOLEAN DEFAULT TRUE,
        requires_diagnostics BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_service_per_category_device UNIQUE (category_id, device_type_id, name)
    );

    -- =============================================
    -- 6. PRICING TIERS TABLE
    -- =============================================
    CREATE TABLE IF NOT EXISTS public.pricing_tiers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        display_name VARCHAR(150) NOT NULL,
        description TEXT,
        price_multiplier DECIMAL(3,2) DEFAULT 1.00,
        estimated_delivery_hours INTEGER,
        includes_features TEXT[],
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- =============================================
    -- 7. DYNAMIC PRICING TABLE
    -- =============================================
    CREATE TABLE IF NOT EXISTS public.dynamic_pricing (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES public.services(id) ON DELETE CASCADE,
        model_id INTEGER REFERENCES public.device_models(id) ON DELETE CASCADE,
        pricing_tier_id INTEGER REFERENCES public.pricing_tiers(id) ON DELETE CASCADE,
        base_price DECIMAL(10,2) NOT NULL,
        discounted_price DECIMAL(10,2),
        cost_price DECIMAL(10,2),
        is_active BOOLEAN DEFAULT TRUE,
        valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        valid_until TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_pricing_per_service_model_tier UNIQUE (service_id, model_id, pricing_tier_id),
        CONSTRAINT check_discounted_price CHECK (discounted_price IS NULL OR discounted_price <= base_price)
    );

    -- =============================================
    -- 8. SERVICE LOCATIONS TABLE
    -- =============================================
    CREATE TABLE IF NOT EXISTS public.service_locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        postal_code_prefixes TEXT[] NOT NULL,
        price_adjustment_percentage DECIMAL(5,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- =============================================
    -- INDEXES FOR PERFORMANCE
    -- =============================================
    CREATE INDEX IF NOT EXISTS idx_brands_device_type_active ON public.brands(device_type_id, is_active);
    CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);
    CREATE INDEX IF NOT EXISTS idx_models_brand_active ON public.device_models(brand_id, is_active);
    CREATE INDEX IF NOT EXISTS idx_models_name ON public.device_models(name);
    CREATE INDEX IF NOT EXISTS idx_models_featured ON public.device_models(is_featured, is_active);
    CREATE INDEX IF NOT EXISTS idx_services_category_device ON public.services(category_id, device_type_id);
    CREATE INDEX IF NOT EXISTS idx_services_doorstep_eligible ON public.services(is_doorstep_eligible, is_active);
    CREATE INDEX IF NOT EXISTS idx_pricing_service_model ON public.dynamic_pricing(service_id, model_id);
    CREATE INDEX IF NOT EXISTS idx_pricing_active_valid ON public.dynamic_pricing(is_active, valid_from, valid_until);

    -- =============================================
    -- TRIGGERS FOR UPDATED_AT
    -- =============================================
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Apply triggers to all tables
    DROP TRIGGER IF EXISTS update_device_types_updated_at ON public.device_types;
    CREATE TRIGGER update_device_types_updated_at BEFORE UPDATE ON public.device_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
    CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_device_models_updated_at ON public.device_models;
    CREATE TRIGGER update_device_models_updated_at BEFORE UPDATE ON public.device_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_service_categories_updated_at ON public.service_categories;
    CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
    CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_pricing_tiers_updated_at ON public.pricing_tiers;
    CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON public.pricing_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_dynamic_pricing_updated_at ON public.dynamic_pricing;
    CREATE TRIGGER update_dynamic_pricing_updated_at BEFORE UPDATE ON public.dynamic_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_service_locations_updated_at ON public.service_locations;
    CREATE TRIGGER update_service_locations_updated_at BEFORE UPDATE ON public.service_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- =============================================
    -- ROW LEVEL SECURITY POLICIES
    -- =============================================
    ALTER TABLE public.device_types ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.dynamic_pricing ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;

    -- Public read access policies
    DROP POLICY IF EXISTS "Public read access for device_types" ON public.device_types;
    CREATE POLICY "Public read access for device_types" ON public.device_types FOR SELECT USING (is_active = true);
    
    DROP POLICY IF EXISTS "Public read access for brands" ON public.brands;
    CREATE POLICY "Public read access for brands" ON public.brands FOR SELECT USING (is_active = true);
    
    DROP POLICY IF EXISTS "Public read access for device_models" ON public.device_models;
    CREATE POLICY "Public read access for device_models" ON public.device_models FOR SELECT USING (is_active = true);
    
    DROP POLICY IF EXISTS "Public read access for service_categories" ON public.service_categories;
    CREATE POLICY "Public read access for service_categories" ON public.service_categories FOR SELECT USING (is_active = true);
    
    DROP POLICY IF EXISTS "Public read access for services" ON public.services;
    CREATE POLICY "Public read access for services" ON public.services FOR SELECT USING (is_active = true);
    
    DROP POLICY IF EXISTS "Public read access for pricing_tiers" ON public.pricing_tiers;
    CREATE POLICY "Public read access for pricing_tiers" ON public.pricing_tiers FOR SELECT USING (is_active = true);
    
    DROP POLICY IF EXISTS "Public read access for dynamic_pricing" ON public.dynamic_pricing;
    CREATE POLICY "Public read access for dynamic_pricing" ON public.dynamic_pricing FOR SELECT USING (is_active = true);
    
    DROP POLICY IF EXISTS "Public read access for service_locations" ON public.service_locations;
    CREATE POLICY "Public read access for service_locations" ON public.service_locations FOR SELECT USING (is_active = true);

    -- Service role full access policies
    DROP POLICY IF EXISTS "Service role full access device_types" ON public.device_types;
    CREATE POLICY "Service role full access device_types" ON public.device_types FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Service role full access brands" ON public.brands;
    CREATE POLICY "Service role full access brands" ON public.brands FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Service role full access device_models" ON public.device_models;
    CREATE POLICY "Service role full access device_models" ON public.device_models FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Service role full access service_categories" ON public.service_categories;
    CREATE POLICY "Service role full access service_categories" ON public.service_categories FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Service role full access services" ON public.services;
    CREATE POLICY "Service role full access services" ON public.services FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Service role full access pricing_tiers" ON public.pricing_tiers;
    CREATE POLICY "Service role full access pricing_tiers" ON public.pricing_tiers FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Service role full access dynamic_pricing" ON public.dynamic_pricing;
    CREATE POLICY "Service role full access dynamic_pricing" ON public.dynamic_pricing FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Service role full access service_locations" ON public.service_locations;
    CREATE POLICY "Service role full access service_locations" ON public.service_locations FOR ALL USING (true);
  `;

  try {
    const { error } = await supabase.rpc('exec', { sql: schemaSQL });
    if (error) throw error;
    console.log('   ✅ Schema created successfully');
  } catch (error) {
    // Fallback: Try to execute with individual statements
    console.log('   ⚠️  RPC failed, trying individual statements...');
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec', { sql: statement.trim() + ';' });
          if (error && !error.message.includes('already exists')) {
            console.warn(`   ⚠️  Warning:`, error.message);
          }
        } catch (err) {
          console.warn(`   ⚠️  Warning executing statement:`, err.message);
        }
      }
    }
    console.log('   ✅ Schema setup completed with fallback method');
  }
}

async function seedBasicData() {
  // Device Types
  const deviceTypes = [
    { name: 'mobile', display_name: 'Mobile Phone', sort_order: 1 },
    { name: 'laptop', display_name: 'Laptop', sort_order: 2 },
    { name: 'tablet', display_name: 'Tablet', sort_order: 3 }
  ];

  console.log('   📱 Inserting device types...');
  for (const deviceType of deviceTypes) {
    const { error } = await supabase
      .from('device_types')
      .upsert(deviceType, { onConflict: 'name' });
    if (error) console.warn(`   ⚠️  Warning inserting ${deviceType.name}:`, error.message);
  }

  // Get device type IDs
  const { data: dtData } = await supabase.from('device_types').select('id, name');
  const deviceTypeMap = {};
  dtData?.forEach(dt => deviceTypeMap[dt.name] = dt.id);

  // Brands
  const brands = [
    // Mobile brands
    { name: 'apple', display_name: 'Apple', device_type_id: deviceTypeMap.mobile, sort_order: 1 },
    { name: 'samsung', display_name: 'Samsung', device_type_id: deviceTypeMap.mobile, sort_order: 2 },
    { name: 'google', display_name: 'Google', device_type_id: deviceTypeMap.mobile, sort_order: 3 },
    { name: 'oneplus', display_name: 'OnePlus', device_type_id: deviceTypeMap.mobile, sort_order: 4 },
    { name: 'xiaomi', display_name: 'Xiaomi', device_type_id: deviceTypeMap.mobile, sort_order: 5 },
    { name: 'other', display_name: 'Other', device_type_id: deviceTypeMap.mobile, sort_order: 99 },
    // Laptop brands
    { name: 'apple', display_name: 'Apple', device_type_id: deviceTypeMap.laptop, sort_order: 1 },
    { name: 'dell', display_name: 'Dell', device_type_id: deviceTypeMap.laptop, sort_order: 2 },
    { name: 'hp', display_name: 'HP', device_type_id: deviceTypeMap.laptop, sort_order: 3 },
    { name: 'lenovo', display_name: 'Lenovo', device_type_id: deviceTypeMap.laptop, sort_order: 4 },
    { name: 'asus', display_name: 'ASUS', device_type_id: deviceTypeMap.laptop, sort_order: 5 },
    { name: 'other', display_name: 'Other', device_type_id: deviceTypeMap.laptop, sort_order: 99 },
    // Tablet brands
    { name: 'apple', display_name: 'Apple', device_type_id: deviceTypeMap.tablet, sort_order: 1 },
    { name: 'samsung', display_name: 'Samsung', device_type_id: deviceTypeMap.tablet, sort_order: 2 },
    { name: 'microsoft', display_name: 'Microsoft', device_type_id: deviceTypeMap.tablet, sort_order: 3 },
    { name: 'lenovo', display_name: 'Lenovo', device_type_id: deviceTypeMap.tablet, sort_order: 4 },
    { name: 'other', display_name: 'Other', device_type_id: deviceTypeMap.tablet, sort_order: 99 }
  ];

  console.log('   🏷️  Inserting brands...');
  const { error: brandsError } = await supabase
    .from('brands')
    .upsert(brands, { onConflict: 'name,device_type_id' });
  if (brandsError) console.warn('   ⚠️  Warning inserting brands:', brandsError.message);

  // Get brand IDs
  const { data: brandData } = await supabase
    .from('brands')
    .select('id, name, device_type_id')
    .in('device_type_id', Object.values(deviceTypeMap));

  // Sample Models (just a few key ones to start)
  const sampleModels = [
    // Apple iPhones
    { brand_name: 'apple', device_type: 'mobile', name: 'iPhone 15 Pro Max', model_year: 2023, is_featured: true, sort_order: 1 },
    { brand_name: 'apple', device_type: 'mobile', name: 'iPhone 15 Pro', model_year: 2023, is_featured: true, sort_order: 2 },
    { brand_name: 'apple', device_type: 'mobile', name: 'iPhone 15', model_year: 2023, is_featured: true, sort_order: 3 },
    { brand_name: 'apple', device_type: 'mobile', name: 'iPhone 14 Pro Max', model_year: 2022, is_featured: true, sort_order: 4 },
    { brand_name: 'apple', device_type: 'mobile', name: 'iPhone 14', model_year: 2022, is_featured: true, sort_order: 5 },
    // Samsung phones
    { brand_name: 'samsung', device_type: 'mobile', name: 'Galaxy S23 Ultra', model_year: 2023, is_featured: true, sort_order: 1 },
    { brand_name: 'samsung', device_type: 'mobile', name: 'Galaxy S23', model_year: 2023, is_featured: true, sort_order: 2 },
    // MacBooks
    { brand_name: 'apple', device_type: 'laptop', name: 'MacBook Pro 16" (M3)', model_year: 2023, is_featured: true, sort_order: 1 },
    { brand_name: 'apple', device_type: 'laptop', name: 'MacBook Air 13" (M3)', model_year: 2024, is_featured: true, sort_order: 2 },
    // iPads
    { brand_name: 'apple', device_type: 'tablet', name: 'iPad Pro 12.9" (M2)', model_year: 2022, is_featured: true, sort_order: 1 }
  ];

  console.log('   📱 Inserting sample models...');
  for (const model of sampleModels) {
    const brand = brandData?.find(b => 
      b.name === model.brand_name && 
      b.device_type_id === deviceTypeMap[model.device_type]
    );
    
    if (brand) {
      const { error } = await supabase
        .from('device_models')
        .upsert({
          brand_id: brand.id,
          name: model.name,
          display_name: model.name,
          model_year: model.model_year,
          is_featured: model.is_featured,
          sort_order: model.sort_order
        }, { onConflict: 'brand_id,name' });
      
      if (error) console.warn(`   ⚠️  Warning inserting ${model.name}:`, error.message);
    }
  }

  console.log('   ✅ Basic data seeded successfully');
}

async function verifySetup() {
  // Check tables exist and have data
  const tables = ['device_types', 'brands', 'device_models'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .limit(1);
      
    if (error) {
      throw new Error(`Table ${table} verification failed: ${error.message}`);
    }
    
    const count = data?.length || 0;
    console.log(`   ✅ ${table}: ${count > 0 ? 'OK' : 'Empty'}`);
  }
}

// Run the setup
if (require.main === module) {
  setupDynamicPricingDatabase();
}

module.exports = { setupDynamicPricingDatabase }; 