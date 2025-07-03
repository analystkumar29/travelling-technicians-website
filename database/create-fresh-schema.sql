-- Fresh Database Schema for The Travelling Technicians
-- Run this in Supabase SQL Editor for the new database

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

-- Row Level Security (RLS) Policies
ALTER TABLE device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobileactive_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for device data
CREATE POLICY "Public read access for device_types" ON device_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for brands" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for device_models" ON device_models FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for pricing_tiers" ON pricing_tiers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for mobileactive_products" ON mobileactive_products FOR SELECT USING (is_available = true);
CREATE POLICY "Public read access for dynamic_pricing" ON dynamic_pricing FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for service_locations" ON service_locations FOR SELECT USING (is_active = true);

-- Service role full access for admin operations
CREATE POLICY "Service role full access device_types" ON device_types USING (true);
CREATE POLICY "Service role full access brands" ON brands USING (true);
CREATE POLICY "Service role full access device_models" ON device_models USING (true);
CREATE POLICY "Service role full access services" ON services USING (true);
CREATE POLICY "Service role full access pricing_tiers" ON pricing_tiers USING (true);
CREATE POLICY "Service role full access mobileactive_products" ON mobileactive_products USING (true);
CREATE POLICY "Service role full access dynamic_pricing" ON dynamic_pricing USING (true);
CREATE POLICY "Service role full access service_locations" ON service_locations USING (true);
CREATE POLICY "Service role full access bookings" ON bookings USING (true);

-- Public insert access for bookings
CREATE POLICY "Public insert access for bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Public update access for bookings (for rescheduling)
CREATE POLICY "Public update access for bookings" ON bookings FOR UPDATE USING (true);

COMMENT ON TABLE device_types IS 'Device type categories (mobile, laptop, tablet)';
COMMENT ON TABLE brands IS 'Device brands with device type relationships';
COMMENT ON TABLE device_models IS 'Specific device models with brand relationships';
COMMENT ON TABLE services IS 'Repair services available for each device type';
COMMENT ON TABLE pricing_tiers IS 'Service tiers with different pricing and warranty levels';
COMMENT ON TABLE mobileactive_products IS 'MobileActive supplier product catalog';
COMMENT ON TABLE dynamic_pricing IS 'Dynamic pricing matrix for all device/service/tier combinations';
COMMENT ON TABLE service_locations IS 'Service areas with location-based pricing adjustments';
COMMENT ON TABLE bookings IS 'Customer booking records';

-- Success message
SELECT 'Database schema created successfully!' as status; 