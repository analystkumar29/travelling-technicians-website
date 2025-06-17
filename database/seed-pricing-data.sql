-- Comprehensive Pricing Data Seeding Script
-- Populates all pricing tables with professional data

-- 1. Insert Service Categories
INSERT INTO service_categories (name, display_name, description, icon_name, sort_order) VALUES
('screen_repair', 'Screen Repair', 'Screen replacement and display repairs', 'screen', 1),
('battery_repair', 'Battery Repair', 'Battery replacement and power-related repairs', 'battery', 2),
('charging_repair', 'Charging Repair', 'Charging port and power jack repairs', 'charging', 3),
('audio_repair', 'Audio Repair', 'Speaker and microphone repairs', 'audio', 4),
('camera_repair', 'Camera Repair', 'Camera module and lens repairs', 'camera', 5),
('input_repair', 'Input Device Repair', 'Keyboard, trackpad, and button repairs', 'keyboard', 6),
('hardware_upgrade', 'Hardware Upgrade', 'Memory, storage, and component upgrades', 'memory', 7),
('software_repair', 'Software Repair', 'Software troubleshooting and optimization', 'software', 8),
('diagnostics', 'Diagnostics', 'Device diagnostics and assessments', 'diagnostics', 9)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- 2. Insert Services (using device_type_id from existing device_types table)
-- Mobile Services
INSERT INTO services (category_id, device_type_id, name, display_name, description, estimated_duration_minutes, warranty_period_days, is_doorstep_eligible, requires_diagnostics, sort_order) VALUES
-- Screen Repair Services
((SELECT id FROM service_categories WHERE name = 'screen_repair'), (SELECT id FROM device_types WHERE name = 'mobile'), 'screen_replacement', 'Screen Replacement', 'Replace damaged or cracked screens with high-quality parts', 45, 365, true, false, 1),
((SELECT id FROM service_categories WHERE name = 'screen_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'screen_replacement', 'Screen Replacement', 'Replace cracked or damaged laptop screens', 60, 365, true, false, 1),
((SELECT id FROM service_categories WHERE name = 'screen_repair'), (SELECT id FROM device_types WHERE name = 'tablet'), 'screen_replacement', 'Screen Replacement', 'Replace damaged or cracked tablet screens', 50, 365, true, false, 1),

-- Battery Repair Services
((SELECT id FROM service_categories WHERE name = 'battery_repair'), (SELECT id FROM device_types WHERE name = 'mobile'), 'battery_replacement', 'Battery Replacement', 'Replace old or failing batteries to extend device life', 30, 365, true, false, 2),
((SELECT id FROM service_categories WHERE name = 'battery_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'battery_replacement', 'Battery Replacement', 'Replace old laptop batteries to restore battery life', 45, 365, true, false, 2),
((SELECT id FROM service_categories WHERE name = 'battery_repair'), (SELECT id FROM device_types WHERE name = 'tablet'), 'battery_replacement', 'Battery Replacement', 'Replace old tablet batteries to extend device life', 40, 365, true, false, 2),

-- Charging Repair Services
((SELECT id FROM service_categories WHERE name = 'charging_repair'), (SELECT id FROM device_types WHERE name = 'mobile'), 'charging_port_repair', 'Charging Port Repair', 'Fix loose or non-functioning charging ports', 45, 365, true, false, 3),
((SELECT id FROM service_categories WHERE name = 'charging_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'power_jack_repair', 'Power Jack Repair', 'Fix laptop power jack and charging issues', 50, 365, true, false, 3),

-- Audio Repair Services
((SELECT id FROM service_categories WHERE name = 'audio_repair'), (SELECT id FROM device_types WHERE name = 'mobile'), 'speaker_microphone_repair', 'Speaker/Microphone Repair', 'Resolve audio issues with speakers or microphones', 40, 365, true, false, 4),
((SELECT id FROM service_categories WHERE name = 'audio_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'speaker_repair', 'Speaker Repair', 'Fix laptop speaker and audio issues', 45, 365, true, false, 4),

-- Camera Repair Services
((SELECT id FROM service_categories WHERE name = 'camera_repair'), (SELECT id FROM device_types WHERE name = 'mobile'), 'camera_repair', 'Camera Repair', 'Fix front or rear camera issues', 50, 365, true, false, 5),
((SELECT id FROM service_categories WHERE name = 'camera_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'webcam_repair', 'Webcam Repair', 'Fix laptop webcam and video issues', 40, 365, true, false, 5),

-- Input Repair Services (Laptop specific)
((SELECT id FROM service_categories WHERE name = 'input_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'keyboard_repair', 'Keyboard Repair/Replacement', 'Fix or replace damaged laptop keyboards', 50, 365, true, false, 6),
((SELECT id FROM service_categories WHERE name = 'input_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'trackpad_repair', 'Trackpad Repair', 'Fix non-responsive or erratic trackpads', 45, 365, true, false, 7),

-- Hardware Upgrade Services (Laptop specific)
((SELECT id FROM service_categories WHERE name = 'hardware_upgrade'), (SELECT id FROM device_types WHERE name = 'laptop'), 'ram_upgrade', 'RAM Upgrade', 'Increase memory capacity for better performance', 30, 365, true, false, 8),
((SELECT id FROM service_categories WHERE name = 'hardware_upgrade'), (SELECT id FROM device_types WHERE name = 'laptop'), 'storage_upgrade', 'HDD/SSD Replacement/Upgrade', 'Replace or upgrade storage drives for better performance', 45, 365, true, false, 9),

-- Software Repair Services (Laptop specific)
((SELECT id FROM service_categories WHERE name = 'software_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'software_troubleshooting', 'Software Troubleshooting', 'Resolve software issues and performance problems', 90, 90, true, true, 10),
((SELECT id FROM service_categories WHERE name = 'software_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'virus_removal', 'Virus Removal', 'Remove malware and implement security measures', 120, 90, true, true, 11),
((SELECT id FROM service_categories WHERE name = 'software_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'os_installation', 'OS Installation/Repair', 'Install or repair operating system', 180, 90, true, true, 12),

-- Diagnostics Services
((SELECT id FROM service_categories WHERE name = 'diagnostics'), (SELECT id FROM device_types WHERE name = 'mobile'), 'water_damage_diagnostics', 'Water Damage Diagnostics', 'Assess and repair water-damaged devices when possible', 90, 180, true, true, 13),
((SELECT id FROM service_categories WHERE name = 'diagnostics'), (SELECT id FROM device_types WHERE name = 'laptop'), 'hardware_diagnostics', 'Hardware Diagnostics', 'Comprehensive hardware testing and diagnosis', 60, 90, true, true, 13),
((SELECT id FROM service_categories WHERE name = 'diagnostics'), (SELECT id FROM device_types WHERE name = 'tablet'), 'general_diagnostics', 'General Diagnostics', 'Complete device assessment and diagnostics', 60, 90, true, true, 13)

ON CONFLICT (category_id, device_type_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    warranty_period_days = EXCLUDED.warranty_period_days,
    is_doorstep_eligible = EXCLUDED.is_doorstep_eligible,
    requires_diagnostics = EXCLUDED.requires_diagnostics,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- 3. Insert Pricing Tiers (Simplified 2-tier system with correct warranty periods)
INSERT INTO pricing_tiers (name, display_name, description, price_multiplier, estimated_delivery_hours, includes_features, sort_order) VALUES
('standard', 'Standard Repair', 'Quality repair with standard timeframe and 3-month warranty', 1.00, 48, ARRAY['3-Month Warranty', 'Quality Parts', 'Professional Service', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics'], 1),
('premium', 'Premium Service', 'Priority service with premium parts and 6-month warranty', 1.25, 24, ARRAY['6-Month Warranty', 'Premium Parts', 'Priority Service', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics', 'Express Handling', 'Quality Assurance Check'], 2)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_multiplier = EXCLUDED.price_multiplier,
    estimated_delivery_hours = EXCLUDED.estimated_delivery_hours,
    includes_features = EXCLUDED.includes_features,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- 4. Insert Service Locations (Lower Mainland BC) - Updated based on manual changes
INSERT INTO service_locations (name, postal_code_prefixes, price_adjustment_percentage, sort_order) VALUES
('Vancouver Downtown', ARRAY['V6B', 'V6C', 'V6E', 'V6G', 'V6Z'], 0.0, 1),
('Vancouver West Side', ARRAY['V6H', 'V6J', 'V6K', 'V6L', 'V6M', 'V6N', 'V6P', 'V6R', 'V6S', 'V6T'], 0.0, 2),
('Vancouver East Side', ARRAY['V5K', 'V5L', 'V5M', 'V5N', 'V5P', 'V5R', 'V5S', 'V5T', 'V5V', 'V5W', 'V5X', 'V5Y', 'V5Z', 'V6A'], 0.0, 3),
('Richmond', ARRAY['V6X', 'V6Y', 'V7A', 'V7B', 'V7C', 'V7E'], 0.0, 4),
('Burnaby', ARRAY['V3J', 'V3N', 'V5A', 'V5B', 'V5C', 'V5E', 'V5G', 'V5H', 'V5J'], 0.0, 5),
('Surrey', ARRAY['V3R', 'V3S', 'V3T', 'V3V', 'V3W', 'V3X', 'V3Y', 'V3Z', 'V4A', 'V4B', 'V4C', 'V4N', 'V4P'], 0.0, 6),
('Coquitlam', ARRAY['V3B', 'V3C', 'V3E', 'V3H', 'V3K'], 0.0, 7),
('North Vancouver', ARRAY['V7G', 'V7H', 'V7J', 'V7K', 'V7L', 'V7M', 'V7N', 'V7P', 'V7R'], 0.0, 8),
('West Vancouver', ARRAY['V7S', 'V7T', 'V7V', 'V7W'], 0.0, 9),
('New Westminster', ARRAY['V3L', 'V3M'], 0.0, 10),
('Delta', ARRAY['V4C', 'V4E', 'V4G', 'V4K', 'V4L', 'V4M'], 0.0, 11),
('Langley', ARRAY['V1M', 'V2Y', 'V2Z', 'V3A'], 0.0, 12),
('Whistler', ARRAY['V8E', 'V0N'], 15.0, 13),
('Squamish', ARRAY['V8B'], 10.0, 14)
ON CONFLICT (name) DO UPDATE SET
    postal_code_prefixes = EXCLUDED.postal_code_prefixes,
    price_adjustment_percentage = EXCLUDED.price_adjustment_percentage,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW(); 