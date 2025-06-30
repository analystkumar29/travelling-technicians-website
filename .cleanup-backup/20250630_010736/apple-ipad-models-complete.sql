-- Complete Apple iPad Models Script
-- All current iPad models for tablet device type
-- Uses correct lowercase 'apple' brand name format

-- iPad Pro 12.9-inch (6th generation, 2022 - M2)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-pro-12-9-m2-2022' as name,
    'iPad Pro 12.9" (M2, 2022)' as display_name,
    2022 as model_year,
    '12.9"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Silver', 'Space Gray'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad Pro 11-inch (4th generation, 2022 - M2)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-pro-11-m2-2022' as name,
    'iPad Pro 11" (M2, 2022)' as display_name,
    2022 as model_year,
    '11"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Silver', 'Space Gray'] as color_options,
    true as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad Air (5th generation, 2022 - M1)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-air-5th-gen-m1-2022' as name,
    'iPad Air (5th generation, M1, 2022)' as display_name,
    2022 as model_year,
    '10.9"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Space Gray', 'Starlight', 'Pink', 'Purple', 'Blue'] as color_options,
    true as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad (10th generation, 2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-10th-gen-2022' as name,
    'iPad (10th generation, 2022)' as display_name,
    2022 as model_year,
    '10.9"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Silver', 'Pink', 'Blue', 'Yellow'] as color_options,
    true as is_featured,
    4 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad mini (6th generation, 2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-mini-6th-gen-2021' as name,
    'iPad mini (6th generation, 2021)' as display_name,
    2021 as model_year,
    '8.3"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Space Gray', 'Pink', 'Purple', 'Starlight'] as color_options,
    true as is_featured,
    5 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad (9th generation, 2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-9th-gen-2021' as name,
    'iPad (9th generation, 2021)' as display_name,
    2021 as model_year,
    '10.2"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Space Gray', 'Silver'] as color_options,
    false as is_featured,
    6 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad Pro 12.9-inch (5th generation, 2021 - M1)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-pro-12-9-m1-2021' as name,
    'iPad Pro 12.9" (M1, 2021)' as display_name,
    2021 as model_year,
    '12.9"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Silver', 'Space Gray'] as color_options,
    false as is_featured,
    7 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad Pro 11-inch (3rd generation, 2021 - M1)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-pro-11-m1-2021' as name,
    'iPad Pro 11" (M1, 2021)' as display_name,
    2021 as model_year,
    '11"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Silver', 'Space Gray'] as color_options,
    false as is_featured,
    8 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad Air (4th generation, 2020)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-air-4th-gen-2020' as name,
    'iPad Air (4th generation, 2020)' as display_name,
    2020 as model_year,
    '10.9"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Rose Gold', 'Green', 'Sky Blue'] as color_options,
    false as is_featured,
    9 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad (8th generation, 2020)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-8th-gen-2020' as name,
    'iPad (8th generation, 2020)' as display_name,
    2020 as model_year,
    '10.2"' as screen_size,
    ARRAY['32GB', '128GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold'] as color_options,
    false as is_featured,
    10 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad Pro 12.9-inch (4th generation, 2020)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-pro-12-9-2020' as name,
    'iPad Pro 12.9" (4th generation, 2020)' as display_name,
    2020 as model_year,
    '12.9"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Silver', 'Space Gray'] as color_options,
    false as is_featured,
    11 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPad Pro 11-inch (2nd generation, 2020)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'ipad-pro-11-2020' as name,
    'iPad Pro 11" (2nd generation, 2020)' as display_name,
    2020 as model_year,
    '11"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Silver', 'Space Gray'] as color_options,
    false as is_featured,
    12 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Summary query
SELECT 
    'iPad Models Summary' as info,
    COUNT(*) as total_ipad_models,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_models
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id 
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'apple' AND dt.name = 'tablet';

-- Success message
SELECT 'All Apple iPad models successfully added!' as status; 