-- OnePlus Mobile Device Models Script
-- Popular OnePlus phones from 2020-2024

-- OnePlus 12 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-12' as name,
    'OnePlus 12' as display_name,
    2024 as model_year,
    '6.82"' as screen_size,
    ARRAY['256GB', '512GB', '1TB'] as storage_options,
    ARRAY['Silky Black', 'Flowy Emerald', 'Pale Green'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- OnePlus 12R (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-12r' as name,
    'OnePlus 12R' as display_name,
    2024 as model_year,
    '6.78"' as screen_size,
    ARRAY['128GB', '256GB'] as storage_options,
    ARRAY['Cool Blue', 'Iron Gray'] as color_options,
    true as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- OnePlus Open (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-open' as name,
    'OnePlus Open' as display_name,
    2023 as model_year,
    '7.82"' as screen_size,
    ARRAY['512GB'] as storage_options,
    ARRAY['Voyager Black', 'Emerald Dusk'] as color_options,
    true as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- OnePlus 11 (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-11' as name,
    'OnePlus 11' as display_name,
    2023 as model_year,
    '6.7"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Titan Black', 'Eternal Green'] as color_options,
    true as is_featured,
    4 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- OnePlus 11R (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-11r' as name,
    'OnePlus 11R' as display_name,
    2023 as model_year,
    '6.74"' as screen_size,
    ARRAY['128GB', '256GB'] as storage_options,
    ARRAY['Sonic Black', 'Galactic Silver'] as color_options,
    true as is_featured,
    5 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- OnePlus Nord 3 5G (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-nord-3-5g' as name,
    'OnePlus Nord 3 5G' as display_name,
    2023 as model_year,
    '6.74"' as screen_size,
    ARRAY['128GB', '256GB'] as storage_options,
    ARRAY['Misty Green', 'Tempest Gray'] as color_options,
    true as is_featured,
    6 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- OnePlus 10 Pro (2022)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-10-pro' as name,
    'OnePlus 10 Pro' as display_name,
    2022 as model_year,
    '6.7"' as screen_size,
    ARRAY['128GB', '256GB', '512GB'] as storage_options,
    ARRAY['Volcanic Black', 'Emerald Forest'] as color_options,
    false as is_featured,
    7 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- OnePlus 9 Pro (2021)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-9-pro' as name,
    'OnePlus 9 Pro' as display_name,
    2021 as model_year,
    '6.7"' as screen_size,
    ARRAY['128GB', '256GB'] as storage_options,
    ARRAY['Morning Mist', 'Pine Green', 'Stellar Black'] as color_options,
    false as is_featured,
    8 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- OnePlus 8 Pro (2020)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-8-pro' as name,
    'OnePlus 8 Pro' as display_name,
    2020 as model_year,
    '6.78"' as screen_size,
    ARRAY['128GB', '256GB'] as storage_options,
    ARRAY['Onyx Black', 'Glacial Green', 'Ultramarine Blue'] as color_options,
    false as is_featured,
    9 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'mobile'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Success message
SELECT 'OnePlus mobile models successfully added!' as status; 