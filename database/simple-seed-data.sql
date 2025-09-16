-- Simple seed data for essential functionality

-- Device Types
INSERT INTO public.device_types (name, display_name, sort_order) VALUES
('mobile', 'Mobile Phone', 1),
('laptop', 'Laptop', 2),
('tablet', 'Tablet', 3)
ON CONFLICT (name) DO NOTHING;

-- Brands for Mobile
INSERT INTO public.brands (name, display_name, device_type_id, sort_order) VALUES
('apple', 'Apple', (SELECT id FROM device_types WHERE name = 'mobile'), 1),
('samsung', 'Samsung', (SELECT id FROM device_types WHERE name = 'mobile'), 2),
('google', 'Google', (SELECT id FROM device_types WHERE name = 'mobile'), 3),
('oneplus', 'OnePlus', (SELECT id FROM device_types WHERE name = 'mobile'), 4),
('other', 'Other', (SELECT id FROM device_types WHERE name = 'mobile'), 99)
ON CONFLICT (name) DO NOTHING;

-- Brands for Laptop
INSERT INTO public.brands (name, display_name, device_type_id, sort_order) VALUES
('apple', 'Apple MacBook', (SELECT id FROM device_types WHERE name = 'laptop'), 1),
('dell', 'Dell', (SELECT id FROM device_types WHERE name = 'laptop'), 2),
('hp', 'HP', (SELECT id FROM device_types WHERE name = 'laptop'), 3),
('lenovo', 'Lenovo', (SELECT id FROM device_types WHERE name = 'laptop'), 4),
('asus', 'ASUS', (SELECT id FROM device_types WHERE name = 'laptop'), 5)
ON CONFLICT (name) DO NOTHING;

-- Essential iPhone Models
INSERT INTO public.device_models (brand_id, name, display_name, release_year, is_featured, sort_order) VALUES
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 15 Pro Max', 'iPhone 15 Pro Max', 2023, true, 1),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 15 Pro', 'iPhone 15 Pro', 2023, true, 2),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 15', 'iPhone 15', 2023, true, 3),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 14 Pro Max', 'iPhone 14 Pro Max', 2022, true, 4),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 14', 'iPhone 14', 2022, true, 5),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'iPhone 13', 'iPhone 13', 2021, false, 6);

-- Essential Samsung Models
INSERT INTO public.device_models (brand_id, name, display_name, release_year, is_featured, sort_order) VALUES
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy S24 Ultra', 'Galaxy S24 Ultra', 2024, true, 1),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy S24', 'Galaxy S24', 2024, true, 2),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy S23', 'Galaxy S23', 2023, false, 3),
((SELECT id FROM brands WHERE name = 'samsung' AND device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')), 'Galaxy Note 20', 'Galaxy Note 20', 2020, false, 4);

-- Essential Laptop Models
INSERT INTO public.device_models (brand_id, name, display_name, release_year, is_featured, sort_order) VALUES
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'MacBook Pro 16-inch', 'MacBook Pro 16-inch', 2023, true, 1),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'MacBook Pro 14-inch', 'MacBook Pro 14-inch', 2023, true, 2),
((SELECT id FROM brands WHERE name = 'apple' AND device_type_id = (SELECT id FROM device_types WHERE name = 'laptop')), 'MacBook Air', 'MacBook Air', 2023, true, 3);

-- Services for Mobile
INSERT INTO public.services (name, display_name, device_type_id, is_doorstep_eligible, sort_order) VALUES
('screen-replacement', 'Screen Replacement', (SELECT id FROM device_types WHERE name = 'mobile'), true, 1),
('battery-replacement', 'Battery Replacement', (SELECT id FROM device_types WHERE name = 'mobile'), true, 2),
('charging-port-repair', 'Charging Port Repair', (SELECT id FROM device_types WHERE name = 'mobile'), true, 3),
('camera-repair', 'Camera Repair', (SELECT id FROM device_types WHERE name = 'mobile'), true, 4),
('speaker-repair', 'Speaker Repair', (SELECT id FROM device_types WHERE name = 'mobile'), true, 5)
ON CONFLICT (name) DO NOTHING;

-- Services for Laptop
INSERT INTO public.services (name, display_name, device_type_id, is_doorstep_eligible, sort_order) VALUES
('laptop-screen-replacement', 'Screen Replacement', (SELECT id FROM device_types WHERE name = 'laptop'), true, 1),
('laptop-battery-replacement', 'Battery Replacement', (SELECT id FROM device_types WHERE name = 'laptop'), true, 2),
('keyboard-repair', 'Keyboard Repair', (SELECT id FROM device_types WHERE name = 'laptop'), true, 3),
('ram-upgrade', 'RAM Upgrade', (SELECT id FROM device_types WHERE name = 'laptop'), true, 4),
('ssd-upgrade', 'SSD Upgrade', (SELECT id FROM device_types WHERE name = 'laptop'), true, 5)
ON CONFLICT (name) DO NOTHING;

-- Pricing Tiers
INSERT INTO public.pricing_tiers (name, display_name, multiplier, warranty_months, turnaround_hours, sort_order) VALUES
('economy', 'Economy', 0.85, 3, 72, 1),
('standard', 'Standard', 1.0, 6, 48, 2),
('premium', 'Premium', 1.25, 12, 24, 3),
('express', 'Express', 1.5, 12, 12, 4)
ON CONFLICT (name) DO NOTHING;

-- Service Locations
INSERT INTO public.service_locations (name, postal_code, city, province) VALUES
('Vancouver Downtown', 'V6B', 'Vancouver', 'BC'),
('Burnaby Central', 'V5H', 'Burnaby', 'BC'),
('Surrey Central', 'V3T', 'Surrey', 'BC'),
('Richmond Centre', 'V6Y', 'Richmond', 'BC'),
('Coquitlam Centre', 'V3B', 'Coquitlam', 'BC')
ON CONFLICT (postal_code) DO NOTHING;

SELECT 'Simple seed data applied successfully!' as status;
