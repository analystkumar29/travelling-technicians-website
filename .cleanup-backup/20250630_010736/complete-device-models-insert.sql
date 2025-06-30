-- Complete Device Models Insert Script
-- This script adds all latest device models for each brand across mobile, laptop, and tablet categories
-- Updated for 2024 releases

-- ===========================================
-- APPLE MODELS
-- ===========================================

-- Apple Mobile Devices (iPhones)
INSERT INTO device_models (name, display_name, brand_id, device_type_id, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES
-- iPhone 16 Series (2024)
('iPhone 16 Pro Max', 'iPhone 16 Pro Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.9"', '["256GB", "512GB", "1TB"]', '["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]', true, 1),
('iPhone 16 Pro', 'iPhone 16 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.3"', '["128GB", "256GB", "512GB", "1TB"]', '["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]', true, 2),
('iPhone 16 Plus', 'iPhone 16 Plus', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.7"', '["128GB", "256GB", "512GB"]', '["Pink", "Teal", "Ultramarine", "White", "Black"]', true, 3),
('iPhone 16', 'iPhone 16', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.1"', '["128GB", "256GB", "512GB"]', '["Pink", "Teal", "Ultramarine", "White", "Black"]', true, 4),

-- iPhone 15 Series (2023)
('iPhone 15 Pro Max', 'iPhone 15 Pro Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '["256GB", "512GB", "1TB"]', '["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]', true, 5),
('iPhone 15 Pro', 'iPhone 15 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.1"', '["128GB", "256GB", "512GB", "1TB"]', '["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]', true, 6),
('iPhone 15 Plus', 'iPhone 15 Plus', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '["128GB", "256GB", "512GB"]', '["Pink", "Yellow", "Green", "Blue", "Black"]', true, 7),
('iPhone 15', 'iPhone 15', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.1"', '["128GB", "256GB", "512GB"]', '["Pink", "Yellow", "Green", "Blue", "Black"]', true, 8),

-- iPhone 14 Series (2022)
('iPhone 14 Pro Max', 'iPhone 14 Pro Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.7"', '["128GB", "256GB", "512GB", "1TB"]', '["Deep Purple", "Gold", "Silver", "Space Black"]', false, 9),
('iPhone 14 Pro', 'iPhone 14 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.1"', '["128GB", "256GB", "512GB", "1TB"]', '["Deep Purple", "Gold", "Silver", "Space Black"]', false, 10),
('iPhone 14 Plus', 'iPhone 14 Plus', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.7"', '["128GB", "256GB", "512GB"]', '["Blue", "Purple", "Midnight", "Starlight", "Red"]', false, 11),
('iPhone 14', 'iPhone 14', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.1"', '["128GB", "256GB", "512GB"]', '["Blue", "Purple", "Midnight", "Starlight", "Red"]', false, 12),

-- iPhone 13 Series (2021)
('iPhone 13 Pro Max', 'iPhone 13 Pro Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2021, '6.7"', '["128GB", "256GB", "512GB", "1TB"]', '["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"]', false, 13),
('iPhone 13 Pro', 'iPhone 13 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2021, '6.1"', '["128GB", "256GB", "512GB", "1TB"]', '["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"]', false, 14),
('iPhone 13', 'iPhone 13', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2021, '6.1"', '["128GB", "256GB", "512GB"]', '["Pink", "Blue", "Midnight", "Starlight", "Red"]', false, 15),
('iPhone 13 mini', 'iPhone 13 mini', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2021, '5.4"', '["128GB", "256GB", "512GB"]', '["Pink", "Blue", "Midnight", "Starlight", "Red"]', false, 16),

-- iPhone SE
('iPhone SE (3rd generation)', 'iPhone SE (3rd generation)', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '4.7"', '["64GB", "128GB", "256GB"]', '["Midnight", "Starlight", "Red"]', false, 17),

-- Apple Laptops (MacBooks)
('MacBook Pro 16" M4 Max', 'MacBook Pro 16" M4 Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16.2"', '["512GB", "1TB", "2TB", "4TB", "8TB"]', '["Space Black", "Silver"]', true, 1),
('MacBook Pro 16" M4 Pro', 'MacBook Pro 16" M4 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16.2"', '["512GB", "1TB", "2TB", "4TB"]', '["Space Black", "Silver"]', true, 2),
('MacBook Pro 14" M4 Max', 'MacBook Pro 14" M4 Max', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14.2"', '["512GB", "1TB", "2TB", "4TB", "8TB"]', '["Space Black", "Silver"]', true, 3),
('MacBook Pro 14" M4 Pro', 'MacBook Pro 14" M4 Pro', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14.2"', '["512GB", "1TB", "2TB", "4TB"]', '["Space Black", "Silver"]', true, 4),
('MacBook Pro 14" M4', 'MacBook Pro 14" M4', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14.2"', '["512GB", "1TB", "2TB"]', '["Space Black", "Silver"]', true, 5),
('MacBook Air 15" M3', 'MacBook Air 15" M3', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.3"', '["256GB", "512GB", "1TB", "2TB"]', '["Midnight", "Starlight", "Silver", "Space Gray"]', true, 6),
('MacBook Air 13" M3', 'MacBook Air 13" M3', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '13.6"', '["256GB", "512GB", "1TB", "2TB"]', '["Midnight", "Starlight", "Silver", "Space Gray"]', true, 7),
('MacBook Air 13" M2', 'MacBook Air 13" M2', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'laptop'), 2022, '13.6"', '["256GB", "512GB", "1TB", "2TB"]', '["Midnight", "Starlight", "Silver", "Space Gray"]', false, 8),
('MacBook Air 13" M1', 'MacBook Air 13" M1', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'laptop'), 2020, '13.3"', '["256GB", "512GB", "1TB", "2TB"]', '["Gold", "Silver", "Space Gray"]', false, 9),

-- Apple Tablets (iPads)
('iPad Pro 13" M4', 'iPad Pro 13" M4', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'tablet'), 2024, '13"', '["256GB", "512GB", "1TB", "2TB"]', '["Silver", "Space Black"]', true, 1),
('iPad Pro 11" M4', 'iPad Pro 11" M4', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'tablet'), 2024, '11"', '["256GB", "512GB", "1TB", "2TB"]', '["Silver", "Space Black"]', true, 2),
('iPad Air 13" M2', 'iPad Air 13" M2', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'tablet'), 2024, '13"', '["128GB", "256GB", "512GB", "1TB"]', '["Space Gray", "Starlight", "Pink", "Purple", "Blue"]', true, 3),
('iPad Air 11" M2', 'iPad Air 11" M2', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'tablet'), 2024, '11"', '["128GB", "256GB", "512GB", "1TB"]', '["Space Gray", "Starlight", "Pink", "Purple", "Blue"]', true, 4),
('iPad 10th generation', 'iPad 10th generation', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'tablet'), 2022, '10.9"', '["64GB", "256GB"]', '["Silver", "Pink", "Blue", "Yellow"]', true, 5),
('iPad mini 6th generation', 'iPad mini 6th generation', (SELECT id FROM brands WHERE name = 'apple'), (SELECT id FROM device_types WHERE name = 'tablet'), 2021, '8.3"', '["64GB", "256GB"]', '["Space Gray", "Pink", "Purple", "Starlight"]', false, 6);

-- ===========================================
-- SAMSUNG MODELS
-- ===========================================

-- Samsung Mobile Devices
INSERT INTO device_models (name, display_name, brand_id, device_type_id, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES
-- Galaxy S24 Series (2024)
('Galaxy S24 Ultra', 'Galaxy S24 Ultra', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.8"', '["256GB", "512GB", "1TB"]', '["Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"]', true, 1),
('Galaxy S24+', 'Galaxy S24+', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.7"', '["256GB", "512GB"]', '["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"]', true, 2),
('Galaxy S24', 'Galaxy S24', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.2"', '["128GB", "256GB", "512GB"]', '["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"]', true, 3),

-- Galaxy S23 Series (2023)
('Galaxy S23 Ultra', 'Galaxy S23 Ultra', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.8"', '["256GB", "512GB", "1TB"]', '["Phantom Black", "Cream", "Green", "Lavender"]', true, 4),
('Galaxy S23+', 'Galaxy S23+', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.6"', '["256GB", "512GB"]', '["Phantom Black", "Cream", "Green", "Lavender"]', false, 5),
('Galaxy S23', 'Galaxy S23', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.1"', '["128GB", "256GB", "512GB"]', '["Phantom Black", "Cream", "Green", "Lavender"]', false, 6),

-- Galaxy Z Series (Foldables)
('Galaxy Z Fold6', 'Galaxy Z Fold6', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '7.6"', '["256GB", "512GB", "1TB"]', '["Silver Shadow", "Pink", "Navy", "Crafted Black", "White"]', true, 7),
('Galaxy Z Flip6', 'Galaxy Z Flip6', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.7"', '["256GB", "512GB"]', '["Silver Shadow", "Yellow", "Blue", "Mint", "Black", "White", "Peach"]', true, 8),
('Galaxy Z Fold5', 'Galaxy Z Fold5', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '7.6"', '["256GB", "512GB", "1TB"]', '["Phantom Black", "Cream", "Icy Blue"]', false, 9),
('Galaxy Z Flip5', 'Galaxy Z Flip5', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '["256GB", "512GB"]', '["Mint", "Graphite", "Cream", "Lavender"]', false, 10),

-- Galaxy A Series
('Galaxy A55 5G', 'Galaxy A55 5G', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.6"', '["128GB", "256GB"]', '["Awesome Iceblue", "Awesome Lilac", "Awesome Navy", "Awesome Lemon"]', false, 11),
('Galaxy A35 5G', 'Galaxy A35 5G', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.6"', '["128GB", "256GB"]', '["Awesome Iceblue", "Awesome Lilac", "Awesome Navy", "Awesome Lemon"]', false, 12),
('Galaxy A25 5G', 'Galaxy A25 5G', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.5"', '["128GB", "256GB"]', '["Blue Black", "Blue", "Yellow", "Light Blue"]', false, 13),

-- Samsung Laptops
('Galaxy Book4 Ultra', 'Galaxy Book4 Ultra', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '["512GB", "1TB"]', '["Moonstone Gray"]', true, 1),
('Galaxy Book4 Pro 360', 'Galaxy Book4 Pro 360', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '["512GB", "1TB"]', '["Moonstone Gray"]', true, 2),
('Galaxy Book4 Pro', 'Galaxy Book4 Pro', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '["512GB", "1TB"]', '["Moonstone Gray"]', true, 3),
('Galaxy Book4 360', 'Galaxy Book4 360', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.6"', '["256GB", "512GB"]', '["Moonstone Gray"]', false, 4),
('Galaxy Book4', 'Galaxy Book4', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.6"', '["256GB", "512GB"]', '["Moonstone Gray"]', false, 5),

-- Samsung Tablets
('Galaxy Tab S10 Ultra', 'Galaxy Tab S10 Ultra', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'tablet'), 2024, '14.6"', '["256GB", "512GB", "1TB"]', '["Moonstone Gray", "Platinum Silver"]', true, 1),
('Galaxy Tab S10+', 'Galaxy Tab S10+', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'tablet'), 2024, '12.4"', '["256GB", "512GB"]', '["Moonstone Gray", "Platinum Silver"]', true, 2),
('Galaxy Tab S9 Ultra', 'Galaxy Tab S9 Ultra', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'tablet'), 2023, '14.6"', '["256GB", "512GB", "1TB"]', '["Graphite", "Beige"]', false, 3),
('Galaxy Tab S9+', 'Galaxy Tab S9+', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'tablet'), 2023, '12.4"', '["256GB", "512GB"]', '["Graphite", "Beige"]', false, 4),
('Galaxy Tab S9', 'Galaxy Tab S9', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'tablet'), 2023, '11"', '["128GB", "256GB"]', '["Graphite", "Beige"]', false, 5),
('Galaxy Tab A9+', 'Galaxy Tab A9+', (SELECT id FROM brands WHERE name = 'samsung'), (SELECT id FROM device_types WHERE name = 'tablet'), 2023, '11"', '["64GB", "128GB"]', '["Graphite", "Silver"]', false, 6);

-- ===========================================
-- GOOGLE MODELS
-- ===========================================

-- Google Mobile Devices (Pixel)
INSERT INTO device_models (name, display_name, brand_id, device_type_id, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES
-- Pixel 9 Series (2024)
('Pixel 9 Pro XL', 'Pixel 9 Pro XL', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.8"', '["128GB", "256GB", "512GB", "1TB"]', '["Obsidian", "Porcelain", "Hazel", "Rose Quartz"]', true, 1),
('Pixel 9 Pro', 'Pixel 9 Pro', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.3"', '["128GB", "256GB", "512GB", "1TB"]', '["Obsidian", "Porcelain", "Hazel", "Rose Quartz"]', true, 2),
('Pixel 9', 'Pixel 9', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '6.3"', '["128GB", "256GB"]', '["Obsidian", "Porcelain", "Wintergreen", "Peony"]', true, 3),
('Pixel 9 Pro Fold', 'Pixel 9 Pro Fold', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2024, '8"', '["256GB", "512GB"]', '["Obsidian", "Porcelain"]', true, 4),

-- Pixel 8 Series (2023)
('Pixel 8 Pro', 'Pixel 8 Pro', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.7"', '["128GB", "256GB", "512GB", "1TB"]', '["Obsidian", "Porcelain", "Bay"]', false, 5),
('Pixel 8', 'Pixel 8', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.2"', '["128GB", "256GB"]', '["Obsidian", "Hazel", "Rose"]', false, 6),

-- Pixel 7 Series (2022)
('Pixel 7 Pro', 'Pixel 7 Pro', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.7"', '["128GB", "256GB", "512GB"]', '["Obsidian", "Snow", "Hazel"]', false, 7),
('Pixel 7', 'Pixel 7', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.3"', '["128GB", "256GB"]', '["Obsidian", "Snow", "Lemongrass"]', false, 8),
('Pixel 7a', 'Pixel 7a', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2023, '6.1"', '["128GB"]', '["Charcoal", "Snow", "Sea", "Coral"]', false, 9),

-- Pixel 6 Series (2021)
('Pixel 6 Pro', 'Pixel 6 Pro', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2021, '6.7"', '["128GB", "256GB", "512GB"]', '["Stormy Black", "Cloudy White", "Sorta Sunny"]', false, 10),
('Pixel 6', 'Pixel 6', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2021, '6.4"', '["128GB", "256GB"]', '["Stormy Black", "Sorta Seafoam", "Kinda Coral"]', false, 11),
('Pixel 6a', 'Pixel 6a', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'mobile'), 2022, '6.1"', '["128GB"]', '["Chalk", "Charcoal", "Sage"]', false, 12),

-- Google Laptops (Pixelbook/Chromebook)
('Pixelbook Go', 'Pixelbook Go', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'laptop'), 2019, '13.3"', '["64GB", "128GB", "256GB"]', '["Just Black", "Not Pink"]', false, 1),

-- Google Tablets (Pixel Tablet)
('Pixel Tablet', 'Pixel Tablet', (SELECT id FROM brands WHERE name = 'google'), (SELECT id FROM device_types WHERE name = 'tablet'), 2023, '10.95"', '["128GB", "256GB"]', '["Porcelain", "Hazel", "Rose"]', true, 1);

-- ===========================================
-- DELL MODELS
-- ===========================================

-- Dell Laptops
INSERT INTO device_models (name, display_name, brand_id, device_type_id, model_year, screen_size, storage_options, color_options, is_featured, sort_order) VALUES
-- XPS Series
('XPS 16 9640', 'XPS 16 (9640)', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16.3"', '["512GB", "1TB", "2TB", "4TB"]', '["Platinum Silver", "Graphite"]', true, 1),
('XPS 14 9440', 'XPS 14 (9440)', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14.5"', '["512GB", "1TB", "2TB"]', '["Platinum Silver", "Graphite"]', true, 2),
('XPS 13 9340', 'XPS 13 (9340)', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '13.4"', '["256GB", "512GB", "1TB", "2TB"]', '["Platinum Silver", "Graphite"]', true, 3),
('XPS 13 Plus 9320', 'XPS 13 Plus (9320)', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2023, '13.4"', '["256GB", "512GB", "1TB", "2TB"]', '["Platinum Silver", "Graphite"]', false, 4),

-- Inspiron Series
('Inspiron 16 7640', 'Inspiron 16 (7640)', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '["512GB", "1TB"]', '["Platinum Silver", "Ice Blue"]', false, 5),
('Inspiron 14 7440', 'Inspiron 14 (7440)', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14"', '["256GB", "512GB", "1TB"]', '["Platinum Silver", "Ice Blue"]', false, 6),
('Inspiron 14 5440', 'Inspiron 14 (5440)', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14"', '["256GB", "512GB"]', '["Platinum Silver", "Dark River Blue"]', false, 7),

-- Alienware Series
('Alienware x16 R2', 'Alienware x16 R2', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '["1TB", "2TB", "4TB"]', '["Lunar Silver", "Dark Metallic Moon"]', true, 8),
('Alienware x14 R2', 'Alienware x14 R2', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14"', '["512GB", "1TB", "2TB"]', '["Lunar Silver", "Dark Metallic Moon"]', false, 9),
('Alienware m18 R2', 'Alienware m18 R2', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '18"', '["1TB", "2TB", "4TB"]', '["Dark Metallic Moon"]', true, 10),
('Alienware m16 R2', 'Alienware m16 R2', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '["512GB", "1TB", "2TB"]', '["Dark Metallic Moon"]', false, 11),

-- Latitude Series (Business)
('Latitude 9450', 'Latitude 9450', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14"', '["256GB", "512GB", "1TB"]', '["Titan Gray", "Platinum Silver"]', false, 12),
('Latitude 7450', 'Latitude 7450', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14"', '["256GB", "512GB", "1TB"]', '["Titan Gray"]', false, 13),
('Latitude 5450', 'Latitude 5450', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '14"', '["256GB", "512GB"]', '["Titan Gray"]', false, 14),

-- Precision Series (Workstation)
('Precision 7780', 'Precision 7780', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '17.3"', '["512GB", "1TB", "2TB", "4TB"]', '["Titan Gray"]', false, 15),
('Precision 5680', 'Precision 5680', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '16"', '["512GB", "1TB", "2TB"]', '["Titan Gray"]', false, 16),
('Precision 3590', 'Precision 3590', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'laptop'), 2024, '15.6"', '["256GB", "512GB", "1TB"]', '["Titan Gray"]', false, 17),

-- Dell Tablets
('Latitude 7230 Rugged Extreme Tablet', 'Latitude 7230 Rugged Extreme Tablet', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'tablet'), 2024, '12"', '["256GB", "512GB", "1TB"]', '["Black"]', false, 1),
('Latitude 5030 2-in-1', 'Latitude 5030 2-in-1', (SELECT id FROM brands WHERE name = 'dell'), (SELECT id FROM device_types WHERE name = 'tablet'), 2024, '13"', '["256GB", "512GB"]', '["Titan Gray"]', false, 2);

-- ===========================================
-- UPDATE EXISTING MODELS STATUS
-- ===========================================

-- Mark older models as not featured and adjust sort order
UPDATE device_models SET is_featured = false WHERE model_year < 2023;
UPDATE device_models SET is_featured = true WHERE model_year >= 2024;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check total models per brand
-- SELECT 
--   b.display_name as brand,
--   dt.display_name as device_type,
--   COUNT(*) as model_count
-- FROM device_models dm
-- JOIN brands b ON dm.brand_id = b.id
-- JOIN device_types dt ON dm.device_type_id = dt.id
-- GROUP BY b.display_name, dt.display_name
-- ORDER BY b.display_name, dt.display_name;

-- Check featured models
-- SELECT 
--   b.display_name as brand,
--   dm.display_name as model,
--   dm.model_year,
--   dm.is_featured
-- FROM device_models dm
-- JOIN brands b ON dm.brand_id = b.id
-- WHERE dm.is_featured = true
-- ORDER BY b.display_name, dm.sort_order;

COMMIT; 