-- Migration: Simplify pricing tiers to only Standard and Premium
-- Remove 'economy' and 'express' tiers - keep only 'standard' and 'premium'
-- Run this manually in Supabase dashboard if needed

-- Step 1: Update any economy or express records to standard
UPDATE dynamic_pricing 
SET pricing_tier = 'standard' 
WHERE pricing_tier IN ('economy', 'express');

-- Step 2: Update the CHECK constraint to only allow standard and premium
ALTER TABLE dynamic_pricing 
DROP CONSTRAINT IF EXISTS dynamic_pricing_pricing_tier_check;

-- Step 3: Add new constraint for only standard and premium
ALTER TABLE dynamic_pricing
ADD CONSTRAINT dynamic_pricing_pricing_tier_check 
CHECK (pricing_tier IN ('standard', 'premium'));

-- Step 4: Update column comments
COMMENT ON COLUMN dynamic_pricing.pricing_tier IS 'Quality tier: standard (aftermarket parts), premium (OEM parts)';

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Pricing tiers simplified to: standard, premium';
  RAISE NOTICE 'All economy/express records converted to standard';
  RAISE NOTICE 'Ready for new bulk pricing interface!';
END $$;
