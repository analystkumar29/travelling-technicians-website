-- Dynamic Pricing System Database Schema
-- This script creates all tables needed for dynamic pricing functionality
-- including brands, models, services, and pricing tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. DEVICE TYPES TABLE (Reference table)
-- =============================================
CREATE TABLE IF NOT EXISTS public.device_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'mobile', 'laptop', 'tablet'
    display_name VARCHAR(100) NOT NULL, -- 'Mobile Phone', 'Laptop', 'Tablet'
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
    display_name VARCHAR(100) NOT NULL, -- Brand display name
    logo_url VARCHAR(500), -- URL to brand logo
    website_url VARCHAR(500), -- Brand website
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique brand names per device type
    CONSTRAINT unique_brand_per_device_type UNIQUE (name, device_type_id)
);

-- =============================================
-- 3. DEVICE MODELS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.device_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES public.brands(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    display_name VARCHAR(200), -- Optional display name if different from name
    model_year INTEGER, -- Release year
    screen_size VARCHAR(50), -- e.g., '6.1"', '13"', '15.6"'
    color_options TEXT[], -- Array of available colors
    storage_options TEXT[], -- Array of storage options ['64GB', '128GB', '256GB']
    specifications JSONB, -- Flexible field for additional specs
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE, -- For popular models
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique model names per brand
    CONSTRAINT unique_model_per_brand UNIQUE (brand_id, name)
);

-- =============================================
-- 4. SERVICE CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- 'screen_replacement', 'battery_replacement', etc.
    display_name VARCHAR(150) NOT NULL, -- 'Screen Replacement', 'Battery Replacement'
    description TEXT,
    icon_name VARCHAR(100), -- Icon identifier for UI
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
    estimated_duration_minutes INTEGER, -- Estimated repair time
    warranty_period_days INTEGER DEFAULT 365, -- Warranty in days
    is_doorstep_eligible BOOLEAN DEFAULT TRUE,
    requires_diagnostics BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique service names per category and device type
    CONSTRAINT unique_service_per_category_device UNIQUE (category_id, device_type_id, name)
);

-- =============================================
-- 6. PRICING TIERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- 'standard', 'premium', 'same_day'
    display_name VARCHAR(150) NOT NULL, -- 'Standard Repair', 'Premium Service', 'Same Day Service'
    description TEXT,
    price_multiplier DECIMAL(3,2) DEFAULT 1.00, -- Multiplier for base price
    estimated_delivery_hours INTEGER, -- Hours to complete
    includes_features TEXT[], -- Array of included features
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
    base_price DECIMAL(10,2) NOT NULL, -- Base price in CAD
    discounted_price DECIMAL(10,2), -- Optional discounted price
    cost_price DECIMAL(10,2), -- Internal cost price (for profit calculation)
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE, -- Optional expiry date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique pricing per service, model, and tier
    CONSTRAINT unique_pricing_per_service_model_tier UNIQUE (service_id, model_id, pricing_tier_id),
    
    -- Ensure discounted price is not higher than base price
    CONSTRAINT check_discounted_price CHECK (discounted_price IS NULL OR discounted_price <= base_price)
);

-- =============================================
-- 8. LOCATIONS TABLE (for location-based pricing)
-- =============================================
CREATE TABLE IF NOT EXISTS public.service_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 'Vancouver', 'Burnaby', etc.
    postal_code_prefixes TEXT[] NOT NULL, -- Array of postal code prefixes ['V5K', 'V5L']
    price_adjustment_percentage DECIMAL(5,2) DEFAULT 0.00, -- +/- percentage adjustment
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. INDEXES FOR PERFORMANCE
-- =============================================

-- Brands indexes
CREATE INDEX IF NOT EXISTS idx_brands_device_type_active ON public.brands(device_type_id, is_active);
CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);

-- Models indexes
CREATE INDEX IF NOT EXISTS idx_models_brand_active ON public.device_models(brand_id, is_active);
CREATE INDEX IF NOT EXISTS idx_models_name ON public.device_models(name);
CREATE INDEX IF NOT EXISTS idx_models_featured ON public.device_models(is_featured, is_active);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_category_device ON public.services(category_id, device_type_id);
CREATE INDEX IF NOT EXISTS idx_services_doorstep_eligible ON public.services(is_doorstep_eligible, is_active);

-- Pricing indexes
CREATE INDEX IF NOT EXISTS idx_pricing_service_model ON public.dynamic_pricing(service_id, model_id);
CREATE INDEX IF NOT EXISTS idx_pricing_active_valid ON public.dynamic_pricing(is_active, valid_from, valid_until);

-- =============================================
-- 10. TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_device_types_updated_at BEFORE UPDATE ON public.device_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_models_updated_at BEFORE UPDATE ON public.device_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON public.pricing_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_pricing_updated_at BEFORE UPDATE ON public.dynamic_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_locations_updated_at BEFORE UPDATE ON public.service_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for booking form)
CREATE POLICY "Public read access for device_types" ON public.device_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for brands" ON public.brands FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for device_models" ON public.device_models FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for service_categories" ON public.service_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for pricing_tiers" ON public.pricing_tiers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for dynamic_pricing" ON public.dynamic_pricing FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for service_locations" ON public.service_locations FOR SELECT USING (is_active = true);

-- Create admin policies (service role can do everything)
CREATE POLICY "Service role full access device_types" ON public.device_types FOR ALL USING (true);
CREATE POLICY "Service role full access brands" ON public.brands FOR ALL USING (true);
CREATE POLICY "Service role full access device_models" ON public.device_models FOR ALL USING (true);
CREATE POLICY "Service role full access service_categories" ON public.service_categories FOR ALL USING (true);
CREATE POLICY "Service role full access services" ON public.services FOR ALL USING (true);
CREATE POLICY "Service role full access pricing_tiers" ON public.pricing_tiers FOR ALL USING (true);
CREATE POLICY "Service role full access dynamic_pricing" ON public.dynamic_pricing FOR ALL USING (true);
CREATE POLICY "Service role full access service_locations" ON public.service_locations FOR ALL USING (true);

-- =============================================
-- 12. HELPFUL VIEWS
-- =============================================

-- View for complete model information with brand and device type
CREATE OR REPLACE VIEW public.models_with_details AS
SELECT 
    dm.id,
    dm.name as model_name,
    dm.display_name as model_display_name,
    dm.model_year,
    dm.screen_size,
    dm.is_featured,
    b.id as brand_id,
    b.name as brand_name,
    b.display_name as brand_display_name,
    b.logo_url as brand_logo_url,
    dt.id as device_type_id,
    dt.name as device_type,
    dt.display_name as device_type_display_name
FROM public.device_models dm
JOIN public.brands b ON dm.brand_id = b.id
JOIN public.device_types dt ON b.device_type_id = dt.id
WHERE dm.is_active = true 
AND b.is_active = true 
AND dt.is_active = true;

-- View for complete pricing information
CREATE OR REPLACE VIEW public.pricing_with_details AS
SELECT 
    dp.id,
    dp.base_price,
    dp.discounted_price,
    dp.valid_from,
    dp.valid_until,
    s.name as service_name,
    s.display_name as service_display_name,
    s.estimated_duration_minutes,
    s.warranty_period_days,
    s.is_doorstep_eligible,
    sc.name as category_name,
    sc.display_name as category_display_name,
    dm.name as model_name,
    dm.display_name as model_display_name,
    b.name as brand_name,
    b.display_name as brand_display_name,
    dt.name as device_type,
    dt.display_name as device_type_display_name,
    pt.name as pricing_tier,
    pt.display_name as pricing_tier_display_name,
    pt.price_multiplier,
    pt.estimated_delivery_hours
FROM public.dynamic_pricing dp
JOIN public.services s ON dp.service_id = s.id
JOIN public.service_categories sc ON s.category_id = sc.id
JOIN public.device_models dm ON dp.model_id = dm.id
JOIN public.brands b ON dm.brand_id = b.id
JOIN public.device_types dt ON b.device_type_id = dt.id
JOIN public.pricing_tiers pt ON dp.pricing_tier_id = pt.id
WHERE dp.is_active = true
AND s.is_active = true
AND dm.is_active = true
AND b.is_active = true
AND dt.is_active = true
AND pt.is_active = true
AND (dp.valid_until IS NULL OR dp.valid_until > NOW());

-- =============================================
-- 13. USEFUL FUNCTIONS
-- =============================================

-- Function to get price for a specific service and model
CREATE OR REPLACE FUNCTION get_service_price(
    p_device_type VARCHAR(50),
    p_brand_name VARCHAR(100),
    p_model_name VARCHAR(200),
    p_service_name VARCHAR(150),
    p_pricing_tier VARCHAR(100) DEFAULT 'standard'
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    result_price DECIMAL(10,2);
BEGIN
    SELECT 
        CASE 
            WHEN dp.discounted_price IS NOT NULL THEN dp.discounted_price
            ELSE dp.base_price * pt.price_multiplier
        END INTO result_price
    FROM public.dynamic_pricing dp
    JOIN public.services s ON dp.service_id = s.id
    JOIN public.device_models dm ON dp.model_id = dm.id
    JOIN public.brands b ON dm.brand_id = b.id
    JOIN public.device_types dt ON b.device_type_id = dt.id
    JOIN public.pricing_tiers pt ON dp.pricing_tier_id = pt.id
    WHERE dt.name = p_device_type
    AND b.name = p_brand_name
    AND dm.name = p_model_name
    AND s.name = p_service_name
    AND pt.name = p_pricing_tier
    AND dp.is_active = true
    AND s.is_active = true
    AND dm.is_active = true
    AND b.is_active = true
    AND dt.is_active = true
    AND pt.is_active = true
    AND (dp.valid_until IS NULL OR dp.valid_until > NOW());
    
    RETURN result_price;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Dynamic Pricing Schema Created Successfully!' as message; 