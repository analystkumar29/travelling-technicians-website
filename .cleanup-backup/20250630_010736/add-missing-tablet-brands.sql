-- Add Missing Brand Entries for Tablet Device Type
-- This adds Google, OnePlus, and Xiaomi to device_type_id = 3 (tablet)

-- Add Google for tablets (device_type_id = 3)
INSERT INTO brands (name, device_type_id, display_name, is_active, sort_order)
VALUES ('google', 3, 'Google', true, 5)
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Add OnePlus for tablets (device_type_id = 3)
INSERT INTO brands (name, device_type_id, display_name, is_active, sort_order)
VALUES ('oneplus', 3, 'OnePlus', true, 6)
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Add Xiaomi for tablets (device_type_id = 3)
INSERT INTO brands (name, device_type_id, display_name, is_active, sort_order)
VALUES ('xiaomi', 3, 'Xiaomi', true, 7)
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Add Microsoft for tablets (device_type_id = 3)
INSERT INTO brands (name, device_type_id, display_name, is_active, sort_order)
VALUES ('microsoft', 3, 'Microsoft', true, 8)
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Also add Samsung for laptops if needed (device_type_id = 2)
INSERT INTO brands (name, device_type_id, display_name, is_active, sort_order)
VALUES ('samsung', 2, 'Samsung', true, 6)
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Add Lenovo for laptops (device_type_id = 2)
INSERT INTO brands (name, device_type_id, display_name, is_active, sort_order)
VALUES ('lenovo', 2, 'Lenovo', true, 7)
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Add ASUS for all device types
-- ASUS for mobile (device_type_id = 1)
INSERT INTO brands (name, device_type_id, display_name, is_active, sort_order)
VALUES ('asus', 1, 'ASUS', true, 9)
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ASUS for laptop (device_type_id = 2)
INSERT INTO brands (name, device_type_id, display_name, is_active, sort_order)
VALUES ('asus', 2, 'ASUS', true, 8)
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ASUS for tablet (device_type_id = 3)
INSERT INTO brands (name, device_type_id, display_name, is_active, sort_order)
VALUES ('asus', 3, 'ASUS', true, 9)
ON CONFLICT (name, device_type_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Verify the additions
SELECT 
    'Tablet Brands After Addition' as info,
    name,
    device_type_id,
    display_name,
    sort_order
FROM brands 
WHERE device_type_id = 3 
ORDER BY sort_order;

-- Success message
SELECT 'Missing tablet brand entries successfully added!' as status; 