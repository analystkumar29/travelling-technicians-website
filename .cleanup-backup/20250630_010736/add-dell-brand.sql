-- Add Dell brand for laptop device type
-- This must be run before the Dell laptop models script

INSERT INTO brands (name, device_type_id, display_name, sort_order)
SELECT 
    'dell' as name,
    dt.id as device_type_id,
    'Dell' as display_name,
    9 as sort_order
FROM device_types dt
WHERE dt.name = 'laptop'
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Verify Dell brand was added
SELECT 
    b.name as brand_name,
    dt.name as device_type,
    b.display_name,
    b.sort_order
FROM brands b
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'dell' AND dt.name = 'laptop';

SELECT 'Dell brand for laptops successfully added!' as status; 