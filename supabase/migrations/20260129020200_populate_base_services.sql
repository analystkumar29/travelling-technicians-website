-- Migration: Populate base services without tier suffixes
-- This migration adds all mobile and laptop services as base services
-- Tiers (Standard/Premium) are handled at pricing level, not service level

-- First, ensure all categories exist
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

-- Clear existing tier-based services (we'll use base services instead)
DELETE FROM services WHERE name LIKE '%(Standard)%' OR name LIKE '%(Premium)%';

-- Get category IDs for reference
DO $$
DECLARE
  screen_cat_id uuid;
  battery_cat_id uuid;
  charging_cat_id uuid;
  audio_cat_id uuid;
  camera_cat_id uuid;
  diagnostics_cat_id uuid;
  input_cat_id uuid;
  upgrade_cat_id uuid;
  software_cat_id uuid;
  hardware_cat_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO screen_cat_id FROM service_categories WHERE slug = 'screen_repair';
  SELECT id INTO battery_cat_id FROM service_categories WHERE slug = 'battery_repair';
  SELECT id INTO charging_cat_id FROM service_categories WHERE slug = 'charging_repair';
  SELECT id INTO audio_cat_id FROM service_categories WHERE slug = 'audio_repair';
  SELECT id INTO camera_cat_id FROM service_categories WHERE slug = 'camera_repair';
  SELECT id INTO diagnostics_cat_id FROM service_categories WHERE slug = 'diagnostics';
  SELECT id INTO input_cat_id FROM service_categories WHERE slug = 'input_repair';
  SELECT id INTO upgrade_cat_id FROM service_categories WHERE slug = 'hardware_upgrade';
  SELECT id INTO software_cat_id FROM service_categories WHERE slug = 'software_repair';
  SELECT id INTO hardware_cat_id FROM service_categories WHERE slug = 'hardware_repair';

  -- Insert MOBILE services (base services without tier suffixes)
  INSERT INTO services (name, slug, display_name, description, category_id, estimated_duration_minutes, is_doorstep_eligible, requires_diagnostics, is_active)
  VALUES
    ('Screen Replacement', 'screen-replacement-mobile', 'Screen Replacement', 'Replace damaged or cracked screens with high-quality parts', screen_cat_id, 45, true, false, true),
    ('Battery Replacement', 'battery-replacement-mobile', 'Battery Replacement', 'Replace old or failing batteries to extend device life', battery_cat_id, 30, true, false, true),
    ('Charging Port Repair', 'charging-port-repair', 'Charging Port Repair', 'Fix loose or non-functioning charging ports', charging_cat_id, 45, true, false, true),
    ('Speaker/Microphone Repair', 'speaker-microphone-repair', 'Speaker/Microphone Repair', 'Resolve audio issues with speakers or microphones', audio_cat_id, 40, true, false, true),
    ('Camera Repair', 'camera-repair', 'Camera Repair', 'Fix front or rear camera issues', camera_cat_id, 50, true, false, true),
    ('Water Damage Diagnostics', 'water-damage-diagnostics', 'Water Damage Diagnostics', 'Assess and repair water-damaged devices when possible', diagnostics_cat_id, 90, true, true, true)
  ON CONFLICT (slug) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    category_id = EXCLUDED.category_id;

  -- Insert LAPTOP services (base services without tier suffixes)
  INSERT INTO services (name, slug, display_name, description, category_id, estimated_duration_minutes, is_doorstep_eligible, requires_diagnostics, is_active)
  VALUES
    ('Screen Replacement', 'screen-replacement-laptop', 'Screen Replacement', 'Replace cracked or damaged laptop screens', screen_cat_id, 60, true, false, true),
    ('Battery Replacement', 'battery-replacement-laptop', 'Battery Replacement', 'Replace old laptop batteries to restore battery life', battery_cat_id, 45, true, false, true),
    ('Keyboard Repair', 'keyboard-repair', 'Keyboard Repair/Replacement', 'Fix or replace damaged laptop keyboards', input_cat_id, 50, true, false, true),
    ('Trackpad Repair', 'trackpad-repair', 'Trackpad Repair', 'Fix non-responsive or erratic trackpads', input_cat_id, 50, true, false, true),
    ('RAM Upgrade', 'ram-upgrade', 'RAM Upgrade', 'Increase memory capacity for better performance', upgrade_cat_id, 30, true, false, true),
    ('Storage Upgrade', 'storage-upgrade', 'HDD/SSD Replacement/Upgrade', 'Replace or upgrade storage drives for better performance', upgrade_cat_id, 45, true, false, true),
    ('Software Troubleshooting', 'software-troubleshooting', 'Software Troubleshooting', 'Resolve software issues and performance problems', software_cat_id, 90, true, true, true),
    ('Virus Removal', 'virus-removal', 'Virus Removal', 'Remove malware and viruses from your system', software_cat_id, 90, true, true, true),
    ('Cooling System Repair', 'cooling-repair', 'Cooling System Repair', 'Fix overheating issues and fan problems', hardware_cat_id, 60, true, false, true),
    ('Power Jack Repair', 'power-jack-repair', 'Power Jack Repair', 'Repair loose or broken power jacks', hardware_cat_id, 60, true, false, true)
  ON CONFLICT (slug) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    category_id = EXCLUDED.category_id;

  RAISE NOTICE 'Services populated successfully - % mobile services, % laptop services', 6, 10;
END $$;

-- Verify the data
SELECT 
  COUNT(*) as total_services,
  COUNT(CASE WHEN slug LIKE '%-mobile' THEN 1 END) as mobile_services,
  COUNT(CASE WHEN slug LIKE '%-laptop' THEN 1 END) as laptop_services,
  COUNT(CASE WHEN slug NOT LIKE '%-mobile' AND slug NOT LIKE '%-laptop' THEN 1 END) as shared_services
FROM services;
