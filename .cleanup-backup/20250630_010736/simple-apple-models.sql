-- Simple Apple Models Insert Script
-- Add all Apple device models (iPhone, iPad, MacBook)
-- Replaces existing models if they already exist

-- iPhone 15 Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-15-pro-max', 'iPhone 15 Pro Max', 2023, '6.7"',
    ARRAY['128GB', '256GB', '512GB', '1TB'],
    ARRAY['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
    true, 1
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
    b.id, 'iphone-15-pro', 'iPhone 15 Pro', 2023, '6.1"',
    ARRAY['128GB', '256GB', '512GB', '1TB'],
    ARRAY['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
    true, 2
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
    b.id, 'iphone-15-plus', 'iPhone 15 Plus', 2023, '6.7"',
    ARRAY['128GB', '256GB', '512GB'],
    ARRAY['Pink', 'Yellow', 'Green', 'Blue', 'Black'],
    true, 3
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
    b.id, 'iphone-15', 'iPhone 15', 2023, '6.1"',
    ARRAY['128GB', '256GB', '512GB'],
    ARRAY['Pink', 'Yellow', 'Green', 'Blue', 'Black'],
    true, 4
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

-- iPhone 14 Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-14-pro-max', 'iPhone 14 Pro Max', 2022, '6.7"',
    ARRAY['128GB', '256GB', '512GB', '1TB'],
    ARRAY['Deep Purple', 'Gold', 'Silver', 'Space Black'],
    true, 5
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
    b.id, 'iphone-14-pro', 'iPhone 14 Pro', 2022, '6.1"',
    ARRAY['128GB', '256GB', '512GB', '1TB'],
    ARRAY['Deep Purple', 'Gold', 'Silver', 'Space Black'],
    true, 6
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
    b.id, 'iphone-14-plus', 'iPhone 14 Plus', 2022, '6.7"',
    ARRAY['128GB', '256GB', '512GB'],
    ARRAY['Purple', 'Yellow', 'Blue', 'Midnight', 'Starlight', 'Red'],
    true, 7
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
    b.id, 'iphone-14', 'iPhone 14', 2022, '6.1"',
    ARRAY['128GB', '256GB', '512GB'],
    ARRAY['Purple', 'Yellow', 'Blue', 'Midnight', 'Starlight', 'Red'],
    true, 8
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

-- iPhone 13 Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-13-pro-max', 'iPhone 13 Pro Max', 2021, '6.7"',
    ARRAY['128GB', '256GB', '512GB', '1TB'],
    ARRAY['Sierra Blue', 'Gold', 'Silver', 'Graphite'],
    false, 9
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
    b.id, 'iphone-13-pro', 'iPhone 13 Pro', 2021, '6.1"',
    ARRAY['128GB', '256GB', '512GB', '1TB'],
    ARRAY['Sierra Blue', 'Gold', 'Silver', 'Graphite'],
    false, 10
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
    b.id, 'iphone-13', 'iPhone 13', 2021, '6.1"',
    ARRAY['128GB', '256GB', '512GB'],
    ARRAY['Pink', 'Blue', 'Midnight', 'Starlight', 'Red'],
    false, 11
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
    b.id, 'iphone-13-mini', 'iPhone 13 mini', 2021, '5.4"',
    ARRAY['128GB', '256GB', '512GB'],
    ARRAY['Pink', 'Blue', 'Midnight', 'Starlight', 'Red'],
    false, 12
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

-- iPhone 12 Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-12-pro-max', 'iPhone 12 Pro Max', 2020, '6.7"',
    ARRAY['128GB', '256GB', '512GB'],
    ARRAY['Pacific Blue', 'Gold', 'Silver', 'Graphite'],
    false, 13
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

-- iPhone SE Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-se-3rd-gen', 'iPhone SE (3rd generation)', 2022, '4.7"',
    ARRAY['64GB', '128GB', '256GB'],
    ARRAY['Midnight', 'Starlight', 'Red'],
    false, 17
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
    b.id, 'iphone-se-2nd-gen', 'iPhone SE (2nd generation)', 2020, '4.7"',
    ARRAY['64GB', '128GB', '256GB'],
    ARRAY['Black', 'White', 'Red'],
    false, 18
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

-- iPhone 11 Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-11-pro-max', 'iPhone 11 Pro Max', 2019, '6.5"',
    ARRAY['64GB', '256GB', '512GB'],
    ARRAY['Midnight Green', 'Space Gray', 'Silver', 'Gold'],
    false, 19
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
    b.id, 'iphone-11-pro', 'iPhone 11 Pro', 2019, '5.8"',
    ARRAY['64GB', '256GB', '512GB'],
    ARRAY['Midnight Green', 'Space Gray', 'Silver', 'Gold'],
    false, 20
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
    b.id, 'iphone-11', 'iPhone 11', 2019, '6.1"',
    ARRAY['64GB', '128GB', '256GB'],
    ARRAY['Black', 'Green', 'Yellow', 'Purple', 'Red', 'White'],
    false, 21
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

-- iPhone XS Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-xs-max', 'iPhone XS Max', 2018, '6.5"',
    ARRAY['64GB', '256GB', '512GB'],
    ARRAY['Space Gray', 'Silver', 'Gold'],
    false, 22
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
    b.id, 'iphone-xs', 'iPhone XS', 2018, '5.8"',
    ARRAY['64GB', '256GB', '512GB'],
    ARRAY['Space Gray', 'Silver', 'Gold'],
    false, 23
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
    b.id, 'iphone-xr', 'iPhone XR', 2018, '6.1"',
    ARRAY['64GB', '128GB', '256GB'],
    ARRAY['Black', 'Blue', 'Coral', 'Yellow', 'White', 'Red'],
    false, 24
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

-- iPhone X
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-x', 'iPhone X', 2017, '5.8"',
    ARRAY['64GB', '256GB'],
    ARRAY['Space Gray', 'Silver'],
    false, 25
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

-- iPhone 8 Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-8-plus', 'iPhone 8 Plus', 2017, '5.5"',
    ARRAY['64GB', '256GB'],
    ARRAY['Space Gray', 'Silver', 'Gold', 'Red'],
    false, 26
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
    b.id, 'iphone-8', 'iPhone 8', 2017, '4.7"',
    ARRAY['64GB', '256GB'],
    ARRAY['Space Gray', 'Silver', 'Gold', 'Red'],
    false, 27
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

-- iPhone 7 Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-7-plus', 'iPhone 7 Plus', 2016, '5.5"',
    ARRAY['32GB', '128GB', '256GB'],
    ARRAY['Jet Black', 'Black', 'Silver', 'Gold', 'Rose Gold', 'Red'],
    false, 28
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
    b.id, 'iphone-7', 'iPhone 7', 2016, '4.7"',
    ARRAY['32GB', '128GB', '256GB'],
    ARRAY['Jet Black', 'Black', 'Silver', 'Gold', 'Rose Gold', 'Red'],
    false, 29
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

-- iPhone SE 1st Gen
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-se-1st-gen', 'iPhone SE (1st generation)', 2016, '4.0"',
    ARRAY['16GB', '64GB'],
    ARRAY['Space Gray', 'Silver', 'Gold', 'Rose Gold'],
    false, 30
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

-- iPhone 6s Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-6s-plus', 'iPhone 6s Plus', 2015, '5.5"',
    ARRAY['16GB', '64GB', '128GB'],
    ARRAY['Space Gray', 'Silver', 'Gold', 'Rose Gold'],
    false, 31
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
    b.id, 'iphone-6s', 'iPhone 6s', 2015, '4.7"',
    ARRAY['16GB', '64GB', '128GB'],
    ARRAY['Space Gray', 'Silver', 'Gold', 'Rose Gold'],
    false, 32
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

-- iPhone 6 Series
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'iphone-6-plus', 'iPhone 6 Plus', 2014, '5.5"',
    ARRAY['16GB', '64GB', '128GB'],
    ARRAY['Space Gray', 'Silver', 'Gold'],
    false, 33
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
    b.id, 'iphone-6', 'iPhone 6', 2014, '4.7"',
    ARRAY['16GB', '64GB', '128GB'],
    ARRAY['Space Gray', 'Silver', 'Gold'],
    false, 34
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
    b.id, 'iphone-12-pro', 'iPhone 12 Pro', 2020, '6.1"',
    ARRAY['128GB', '256GB', '512GB'],
    ARRAY['Pacific Blue', 'Gold', 'Silver', 'Graphite'],
    false, 14
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
    b.id, 'iphone-12', 'iPhone 12', 2020, '6.1"',
    ARRAY['64GB', '128GB', '256GB'],
    ARRAY['Purple', 'Blue', 'Green', 'Black', 'White', 'Red'],
    false, 15
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
    b.id, 'iphone-12-mini', 'iPhone 12 mini', 2020, '5.4"',
    ARRAY['64GB', '128GB', '256GB'],
    ARRAY['Purple', 'Blue', 'Green', 'Black', 'White', 'Red'],
    false, 16
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

-- iPad Models
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'ipad-pro-12-9-6th-gen', 'iPad Pro 12.9" (6th generation)', 2022, '12.9"',
    ARRAY['128GB', '256GB', '512GB', '1TB', '2TB'],
    ARRAY['Silver', 'Space Gray'],
    true, 1
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
    b.id, 'ipad-pro-11-4th-gen', 'iPad Pro 11" (4th generation)', 2022, '11"',
    ARRAY['128GB', '256GB', '512GB', '1TB', '2TB'],
    ARRAY['Silver', 'Space Gray'],
    true, 2
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
    b.id, 'ipad-air-5th-gen', 'iPad Air (5th generation)', 2022, '10.9"',
    ARRAY['64GB', '256GB'],
    ARRAY['Space Gray', 'Starlight', 'Pink', 'Purple', 'Blue'],
    true, 3
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
    b.id, 'ipad-10th-gen', 'iPad (10th generation)', 2022, '10.9"',
    ARRAY['64GB', '256GB'],
    ARRAY['Silver', 'Pink', 'Blue', 'Yellow'],
    true, 4
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
    b.id, 'ipad-mini-6th-gen', 'iPad mini (6th generation)', 2021, '8.3"',
    ARRAY['64GB', '256GB'],
    ARRAY['Space Gray', 'Pink', 'Purple', 'Starlight'],
    false, 5
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

-- MacBook Models
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'macbook-pro-16-m3-max', 'MacBook Pro 16" M3 Max', 2023, '16.2"',
    ARRAY['512GB', '1TB', '2TB', '4TB', '8TB'],
    ARRAY['Space Black', 'Silver'],
    true, 1
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
    b.id, 'macbook-pro-14-m3-max', 'MacBook Pro 14" M3 Max', 2023, '14.2"',
    ARRAY['512GB', '1TB', '2TB', '4TB', '8TB'],
    ARRAY['Space Black', 'Silver'],
    true, 2
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
    b.id, 'macbook-air-15-m2', 'MacBook Air 15" M2', 2023, '15.3"',
    ARRAY['256GB', '512GB', '1TB', '2TB'],
    ARRAY['Midnight', 'Starlight', 'Space Gray', 'Silver'],
    true, 3
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
    b.id, 'macbook-air-13-m2', 'MacBook Air 13" M2', 2022, '13.6"',
    ARRAY['256GB', '512GB', '1TB', '2TB'],
    ARRAY['Midnight', 'Starlight', 'Space Gray', 'Silver'],
    true, 4
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
    b.id, 'macbook-air-13-m1', 'MacBook Air 13" M1', 2020, '13.3"',
    ARRAY['256GB', '512GB', '1TB', '2TB'],
    ARRAY['Space Gray', 'Silver', 'Gold'],
    false, 5
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

-- MacBook Pro M2 Series (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'macbook-pro-13-m2', 'MacBook Pro 13" M2', 2022, '13.3"',
    ARRAY['256GB', '512GB', '1TB', '2TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 6
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

-- MacBook Pro M1 Series (2020-2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'macbook-pro-16-m1-max', 'MacBook Pro 16" M1 Max', 2021, '16.2"',
    ARRAY['512GB', '1TB', '2TB', '4TB', '8TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 7
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
    b.id, 'macbook-pro-14-m1-max', 'MacBook Pro 14" M1 Max', 2021, '14.2"',
    ARRAY['512GB', '1TB', '2TB', '4TB', '8TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 8
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
    b.id, 'macbook-pro-13-m1', 'MacBook Pro 13" M1', 2020, '13.3"',
    ARRAY['256GB', '512GB', '1TB', '2TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 9
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

-- MacBook Pro Intel Series (2016-2020)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'macbook-pro-16-2019', 'MacBook Pro 16" (2019)', 2019, '16.0"',
    ARRAY['512GB', '1TB', '2TB', '4TB', '8TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 10
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
    b.id, 'macbook-pro-13-2020', 'MacBook Pro 13" (2020)', 2020, '13.3"',
    ARRAY['256GB', '512GB', '1TB', '2TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 11
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
    b.id, 'macbook-pro-15-2019', 'MacBook Pro 15" (2019)', 2019, '15.4"',
    ARRAY['256GB', '512GB', '1TB', '2TB', '4TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 12
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
    b.id, 'macbook-pro-13-2019', 'MacBook Pro 13" (2019)', 2019, '13.3"',
    ARRAY['128GB', '256GB', '512GB', '1TB', '2TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 13
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
    b.id, 'macbook-pro-15-2018', 'MacBook Pro 15" (2018)', 2018, '15.4"',
    ARRAY['256GB', '512GB', '1TB', '2TB', '4TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 14
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
    b.id, 'macbook-pro-13-2018', 'MacBook Pro 13" (2018)', 2018, '13.3"',
    ARRAY['256GB', '512GB', '1TB', '2TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 15
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
    b.id, 'macbook-pro-15-2017', 'MacBook Pro 15" (2017)', 2017, '15.4"',
    ARRAY['256GB', '512GB', '1TB', '2TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 16
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
    b.id, 'macbook-pro-13-2017', 'MacBook Pro 13" (2017)', 2017, '13.3"',
    ARRAY['256GB', '512GB', '1TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 17
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
    b.id, 'macbook-pro-15-2016', 'MacBook Pro 15" (2016)', 2016, '15.4"',
    ARRAY['256GB', '512GB', '1TB', '2TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 18
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
    b.id, 'macbook-pro-13-2016', 'MacBook Pro 13" (2016)', 2016, '13.3"',
    ARRAY['256GB', '512GB', '1TB'],
    ARRAY['Space Gray', 'Silver'],
    false, 19
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

-- MacBook Air Intel Series (2017-2020)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'macbook-air-13-2020-intel', 'MacBook Air 13" (2020 Intel)', 2020, '13.3"',
    ARRAY['256GB', '512GB', '1TB', '2TB'],
    ARRAY['Space Gray', 'Silver', 'Gold'],
    false, 20
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
    b.id, 'macbook-air-13-2019', 'MacBook Air 13" (2019)', 2019, '13.3"',
    ARRAY['128GB', '256GB', '512GB', '1TB'],
    ARRAY['Space Gray', 'Silver', 'Gold'],
    false, 21
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
    b.id, 'macbook-air-13-2018', 'MacBook Air 13" (2018)', 2018, '13.3"',
    ARRAY['128GB', '256GB', '512GB', '1TB'],
    ARRAY['Space Gray', 'Silver', 'Gold'],
    false, 22
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
    b.id, 'macbook-air-13-2017', 'MacBook Air 13" (2017)', 2017, '13.3"',
    ARRAY['128GB', '256GB', '512GB'],
    ARRAY['Silver'],
    false, 23
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

-- MacBook (12-inch, discontinued series)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id, 'macbook-12-2017', 'MacBook 12" (2017)', 2017, '12.0"',
    ARRAY['256GB', '512GB'],
    ARRAY['Space Gray', 'Silver', 'Gold', 'Rose Gold'],
    false, 24
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
    b.id, 'macbook-12-2016', 'MacBook 12" (2016)', 2016, '12.0"',
    ARRAY['256GB', '512GB'],
    ARRAY['Space Gray', 'Silver', 'Gold', 'Rose Gold'],
    false, 25
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
    b.id, 'macbook-12-2015', 'MacBook 12" (2015)', 2015, '12.0"',
    ARRAY['256GB', '512GB'],
    ARRAY['Space Gray', 'Silver', 'Gold'],
    false, 26
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

-- Show summary
SELECT 
    COUNT(*) as total_apple_models,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_models
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id 
WHERE b.name = 'Apple';

SELECT 'Apple models successfully added!' as status; 