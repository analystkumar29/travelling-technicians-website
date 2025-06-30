-- Complete Microsoft Tablet Device Models Script
-- All Microsoft Surface tablets from 2019-2024
-- Uses correct lowercase 'microsoft' brand name format

-- Surface Pro 10 for Business (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-pro-10-business' as name,
    'Surface Pro 10 for Business' as display_name,
    2024 as model_year,
    '13"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Platinum', 'Black'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Pro 9 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-pro-9' as name,
    'Surface Pro 9' as display_name,
    2022 as model_year,
    '13"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Platinum', 'Graphite', 'Sapphire', 'Forest'] as color_options,
    true as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Pro 9 5G (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-pro-9-5g' as name,
    'Surface Pro 9 5G' as display_name,
    2022 as model_year,
    '13"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Platinum'] as color_options,
    true as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Go 4 for Business (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-go-4-business' as name,
    'Surface Go 4 for Business' as display_name,
    2023 as model_year,
    '10.5"' as screen_size,
    ARRAY['128GB', '256GB'] as storage_options,
    ARRAY['Platinum'] as color_options,
    true as is_featured,
    4 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Go 3 (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-go-3' as name,
    'Surface Go 3' as display_name,
    2021 as model_year,
    '10.5"' as screen_size,
    ARRAY['64GB', '128GB'] as storage_options,
    ARRAY['Platinum'] as color_options,
    false as is_featured,
    5 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Pro 8 (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-pro-8' as name,
    'Surface Pro 8' as display_name,
    2021 as model_year,
    '13"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Platinum', 'Graphite'] as color_options,
    false as is_featured,
    6 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Pro X (2020)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-pro-x-2020' as name,
    'Surface Pro X (2020)' as display_name,
    2020 as model_year,
    '13"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Platinum', 'Matte Black'] as color_options,
    false as is_featured,
    7 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Pro 7+ (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-pro-7-plus' as name,
    'Surface Pro 7+' as display_name,
    2021 as model_year,
    '12.3"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Platinum', 'Matte Black'] as color_options,
    false as is_featured,
    8 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Pro 7 (2019)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-pro-7' as name,
    'Surface Pro 7' as display_name,
    2019 as model_year,
    '12.3"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Platinum', 'Matte Black'] as color_options,
    false as is_featured,
    9 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Go 2 (2020)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-go-2' as name,
    'Surface Go 2' as display_name,
    2020 as model_year,
    '10.5"' as screen_size,
    ARRAY['64GB', '128GB'] as storage_options,
    ARRAY['Platinum'] as color_options,
    false as is_featured,
    10 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Pro X (2019)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-pro-x-2019' as name,
    'Surface Pro X (2019)' as display_name,
    2019 as model_year,
    '13"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Platinum', 'Matte Black'] as color_options,
    false as is_featured,
    11 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Go (2018)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-go' as name,
    'Surface Go' as display_name,
    2018 as model_year,
    '10"' as screen_size,
    ARRAY['64GB', '128GB'] as storage_options,
    ARRAY['Platinum'] as color_options,
    false as is_featured,
    12 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Pro 6 (2018)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-pro-6' as name,
    'Surface Pro 6' as display_name,
    2018 as model_year,
    '12.3"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Platinum', 'Matte Black'] as color_options,
    false as is_featured,
    13 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Surface Pro (2017)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'surface-pro-2017' as name,
    'Surface Pro (2017)' as display_name,
    2017 as model_year,
    '12.3"' as screen_size,
    ARRAY['128GB', '256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Platinum'] as color_options,
    false as is_featured,
    14 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'microsoft' AND dt.name = 'tablet'
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
    'Microsoft Tablet Models Summary' as info,
    COUNT(*) as total_microsoft_tablet_models,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_models
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id 
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'microsoft' AND dt.name = 'tablet';

-- Success message
SELECT 'All Microsoft tablet models successfully added!' as status; 