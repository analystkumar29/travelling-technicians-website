-- SQL Script to Deactivate All Services Except Battery and Screen Replacements
-- This script sets is_active = false for all services that are NOT battery or screen replacements
-- Run this script in your Supabase SQL Editor or via psql

-- First, let's see what services we currently have
SELECT 
    s.id,
    s.name,
    s.slug,
    s.is_active,
    sc.name as category_name,
    dt.name as device_type
FROM services s
LEFT JOIN service_categories sc ON s.category_id = sc.id
LEFT JOIN device_types dt ON s.device_type_id = dt.id
ORDER BY s.name;

-- Now, let's identify which services to deactivate
-- We'll keep services that contain "battery" or "screen" in their name (case-insensitive)
-- and deactivate everything else

-- Step 1: Create a backup of current active status (optional)
-- CREATE TABLE services_backup_YYYYMMDD AS SELECT * FROM services;

-- Step 2: Update services to deactivate non-battery/screen services
UPDATE services 
SET is_active = false
WHERE 
    -- Deactivate services that don't contain 'battery' or 'screen' in their name
    LOWER(name) NOT LIKE '%battery%' 
    AND LOWER(name) NOT LIKE '%screen%'
    -- Also check display_name if it exists
    AND (display_name IS NULL OR LOWER(display_name) NOT LIKE '%battery%' AND LOWER(display_name) NOT LIKE '%screen%')
    -- And check slug
    AND LOWER(slug) NOT LIKE '%battery%' 
    AND LOWER(slug) NOT LIKE '%screen%';

-- Alternative: More precise approach if you want to keep specific service IDs
-- UPDATE services 
-- SET is_active = false
-- WHERE id NOT IN (
--     -- List of service IDs to keep active (battery and screen services)
--     SELECT id FROM services 
--     WHERE LOWER(name) LIKE '%battery%' OR LOWER(name) LIKE '%screen%'
-- );

-- Step 3: Verify the changes
SELECT 
    s.id,
    s.name,
    s.slug,
    s.is_active,
    sc.name as category_name,
    dt.name as device_type,
    CASE 
        WHEN LOWER(s.name) LIKE '%battery%' OR LOWER(s.name) LIKE '%screen%' THEN 'KEPT ACTIVE'
        ELSE 'DEACTIVATED'
    END as action_taken
FROM services s
LEFT JOIN service_categories sc ON s.category_id = sc.id
LEFT JOIN device_types dt ON s.device_type_id = dt.id
ORDER BY s.is_active DESC, s.name;

-- Step 4: Count summary
SELECT 
    COUNT(*) as total_services,
    SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_services,
    SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as inactive_services,
    SUM(CASE WHEN LOWER(name) LIKE '%battery%' OR LOWER(name) LIKE '%screen%' THEN 1 ELSE 0 END) as battery_screen_services,
    SUM(CASE WHEN (LOWER(name) LIKE '%battery%' OR LOWER(name) LIKE '%screen%') AND is_active = true THEN 1 ELSE 0 END) as active_battery_screen
FROM services;

-- Rollback script (in case you need to revert)
-- UPDATE services SET is_active = true WHERE id IN (
--     SELECT id FROM services_backup_YYYYMMDD WHERE is_active = true
-- );

-- Note: This script assumes you want to keep ALL battery and screen services active.
-- If you need more specific criteria, adjust the WHERE clause accordingly.