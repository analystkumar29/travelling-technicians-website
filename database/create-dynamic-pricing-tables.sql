-- Dynamic Pricing Tables Setup for Supabase
-- Copy and paste this entire file into your Supabase SQL Editor and run it

-- =============================================
-- 1. CREATE DEVICE_TYPES TABLE
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
-- 2. CREATE BRANDS TABLE
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
-- 3. CREATE DEVICE_MODELS TABLE
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
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_brands_device_type_active ON public.brands(device_type_id, is_active);
CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);
CREATE INDEX IF NOT EXISTS idx_models_brand_active ON public.device_models(brand_id, is_active);
CREATE INDEX IF NOT EXISTS idx_models_name ON public.device_models(name);
CREATE INDEX IF NOT EXISTS idx_models_featured ON public.device_models(is_featured, is_active);

-- =============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. CREATE POLICIES FOR PUBLIC READ ACCESS
-- =============================================
DROP POLICY IF EXISTS "Public read access for device_types" ON public.device_types;
CREATE POLICY "Public read access for device_types" ON public.device_types FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for brands" ON public.brands;
CREATE POLICY "Public read access for brands" ON public.brands FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for device_models" ON public.device_models;
CREATE POLICY "Public read access for device_models" ON public.device_models FOR SELECT USING (is_active = true);

-- =============================================
-- 7. CREATE POLICIES FOR SERVICE ROLE
-- =============================================
DROP POLICY IF EXISTS "Service role full access device_types" ON public.device_types;
CREATE POLICY "Service role full access device_types" ON public.device_types FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access brands" ON public.brands;
CREATE POLICY "Service role full access brands" ON public.brands FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access device_models" ON public.device_models;
CREATE POLICY "Service role full access device_models" ON public.device_models FOR ALL USING (true);

-- =============================================
-- 8. INSERT DEVICE TYPES
-- =============================================
INSERT INTO public.device_types (name, display_name, sort_order) VALUES
('mobile', 'Mobile Phone', 1),
('laptop', 'Laptop', 2),
('tablet', 'Tablet', 3)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 9. INSERT BRANDS
-- =============================================
-- Mobile brands
INSERT INTO public.brands (name, display_name, device_type_id, sort_order) VALUES
('apple', 'Apple', (SELECT id FROM device_types WHERE name = 'mobile'), 1),
('samsung', 'Samsung', (SELECT id FROM device_types WHERE name = 'mobile'), 2),
('google', 'Google', (SELECT id FROM device_types WHERE name = 'mobile'), 3),
('oneplus', 'OnePlus', (SELECT id FROM device_types WHERE name = 'mobile'), 4),
('xiaomi', 'Xiaomi', (SELECT id FROM device_types WHERE name = 'mobile'), 5),
('other', 'Other', (SELECT id FROM device_types WHERE name = 'mobile'), 99)
ON CONFLICT (name, device_type_id) DO NOTHING;

-- Laptop brands
INSERT INTO public.brands (name, display_name, device_type_id, sort_order) VALUES
('apple', 'Apple', (SELECT id FROM device_types WHERE name = 'laptop'), 1),
('dell', 'Dell', (SELECT id FROM device_types WHERE name = 'laptop'), 2),
('hp', 'HP', (SELECT id FROM device_types WHERE name = 'laptop'), 3),
('lenovo', 'Lenovo', (SELECT id FROM device_types WHERE name = 'laptop'), 4),
('asus', 'ASUS', (SELECT id FROM device_types WHERE name = 'laptop'), 5),
('other', 'Other', (SELECT id FROM device_types WHERE name = 'laptop'), 99)
ON CONFLICT (name, device_type_id) DO NOTHING;

-- Tablet brands
INSERT INTO public.brands (name, display_name, device_type_id, sort_order) VALUES
('apple', 'Apple', (SELECT id FROM device_types WHERE name = 'tablet'), 1),
('samsung', 'Samsung', (SELECT id FROM device_types WHERE name = 'tablet'), 2),
('microsoft', 'Microsoft', (SELECT id FROM device_types WHERE name = 'tablet'), 3),
('lenovo', 'Lenovo', (SELECT id FROM device_types WHERE name = 'tablet'), 4),
('other', 'Other', (SELECT id FROM device_types WHERE name = 'tablet'), 99)
ON CONFLICT (name, device_type_id) DO NOTHING;

-- =============================================
-- 10. INSERT SAMPLE DEVICE MODELS
-- =============================================

-- Apple iPhone models
INSERT INTO public.device_models (brand_id, name, display_name, model_year, is_featured, sort_order) VALUES
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 15 Pro Max', 'iPhone 15 Pro Max', 2023, true, 1),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 15 Pro', 'iPhone 15 Pro', 2023, true, 2),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 15 Plus', 'iPhone 15 Plus', 2023, true, 3),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 15', 'iPhone 15', 2023, true, 4),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 14 Pro Max', 'iPhone 14 Pro Max', 2022, true, 5),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 14 Pro', 'iPhone 14 Pro', 2022, true, 6),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 14 Plus', 'iPhone 14 Plus', 2022, true, 7),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 14', 'iPhone 14', 2022, true, 8),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 13 Pro Max', 'iPhone 13 Pro Max', 2021, false, 9),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 13 Pro', 'iPhone 13 Pro', 2021, false, 10),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 13', 'iPhone 13', 2021, false, 11),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 13 Mini', 'iPhone 13 Mini', 2021, false, 12),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 12 Pro Max', 'iPhone 12 Pro Max', 2020, false, 13),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 12 Pro', 'iPhone 12 Pro', 2020, false, 14),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 12', 'iPhone 12', 2020, false, 15),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 12 Mini', 'iPhone 12 Mini', 2020, false, 16),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 11 Pro Max', 'iPhone 11 Pro Max', 2019, false, 17),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 11 Pro', 'iPhone 11 Pro', 2019, false, 18),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 11', 'iPhone 11', 2019, false, 19),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone SE (3rd Gen)', 'iPhone SE (3rd Generation)', 2022, false, 20)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Samsung Galaxy models
INSERT INTO public.device_models (brand_id, name, display_name, model_year, is_featured, sort_order) VALUES
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy S23 Ultra', 'Galaxy S23 Ultra', 2023, true, 1),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy S23+', 'Galaxy S23+', 2023, true, 2),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy S23', 'Galaxy S23', 2023, true, 3),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy S22 Ultra', 'Galaxy S22 Ultra', 2022, false, 4),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy S22+', 'Galaxy S22+', 2022, false, 5),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy S22', 'Galaxy S22', 2022, false, 6),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy Z Fold 5', 'Galaxy Z Fold 5', 2023, true, 7),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy Z Flip 5', 'Galaxy Z Flip 5', 2023, true, 8),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy A54', 'Galaxy A54', 2023, false, 9),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy A53', 'Galaxy A53', 2022, false, 10)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Google Pixel models
INSERT INTO public.device_models (brand_id, name, display_name, model_year, is_featured, sort_order) VALUES
((SELECT id FROM brands WHERE name = 'google' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Pixel 8 Pro', 'Pixel 8 Pro', 2023, true, 1),
((SELECT id FROM brands WHERE name = 'google' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Pixel 8', 'Pixel 8', 2023, true, 2),
((SELECT id FROM brands WHERE name = 'google' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Pixel 7 Pro', 'Pixel 7 Pro', 2022, false, 3),
((SELECT id FROM brands WHERE name = 'google' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Pixel 7', 'Pixel 7', 2022, false, 4),
((SELECT id FROM brands WHERE name = 'google' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Pixel 7a', 'Pixel 7a', 2023, false, 5)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Apple MacBook models
INSERT INTO public.device_models (brand_id, name, display_name, model_year, is_featured, sort_order) VALUES
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'MacBook Pro 16" (M3 Pro/Max)', 'MacBook Pro 16" (M3 Pro/Max)', 2023, true, 1),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'MacBook Pro 14" (M3 Pro/Max)', 'MacBook Pro 14" (M3 Pro/Max)', 2023, true, 2),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'MacBook Air 15" (M3)', 'MacBook Air 15" (M3)', 2024, true, 3),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'MacBook Air 13" (M3)', 'MacBook Air 13" (M3)', 2024, true, 4),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'MacBook Pro 13" (M2)', 'MacBook Pro 13" (M2)', 2022, false, 5),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'MacBook Air 13" (M2)', 'MacBook Air 13" (M2)', 2022, false, 6)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Dell laptop models
INSERT INTO public.device_models (brand_id, name, display_name, model_year, is_featured, sort_order) VALUES
((SELECT id FROM brands WHERE name = 'dell' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'XPS 17 (2023)', 'XPS 17 (2023)', 2023, true, 1),
((SELECT id FROM brands WHERE name = 'dell' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'XPS 15 (2023)', 'XPS 15 (2023)', 2023, true, 2),
((SELECT id FROM brands WHERE name = 'dell' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'XPS 13 (2023)', 'XPS 13 (2023)', 2023, true, 3),
((SELECT id FROM brands WHERE name = 'dell' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Inspiron 16', 'Inspiron 16', 2023, false, 4),
((SELECT id FROM brands WHERE name = 'dell' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Inspiron 15', 'Inspiron 15', 2023, false, 5)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Apple iPad models
INSERT INTO public.device_models (brand_id, name, display_name, model_year, is_featured, sort_order) VALUES
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Pro 12.9" (M2)', 'iPad Pro 12.9" (M2)', 2022, true, 1),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Pro 11" (M2)', 'iPad Pro 11" (M2)', 2022, true, 2),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Air (5th Gen)', 'iPad Air (5th Generation)', 2022, true, 3),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad (10th Gen)', 'iPad (10th Generation)', 2022, false, 4),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Mini (6th Gen)', 'iPad Mini (6th Generation)', 2021, false, 5)
ON CONFLICT (brand_id, name) DO NOTHING;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Dynamic Pricing Database Setup Complete! 🎉' as message,
       (SELECT COUNT(*) FROM device_types) as device_types_count,
       (SELECT COUNT(*) FROM brands) as brands_count,
       (SELECT COUNT(*) FROM device_models) as models_count; 