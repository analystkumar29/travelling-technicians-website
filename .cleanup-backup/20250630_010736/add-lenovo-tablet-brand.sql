-- Add Lenovo brand for tablet device type
-- This ensures Lenovo brand exists for tablets before running the tablet models script

INSERT INTO brands (name, device_type_id, display_name, sort_order)
SELECT 
    'lenovo' as name,
    dt.id as device_type_id,
    'Lenovo' as display_name,
    7 as sort_order
FROM device_types dt
WHERE dt.name = 'tablet'
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Verify Lenovo brand was added
SELECT 
    b.name as brand_name,
    dt.name as device_type,
    b.display_name,
    b.sort_order
FROM brands b
JOIN device_types dt ON b.device_type_id = dt.id
WHERE b.name = 'lenovo' AND dt.name = 'tablet';

SELECT 'Lenovo brand for tablets successfully added!' as status; 