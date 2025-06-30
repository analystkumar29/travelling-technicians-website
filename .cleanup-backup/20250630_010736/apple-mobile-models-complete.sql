-- Complete Apple iPhone Models Script
-- All iPhone models from iPhone 6 onwards for mobile device type
-- Uses correct lowercase 'apple' brand name format

-- iPhone 15 Series (2023)
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
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone 14 Series (2022)
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
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone SE 3rd Generation (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-se-3rd-gen' as name,
    'iPhone SE (3rd generation)' as display_name,
    2022 as model_year,
    '4.7"' as screen_size,
    ARRAY['64GB', '128GB', '256GB'] as storage_options,
    ARRAY['Midnight', 'Starlight', 'Red'] as color_options,
    false as is_featured,
    9 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone 13 Series (2021)
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
    10 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    11 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    13 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone 12 Series (2020)
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
    14 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    15 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    17 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone SE 2nd Generation (2020)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-se-2nd-gen' as name,
    'iPhone SE (2nd generation)' as display_name,
    2020 as model_year,
    '4.7"' as screen_size,
    ARRAY['64GB', '128GB', '256GB'] as storage_options,
    ARRAY['Black', 'White', 'Red'] as color_options,
    false as is_featured,
    18 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone 11 Series (2019)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-11-pro-max' as name,
    'iPhone 11 Pro Max' as display_name,
    2019 as model_year,
    '6.5"' as screen_size,
    ARRAY['64GB', '256GB', '512GB'] as storage_options,
    ARRAY['Midnight Green', 'Space Gray', 'Silver', 'Gold'] as color_options,
    false as is_featured,
    19 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    'iphone-11-pro' as name,
    'iPhone 11 Pro' as display_name,
    2019 as model_year,
    '5.8"' as screen_size,
    ARRAY['64GB', '256GB', '512GB'] as storage_options,
    ARRAY['Midnight Green', 'Space Gray', 'Silver', 'Gold'] as color_options,
    false as is_featured,
    20 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    'iphone-11' as name,
    'iPhone 11' as display_name,
    2019 as model_year,
    '6.1"' as screen_size,
    ARRAY['64GB', '128GB', '256GB'] as storage_options,
    ARRAY['Black', 'Green', 'Yellow', 'Purple', 'Red', 'White'] as color_options,
    false as is_featured,
    21 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone XS Series (2018)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-xs-max' as name,
    'iPhone XS Max' as display_name,
    2018 as model_year,
    '6.5"' as screen_size,
    ARRAY['64GB', '256GB', '512GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold'] as color_options,
    false as is_featured,
    22 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    'iphone-xs' as name,
    'iPhone XS' as display_name,
    2018 as model_year,
    '5.8"' as screen_size,
    ARRAY['64GB', '256GB', '512GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold'] as color_options,
    false as is_featured,
    23 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    'iphone-xr' as name,
    'iPhone XR' as display_name,
    2018 as model_year,
    '6.1"' as screen_size,
    ARRAY['64GB', '128GB', '256GB'] as storage_options,
    ARRAY['Black', 'Blue', 'Coral', 'Yellow', 'White', 'Red'] as color_options,
    false as is_featured,
    24 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone X (2017)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-x' as name,
    'iPhone X' as display_name,
    2017 as model_year,
    '5.8"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Space Gray', 'Silver'] as color_options,
    false as is_featured,
    25 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone 8 Series (2017)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-8-plus' as name,
    'iPhone 8 Plus' as display_name,
    2017 as model_year,
    '5.5"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold', 'Red'] as color_options,
    false as is_featured,
    26 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    'iphone-8' as name,
    'iPhone 8' as display_name,
    2017 as model_year,
    '4.7"' as screen_size,
    ARRAY['64GB', '256GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold', 'Red'] as color_options,
    false as is_featured,
    27 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone 7 Series (2016)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-7-plus' as name,
    'iPhone 7 Plus' as display_name,
    2016 as model_year,
    '5.5"' as screen_size,
    ARRAY['32GB', '128GB', '256GB'] as storage_options,
    ARRAY['Jet Black', 'Black', 'Silver', 'Gold', 'Rose Gold', 'Red'] as color_options,
    false as is_featured,
    28 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    'iphone-7' as name,
    'iPhone 7' as display_name,
    2016 as model_year,
    '4.7"' as screen_size,
    ARRAY['32GB', '128GB', '256GB'] as storage_options,
    ARRAY['Jet Black', 'Black', 'Silver', 'Gold', 'Rose Gold', 'Red'] as color_options,
    false as is_featured,
    29 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone SE 1st Generation (2016)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-se-1st-gen' as name,
    'iPhone SE (1st generation)' as display_name,
    2016 as model_year,
    '4.0"' as screen_size,
    ARRAY['16GB', '64GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold', 'Rose Gold'] as color_options,
    false as is_featured,
    30 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone 6s Series (2015)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-6s-plus' as name,
    'iPhone 6s Plus' as display_name,
    2015 as model_year,
    '5.5"' as screen_size,
    ARRAY['16GB', '64GB', '128GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold', 'Rose Gold'] as color_options,
    false as is_featured,
    31 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    'iphone-6s' as name,
    'iPhone 6s' as display_name,
    2015 as model_year,
    '4.7"' as screen_size,
    ARRAY['16GB', '64GB', '128GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold', 'Rose Gold'] as color_options,
    false as is_featured,
    32 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- iPhone 6 Series (2014)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'iphone-6-plus' as name,
    'iPhone 6 Plus' as display_name,
    2014 as model_year,
    '5.5"' as screen_size,
    ARRAY['16GB', '64GB', '128GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold'] as color_options,
    false as is_featured,
    33 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    'iphone-6' as name,
    'iPhone 6' as display_name,
    2014 as model_year,
    '4.7"' as screen_size,
    ARRAY['16GB', '64GB', '128GB'] as storage_options,
    ARRAY['Space Gray', 'Silver', 'Gold'] as color_options,
    false as is_featured,
    34 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'apple' AND dt.name = 'mobile'
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
    'iPhone Models Summary' as info,
    COUNT(*) as total_iphone_models,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_models
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id 
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'apple' AND dt.name = 'mobile';

-- Success message
SELECT 'All Apple iPhone models successfully added!' as status; 