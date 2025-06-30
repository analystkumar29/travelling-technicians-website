-- Complete Dell Laptop Device Models Script
-- All major Dell laptop series from 2021-2024
-- Uses correct lowercase 'dell' brand name format

-- XPS 13 Plus (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'xps-13-plus-2024' as name,
    'XPS 13 Plus (2024)' as display_name,
    2024 as model_year,
    '13.4"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Graphite', 'Platinum Silver'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- XPS 15 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'xps-15-2024' as name,
    'XPS 15 (2024)' as display_name,
    2024 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Platinum Silver', 'Graphite'] as color_options,
    true as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Alienware m18 R2 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'alienware-m18-r2' as name,
    'Alienware m18 R2' as display_name,
    2024 as model_year,
    '18"' as screen_size,
    ARRAY['1TB', '2TB', '4TB'] as storage_options,
    ARRAY['Dark Metallic Moon', 'Lunar Light'] as color_options,
    true as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Latitude 7440 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'latitude-7440-2024' as name,
    'Latitude 7440 (2024)' as display_name,
    2024 as model_year,
    '14"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Titan Gray'] as color_options,
    true as is_featured,
    4 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Precision 5580 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'precision-5580-2024' as name,
    'Precision 5580 (2024)' as display_name,
    2024 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Titan Gray'] as color_options,
    true as is_featured,
    5 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Inspiron 16 7630 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'inspiron-16-7630-2024' as name,
    'Inspiron 16 7630 (2024)' as display_name,
    2024 as model_year,
    '16"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Platinum Silver', 'Ice Blue'] as color_options,
    true as is_featured,
    6 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- XPS 17 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'xps-17-2023' as name,
    'XPS 17 (2023)' as display_name,
    2023 as model_year,
    '17"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Platinum Silver', 'Graphite'] as color_options,
    false as is_featured,
    7 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Alienware x15 R2 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'alienware-x15-r2' as name,
    'Alienware x15 R2' as display_name,
    2023 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Lunar Light', 'Dark Side of the Moon'] as color_options,
    false as is_featured,
    8 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Latitude 9430 2-in-1 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'latitude-9430-2in1' as name,
    'Latitude 9430 2-in-1' as display_name,
    2023 as model_year,
    '14"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Titan Gray'] as color_options,
    false as is_featured,
    9 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Vostro 16 5620 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'vostro-16-5620' as name,
    'Vostro 16 5620' as display_name,
    2023 as model_year,
    '16"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Carbon Black', 'Titan Gray'] as color_options,
    false as is_featured,
    10 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Inspiron 14 5425 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'inspiron-14-5425' as name,
    'Inspiron 14 5425' as display_name,
    2023 as model_year,
    '14"' as screen_size,
    ARRAY['256GB', '512GB'] as storage_options,
    ARRAY['Platinum Silver', 'Pebble Green', 'Mist Blue'] as color_options,
    false as is_featured,
    11 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- G15 5525 Gaming (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'g15-5525-gaming' as name,
    'G15 5525 Gaming' as display_name,
    2023 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Specter Green', 'Dark Shadow Gray'] as color_options,
    false as is_featured,
    12 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Precision 7570 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'precision-7570-2022' as name,
    'Precision 7570 (2022)' as display_name,
    2022 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Titan Gray'] as color_options,
    false as is_featured,
    13 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Latitude 5530 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'latitude-5530-2022' as name,
    'Latitude 5530 (2022)' as display_name,
    2022 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Titan Gray'] as color_options,
    false as is_featured,
    14 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Alienware m15 R7 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'alienware-m15-r7' as name,
    'Alienware m15 R7' as display_name,
    2022 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Lunar Light', 'Dark Side of the Moon'] as color_options,
    false as is_featured,
    15 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Inspiron 15 3525 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'inspiron-15-3525-2022' as name,
    'Inspiron 15 3525 (2022)' as display_name,
    2022 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB'] as storage_options,
    ARRAY['Carbon Black', 'Platinum Silver'] as color_options,
    false as is_featured,
    16 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Vostro 15 3515 (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'vostro-15-3515-2021' as name,
    'Vostro 15 3515 (2021)' as display_name,
    2021 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB'] as storage_options,
    ARRAY['Accent Black'] as color_options,
    false as is_featured,
    17 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- XPS 13 9310 (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'xps-13-9310-2021' as name,
    'XPS 13 9310 (2021)' as display_name,
    2021 as model_year,
    '13.3"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Platinum Silver', 'Frost White'] as color_options,
    false as is_featured,
    18 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Latitude 7420 (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'latitude-7420-2021' as name,
    'Latitude 7420 (2021)' as display_name,
    2021 as model_year,
    '14"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Titan Gray'] as color_options,
    false as is_featured,
    19 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Alienware Area-51m R2 (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'alienware-area51m-r2' as name,
    'Alienware Area-51m R2' as display_name,
    2021 as model_year,
    '17.3"' as screen_size,
    ARRAY['1TB', '2TB'] as storage_options,
    ARRAY['Lunar Light', 'Dark Side of the Moon'] as color_options,
    false as is_featured,
    20 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'dell' AND dt.name = 'laptop'
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
    'Dell Laptop Models Summary' as info,
    COUNT(*) as total_dell_laptop_models,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_models
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id 
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'dell' AND dt.name = 'laptop';

-- Success message
SELECT 'All Dell laptop models successfully added!' as status; 