-- FINAL COMPREHENSIVE DEVICE MODELS INSERT SCRIPT
-- This script includes all missing brands and complete model lineups

-- =====================================================
-- STEP 1: ADD MISSING BRANDS (if not exist)
-- =====================================================

INSERT INTO brands (name, display_name, logo_url, website_url, sort_order) VALUES
('oneplus', 'OnePlus', 'https://logos-world.net/wp-content/uploads/2020/05/OnePlus-Logo.png', 'https://www.oneplus.com', 5),
('xiaomi', 'Xiaomi', 'https://logos-world.net/wp-content/uploads/2021/08/Xiaomi-Logo.png', 'https://www.mi.com', 6),
('asus', 'ASUS', 'https://logos-world.net/wp-content/uploads/2020/03/Asus-Logo.png', 'https://www.asus.com', 7),
('hp', 'HP', 'https://logos-world.net/wp-content/uploads/2020/09/HP-Logo.png', 'https://www.hp.com', 8),
('lenovo', 'Lenovo', 'https://logos-world.net/wp-content/uploads/2020/09/Lenovo-Logo.png', 'https://www.lenovo.com', 9),
('microsoft', 'Microsoft', 'https://logos-world.net/wp-content/uploads/2020/09/Microsoft-Logo.png', 'https://www.microsoft.com', 10)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- MOBILE DEVICES - ALL MISSING MODELS
-- =====================================================

INSERT INTO device_models (name, display_name, brand_id, device_type_id, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES

-- ONEPLUS MOBILE MODELS (Complete 2024-2022)
('OnePlus 12', 'OnePlus 12', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.82"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Silky Black\", \"Flowy Emerald\", \"Pale Blue\"]', true, 1),
('OnePlus 12R', 'OnePlus 12R', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.78"', '[\"128GB\", \"256GB\"]', '[\"Cool Blue\", \"Iron Gray\"]', true, 2),
('OnePlus 11', 'OnePlus 11', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Titan Black\", \"Eternal Green\"]', true, 3),
('OnePlus 11R', 'OnePlus 11R', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.74"', '[\"128GB\", \"256GB\"]', '[\"Sonic Black\", \"Galactic Silver\"]', false, 4),
('OnePlus 10 Pro', 'OnePlus 10 Pro', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.7"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Volcanic Black\", \"Emerald Forest\", \"Panda White\"]', false, 5),
('OnePlus 10T', 'OnePlus 10T', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.7"', '[\"128GB\", \"256GB\"]', '[\"Moonstone Black\", \"Jade Green\"]', false, 6),
('OnePlus Nord 4', 'OnePlus Nord 4', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.74"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Mercurial Silver\", \"Obsidian Midnight\", \"Oasis Green\"]', true, 7),
('OnePlus Nord CE 4', 'OnePlus Nord CE 4', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.7"', '[\"128GB\", \"256GB\"]', '[\"Celadon Marble\", \"Dark Chrome\"]', false, 8),
('OnePlus Nord 3', 'OnePlus Nord 3', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.74"', '[\"128GB\", \"256GB\"]', '[\"Misty Green\", \"Tempest Gray\"]', false, 9),
('OnePlus Nord CE 3', 'OnePlus Nord CE 3', (SELECT id FROM brands WHERE name = 'oneplus'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '[\"128GB\", \"256GB\"]', '[\"Aqua Surge\", \"Gray Shimmer\"]', false, 10),

-- XIAOMI MOBILE MODELS (Complete 2024-2022 including Redmi & POCO)
('Xiaomi 14 Ultra', 'Xiaomi 14 Ultra', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.73"', '[\"512GB\", \"1TB\"]', '[\"White\", \"Black\"]', true, 11),
('Xiaomi 14 Pro', 'Xiaomi 14 Pro', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.73"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Black\", \"White\", \"Titanium\"]', true, 12),
('Xiaomi 14', 'Xiaomi 14', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.36"', '[\"256GB\", \"512GB\"]', '[\"Black\", \"White\", \"Pink\", \"Green\"]', true, 13),
('Xiaomi 13 Ultra', 'Xiaomi 13 Ultra', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.73"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Black\", \"White\", \"Olive Green\"]', true, 14),
('Xiaomi 13 Pro', 'Xiaomi 13 Pro', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.73"', '[\"256GB\", \"512GB\"]', '[\"Ceramic Black\", \"Ceramic White\", \"Flora Green\"]', false, 15),
('Xiaomi 13', 'Xiaomi 13', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.36"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Black\", \"White\", \"Pink\"]', false, 16),
('Xiaomi 12S Ultra', 'Xiaomi 12S Ultra', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.73"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Black\", \"Green\"]', false, 17),
('Xiaomi 12 Pro', 'Xiaomi 12 Pro', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.73"', '[\"256GB\", \"512GB\"]', '[\"Gray\", \"Blue\", \"Purple\"]', false, 18),
('Redmi Note 13 Pro+ 5G', 'Redmi Note 13 Pro+ 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"256GB\", \"512GB\"]', '[\"Midnight Black\", \"Coral Purple\", \"Moonstone Silver\"]', true, 19),
('Redmi Note 13 Pro 5G', 'Redmi Note 13 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Ocean Teal\", \"Midnight Black\", \"Coral Purple\"]', true, 20),
('Redmi K70 Ultra', 'Redmi K70 Ultra', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Midnight Black\", \"Glacier White\", \"Mercury Silver\"]', true, 21),
('POCO X6 Pro 5G', 'POCO X6 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"256GB\", \"512GB\"]', '[\"Black\", \"Yellow\", \"Gray\"]', true, 22),
('POCO F5 Pro 5G', 'POCO F5 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"256GB\", \"512GB\"]', '[\"Arctic White\", \"Obsidian Black\"]', false, 23),

-- EXPANDED SAMSUNG GALAXY MODELS (Many missing models)
('Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24 Ultra', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.8"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Titanium Black\", \"Titanium Gray\", \"Titanium Violet\", \"Titanium Yellow\"]', true, 50),
('Samsung Galaxy S24+', 'Samsung Galaxy S24+', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.7"', '[\"256GB\", \"512GB\"]', '[\"Onyx Black\", \"Marble Gray\", \"Cobalt Violet\", \"Amber Yellow\"]', true, 51),
('Samsung Galaxy S24', 'Samsung Galaxy S24', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.2"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Onyx Black\", \"Marble Gray\", \"Cobalt Violet\", \"Amber Yellow\"]', true, 52),
('Samsung Galaxy S24 FE', 'Samsung Galaxy S24 FE', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.7"', '[\"128GB\", \"256GB\"]', '[\"Graphite\", \"Blue\", \"Mint\", \"Yellow\"]', true, 53),
('Samsung Galaxy Z Fold6', 'Samsung Galaxy Z Fold6', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '7.6"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Silver Shadow\", \"Pink\", \"Navy\"]', true, 54),
('Samsung Galaxy Z Flip6', 'Samsung Galaxy Z Flip6', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.7"', '[\"256GB\", \"512GB\"]', '[\"Silver Shadow\", \"Yellow\", \"Blue\", \"Mint\", \"Peach\"]', true, 55),
('Samsung Galaxy A55 5G', 'Samsung Galaxy A55 5G', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.6"', '[\"128GB\", \"256GB\"]', '[\"Awesome Iceblue\", \"Awesome Lilac\", \"Awesome Navy\", \"Awesome Lemon\"]', false, 56),
('Samsung Galaxy A35 5G', 'Samsung Galaxy A35 5G', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.6"', '[\"128GB\", \"256GB\"]', '[\"Awesome Iceblue\", \"Awesome Lilac\", \"Awesome Navy\", \"Awesome Lemon\"]', false, 57),
('Samsung Galaxy A25 5G', 'Samsung Galaxy A25 5G', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.5"', '[\"128GB\", \"256GB\"]', '[\"Blue Black\", \"Light Blue\", \"Yellow\"]', false, 58),
('Samsung Galaxy A15 5G', 'Samsung Galaxy A15 5G', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.5"', '[\"128GB\", \"256GB\"]', '[\"Blue Black\", \"Light Blue\", \"Yellow\"]', false, 59),
('Samsung Galaxy S23 Ultra', 'Samsung Galaxy S23 Ultra', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.8"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Phantom Black\", \"Green\", \"Cream\", \"Lavender\"]', false, 60),
('Samsung Galaxy S23+', 'Samsung Galaxy S23+', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.6"', '[\"256GB\", \"512GB\"]', '[\"Phantom Black\", \"Green\", \"Cream\", \"Lavender\"]', false, 61),
('Samsung Galaxy S23', 'Samsung Galaxy S23', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.1"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Phantom Black\", \"Green\", \"Cream\", \"Lavender\"]', false, 62),
('Samsung Galaxy Z Fold5', 'Samsung Galaxy Z Fold5', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '7.6"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Icy Blue\", \"Phantom Black\", \"Cream\"]', false, 63),
('Samsung Galaxy Z Flip5', 'Samsung Galaxy Z Flip5', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '[\"256GB\", \"512GB\"]', '[\"Mint\", \"Graphite\", \"Cream\", \"Lavender\"]', false, 64),

-- EXPANDED APPLE IPHONE MODELS (Many missing models)
('iPhone 16 Pro Max', 'iPhone 16 Pro Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.9"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Natural Titanium\", \"Blue Titanium\", \"White Titanium\", \"Black Titanium\"]', true, 100),
('iPhone 16 Pro', 'iPhone 16 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.3"', '[\"128GB\", \"256GB\", \"512GB\", \"1TB\"]', '[\"Natural Titanium\", \"Blue Titanium\", \"White Titanium\", \"Black Titanium\"]', true, 101),
('iPhone 16 Plus', 'iPhone 16 Plus', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.7"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Black\", \"White\", \"Pink\", \"Teal\", \"Ultramarine\"]', true, 102),
('iPhone 16', 'iPhone 16', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.1"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Black\", \"White\", \"Pink\", \"Teal\", \"Ultramarine\"]', true, 103),
('iPhone 15 Pro Max', 'iPhone 15 Pro Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Natural Titanium\", \"Blue Titanium\", \"White Titanium\", \"Black Titanium\"]', true, 104),
('iPhone 15 Pro', 'iPhone 15 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.1"', '[\"128GB\", \"256GB\", \"512GB\", \"1TB\"]', '[\"Natural Titanium\", \"Blue Titanium\", \"White Titanium\", \"Black Titanium\"]', true, 105),
('iPhone 15 Plus', 'iPhone 15 Plus', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Black\", \"Blue\", \"Green\", \"Yellow\", \"Pink\"]', false, 106),
('iPhone 15', 'iPhone 15', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.1"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Black\", \"Blue\", \"Green\", \"Yellow\", \"Pink\"]', false, 107),
('iPhone 14 Pro Max', 'iPhone 14 Pro Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.7"', '[\"128GB\", \"256GB\", \"512GB\", \"1TB\"]', '[\"Deep Purple\", \"Gold\", \"Silver\", \"Space Black\"]', false, 108),
('iPhone 14 Pro', 'iPhone 14 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.1"', '[\"128GB\", \"256GB\", \"512GB\", \"1TB\"]', '[\"Deep Purple\", \"Gold\", \"Silver\", \"Space Black\"]', false, 109),
('iPhone 14 Plus', 'iPhone 14 Plus', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.7"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Blue\", \"Purple\", \"Midnight\", \"Starlight\", \"Red\"]', false, 110),
('iPhone 14', 'iPhone 14', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.1"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Blue\", \"Purple\", \"Midnight\", \"Starlight\", \"Red\"]', false, 111),
('iPhone 13 Pro Max', 'iPhone 13 Pro Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2021, '6.7"', '[\"128GB\", \"256GB\", \"512GB\", \"1TB\"]', '[\"Alpine Green\", \"Silver\", \"Gold\", \"Graphite\", \"Sierra Blue\"]', false, 112),
('iPhone 13 Pro', 'iPhone 13 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2021, '6.1"', '[\"128GB\", \"256GB\", \"512GB\", \"1TB\"]', '[\"Alpine Green\", \"Silver\", \"Gold\", \"Graphite\", \"Sierra Blue\"]', false, 113),
('iPhone 13', 'iPhone 13', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2021, '6.1"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Pink\", \"Blue\", \"Midnight\", \"Starlight\", \"Red\", \"Green\"]', false, 114),
('iPhone 13 mini', 'iPhone 13 mini', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2021, '5.4"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Pink\", \"Blue\", \"Midnight\", \"Starlight\", \"Red\", \"Green\"]', false, 115),
('iPhone SE (3rd generation)', 'iPhone SE (3rd generation)', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '4.7"', '[\"64GB\", \"128GB\", \"256GB\"]', '[\"Midnight\", \"Starlight\", \"Red\"]', false, 116),
('iPhone 12 Pro Max', 'iPhone 12 Pro Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2020, '6.7"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Silver\", \"Graphite\", \"Gold\", \"Pacific Blue\"]', false, 117),
('iPhone 12 Pro', 'iPhone 12 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2020, '6.1"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Silver\", \"Graphite\", \"Gold\", \"Pacific Blue\"]', false, 118),
('iPhone 12', 'iPhone 12', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2020, '6.1"', '[\"64GB\", \"128GB\", \"256GB\"]', '[\"Black\", \"White\", \"Red\", \"Green\", \"Blue\", \"Purple\"]', false, 119),
('iPhone 12 mini', 'iPhone 12 mini', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2020, '5.4"', '[\"64GB\", \"128GB\", \"256GB\"]', '[\"Black\", \"White\", \"Red\", \"Green\", \"Blue\", \"Purple\"]', false, 120);

-- Continue with laptop models in the next section... 