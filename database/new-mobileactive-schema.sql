-- =====================================================
-- NEW MOBILEACTIVE-BASED DATABASE SCHEMA
-- Streamlined for The Travelling Technicians
-- Based on actual MobileActive supplier data
-- =====================================================

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS dynamic_pricing CASCADE;
DROP TABLE IF EXISTS device_models CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS pricing_tiers CASCADE;
DROP TABLE IF EXISTS device_types CASCADE;
DROP TABLE IF EXISTS mobileactive_products CASCADE;

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

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Device Types
INSERT INTO device_types (id, name, display_name, is_active) VALUES 
(1, 'mobile', 'Mobile Phones', true);

-- Brands
INSERT INTO brands (id, name, display_name, device_type_id, logo_url, brand_colors, is_active, sort_order) VALUES 
(1, 'samsung', 'Samsung', 1, '/images/brands/samsung.svg', '{"primary": "#1428A0", "secondary": "#000000"}', true, 1),
(2, 'apple', 'Apple', 1, '/images/brands/apple.svg', '{"primary": "#000000", "secondary": "#007AFF"}', true, 2);

-- Services (based on MobileActive data)
INSERT INTO services (id, name, display_name, device_type_id, description, is_active, sort_order) VALUES 
(1, 'screen_replacement', 'Screen Replacement', 1, 'Professional screen replacement service with quality parts', true, 1),
(2, 'battery_replacement', 'Battery Replacement', 1, 'Battery replacement with genuine or high-quality aftermarket batteries', true, 2),
(3, 'charging_port_repair', 'Charging Port Repair', 1, 'Repair or replacement of charging ports and connectors', true, 3),
(4, 'camera_repair', 'Camera Repair', 1, 'Camera module repair and replacement services', true, 4);

-- Pricing Tiers
INSERT INTO pricing_tiers (id, name, display_name, multiplier, warranty_months, turnaround_hours, is_active, sort_order) VALUES 
(1, 'economy', 'Economy', 0.8, 3, 72, true, 1),
(2, 'standard', 'Standard', 1.0, 6, 48, true, 2),
(3, 'premium', 'Premium', 1.25, 12, 24, true, 3),
(4, 'express', 'Express', 1.5, 6, 12, true, 4);

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

-- Summary of the new schema:
-- - 1 Device Type: Mobile
-- - 2 Brands: Samsung, Apple  
-- - 4 Services: Screen, Battery, Charging Port, Camera
-- - 4 Pricing Tiers: Economy, Standard, Premium, Express
-- - 80 Models (42 Samsung + 38 Apple)
-- - 527 MobileActive Products
-- - 320 Possible Pricing Combinations (vs 10,376 in old system)

-- This schema is much more manageable and focused on your actual supplier data! 