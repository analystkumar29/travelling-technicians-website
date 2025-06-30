-- Simple Apple Models Insert Script
-- This script adds all Apple models for phones, tablets, and laptops
-- It replaces existing models if they already exist

-- =============================================
-- APPLE MODELS ONLY - SIMPLE SCRIPT
-- =============================================

-- First, let's get the brand IDs we need
-- We'll assume Apple brand exists for mobile, tablet, and laptop device types

-- IPHONE MODELS (Mobile Device Type)
-- Get Apple brand ID for mobile devices
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-15-pro-max' as name,
    'iPhone 15 Pro Max' as display_name,
    2023 as model_year,
    '6.7"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-15-pro' as name,
    'iPhone 15 Pro' as display_name,
    2023 as model_year,
    '6.1"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'] as color_options,
    true as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-15-plus' as name,
    'iPhone 15 Plus' as display_name,
    2023 as model_year,
    '6.7"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Pink', 'Yellow', 'Green', 'Blue', 'Black'] as color_options,
    true as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-15' as name,
    'iPhone 15' as display_name,
    2023 as model_year,
    '6.1"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Pink', 'Yellow', 'Green', 'Blue', 'Black'] as color_options,
    true as is_featured,
    4 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-14-pro-max' as name,
    'iPhone 14 Pro Max' as display_name,
    2022 as model_year,
    '6.7"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Deep Purple', 'Gold', 'Silver', 'Space Black'] as color_options,
    true as is_featured,
    5 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-14-pro' as name,
    'iPhone 14 Pro' as display_name,
    2022 as model_year,
    '6.1"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Deep Purple', 'Gold', 'Silver', 'Space Black'] as color_options,
    true as is_featured,
    6 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-14-plus' as name,
    'iPhone 14 Plus' as display_name,
    2022 as model_year,
    '6.7"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Purple', 'Yellow', 'Blue', 'Midnight', 'Starlight', 'Red'] as color_options,
    true as is_featured,
    7 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-14' as name,
    'iPhone 14' as display_name,
    2022 as model_year,
    '6.1"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Purple', 'Yellow', 'Blue', 'Midnight', 'Starlight', 'Red'] as color_options,
    true as is_featured,
    8 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-13-pro-max' as name,
    'iPhone 13 Pro Max' as display_name,
    2021 as model_year,
    '6.7"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Sierra Blue', 'Gold', 'Silver', 'Graphite'] as color_options,
    false as is_featured,
    9 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-13-pro' as name,
    'iPhone 13 Pro' as display_name,
    2021 as model_year,
    '6.1"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Sierra Blue', 'Gold', 'Silver', 'Graphite'] as color_options,
    false as is_featured,
    10 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-13-mini' as name,
    'iPhone 13 mini' as display_name,
    2021 as model_year,
    '5.4"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Pink', 'Blue', 'Midnight', 'Starlight', 'Red'] as color_options,
    false as is_featured,
    11 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-13' as name,
    'iPhone 13' as display_name,
    2021 as model_year,
    '6.1"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Pink', 'Blue', 'Midnight', 'Starlight', 'Red'] as color_options,
    false as is_featured,
    12 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-12-pro-max' as name,
    'iPhone 12 Pro Max' as display_name,
    2020 as model_year,
    '6.7"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Pacific Blue', 'Gold', 'Silver', 'Graphite'] as color_options,
    false as is_featured,
    13 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-12-pro' as name,
    'iPhone 12 Pro' as display_name,
    2020 as model_year,
    '6.1"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Pacific Blue', 'Gold', 'Silver', 'Graphite'] as color_options,
    false as is_featured,
    14 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-12-mini' as name,
    'iPhone 12 mini' as display_name,
    2020 as model_year,
    '5.4"' as screen_size,
    ARRAY['64GB', '128GB', '256GB'] as storage_options,
    ARRAY['Purple', 'Blue', 'Green', 'Black', 'White', 'Red'] as color_options,
    false as is_featured,
    15 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-12' as name,
    'iPhone 12' as display_name,
    2020 as model_year,
    '6.1"' as screen_size,
    ARRAY['64GB', '128GB', '256GB'] as storage_options,
    ARRAY['Purple', 'Blue', 'Green', 'Black', 'White', 'Red'] as color_options,
    false as is_featured,
    16 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- IPAD MODELS (Tablet Device Type)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-pro-12-9-6th-gen' as name,
    'iPad Pro 12.9" (6th generation)' as display_name,
    2022 as model_year,
    '12.9"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Silver', 'Space Gray'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-pro-11-4th-gen' as name,
    'iPad Pro 11" (4th generation)' as display_name,
    2022 as model_year,
    '11"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Silver', 'Space Gray'] as color_options,
    true as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-air-5th-gen' as name,
    'iPad Air (5th generation)' as display_name,
    2022 as model_year,
    '10.9"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Space Gray', 'Starlight', 'Pink', 'Purple', 'Blue'] as color_options,
    true as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-10th-gen' as name,
    'iPad (10th generation)' as display_name,
    2022 as model_year,
    '10.9"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Silver', 'Pink', 'Blue', 'Yellow'] as color_options,
    true as is_featured,
    4 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-mini-6th-gen' as name,
    'iPad mini (6th generation)' as display_name,
    2021 as model_year,
    '8.3"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Space Gray', 'Pink', 'Purple', 'Starlight'] as color_options,
    false as is_featured,
    5 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- MACBOOK MODELS (Laptop Device Type)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'macbook-pro-16-m3-max' as name,
    'MacBook Pro 16" M3 Max' as display_name,
    2023 as model_year,
    '16.2"' as screen_size,
    ARRAY['512GB', '1TB', '2TB', '4TB', '8TB'] as storage_options,
    ARRAY['Space Black', 'Silver'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'macbook-pro-14-m3-max' as name,
    'MacBook Pro 14" M3 Max' as display_name,
    2023 as model_year,
    '14.2"' as screen_size,
    ARRAY['512GB', '1TB', '2TB', '4TB', '8TB'] as storage_options,
    ARRAY['Space Black', 'Silver'] as color_options,
    true as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'macbook-pro-16-m2-pro' as name,
    'MacBook Pro 16" M2 Pro' as display_name,
    2023 as model_year,
    '16.2"' as screen_size,
    ARRAY['512GB', '1TB', '2TB', '4TB'] as storage_options,
    ARRAY['Space Gray', 'Silver'] as color_options,
    true as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'macbook-pro-14-m2-pro' as name,
    'MacBook Pro 14" M2 Pro' as display_name,
    2023 as model_year,
    '14.2"' as screen_size,
    ARRAY['512GB', '1TB', '2TB', '4TB'] as storage_options,
    ARRAY['Space Gray', 'Silver'] as color_options,
    true as is_featured,
    4 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'macbook-air-15-m2' as name,
    'MacBook Air 15" M2' as display_name,
    2023 as model_year,
    '15.3"' as screen_size,
    ARRAY['256GB', '512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Midnight', 'Starlight', 'Space Gray', 'Silver'] as color_options,
    true as is_featured,
    5 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'macbook-air-13-m2' as name,
    'MacBook Air 13" M2' as display_name,
    2022 as model_year,
    '13.6"' as screen_size,
    ARRAY['256GB', '512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Midnight', 'Starlight', 'Space Gray', 'Silver'] as color_options,
    true as is_featured,
    6 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'macbook-air-13-m1' as name,
    'MacBook Air 13" M1' as display_name,
    2020 as model_year,
    '13.3"' as screen_size,
    ARRAY['256GB', '512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold'] as color_options,
    false as is_featured,
    7 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'Apple' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Show final count
SELECT 
    'Summary' as info,
    COUNT(*) as total_apple_models,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_models
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id 
WHERE b.name = 'Apple';

-- Success message
SELECT 'Apple models successfully added!' as status; 