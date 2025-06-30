-- Complete ASUS Laptop Device Models Script
-- All major ASUS laptop series from 2021-2024
-- Uses correct lowercase 'asus' brand name format

-- ROG Zephyrus G16 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'rog-zephyrus-g16-2024' as name,
    'ROG Zephyrus G16 (2024)' as display_name,
    2024 as model_year,
    '16"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Eclipse Gray', 'Platinum White'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Zenbook Pro 16X OLED (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'zenbook-pro-16x-oled-2024' as name,
    'Zenbook Pro 16X OLED (2024)' as display_name,
    2024 as model_year,
    '16"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Tech Black', 'Inkwell Gray'] as color_options,
    true as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ROG Strix G18 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'rog-strix-g18-2024' as name,
    'ROG Strix G18 (2024)' as display_name,
    2024 as model_year,
    '18"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Eclipse Gray', 'Volt Green'] as color_options,
    true as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Zenbook 14 OLED (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'zenbook-14-oled-2024' as name,
    'Zenbook 14 OLED (2024)' as display_name,
    2024 as model_year,
    '14"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Ponder Blue', 'Jasper Gray', 'Sandstone Beige'] as color_options,
    true as is_featured,
    4 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- TUF Gaming A16 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'tuf-gaming-a16-2024' as name,
    'TUF Gaming A16 (2024)' as display_name,
    2024 as model_year,
    '16"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Mecha Gray', 'Off Black'] as color_options,
    true as is_featured,
    5 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- VivoBook Pro 16X OLED (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'vivobook-pro-16x-oled-2024' as name,
    'VivoBook Pro 16X OLED (2024)' as display_name,
    2024 as model_year,
    '16"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Cool Silver', 'Quiet Blue'] as color_options,
    true as is_featured,
    6 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ROG Zephyrus G14 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'rog-zephyrus-g14-2023' as name,
    'ROG Zephyrus G14 (2023)' as display_name,
    2023 as model_year,
    '14"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Eclipse Gray', 'Moonlight White'] as color_options,
    false as is_featured,
    7 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Zenbook Pro 14 OLED (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'zenbook-pro-14-oled-2023' as name,
    'Zenbook Pro 14 OLED (2023)' as display_name,
    2023 as model_year,
    '14"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Tech Black', 'Inkwell Gray'] as color_options,
    false as is_featured,
    8 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ROG Strix Scar 17 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'rog-strix-scar-17-2023' as name,
    'ROG Strix Scar 17 (2023)' as display_name,
    2023 as model_year,
    '17.3"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Off Black', 'Eclipse Gray'] as color_options,
    false as is_featured,
    9 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- TUF Gaming F15 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'tuf-gaming-f15-2023' as name,
    'TUF Gaming F15 (2023)' as display_name,
    2023 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Mecha Gray', 'Graphite Black'] as color_options,
    false as is_featured,
    10 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Zenbook S 13 OLED (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'zenbook-s-13-oled-2023' as name,
    'Zenbook S 13 OLED (2023)' as display_name,
    2023 as model_year,
    '13.3"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Basalt Gray', 'Refined White'] as color_options,
    false as is_featured,
    11 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- VivoBook Pro 15 OLED (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'vivobook-pro-15-oled-2023' as name,
    'VivoBook Pro 15 OLED (2023)' as display_name,
    2023 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Cool Silver', 'Quiet Blue'] as color_options,
    false as is_featured,
    12 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ExpertBook B9 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'expertbook-b9-2023' as name,
    'ExpertBook B9 (2023)' as display_name,
    2023 as model_year,
    '14"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Star Black'] as color_options,
    false as is_featured,
    13 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ROG Flow X13 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'rog-flow-x13-2022' as name,
    'ROG Flow X13 (2022)' as display_name,
    2022 as model_year,
    '13.4"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Off Black'] as color_options,
    false as is_featured,
    14 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Zenbook 17 Fold OLED (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'zenbook-17-fold-oled-2022' as name,
    'Zenbook 17 Fold OLED (2022)' as display_name,
    2022 as model_year,
    '17.3"' as screen_size,
    ARRAY['1TB'] as storage_options,
    ARRAY['Tech Black'] as color_options,
    false as is_featured,
    15 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- TUF Dash F15 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'tuf-dash-f15-2022' as name,
    'TUF Dash F15 (2022)' as display_name,
    2022 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Eclipse Gray', 'Moonlight White'] as color_options,
    false as is_featured,
    16 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- VivoBook S15 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'vivobook-s15-2022' as name,
    'VivoBook S15 (2022)' as display_name,
    2022 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB'] as storage_options,
    ARRAY['Indie Black', 'Gaia Green', 'Hearty Gold'] as color_options,
    false as is_featured,
    17 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ExpertBook B5 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'expertbook-b5-2022' as name,
    'ExpertBook B5 (2022)' as display_name,
    2022 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Star Black'] as color_options,
    false as is_featured,
    18 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ROG Strix G15 (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'rog-strix-g15-2021' as name,
    'ROG Strix G15 (2021)' as display_name,
    2021 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Eclipse Gray', 'Electro Punk'] as color_options,
    false as is_featured,
    19 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Zenbook Pro 15 OLED (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'zenbook-pro-15-oled-2021' as name,
    'Zenbook Pro 15 OLED (2021)' as display_name,
    2021 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Pine Gray'] as color_options,
    false as is_featured,
    20 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'asus' AND dt.name = 'laptop'
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
    'ASUS Laptop Models Summary' as info,
    COUNT(*) as total_asus_laptop_models,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_models
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id 
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'asus' AND dt.name = 'laptop';

-- Success message
SELECT 'All ASUS laptop models successfully added!' as status; 