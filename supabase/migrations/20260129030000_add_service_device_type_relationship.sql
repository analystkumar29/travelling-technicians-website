-- ===================================================================
-- Migration: Add device_type relationship to services table
-- Purpose: Enable proper filtering of services by device type
-- ===================================================================

-- Step 1: Add device_type_id column to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS device_type_id UUID REFERENCES device_types(id);

-- Step 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_device_type_id ON services(device_type_id);

-- Step 3: Populate device_type_id based on slug patterns
-- Mobile services (have -mobile suffix)
UPDATE services 
SET device_type_id = (SELECT id FROM device_types WHERE name = 'Mobile' LIMIT 1)
WHERE slug LIKE '%-mobile' AND device_type_id IS NULL;

-- Laptop services (have -laptop suffix)
UPDATE services 
SET device_type_id = (SELECT id FROM device_types WHERE name = 'Laptop' LIMIT 1)
WHERE slug LIKE '%-laptop' AND device_type_id IS NULL;

-- Shared services (no device suffix - these might need manual assignment)
-- For now, we'll leave them NULL or you can set a default
-- Uncomment below if you want to assign shared services to mobile by default
-- UPDATE services 
-- SET device_type_id = (SELECT id FROM device_types WHERE name = 'Mobile' LIMIT 1)
-- WHERE device_type_id IS NULL AND slug NOT LIKE '%-mobile' AND slug NOT LIKE '%-laptop';

-- Step 4: Verify the migration
SELECT 
  s.name,
  s.slug,
  dt.name as device_type,
  s.device_type_id
FROM services s
LEFT JOIN device_types dt ON s.device_type_id = dt.id
ORDER BY dt.name, s.slug;

-- Step 5: Add comment to document the column
COMMENT ON COLUMN services.device_type_id IS 'Foreign key to device_types table - indicates which device type this service applies to';
