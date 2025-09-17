-- Fix Schema for MobileActive Scraping Compatibility
-- Adds missing tables and columns that the scraping scripts expect

-- =====================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add missing columns to device_models
ALTER TABLE device_models 
ADD COLUMN IF NOT EXISTS model_year INTEGER,
ADD COLUMN IF NOT EXISTS popularity_score DECIMAL(3,2) DEFAULT 0.5;

-- Rename release_year to model_year for consistency
UPDATE device_models SET model_year = release_year WHERE model_year IS NULL AND release_year IS NOT NULL;
ALTER TABLE device_models DROP COLUMN IF EXISTS release_year;

-- Add missing columns to services table (rename to match script expectations)
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS name_alt VARCHAR(50),
ADD COLUMN IF NOT EXISTS category_id INTEGER,
ADD COLUMN IF NOT EXISTS device_type_id INTEGER REFERENCES device_types(id);

-- Update services to have device_type_id where missing
UPDATE services 
SET device_type_id = (SELECT id FROM device_types WHERE name = 'mobile' LIMIT 1)
WHERE device_type_id IS NULL;

-- =====================================================
-- CREATE MOBILEACTIVE SPECIFIC TABLES
-- =====================================================

-- MobileActive Products table (supplier inventory)
CREATE TABLE IF NOT EXISTS mobileactive_products (
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
    data_source VARCHAR(50) DEFAULT 'mobileactive',
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quality Tiers table (for parts quality classification)
CREATE TABLE IF NOT EXISTS quality_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    warranty_months INTEGER DEFAULT 6,
    turnaround_hours INTEGER DEFAULT 48,
    price_multiplier DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Service Categories table (for organizing services)
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    device_type_id INTEGER REFERENCES device_types(id),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Brand Mappings table (for supplier brand name normalization)
CREATE TABLE IF NOT EXISTS brand_mappings (
    id SERIAL PRIMARY KEY,
    mobileactive_brand VARCHAR(100) NOT NULL,
    system_brand_id INTEGER REFERENCES brands(id),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(mobileactive_brand, system_brand_id)
);

-- Model Mappings table (for supplier model name normalization)
CREATE TABLE IF NOT EXISTS model_mappings (
    id SERIAL PRIMARY KEY,
    mobileactive_model VARCHAR(150) NOT NULL,
    system_model_id INTEGER REFERENCES device_models(id),
    brand_id INTEGER REFERENCES brands(id),
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(mobileactive_model, system_model_id, brand_id)
);

-- Service Mappings table (for supplier service name normalization)
CREATE TABLE IF NOT EXISTS service_mappings (
    id SERIAL PRIMARY KEY,
    mobileactive_service VARCHAR(100) NOT NULL,
    system_service_id INTEGER REFERENCES services(id),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(mobileactive_service, system_service_id)
);

-- MobileActive Pricing table (direct supplier pricing)
CREATE TABLE IF NOT EXISTS mobileactive_pricing (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES mobileactive_products(id),
    quality_tier_id INTEGER REFERENCES quality_tiers(id),
    cost_price DECIMAL(10,2) NOT NULL,
    suggested_retail DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'CAD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, quality_tier_id)
);

-- =====================================================
-- ADD INDEXES FOR PERFORMANCE
-- =====================================================

-- MobileActive Products indexes
CREATE INDEX IF NOT EXISTS idx_mobileactive_brand_model ON mobileactive_products(brand, model_name);
CREATE INDEX IF NOT EXISTS idx_mobileactive_device_type ON mobileactive_products(device_type);
CREATE INDEX IF NOT EXISTS idx_mobileactive_service ON mobileactive_products(service_type);
CREATE INDEX IF NOT EXISTS idx_mobileactive_available ON mobileactive_products(is_available);

-- Mapping table indexes
CREATE INDEX IF NOT EXISTS idx_brand_mappings_mobileactive ON brand_mappings(mobileactive_brand);
CREATE INDEX IF NOT EXISTS idx_model_mappings_mobileactive ON model_mappings(mobileactive_model);
CREATE INDEX IF NOT EXISTS idx_service_mappings_mobileactive ON service_mappings(mobileactive_service);

-- Pricing indexes
CREATE INDEX IF NOT EXISTS idx_mobileactive_pricing_product ON mobileactive_pricing(product_id);
CREATE INDEX IF NOT EXISTS idx_mobileactive_pricing_tier ON mobileactive_pricing(quality_tier_id);

-- =====================================================
-- ADD TRIGGERS FOR TIMESTAMP UPDATES
-- =====================================================

-- Ensure the update trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
CREATE TRIGGER update_mobileactive_products_updated_at 
    BEFORE UPDATE ON mobileactive_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quality_tiers_updated_at 
    BEFORE UPDATE ON quality_tiers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at 
    BEFORE UPDATE ON service_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobileactive_pricing_updated_at 
    BEFORE UPDATE ON mobileactive_pricing 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA FOR SCRAPING COMPATIBILITY
-- =====================================================

-- Insert default quality tiers
INSERT INTO quality_tiers (name, display_name, description, warranty_months, turnaround_hours, price_multiplier, sort_order) VALUES
('economy', 'Economy', 'Budget-friendly aftermarket parts', 3, 72, 0.80, 1),
('aftermarket', 'Aftermarket', 'Quality aftermarket parts', 6, 48, 1.00, 2),
('premium', 'Premium', 'High-quality aftermarket parts', 12, 24, 1.25, 3),
('oem', 'OEM', 'Original equipment manufacturer parts', 12, 24, 1.50, 4),
('refurbished', 'Refurbished', 'Refurbished original parts', 6, 48, 1.10, 5)
ON CONFLICT (name) DO NOTHING;

-- Insert default service categories
INSERT INTO service_categories (name, display_name, description, device_type_id, sort_order) VALUES
('screen', 'Screen Repairs', 'Display and touch screen services', (SELECT id FROM device_types WHERE name = 'mobile' LIMIT 1), 1),
('battery', 'Battery Services', 'Battery replacement and repair', (SELECT id FROM device_types WHERE name = 'mobile' LIMIT 1), 2),
('charging', 'Charging & Ports', 'Charging port and cable services', (SELECT id FROM device_types WHERE name = 'mobile' LIMIT 1), 3),
('audio', 'Audio Components', 'Speaker and microphone services', (SELECT id FROM device_types WHERE name = 'mobile' LIMIT 1), 4),
('camera', 'Camera Services', 'Camera replacement and repair', (SELECT id FROM device_types WHERE name = 'mobile' LIMIT 1), 5),
('housing', 'Housing & Frame', 'Back cover and frame replacement', (SELECT id FROM device_types WHERE name = 'mobile' LIMIT 1), 6)
ON CONFLICT (name) DO NOTHING;

-- Update services to link to categories
UPDATE services SET category_id = (SELECT id FROM service_categories WHERE name = 'screen' LIMIT 1) 
WHERE name LIKE '%screen%' AND category_id IS NULL;

UPDATE services SET category_id = (SELECT id FROM service_categories WHERE name = 'battery' LIMIT 1) 
WHERE name LIKE '%battery%' AND category_id IS NULL;

UPDATE services SET category_id = (SELECT id FROM service_categories WHERE name = 'charging' LIMIT 1) 
WHERE name LIKE '%charging%' OR name LIKE '%port%' AND category_id IS NULL;

UPDATE services SET category_id = (SELECT id FROM service_categories WHERE name = 'audio' LIMIT 1) 
WHERE name LIKE '%speaker%' AND category_id IS NULL;

UPDATE services SET category_id = (SELECT id FROM service_categories WHERE name = 'camera' LIMIT 1) 
WHERE name LIKE '%camera%' AND category_id IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE mobileactive_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobileactive_pricing ENABLE ROW LEVEL SECURITY;

-- Public read access for reference tables
CREATE POLICY "Public read access for quality_tiers" ON quality_tiers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for service_categories" ON service_categories FOR SELECT USING (is_active = true);

-- Service role full access for admin operations
CREATE POLICY "Service role full access mobileactive_products" ON mobileactive_products USING (true);
CREATE POLICY "Service role full access quality_tiers" ON quality_tiers USING (true);
CREATE POLICY "Service role full access service_categories" ON service_categories USING (true);
CREATE POLICY "Service role full access brand_mappings" ON brand_mappings USING (true);
CREATE POLICY "Service role full access model_mappings" ON model_mappings USING (true);
CREATE POLICY "Service role full access service_mappings" ON service_mappings USING (true);
CREATE POLICY "Service role full access mobileactive_pricing" ON mobileactive_pricing USING (true);
