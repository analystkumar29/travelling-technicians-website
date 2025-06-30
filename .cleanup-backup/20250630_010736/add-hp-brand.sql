-- Add HP brand for laptop device type
-- This must be run before the HP laptop models script

INSERT INTO brands (name, device_type_id, display_name, sort_order)
SELECT 
    'hp' as name,
    dt.id as device_type_id,
    'HP' as display_name,
    8 as sort_order
FROM device_types dt
WHERE dt.name = 'laptop'
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Verify HP brand was added
SELECT 
    b.name as brand_name,
    dt.name as device_type,
    b.display_name,
    b.sort_order
FROM brands b
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'hp' AND dt.name = 'laptop';

SELECT 'HP brand for laptops successfully added!' as status; 