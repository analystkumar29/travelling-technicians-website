-- COMPREHENSIVE DEVICE MODELS INSERT SCRIPT
-- Includes all missing brands and complete model lineups (2024-2022)
-- Run this script in Supabase to add all missing device models

-- =====================================================
-- STEP 1: ADD MISSING BRANDS
-- =====================================================

-- Add missing brands if they don't exist
INSERT INTO brands (name, display_name, logo_url, website_url, sort_order) VALUES
('oneplus', 'OnePlus', 'https://logos-world.net/wp-content/uploads/2020/05/OnePlus-Logo.png', 'https://www.oneplus.com', 5),
('xiaomi', 'Xiaomi', 'https://logos-world.net/wp-content/uploads/2021/08/Xiaomi-Logo.png', 'https://www.mi.com', 6),
('asus', 'ASUS', 'https://logos-world.net/wp-content/uploads/2020/03/Asus-Logo.png', 'https://www.asus.com', 7),
('hp', 'HP', 'https://logos-world.net/wp-content/uploads/2020/09/HP-Logo.png', 'https://www.hp.com', 8),
('lenovo', 'Lenovo', 'https://logos-world.net/wp-content/uploads/2020/09/Lenovo-Logo.png', 'https://www.lenovo.com', 9),
('microsoft', 'Microsoft', 'https://logos-world.net/wp-content/uploads/2020/09/Microsoft-Logo.png', 'https://www.microsoft.com', 10)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 2: ONEPLUS MOBILE DEVICES
-- =====================================================

-- OnePlus Mobile Devices (2024-2022)
INSERT INTO device_models (name, display_name, brand_id, device_type_id, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES

-- OnePlus 12 Series (2024)
('OnePlus 12', 'OnePlus 12', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.82"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Silky Black\", \"Flowy Emerald\", \"Pale Blue\"]', true, 1),
('OnePlus 12R', 'OnePlus 12R', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.78"', '[\"128GB\", \"256GB\"]', '[\"Cool Blue\", \"Iron Gray\"]', true, 2),

-- OnePlus 11 Series (2023)
('OnePlus 11', 'OnePlus 11', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Titan Black\", \"Eternal Green\"]', true, 3),
('OnePlus 11R', 'OnePlus 11R', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.74"', '[\"128GB\", \"256GB\"]', '[\"Sonic Black\", \"Galactic Silver\"]', false, 4),

-- OnePlus 10 Series (2022)
('OnePlus 10 Pro', 'OnePlus 10 Pro', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.7"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Volcanic Black\", \"Emerald Forest\", \"Panda White\"]', false, 5),
('OnePlus 10T', 'OnePlus 10T', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.7"', '[\"128GB\", \"256GB\"]', '[\"Moonstone Black\", \"Jade Green\"]', false, 6),
('OnePlus 10R', 'OnePlus 10R', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.7"', '[\"128GB\", \"256GB\"]', '[\"Sierra Black\", \"Forest Green\"]', false, 7),

-- OnePlus Nord Series (2024-2022)
('OnePlus Nord 4', 'OnePlus Nord 4', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.74"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Mercurial Silver\", \"Obsidian Midnight\", \"Oasis Green\"]', true, 8),
('OnePlus Nord CE 4', 'OnePlus Nord CE 4', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.7"', '[\"128GB\", \"256GB\"]', '[\"Celadon Marble\", \"Dark Chrome\"]', false, 9),
('OnePlus Nord CE 4 Lite', 'OnePlus Nord CE 4 Lite', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Super Silver\", \"Mega Blue\"]', false, 10),
('OnePlus Nord 3', 'OnePlus Nord 3', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.74"', '[\"128GB\", \"256GB\"]', '[\"Misty Green\", \"Tempest Gray\"]', false, 11),
('OnePlus Nord CE 3', 'OnePlus Nord CE 3', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '[\"128GB\", \"256GB\"]', '[\"Aqua Surge\", \"Gray Shimmer\"]', false, 12),
('OnePlus Nord CE 3 Lite', 'OnePlus Nord CE 3 Lite', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.72"', '[\"128GB\", \"256GB\"]', '[\"Pastel Lime\", \"Chromatic Gray\"]', false, 13),
('OnePlus Nord 2T', 'OnePlus Nord 2T', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.43"', '[\"128GB\", \"256GB\"]', '[\"Shadow Gray\", \"Jade Fog\"]', false, 14),
('OnePlus Nord CE 2', 'OnePlus Nord CE 2', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.43"', '[\"128GB\", \"256GB\"]', '[\"Gray Mirror\", \"Bahama Blue\"]', false, 15),
('OnePlus Nord CE 2 Lite', 'OnePlus Nord CE 2 Lite', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.59"', '[\"128GB\"]', '[\"Black Dusk\", \"Blue Tide\"]', false, 16),

-- =====================================================
-- STEP 3: XIAOMI MOBILE DEVICES  
-- =====================================================

-- Xiaomi Flagship Series (2024-2022)
('Xiaomi 14 Ultra', 'Xiaomi 14 Ultra', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.73"', '[\"512GB\", \"1TB\"]', '[\"White\", \"Black\"]', true, 1),
('Xiaomi 14 Pro', 'Xiaomi 14 Pro', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.73"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Black\", \"White\", \"Titanium\"]', true, 2),
('Xiaomi 14', 'Xiaomi 14', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.36"', '[\"256GB\", \"512GB\"]', '[\"Black\", \"White\", \"Pink\", \"Green\"]', true, 3),
('Xiaomi 13 Ultra', 'Xiaomi 13 Ultra', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.73"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Black\", \"White\", \"Olive Green\"]', true, 4),
('Xiaomi 13 Pro', 'Xiaomi 13 Pro', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.73"', '[\"256GB\", \"512GB\"]', '[\"Ceramic Black\", \"Ceramic White\", \"Flora Green\"]', false, 5),
('Xiaomi 13', 'Xiaomi 13', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.36"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Black\", \"White\", \"Pink\"]', false, 6),
('Xiaomi 13 Lite', 'Xiaomi 13 Lite', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.55"', '[\"128GB\", \"256GB\"]', '[\"Lite Pink\", \"Lite Blue\", \"Lite Green\"]', false, 7),
('Xiaomi 12S Ultra', 'Xiaomi 12S Ultra', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.73"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Black\", \"Green\"]', false, 8),
('Xiaomi 12 Pro', 'Xiaomi 12 Pro', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.73"', '[\"256GB\", \"512GB\"]', '[\"Gray\", \"Blue\", \"Purple\"]', false, 9),
('Xiaomi 12', 'Xiaomi 12', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.28"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Gray\", \"Blue\", \"Purple\", \"Green\"]', false, 10);

-- Continue with the rest of the script...
-- This file will be quite large, so I'll create it in parts. 