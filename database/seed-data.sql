-- Data Seeding Script for Dynamic Pricing System
-- This script populates all tables with current hardcoded data

-- =============================================
-- 1. DEVICE TYPES
-- =============================================
INSERT INTO public.device_types (name, display_name, sort_order) VALUES
('mobile', 'Mobile Phone', 1),
('laptop', 'Laptop', 2),
('tablet', 'Tablet', 3)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. BRANDS
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
-- 3. DEVICE MODELS - MOBILE
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