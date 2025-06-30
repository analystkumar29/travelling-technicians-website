-- Complete Google Tablet Device Models Script
-- All Google Pixel tablets
-- Uses correct lowercase 'google' brand name format

-- Google Pixel Tablet (2023)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'pixel-tablet' as name,
    'Pixel Tablet' as display_name,
    2023 as model_year,
    '10.95"' as screen_size,
    ARRAY['128GB', '256GB'] as storage_options,
    ARRAY['Porcelain', 'Hazel', 'Rose'] as color_options,
    true as is_featured,
    1 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'google' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Google Pixel Slate (2018)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'pixel-slate' as name,
    'Pixel Slate' as display_name,
    2018 as model_year,
    '12.3"' as screen_size,
    ARRAY['64GB', '128GB', '256GB'] as storage_options,
    ARRAY['Midnight Blue', 'Not Pink'] as color_options,
    false as is_featured,
    2 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'google' AND dt.name = 'tablet'
ON CONFLICT (brand_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    model_year = EXCLUDED.model_year,
    screen_size = EXCLUDED.screen_size,
    storage_options = EXCLUDED.storage_options,
    color_options = EXCLUDED.color_options,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Google Pixel C (2015)
INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order)
SELECT 
    b.id as brand_id,
    'pixel-c' as name,
    'Pixel C' as display_name,
    2015 as model_year,
    '10.2"' as screen_size,
    ARRAY['32GB', '64GB'] as storage_options,
    ARRAY['Silver'] as color_options,
    false as is_featured,
    3 as sort_order
FROM brands b 
JOIN device_types dt ON b.device_type_id = dt.id 
WHERE b.name = 'google' AND dt.name = 'tablet'
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
    'Google Tablet Models Summary' as info,
    COUNT(*) as total_google_tablet_models,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_models
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id 
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'google' AND dt.name = 'tablet';

-- Success message
SELECT 'All Google tablet models successfully added!' as status; 