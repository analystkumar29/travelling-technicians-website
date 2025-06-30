-- Complete HP Laptop Device Models Script
-- All major HP laptop series from 2021-2024
-- Uses correct lowercase 'hp' brand name format

-- Spectre x360 16 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'spectre-x360-16-2024' as name,
    'Spectre x360 16 (2024)' as display_name,
    2024 as model_year,
    '16"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Nightfall Black', 'Natural Silver', 'Nocturne Blue'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Envy x360 15 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'envy-x360-15-2024' as name,
    'Envy x360 15 (2024)' as display_name,
    2024 as model_year,
    '15.6"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Natural Silver', 'Space Blue'] as color_options,
    true as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Omen 17 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'omen-17-2024' as name,
    'Omen 17 (2024)' as display_name,
    2024 as model_year,
    '17.3"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Shadow Black', 'Mica Silver'] as color_options,
    true as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- EliteBook 860 G11 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'elitebook-860-g11' as name,
    'EliteBook 860 G11' as display_name,
    2024 as model_year,
    '16"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Silver'] as color_options,
    true as is_featured,
    4 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Pavilion Plus 14 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'pavilion-plus-14-2024' as name,
    'Pavilion Plus 14 (2024)' as display_name,
    2024 as model_year,
    '14"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Natural Silver', 'Warm Gold'] as color_options,
    true as is_featured,
    5 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ZBook Studio 16 G11 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'zbook-studio-16-g11' as name,
    'ZBook Studio 16 G11' as display_name,
    2024 as model_year,
    '16"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Turbo Silver'] as color_options,
    true as is_featured,
    6 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Spectre x360 14 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'spectre-x360-14-2023' as name,
    'Spectre x360 14 (2023)' as display_name,
    2023 as model_year,
    '13.5"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Nightfall Black', 'Natural Silver', 'Nocturne Blue'] as color_options,
    false as is_featured,
    7 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Envy 17 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'envy-17-2023' as name,
    'Envy 17 (2023)' as display_name,
    2023 as model_year,
    '17.3"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Natural Silver'] as color_options,
    false as is_featured,
    8 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Omen 16 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'omen-16-2023' as name,
    'Omen 16 (2023)' as display_name,
    2023 as model_year,
    '16.1"' as screen_size,
    ARRAY['512GB', '1TB'] as storage_options,
    ARRAY['Shadow Black', 'Mica Silver'] as color_options,
    false as is_featured,
    9 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- EliteBook 840 G10 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'elitebook-840-g10' as name,
    'EliteBook 840 G10' as display_name,
    2023 as model_year,
    '14"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Silver'] as color_options,
    false as is_featured,
    10 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ProBook 450 G10 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'probook-450-g10' as name,
    'ProBook 450 G10' as display_name,
    2023 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB'] as storage_options,
    ARRAY['Silver'] as color_options,
    false as is_featured,
    11 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Pavilion 15 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'pavilion-15-2023' as name,
    'Pavilion 15 (2023)' as display_name,
    2023 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB'] as storage_options,
    ARRAY['Natural Silver', 'Warm Gold', 'Ceramic White'] as color_options,
    false as is_featured,
    12 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ZBook Fury 17 G10 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'zbook-fury-17-g10' as name,
    'ZBook Fury 17 G10' as display_name,
    2023 as model_year,
    '17.3"' as screen_size,
    ARRAY['512GB', '1TB', '2TB'] as storage_options,
    ARRAY['Turbo Silver'] as color_options,
    false as is_featured,
    13 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Victus 15 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'victus-15-2022' as name,
    'Victus 15 (2022)' as display_name,
    2022 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Mica Silver', 'Performance Blue'] as color_options,
    false as is_featured,
    14 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- EliteBook 850 G9 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'elitebook-850-g9' as name,
    'EliteBook 850 G9' as display_name,
    2022 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Silver'] as color_options,
    false as is_featured,
    15 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Dragonfly G3 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'elite-dragonfly-g3' as name,
    'Elite Dragonfly G3' as display_name,
    2022 as model_year,
    '13.5"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Dragonfly Blue', 'Natural Silver'] as color_options,
    false as is_featured,
    16 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Pavilion Gaming 16 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'pavilion-gaming-16-2022' as name,
    'Pavilion Gaming 16 (2022)' as display_name,
    2022 as model_year,
    '16.1"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Shadow Black', 'Acid Green'] as color_options,
    false as is_featured,
    17 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ZBook Power 15 G9 (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'zbook-power-15-g9' as name,
    'ZBook Power 15 G9' as display_name,
    2022 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Turbo Silver'] as color_options,
    false as is_featured,
    18 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Envy 13 (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'envy-13-2021' as name,
    'Envy 13 (2021)' as display_name,
    2021 as model_year,
    '13.3"' as screen_size,
    ARRAY['256GB', '512GB'] as storage_options,
    ARRAY['Natural Silver', 'Pale Gold'] as color_options,
    false as is_featured,
    19 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Omen 15 (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'omen-15-2021' as name,
    'Omen 15 (2021)' as display_name,
    2021 as model_year,
    '15.6"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Shadow Black', 'Mica Silver'] as color_options,
    false as is_featured,
    20 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'hp' AND dt.name = 'laptop'
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
    'HP Laptop Models Summary' as info,
    COUNT(*) as total_hp_laptop_models,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_models
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id 
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'hp' AND dt.name = 'laptop';

-- Success message
SELECT 'All HP laptop models successfully added!' as status; 