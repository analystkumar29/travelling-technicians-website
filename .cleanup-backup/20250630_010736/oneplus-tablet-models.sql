-- Complete OnePlus Tablet Device Models Script
-- All OnePlus tablets
-- Uses correct lowercase 'oneplus' brand name format

-- OnePlus Pad 2 (2024)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-pad-2' as name,
    'OnePlus Pad 2' as display_name,
    2024 as model_year,
    '12.1"' as screen_size,
    ARRAY['256GB', '512GB'] as storage_options,
    ARRAY['Nimbus Gray'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- OnePlus Pad (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-pad' as name,
    'OnePlus Pad' as display_name,
    2023 as model_year,
    '11.61"' as screen_size,
    ARRAY['128GB', '256GB'] as storage_options,
    ARRAY['Halo Green'] as color_options,
    true as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- OnePlus Pad Go (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'oneplus-pad-go' as name,
    'OnePlus Pad Go' as display_name,
    2023 as model_year,
    '11.35"' as screen_size,
    ARRAY['128GB', '256GB'] as storage_options,
    ARRAY['Twin Mint'] as color_options,
    false as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'oneplus' AND dt.name = 'tablet'
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
    'OnePlus Tablet Models Summary' as info,
    COUNT(*) as total_oneplus_tablet_models,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_models
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id 
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'oneplus' AND dt.name = 'tablet';

-- Success message
SELECT 'All OnePlus tablet models successfully added!' as status; 