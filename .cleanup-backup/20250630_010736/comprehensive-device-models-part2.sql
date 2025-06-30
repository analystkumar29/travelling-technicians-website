-- COMPREHENSIVE DEVICE MODELS INSERT SCRIPT - PART 2
-- Continuation of device models insertion

-- =====================================================
-- XIAOMI REDMI SERIES (2024-2022)
-- =====================================================

INSERT INTO device_models (name, display_name, brand_id, device_type_id, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES

-- Redmi Note Series (2024-2022)
('Redmi Note 13 Pro+ 5G', 'Redmi Note 13 Pro+ 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"256GB\", \"512GB\"]', '[\"Midnight Black\", \"Coral Purple\", \"Moonstone Silver\"]', true, 15),
('Redmi Note 13 Pro 5G', 'Redmi Note 13 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Ocean Teal\", \"Midnight Black\", \"Coral Purple\"]', true, 16),
('Redmi Note 13 5G', 'Redmi Note 13 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Midnight Black\", \"Mint Green\", \"Ice Blue\"]', false, 17),
('Redmi Note 13', 'Redmi Note 13', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Midnight Black\", \"Mint Green\", \"Ice Blue\"]', false, 18),
('Redmi Note 12 Pro+ 5G', 'Redmi Note 12 Pro+ 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"256GB\", \"512GB\"]', '[\"Iceberg Blue\", \"Midnight Black\", \"Sky Blue\"]', false, 19),
('Redmi Note 12 Pro 5G', 'Redmi Note 12 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Glacier Blue\", \"Graphite Gray\", \"Pearl White\"]', false, 20),
('Redmi Note 12 5G', 'Redmi Note 12 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Frosted Green\", \"Moonstone Silver\", \"Matte Black\"]', false, 21),
('Redmi Note 12', 'Redmi Note 12', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Onyx Gray\", \"Frosted Green\", \"Moonstone Silver\"]', false, 22),
('Redmi Note 11 Pro+ 5G', 'Redmi Note 11 Pro+ 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Phantom White\", \"Star Blue\", \"Mirage Blue\"]', false, 23),
('Redmi Note 11 Pro 5G', 'Redmi Note 11 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Stealth Black\", \"Star Blue\", \"Phantom White\"]', false, 24),

-- Redmi K Series (2024-2022)
('Redmi K70 Ultra', 'Redmi K70 Ultra', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Midnight Black\", \"Glacier White\", \"Mercury Silver\"]', true, 25),
('Redmi K70 Pro', 'Redmi K70 Pro', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"256GB\", \"512GB\"]', '[\"Midnight Black\", \"Pearl White\", \"Ice Blue\"]', true, 26),
('Redmi K70', 'Redmi K70', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Phantom Black\", \"Glacier White\", \"Jade Purple\"]', false, 27),
('Redmi K60 Ultra', 'Redmi K60 Ultra', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"256GB\", \"512GB\", \"1TB\"]', '[\"Midnight Black\", \"Silver\", \"Green\"]', false, 28),
('Redmi K60 Pro', 'Redmi K60 Pro', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Midnight Black\", \"White\", \"Green\"]', false, 29),
('Redmi K60', 'Redmi K60', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"128GB\", \"256GB\", \"512GB\"]', '[\"Black\", \"White\", \"Blue\", \"Silver\"]', false, 30),

-- POCO Series (2024-2022)
('POCO X6 Pro 5G', 'POCO X6 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"256GB\", \"512GB\"]', '[\"Black\", \"Yellow\", \"Gray\"]', true, 31),
('POCO X6 5G', 'POCO X6 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Black\", \"Blue\", \"White\"]', false, 32),
('POCO M6 Pro 5G', 'POCO M6 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Forest Green\", \"Power Black\", \"Silver\"]', false, 33),
('POCO C65', 'POCO C65', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.74"', '[\"128GB\", \"256GB\"]', '[\"Matte Black\", \"Purple\", \"Blue\"]', false, 34),
('POCO F5 Pro 5G', 'POCO F5 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"256GB\", \"512GB\"]', '[\"Arctic White\", \"Obsidian Black\"]', false, 35),
('POCO F5 5G', 'POCO F5 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"256GB\", \"512GB\"]', '[\"Carbon Black\", \"Eternal Blue\", \"Snowstorm White\"]', false, 36),
('POCO X5 Pro 5G', 'POCO X5 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Horizon Blue\", \"Astral Black\", \"Poco Yellow\"]', false, 37),
('POCO X5 5G', 'POCO X5 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Wildcat Blue\", \"Supernova Green\", \"Jaguar Black\"]', false, 38),
('POCO F4 5G', 'POCO F4 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Night Black\", \"Moonlight Silver\", \"Nebula Green\"]', false, 39),
('POCO X4 Pro 5G', 'POCO X4 Pro 5G', (SELECT id FROM brands WHERE name = 'xiaomi'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.67"', '[\"128GB\", \"256GB\"]', '[\"Laser Black\", \"Laser Blue\", \"Poco Yellow\"]', false, 40),

-- =====================================================
-- ASUS LAPTOPS (2024-2022) 
-- =====================================================

-- ASUS ROG Gaming Laptops
('ASUS ROG Strix G18', 'ASUS ROG Strix G18', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '18"', '[\"512GB\", \"1TB\", \"2TB\"]', '[\"Eclipse Gray\", \"Volt Green\"]', true, 1),
('ASUS ROG Strix G16', 'ASUS ROG Strix G16', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '[\"512GB\", \"1TB\", \"2TB\"]', '[\"Eclipse Gray\", \"Volt Green\"]', true, 2),
('ASUS ROG Strix G15', 'ASUS ROG Strix G15', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.6"', '[\"512GB\", \"1TB\"]', '[\"Eclipse Gray\", \"Electro Punk\"]', true, 3),
('ASUS ROG Zephyrus G16', 'ASUS ROG Zephyrus G16', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '[\"1TB\", \"2TB\"]', '[\"Eclipse Gray\", \"Platinum White\"]', true, 4),
('ASUS ROG Zephyrus G14', 'ASUS ROG Zephyrus G14', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14"', '[\"512GB\", \"1TB\"]', '[\"Eclipse Gray\", \"Platinum White\"]', true, 5),
('ASUS ROG Flow X16', 'ASUS ROG Flow X16', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '[\"1TB\", \"2TB\"]', '[\"Off Black\", \"Glacier White\"]', true, 6),
('ASUS ROG Flow Z13', 'ASUS ROG Flow Z13', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '13.4"', '[\"512GB\", \"1TB\"]', '[\"Off Black\"]', false, 7),

-- ASUS TUF Gaming Series
('ASUS TUF Gaming A16', 'ASUS TUF Gaming A16', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '[\"512GB\", \"1TB\"]', '[\"Jaeger Gray\", \"Mecha Gray\"]', false, 8),
('ASUS TUF Gaming A15', 'ASUS TUF Gaming A15', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.6"', '[\"512GB\", \"1TB\"]', '[\"Jaeger Gray\", \"Graphite Black\"]', false, 9),
('ASUS TUF Gaming F15', 'ASUS TUF Gaming F15', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.6"', '[\"512GB\", \"1TB\"]', '[\"Jaeger Gray\", \"Graphite Black\"]', false, 10),
('ASUS TUF Gaming F17', 'ASUS TUF Gaming F17', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '17.3"', '[\"512GB\", \"1TB\"]', '[\"Fortress Gray\", \"Graphite Black\"]', false, 11),

-- ASUS ZenBook Series
('ASUS ZenBook Pro 16X OLED', 'ASUS ZenBook Pro 16X OLED', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '[\"1TB\", \"2TB\"]', '[\"Space Gray\", \"Glacier Blue\"]', true, 12),
('ASUS ZenBook Pro 15 OLED', 'ASUS ZenBook Pro 15 OLED', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.6"', '[\"512GB\", \"1TB\"]', '[\"Deep Pine\", \"Silver\"]', true, 13),
('ASUS ZenBook 14 OLED', 'ASUS ZenBook 14 OLED', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14"', '[\"512GB\", \"1TB\"]', '[\"Ponder Blue\", \"Jasper Gray\", \"Aqua Celadon\"]', true, 14),
('ASUS ZenBook 13 OLED', 'ASUS ZenBook 13 OLED', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '13.3"', '[\"512GB\", \"1TB\"]', '[\"Pine Gray\", \"Lilac Mist\"]', false, 15),

-- ASUS VivoBook Series
('ASUS VivoBook Pro 16X OLED', 'ASUS VivoBook Pro 16X OLED', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '[\"512GB\", \"1TB\"]', '[\"Quiet Blue\", \"Silver\"]', false, 16),
('ASUS VivoBook Pro 15 OLED', 'ASUS VivoBook Pro 15 OLED', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.6"', '[\"512GB\", \"1TB\"]', '[\"Cool Silver\", \"Quiet Blue\"]', false, 17),
('ASUS VivoBook S 16 OLED', 'ASUS VivoBook S 16 OLED', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '[\"512GB\", \"1TB\"]', '[\"Neutral Black\", \"Silver\"]', false, 18),
('ASUS VivoBook S 15 OLED', 'ASUS VivoBook S 15 OLED', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.6"', '[\"512GB\", \"1TB\"]', '[\"Indie Black\", \"Silver\"]', false, 19),
('ASUS VivoBook S 14 OLED', 'ASUS VivoBook S 14 OLED', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14"', '[\"512GB\", \"1TB\"]', '[\"Indie Black\", \"Silver\", \"Solar Silver\"]', false, 20),

-- ASUS ProArt Series
('ASUS ProArt Studiobook 16 OLED', 'ASUS ProArt Studiobook 16 OLED', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '[\"1TB\", \"2TB\"]', '[\"Black\"]', true, 21),
('ASUS ProArt Display PA279CRV', 'ASUS ProArt Display PA279CRV', (SELECT id FROM brands WHERE name = 'asus'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.6"', '[\"1TB\", \"2TB\"]', '[\"Black\"]', false, 22);

-- Continue with more models in next part... 