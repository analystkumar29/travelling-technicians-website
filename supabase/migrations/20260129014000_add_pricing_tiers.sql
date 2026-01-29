-- Migration: Add pricing tier support to dynamic_pricing
-- This allows standard vs premium pricing based on part quality

-- Step 1: Add pricing_tier column
ALTER TABLE dynamic_pricing 
ADD COLUMN IF NOT EXISTS pricing_tier TEXT 
DEFAULT 'standard'
CHECK (pricing_tier IN ('standard', 'premium', 'economy', 'express'));

-- Step 2: Add part quality metadata columns
ALTER TABLE dynamic_pricing
ADD COLUMN IF NOT EXISTS part_quality TEXT,
ADD COLUMN IF NOT EXISTS part_warranty_months INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS includes_installation BOOLEAN DEFAULT true;

-- Step 3: Drop old unique constraint (model_id, service_id only)
ALTER TABLE dynamic_pricing
DROP CONSTRAINT IF EXISTS dynamic_pricing_model_id_service_id_key;

-- Step 3b: Add new unique constraint including pricing_tier
ALTER TABLE dynamic_pricing
ADD CONSTRAINT dynamic_pricing_model_service_tier_key 
UNIQUE (model_id, service_id, pricing_tier);

-- Step 3c: Set all existing records to 'standard' tier
UPDATE dynamic_pricing 
SET pricing_tier = 'standard',
    part_quality = 'Standard Quality Parts',
    part_warranty_months = 3
WHERE pricing_tier IS NULL;

-- Step 4: Add index for faster tier queries
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_tier 
ON dynamic_pricing(pricing_tier);

-- Step 5: Add composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_lookup 
ON dynamic_pricing(model_id, service_id, pricing_tier);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN dynamic_pricing.pricing_tier IS 'Quality tier: standard (aftermarket), premium (OEM), economy (budget), express (expedited)';
COMMENT ON COLUMN dynamic_pricing.part_quality IS 'Human-readable description of part quality for this tier';
COMMENT ON COLUMN dynamic_pricing.part_warranty_months IS 'Warranty duration for parts at this quality tier';
COMMENT ON COLUMN dynamic_pricing.includes_installation IS 'Whether installation is included in the price';

-- Step 7: Create view for easy tier comparison
CREATE OR REPLACE VIEW pricing_tier_comparison AS
SELECT 
  dm.name as model_name,
  b.name as brand_name,
  dt.name as device_type,
  s.name as service_name,
  dp.pricing_tier,
  dp.base_price,
  dp.compare_at_price,
  dp.part_quality,
  dp.part_warranty_months
FROM dynamic_pricing dp
JOIN device_models dm ON dp.model_id = dm.id
JOIN brands b ON dm.brand_id = b.id
JOIN device_types dt ON dm.type_id = dt.id
JOIN services s ON dp.service_id = s.id
WHERE dp.is_active = true
ORDER BY device_type, brand_name, model_name, service_name, 
         CASE pricing_tier 
           WHEN 'economy' THEN 1
           WHEN 'standard' THEN 2
           WHEN 'premium' THEN 3
           WHEN 'express' THEN 4
         END;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Added columns: pricing_tier, part_quality, part_warranty_months, includes_installation';
  RAISE NOTICE 'All existing records set to "standard" tier';
  RAISE NOTICE 'Created indexes for faster queries';
  RAISE NOTICE 'Created pricing_tier_comparison view';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next step: Run the duplicate script to create premium tier records';
END $$;
