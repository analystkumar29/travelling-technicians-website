-- ===================================================================
-- MANUAL SCRIPT: Populate Base Services
-- Run this in Supabase Dashboard > SQL Editor
-- ===================================================================

-- Step 1: Ensure all categories exist
INSERT INTO service_categories (name, slug, display_order, is_active)
VALUES 
  ('Screen Repair', 'screen_repair', 1, true),
  ('Battery Repair', 'battery_repair', 2, true),
  ('Charging Repair', 'charging_repair', 3, true),
  ('Audio Repair', 'audio_repair', 4, true),
  ('Camera Repair', 'camera_repair', 5, true),
  ('Diagnostics', 'diagnostics', 6, true),
  ('Input Device Repair', 'input_repair', 7, true),
  ('Hardware Upgrade', 'hardware_upgrade', 8, true),
  ('Software Repair', 'software_repair', 9, true),
  ('Hardware Repair', 'hardware_repair', 10, true)
ON CONFLICT (slug) DO UPDATE SET 
  display_order = EXCLUDED.display_order,
  name = EXCLUDED.name;

-- Step 2: Clear tier-based services
DELETE FROM services WHERE name LIKE '%(Standard)%' OR name LIKE '%(Premium)%';

-- Step 3: Insert MOBILE services (6 services)
INSERT INTO services (name, slug, display_name, description, category_id, device_type_id, estimated_duration_minutes, is_doorstep_eligible, requires_diagnostics, is_active)
SELECT 
  'Screen Replacement', 
  'screen-replacement-mobile', 
  'Screen Replacement', 
  'Replace damaged or cracked screens with high-quality parts', 
  (SELECT id FROM service_categories WHERE slug = 'screen_repair'),
  (SELECT id FROM device_types WHERE name = 'Mobile' LIMIT 1),
  45, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'screen-replacement-mobile')
UNION ALL
SELECT 
  'Battery Replacement', 
  'battery-replacement-mobile', 
  'Battery Replacement', 
  'Replace old or failing batteries to extend device life', 
  (SELECT id FROM service_categories WHERE slug = 'battery_repair'),
  (SELECT id FROM device_types WHERE name = 'Mobile' LIMIT 1),
  30, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'battery-replacement-mobile')
UNION ALL
SELECT 
  'Charging Port Repair', 
  'charging-port-repair', 
  'Charging Port Repair', 
  'Fix loose or non-functioning charging ports', 
  (SELECT id FROM service_categories WHERE slug = 'charging_repair'),
  (SELECT id FROM device_types WHERE name = 'Mobile' LIMIT 1),
  45, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'charging-port-repair')
UNION ALL
SELECT 
  'Speaker/Microphone Repair', 
  'speaker-microphone-repair', 
  'Speaker/Microphone Repair', 
  'Resolve audio issues with speakers or microphones', 
  (SELECT id FROM service_categories WHERE slug = 'audio_repair'),
  (SELECT id FROM device_types WHERE name = 'Mobile' LIMIT 1),
  40, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'speaker-microphone-repair')
UNION ALL
SELECT 
  'Camera Repair', 
  'camera-repair', 
  'Camera Repair', 
  'Fix front or rear camera issues', 
  (SELECT id FROM service_categories WHERE slug = 'camera_repair'),
  (SELECT id FROM device_types WHERE name = 'Mobile' LIMIT 1),
  50, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'camera-repair')
UNION ALL
SELECT 
  'Water Damage Diagnostics', 
  'water-damage-diagnostics', 
  'Water Damage Diagnostics', 
  'Assess and repair water-damaged devices when possible', 
  (SELECT id FROM service_categories WHERE slug = 'diagnostics'),
  (SELECT id FROM device_types WHERE name = 'Mobile' LIMIT 1),
  90, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'water-damage-diagnostics');

-- Step 4: Insert LAPTOP services (10 services)
INSERT INTO services (name, slug, display_name, description, category_id, device_type_id, estimated_duration_minutes, is_doorstep_eligible, requires_diagnostics, is_active)
SELECT 
  'Screen Replacement', 
  'screen-replacement-laptop', 
  'Screen Replacement', 
  'Replace cracked or damaged laptop screens', 
  (SELECT id FROM service_categories WHERE slug = 'screen_repair'),
  (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1),
  60, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'screen-replacement-laptop')
UNION ALL
SELECT 
  'Battery Replacement', 
  'battery-replacement-laptop', 
  'Battery Replacement', 
  'Replace old laptop batteries to restore battery life', 
  (SELECT id FROM service_categories WHERE slug = 'battery_repair'),
  (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1),
  45, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'battery-replacement-laptop')
UNION ALL
SELECT 
  'Keyboard Repair', 
  'keyboard-repair', 
  'Keyboard Repair/Replacement', 
  'Fix or replace damaged laptop keyboards', 
  (SELECT id FROM service_categories WHERE slug = 'input_repair'),
  (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1),
  50, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'keyboard-repair')
UNION ALL
SELECT 
  'Trackpad Repair', 
  'trackpad-repair', 
  'Trackpad Repair', 
  'Fix non-responsive or erratic trackpads', 
  (SELECT id FROM service_categories WHERE slug = 'input_repair'),
  (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1),
  50, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'trackpad-repair')
UNION ALL
SELECT 
  'RAM Upgrade', 
  'ram-upgrade', 
  'RAM Upgrade', 
  'Increase memory capacity for better performance', 
  (SELECT id FROM service_categories WHERE slug = 'hardware_upgrade'),
  (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1),
  30, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'ram-upgrade')
UNION ALL
SELECT 
  'Storage Upgrade', 
  'storage-upgrade', 
  'HDD/SSD Replacement/Upgrade', 
  'Replace or upgrade storage drives for better performance', 
  (SELECT id FROM service_categories WHERE slug = 'hardware_upgrade'),
  (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1),
  45, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'storage-upgrade')
UNION ALL
SELECT 
  'Software Troubleshooting', 
  'software-troubleshooting', 
  'Software Troubleshooting', 
  'Resolve software issues and performance problems', 
  (SELECT id FROM service_categories WHERE slug = 'software_repair'),
  (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1),
  90, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'software-troubleshooting')
UNION ALL
SELECT 
  'Virus Removal', 
  'virus-removal', 
  'Virus Removal', 
  'Remove malware and viruses from your system', 
  (SELECT id FROM service_categories WHERE slug = 'software_repair'),
  (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1),
  90, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'virus-removal')
UNION ALL
SELECT 
  'Cooling System Repair', 
  'cooling-repair', 
  'Cooling System Repair', 
  'Fix overheating issues and fan problems', 
  (SELECT id FROM service_categories WHERE slug = 'hardware_repair'),
  (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1),
  60, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'cooling-repair')
UNION ALL
SELECT 
  'Power Jack Repair', 
  'power-jack-repair', 
  'Power Jack Repair', 
  'Repair loose or broken power jacks', 
  (SELECT id FROM service_categories WHERE slug = 'hardware_repair'),
  (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1),
  60, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'power-jack-repair');

-- Step 5: Verify the results
SELECT 
  COUNT(*) as total_services,
  COUNT(CASE WHEN slug LIKE '%-mobile' THEN 1 END) as mobile_services,
  COUNT(CASE WHEN slug LIKE '%-laptop' THEN 1 END) as laptop_services,
  COUNT(CASE WHEN slug NOT LIKE '%-mobile' AND slug NOT LIKE '%-laptop' THEN 1 END) as shared_services
FROM services;

-- Step 6: Show all services with their categories
SELECT 
  s.name,
  s.slug,
  s.display_name,
  sc.name as category,
  s.estimated_duration_minutes,
  s.is_doorstep_eligible,
  s.requires_diagnostics
FROM services s
LEFT JOIN service_categories sc ON s.category_id = sc.id
ORDER BY sc.display_order, s.slug;
