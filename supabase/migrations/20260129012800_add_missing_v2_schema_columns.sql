-- Migration: Add missing columns for V2 schema compatibility
-- This fixes the database errors in the booking form data hooks

-- 1. Add missing is_active column to device_types
ALTER TABLE device_types 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

COMMENT ON COLUMN device_types.is_active IS 'Whether this device type is currently available for booking';

-- 2. Add missing display_name column to services
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Set display_name to name for existing services
UPDATE services 
SET display_name = name 
WHERE display_name IS NULL;

COMMENT ON COLUMN services.display_name IS 'Human-readable name for UI display';

-- 3. Add missing created_at column to dynamic_pricing
ALTER TABLE dynamic_pricing 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

COMMENT ON COLUMN dynamic_pricing.created_at IS 'Timestamp when pricing record was created';

-- 4. Add additional V2 schema columns for services
ALTER TABLE services
ADD COLUMN IF NOT EXISTS category_id UUID,
ADD COLUMN IF NOT EXISTS is_doorstep_eligible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_diagnostics BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER DEFAULT 45;

COMMENT ON COLUMN services.is_doorstep_eligible IS 'Whether this service can be performed at customer location';
COMMENT ON COLUMN services.requires_diagnostics IS 'Whether this service requires initial diagnostic work';
COMMENT ON COLUMN services.estimated_duration_minutes IS 'Typical duration for this service in minutes';

-- 5. Create service_categories table for better organization
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE service_categories IS 'Categories for organizing repair services';

-- 6. Insert default service categories
INSERT INTO service_categories (name, slug, display_order) 
VALUES 
  ('Common Repairs', 'common', 1),
  ('Hardware Services', 'hardware', 2),
  ('Software Services', 'software', 3),
  ('Upgrades', 'upgrades', 4),
  ('Special Services', 'special', 5)
ON CONFLICT (slug) DO NOTHING;

-- 7. Add foreign key constraint for service categories
ALTER TABLE services
DROP CONSTRAINT IF EXISTS fk_services_category;

ALTER TABLE services
ADD CONSTRAINT fk_services_category
FOREIGN KEY (category_id) REFERENCES service_categories(id)
ON DELETE SET NULL;

-- 8. Update existing services with appropriate display names and categories
UPDATE services 
SET 
  display_name = CASE 
    WHEN name = 'screen_replacement' THEN 'Screen Replacement'
    WHEN name = 'battery_replacement' THEN 'Battery Replacement'
    WHEN name = 'charging_port_repair' THEN 'Charging Port Repair'
    ELSE name 
  END,
  is_doorstep_eligible = true,
  estimated_duration_minutes = CASE 
    WHEN name LIKE '%battery%' THEN 30
    WHEN name LIKE '%screen%' THEN 45
    ELSE 45
  END
WHERE display_name IS NULL OR display_name = name;

-- 9. Set categories for existing services (assign to 'Common Repairs' by default)
UPDATE services 
SET category_id = (SELECT id FROM service_categories WHERE slug = 'common' LIMIT 1)
WHERE category_id IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added missing columns: device_types.is_active, services.display_name, dynamic_pricing.created_at';
  RAISE NOTICE 'Added V2 schema enhancements: service categories, doorstep eligibility, duration estimates';
END $$;
