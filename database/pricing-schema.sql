-- Pricing System Database Schema
-- Complete schema for dynamic pricing system

-- 1. Service Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    icon_name VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Services Table (linked to existing device_types)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,
    device_type_id INTEGER REFERENCES device_types(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    estimated_duration_minutes INTEGER DEFAULT 60,
    warranty_period_days INTEGER DEFAULT 365,
    is_doorstep_eligible BOOLEAN DEFAULT true,
    requires_diagnostics BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, device_type_id, name)
);

-- 3. Pricing Tiers Table
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    estimated_delivery_hours INTEGER,
    includes_features TEXT[], -- Array of feature strings
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Service Locations Table (for location-based pricing)
CREATE TABLE IF NOT EXISTS service_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    postal_code_prefixes TEXT[] NOT NULL, -- Array of postal code prefixes
    price_adjustment_percentage DECIMAL(5,2) DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Dynamic Pricing Table (main pricing data)
CREATE TABLE IF NOT EXISTS dynamic_pricing (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    model_id INTEGER REFERENCES device_models(id) ON DELETE CASCADE,
    pricing_tier_id INTEGER REFERENCES pricing_tiers(id) ON DELETE CASCADE,
    base_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2), -- Optional discounted price
    cost_price DECIMAL(10,2), -- Internal cost price for margin calculation
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 year',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, model_id, pricing_tier_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_device_type ON services(device_type_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_service ON dynamic_pricing(service_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_model ON dynamic_pricing(model_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_tier ON dynamic_pricing(pricing_tier_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_active ON dynamic_pricing(is_active);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_valid ON dynamic_pricing(valid_from, valid_until);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all pricing tables
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_locations_updated_at BEFORE UPDATE ON service_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_pricing_updated_at BEFORE UPDATE ON dynamic_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres; 