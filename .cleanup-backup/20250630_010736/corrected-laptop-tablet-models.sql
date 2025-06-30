-- CORRECTED LAPTOP AND TABLET MODELS INSERT SCRIPT
-- This script adds all laptop and tablet models with correct schema

-- =====================================================
-- STEP 1: ASUS LAPTOP MODELS (2024-2022)
-- =====================================================

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES

-- ASUS ROG Gaming Series (2024)
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ROG Strix SCAR 18', 'ASUS ROG Strix SCAR 18', 2024, '18"', '["1TB", "2TB"]', '["Off Black", "Volt Green"]', true, 1),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ROG Strix SCAR 16', 'ASUS ROG Strix SCAR 16', 2024, '16"', '["1TB", "2TB"]', '["Off Black", "Volt Green"]', true, 2),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ROG Strix G18', 'ASUS ROG Strix G18', 2024, '18"', '["512GB", "1TB"]', '["Eclipse Gray", "Volt Green"]', true, 3),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ROG Strix G16', 'ASUS ROG Strix G16', 2024, '16"', '["512GB", "1TB"]', '["Eclipse Gray", "Electro Punk"]', true, 4),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ROG Strix G15', 'ASUS ROG Strix G15', 2024, '15.6"', '["512GB", "1TB"]', '["Eclipse Gray", "Electro Punk"]', true, 5),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ROG Zephyrus G16', 'ASUS ROG Zephyrus G16', 2024, '16"', '["1TB", "2TB"]', '["Eclipse Gray", "Platinum White"]', true, 6),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ROG Zephyrus G14', 'ASUS ROG Zephyrus G14', 2024, '14"', '["512GB", "1TB"]', '["Eclipse Gray", "Platinum White"]', true, 7),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ROG Flow X16', 'ASUS ROG Flow X16', 2024, '16"', '["1TB", "2TB"]', '["Off Black", "Glacier White"]', true, 8),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ROG Flow Z13', 'ASUS ROG Flow Z13', 2024, '13.4"', '["512GB", "1TB"]', '["Off Black"]', false, 9),

-- ASUS TUF Gaming Series
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'TUF Gaming A16', 'ASUS TUF Gaming A16', 2024, '16"', '["512GB", "1TB"]', '["Jaeger Gray", "Mecha Gray"]', false, 10),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'TUF Gaming A15', 'ASUS TUF Gaming A15', 2024, '15.6"', '["512GB", "1TB"]', '["Jaeger Gray", "Graphite Black"]', false, 11),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'TUF Gaming F15', 'ASUS TUF Gaming F15', 2024, '15.6"', '["512GB", "1TB"]', '["Jaeger Gray", "Graphite Black"]', false, 12),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'TUF Gaming F17', 'ASUS TUF Gaming F17', 2024, '17.3"', '["512GB", "1TB"]', '["Jaeger Gray"]', false, 13),

-- ASUS ZenBook Series
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ZenBook Pro 16X OLED', 'ASUS ZenBook Pro 16X OLED', 2024, '16"', '["1TB", "2TB"]', '["Space Gray", "Glacier Blue"]', true, 14),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ZenBook Pro 15 OLED', 'ASUS ZenBook Pro 15 OLED', 2024, '15.6"', '["512GB", "1TB"]', '["Deep Pine", "Silver"]', true, 15),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ZenBook 14 OLED', 'ASUS ZenBook 14 OLED', 2024, '14"', '["512GB", "1TB"]', '["Ponder Blue", "Jasper Gray", "Aqua Celadon"]', true, 16),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ZenBook 13 OLED', 'ASUS ZenBook 13 OLED', 2024, '13.3"', '["256GB", "512GB"]', '["Pine Gray", "Ponder Blue"]', false, 17),

-- ASUS VivoBook Series
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'VivoBook Pro 16X OLED', 'ASUS VivoBook Pro 16X OLED', 2024, '16"', '["512GB", "1TB"]', '["Quiet Blue", "Silver"]', false, 18),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'VivoBook S 16 OLED', 'ASUS VivoBook S 16 OLED', 2024, '16"', '["512GB", "1TB"]', '["Neutral Black", "Silver"]', false, 19),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'VivoBook S 15 OLED', 'ASUS VivoBook S 15 OLED', 2024, '15.6"', '["512GB", "1TB"]', '["Indie Black", "Silver"]', false, 20),
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'VivoBook S 14 OLED', 'ASUS VivoBook S 14 OLED', 2024, '14"', '["512GB", "1TB"]', '["Indie Black", "Silver", "Solar Silver"]', false, 21),

-- ASUS ProArt Series
((SELECT id FROM brands WHERE name = 'asus' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ProArt Studiobook 16 OLED', 'ASUS ProArt Studiobook 16 OLED', 2024, '16"', '["1TB", "2TB"]', '["Black"]', true, 22)

ON CONFLICT (brand_id, name) DO NOTHING;

-- =====================================================
-- STEP 2: HP LAPTOP MODELS (2024-2022)
-- =====================================================

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES

-- HP Spectre Series (2024)
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Spectre x360 16', 'HP Spectre x360 16', 2024, '16"', '["512GB", "1TB", "2TB"]', '["Nocturne Blue", "Natural Silver"]', true, 50),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Spectre x360 14', 'HP Spectre x360 14', 2024, '14"', '["512GB", "1TB"]', '["Nocturne Blue", "Natural Silver", "Copper Luxe"]', true, 51),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Spectre x360 13.5', 'HP Spectre x360 13.5', 2024, '13.5"', '["256GB", "512GB", "1TB"]', '["Sage Green", "Natural Silver"]', true, 52),

-- HP Envy Series (2024)
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Envy x360 16', 'HP Envy x360 16', 2024, '16"', '["512GB", "1TB"]', '["Natural Silver", "Glacier Silver"]', true, 53),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Envy x360 15.6', 'HP Envy x360 15.6', 2024, '15.6"', '["256GB", "512GB", "1TB"]', '["Natural Silver", "Nightfall Black"]', false, 54),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Envy x360 14', 'HP Envy x360 14', 2024, '14"', '["256GB", "512GB"]', '["Natural Silver", "Space Blue"]', false, 55),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Envy 17', 'HP Envy 17', 2024, '17.3"', '["512GB", "1TB"]', '["Natural Silver"]', false, 56),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Envy 16', 'HP Envy 16', 2024, '16"', '["512GB", "1TB"]', '["Natural Silver"]', false, 57),

-- HP Pavilion Series (2024)
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Pavilion Plus 16', 'HP Pavilion Plus 16', 2024, '16"', '["512GB", "1TB"]', '["Natural Silver", "Warm Gold"]', false, 58),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Pavilion Plus 14', 'HP Pavilion Plus 14', 2024, '14"', '["256GB", "512GB"]', '["Natural Silver", "Warm Gold"]', false, 59),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Pavilion x360 15.6', 'HP Pavilion x360 15.6', 2024, '15.6"', '["256GB", "512GB"]', '["Natural Silver", "Forest Teal"]', false, 60),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Pavilion x360 14', 'HP Pavilion x360 14', 2024, '14"', '["256GB", "512GB"]', '["Natural Silver", "Forest Teal"]', false, 61),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Pavilion 15', 'HP Pavilion 15', 2024, '15.6"', '["256GB", "512GB"]', '["Natural Silver", "Ceramic White"]', false, 62),

-- HP Elite/Pro Series (Business)
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'EliteBook 1040 G11', 'HP EliteBook 1040 G11', 2024, '14"', '["256GB", "512GB", "1TB"]', '["Silver"]', false, 63),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'EliteBook 860 G11', 'HP EliteBook 860 G11', 2024, '16"', '["256GB", "512GB", "1TB"]', '["Silver"]', false, 64),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'EliteBook 840 G11', 'HP EliteBook 840 G11', 2024, '14"', '["256GB", "512GB"]', '["Silver"]', false, 65),

-- HP Gaming Series
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Omen 16', 'HP Omen 16', 2024, '16.1"', '["512GB", "1TB"]', '["Shadow Black", "Mica Silver"]', true, 66),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Omen 17', 'HP Omen 17', 2024, '17.3"', '["512GB", "1TB"]', '["Shadow Black"]', true, 67),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Victus 15', 'HP Victus 15', 2024, '15.6"', '["256GB", "512GB", "1TB"]', '["Mica Silver", "Performance Blue"]', false, 68),
((SELECT id FROM brands WHERE name = 'hp' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Victus 16', 'HP Victus 16', 2024, '16.1"', '["256GB", "512GB", "1TB"]', '["Mica Silver", "Performance Blue"]', false, 69)

ON CONFLICT (brand_id, name) DO NOTHING;

-- =====================================================
-- STEP 3: LENOVO LAPTOP MODELS (2024-2022)
-- =====================================================

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES

-- Lenovo ThinkPad Series (2024)
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ThinkPad X1 Carbon Gen 12', 'Lenovo ThinkPad X1 Carbon Gen 12', 2024, '14"', '["512GB", "1TB", "2TB"]', '["Black"]', true, 100),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ThinkPad X1 Yoga Gen 9', 'Lenovo ThinkPad X1 Yoga Gen 9', 2024, '14"', '["512GB", "1TB"]', '["Storm Gray"]', true, 101),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ThinkPad X1 Extreme Gen 5', 'Lenovo ThinkPad X1 Extreme Gen 5', 2024, '16"', '["512GB", "1TB", "2TB"]', '["Black"]', true, 102),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ThinkPad P1 Gen 7', 'Lenovo ThinkPad P1 Gen 7', 2024, '16"', '["512GB", "1TB", "2TB"]', '["Black"]', true, 103),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ThinkPad T14 Gen 5', 'Lenovo ThinkPad T14 Gen 5', 2024, '14"', '["256GB", "512GB", "1TB"]', '["Black"]', false, 104),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ThinkPad T16 Gen 3', 'Lenovo ThinkPad T16 Gen 3', 2024, '16"', '["256GB", "512GB", "1TB"]', '["Black"]', false, 105),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ThinkPad L14 Gen 5', 'Lenovo ThinkPad L14 Gen 5', 2024, '14"', '["256GB", "512GB"]', '["Black"]', false, 106),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'ThinkPad E14 Gen 6', 'Lenovo ThinkPad E14 Gen 6', 2024, '14"', '["256GB", "512GB"]', '["Black"]', false, 107),

-- Lenovo Yoga Series (2024)
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Yoga Pro 9i 16IMH9', 'Lenovo Yoga Pro 9i 16IMH9', 2024, '16"', '["512GB", "1TB", "2TB"]', '["Tidal Teal", "Luna Gray"]', true, 108),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Yoga Pro 7 14IMH9', 'Lenovo Yoga Pro 7 14IMH9', 2024, '14.5"', '["512GB", "1TB"]', '["Luna Gray", "Violet Blue"]', true, 109),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Yoga 9i 14IMH9', 'Lenovo Yoga 9i 14IMH9', 2024, '14"', '["512GB", "1TB"]', '["Oatmeal", "Storm Gray"]', true, 110),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Yoga 7i 16IMH9', 'Lenovo Yoga 7i 16IMH9', 2024, '16"', '["256GB", "512GB", "1TB"]', '["Luna Gray"]', false, 111),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Yoga 7i 14IMH9', 'Lenovo Yoga 7i 14IMH9', 2024, '14"', '["256GB", "512GB"]', '["Luna Gray", "Tidal Teal"]', false, 112),

-- Lenovo Legion Gaming Series (2024)
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Legion Pro 7i Gen 9', 'Lenovo Legion Pro 7i Gen 9', 2024, '16"', '["1TB", "2TB"]', '["Onyx Gray"]', true, 113),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Legion Pro 5i Gen 9', 'Lenovo Legion Pro 5i Gen 9', 2024, '16"', '["512GB", "1TB"]', '["Glacier White", "Legion Gray"]', true, 114),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Legion 5i Gen 9', 'Lenovo Legion 5i Gen 9', 2024, '15.6"', '["256GB", "512GB", "1TB"]', '["Cloud Gray", "Phantom Blue"]', false, 115),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'Legion Slim 5i Gen 9', 'Lenovo Legion Slim 5i Gen 9', 2024, '16"', '["512GB", "1TB"]', '["Arctic Gray"]', false, 116)

ON CONFLICT (brand_id, name) DO NOTHING;

-- =====================================================
-- STEP 4: MICROSOFT SURFACE TABLET MODELS (2024-2022)
-- =====================================================

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES

-- Microsoft Surface Pro Series (2024)
((SELECT id FROM brands WHERE name = 'microsoft' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Surface Pro 10', 'Microsoft Surface Pro 10', 2024, '13"', '["256GB", "512GB", "1TB"]', '["Platinum", "Black", "Sapphire", "Dune"]', true, 200),
((SELECT id FROM brands WHERE name = 'microsoft' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Surface Pro 9', 'Microsoft Surface Pro 9', 2023, '13"', '["128GB", "256GB", "512GB", "1TB"]', '["Platinum", "Graphite", "Sapphire", "Forest"]', true, 201),

-- Microsoft Surface Laptop Studio Series
((SELECT id FROM brands WHERE name = 'microsoft' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Surface Laptop Studio 2', 'Microsoft Surface Laptop Studio 2', 2024, '14.4"', '["512GB", "1TB", "2TB"]', '["Platinum"]', true, 202),

-- Microsoft Surface Book Series
((SELECT id FROM brands WHERE name = 'microsoft' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Surface Book 3 15', 'Microsoft Surface Book 3 15', 2022, '15"', '["256GB", "512GB", "1TB"]', '["Platinum"]', false, 203),
((SELECT id FROM brands WHERE name = 'microsoft' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Surface Book 3 13', 'Microsoft Surface Book 3 13', 2022, '13.5"', '["128GB", "256GB", "512GB"]', '["Platinum"]', false, 204),

-- Microsoft Surface Go Series
((SELECT id FROM brands WHERE name = 'microsoft' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Surface Go 4', 'Microsoft Surface Go 4', 2024, '10.5"', '["128GB", "256GB"]', '["Platinum"]', false, 205),
((SELECT id FROM brands WHERE name = 'microsoft' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Surface Go 3', 'Microsoft Surface Go 3', 2022, '10.5"', '["64GB", "128GB"]', '["Platinum"]', false, 206),

-- Microsoft Surface Studio Series
((SELECT id FROM brands WHERE name = 'microsoft' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Surface Studio 2+', 'Microsoft Surface Studio 2+', 2022, '28"', '["1TB", "2TB"]', '["Platinum"]', true, 207)

ON CONFLICT (brand_id, name) DO NOTHING;

-- =====================================================
-- STEP 5: LENOVO TABLET MODELS (2024-2022)
-- =====================================================

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES

-- Lenovo Tab P Series (Premium)
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Tab P12 Pro', 'Lenovo Tab P12 Pro', 2024, '12.6"', '["128GB", "256GB", "512GB"]', '["Storm Gray", "Oat"]', true, 300),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Tab P11 Pro Gen 2', 'Lenovo Tab P11 Pro Gen 2', 2024, '11.2"', '["128GB", "256GB"]', '["Storm Gray", "Oat"]', true, 301),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Tab P11 Plus Gen 2', 'Lenovo Tab P11 Plus Gen 2', 2024, '11"', '["128GB", "256GB"]', '["Storm Gray", "Silver"]', false, 302),

-- Lenovo Tab M Series (Budget/Mid-range)
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Tab M11', 'Lenovo Tab M11', 2024, '11"', '["64GB", "128GB"]', '["Luna Gray", "Seafoam Green"]', false, 303),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Tab M10 Plus Gen 3', 'Lenovo Tab M10 Plus Gen 3', 2024, '10.6"', '["64GB", "128GB"]', '["Storm Gray", "Arctic Gray"]', false, 304),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Tab M10 Gen 3', 'Lenovo Tab M10 Gen 3', 2023, '10.1"', '["32GB", "64GB", "128GB"]', '["Arctic Gray", "Storm Gray"]', false, 305),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Tab M9', 'Lenovo Tab M9', 2023, '9"', '["32GB", "64GB", "128GB"]', '["Arctic Gray"]', false, 306),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Tab M8 Gen 4', 'Lenovo Tab M8 Gen 4', 2023, '8"', '["32GB", "64GB"]', '["Arctic Gray", "Pink"]', false, 307),

-- Lenovo Yoga Tab Series
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Yoga Tab 13', 'Lenovo Yoga Tab 13', 2022, '13"', '["128GB", "256GB"]', '["Shadow Black"]', false, 308),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Yoga Tab 11', 'Lenovo Yoga Tab 11', 2022, '11"', '["128GB", "256GB"]', '["Storm Gray"]', false, 309),

-- Lenovo ThinkPad Tablet Series
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'ThinkPad X12 Detachable Gen 2', 'Lenovo ThinkPad X12 Detachable Gen 2', 2024, '12.3"', '["256GB", "512GB"]', '["Storm Gray"]', true, 310),
((SELECT id FROM brands WHERE name = 'lenovo' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'ThinkPad X1 Tablet Gen 3', 'Lenovo ThinkPad X1 Tablet Gen 3', 2022, '13"', '["256GB", "512GB", "1TB"]', '["Black"]', false, 311)

ON CONFLICT (brand_id, name) DO NOTHING;

-- =====================================================
-- STEP 6: EXPANDED SAMSUNG TABLET MODELS
-- =====================================================

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES

-- Samsung Galaxy Tab S10 Series (2024) - Latest flagship
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab S10 Ultra', 'Samsung Galaxy Tab S10 Ultra', 2024, '14.6"', '["256GB", "512GB", "1TB"]', '["Moonstone Gray", "Platinum Silver"]', true, 400),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab S10+', 'Samsung Galaxy Tab S10+', 2024, '12.4"', '["256GB", "512GB"]', '["Moonstone Gray", "Platinum Silver"]', true, 401),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab S10', 'Samsung Galaxy Tab S10', 2024, '11"', '["128GB", "256GB"]', '["Moonstone Gray", "Platinum Silver"]', true, 402),

-- Samsung Galaxy Tab S9 Series (2023)
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab S9 Ultra', 'Samsung Galaxy Tab S9 Ultra', 2023, '14.6"', '["256GB", "512GB", "1TB"]', '["Beige", "Graphite"]', true, 403),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab S9+', 'Samsung Galaxy Tab S9+', 2023, '12.4"', '["256GB", "512GB"]', '["Beige", "Graphite"]', true, 404),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab S9', 'Samsung Galaxy Tab S9', 2023, '11"', '["128GB", "256GB"]', '["Beige", "Graphite"]', true, 405),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab S9 FE+', 'Samsung Galaxy Tab S9 FE+', 2023, '12.4"', '["128GB", "256GB"]', '["Gray", "Mint", "Silver", "Lavender"]', false, 406),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab S9 FE', 'Samsung Galaxy Tab S9 FE', 2023, '10.9"', '["128GB", "256GB"]', '["Gray", "Mint", "Silver", "Lavender"]', false, 407),

-- Samsung Galaxy Tab A Series (Budget/Mid-range)
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab A9+', 'Samsung Galaxy Tab A9+', 2024, '11"', '["64GB", "128GB"]', '["Graphite", "Silver"]', false, 408),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab A9', 'Samsung Galaxy Tab A9', 2024, '8.7"', '["64GB", "128GB"]', '["Graphite", "Silver"]', false, 409),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'Galaxy Tab A8', 'Samsung Galaxy Tab A8', 2022, '10.5"', '["32GB", "64GB", "128GB"]', '["Gray", "Silver", "Pink Gold"]', false, 410)

ON CONFLICT (brand_id, name) DO NOTHING;

-- =====================================================
-- STEP 7: EXPANDED APPLE IPAD MODELS
-- =====================================================

INSERT INTO device_models (brand_id, name, display_name, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES

-- iPad Pro M4 Series (2024) - Latest generation
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Pro 13-inch M4', 'iPad Pro 13-inch M4', 2024, '13"', '["256GB", "512GB", "1TB", "2TB"]', '["Silver", "Space Black"]', true, 500),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Pro 11-inch M4', 'iPad Pro 11-inch M4', 2024, '11"', '["256GB", "512GB", "1TB", "2TB"]', '["Silver", "Space Black"]', true, 501),

-- iPad Air M2 Series (2024)
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Air 13-inch M2', 'iPad Air 13-inch M2', 2024, '13"', '["128GB", "256GB", "512GB", "1TB"]', '["Space Gray", "Starlight", "Pink", "Purple", "Blue"]', true, 502),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Air 11-inch M2', 'iPad Air 11-inch M2', 2024, '11"', '["128GB", "256GB", "512GB", "1TB"]', '["Space Gray", "Starlight", "Pink", "Purple", "Blue"]', true, 503),

-- iPad 10th Generation (2022)
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad 10th generation', 'iPad 10th generation', 2022, '10.9"', '["64GB", "256GB"]', '["Silver", "Pink", "Blue", "Yellow"]', true, 504),

-- iPad mini 6th Generation (2021)
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad mini 6th generation', 'iPad mini 6th generation', 2021, '8.3"', '["64GB", "256GB"]', '["Space Gray", "Pink", "Purple", "Starlight"]', false, 505),

-- iPad Pro M2 Series (2022) - Previous generation
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Pro 12.9-inch M2', 'iPad Pro 12.9-inch M2', 2022, '12.9"', '["128GB", "256GB", "512GB", "1TB", "2TB"]', '["Silver", "Space Gray"]', false, 506),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Pro 11-inch M2', 'iPad Pro 11-inch M2', 2022, '11"', '["128GB", "256GB", "512GB", "1TB", "2TB"]', '["Silver", "Space Gray"]', false, 507),

-- iPad Air 5th Generation (2022)
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad Air 5th generation', 'iPad Air 5th generation', 2022, '10.9"', '["64GB", "256GB"]', '["Space Gray", "Starlight", "Pink", "Purple", "Blue"]', false, 508),

-- iPad 9th Generation (2021)
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'tablet')), 'iPad 9th generation', 'iPad 9th generation', 2021, '10.2"', '["64GB", "256GB"]', '["Space Gray", "Silver"]', false, 509)

ON CONFLICT (brand_id, name) DO NOTHING;

-- =====================================================
-- SCRIPT COMPLETED SUCCESSFULLY
-- =====================================================

-- This script includes:
-- - 22 ASUS laptop models (ROG, TUF, ZenBook, VivoBook, ProArt)
-- - 20 HP laptop models (Spectre, Envy, Pavilion, Elite, Gaming)
-- - 16 Lenovo laptop models (ThinkPad, Yoga, Legion)
-- - 7 Microsoft Surface tablet models
-- - 11 Lenovo tablet models (Tab P, Tab M, Yoga Tab, ThinkPad)
-- - 10 Samsung Galaxy tablet models (S10, S9, A series)
-- - 9 Apple iPad models (Pro M4, Air M2, regular iPad, mini)
-- - All models include realistic specifications and color options
-- - Proper conflict resolution with (brand_id, name) constraints

-- Total: 95+ new laptop and tablet models added 