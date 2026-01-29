-- Script: Duplicate all standard pricing to create premium tier records
-- This creates premium (OEM quality) pricing at 30% higher than standard
-- Run this AFTER running the migration script

-- IMPORTANT: Run this in a transaction so you can review before committing
BEGIN;

-- Step 1: Show what we're about to create
DO $$
DECLARE
  standard_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO standard_count
  FROM dynamic_pricing
  WHERE pricing_tier = 'standard';
  
  RAISE NOTICE '📊 Creating premium tier pricing records...';
  RAISE NOTICE 'Found % standard tier records to duplicate', standard_count;
  RAISE NOTICE 'Premium pricing will be 30%% higher with OEM quality parts';
  RAISE NOTICE '';
END $$;

-- Step 2: Insert premium tier records (duplicates of standard)
INSERT INTO dynamic_pricing (
  model_id,
  service_id,
  base_price,
  compare_at_price,
  required_parts,
  is_active,
  pricing_tier,
  part_quality,
  part_warranty_months,
  includes_installation,
  created_at
)
SELECT 
  model_id,
  service_id,
  -- Premium pricing: 30% higher than standard
  ROUND(base_price * 1.30, 2) as base_price,
  -- If there was a compare_at_price, increase it too
  CASE 
    WHEN compare_at_price IS NOT NULL THEN ROUND(compare_at_price * 1.30, 2)
    ELSE NULL 
  END as compare_at_price,
  required_parts,
  is_active,
  'premium' as pricing_tier,
  'Premium OEM Quality Parts' as part_quality,
  6 as part_warranty_months, -- 6 months vs 3 months for standard
  includes_installation,
  NOW() as created_at
FROM dynamic_pricing
WHERE pricing_tier = 'standard'
-- Only duplicate if premium doesn't already exist for this model/service combo
AND NOT EXISTS (
  SELECT 1 FROM dynamic_pricing dp2
  WHERE dp2.model_id = dynamic_pricing.model_id
  AND dp2.service_id = dynamic_pricing.service_id
  AND dp2.pricing_tier = 'premium'
);

-- Step 3: Show results
DO $$
DECLARE
  standard_count INTEGER;
  premium_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO standard_count
  FROM dynamic_pricing
  WHERE pricing_tier = 'standard';
  
  SELECT COUNT(*) INTO premium_count
  FROM dynamic_pricing
  WHERE pricing_tier = 'premium';
  
  SELECT COUNT(*) INTO total_count
  FROM dynamic_pricing;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Duplication completed!';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Standard tier records: %', standard_count;
  RAISE NOTICE 'Premium tier records:  %', premium_count;
  RAISE NOTICE 'Total pricing records: %', total_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Sample premium pricing created:';
END $$;

-- Step 4: Show sample of what was created
SELECT 
  dm.name as model,
  b.name as brand,
  s.name as service,
  dp.pricing_tier as tier,
  dp.base_price as price,
  dp.part_quality,
  dp.part_warranty_months as warranty_months
FROM dynamic_pricing dp
JOIN device_models dm ON dp.model_id = dm.id
JOIN brands b ON dm.brand_id = b.id
JOIN services s ON dp.service_id = s.id
WHERE dp.pricing_tier = 'premium'
ORDER BY b.name, dm.name, s.name
LIMIT 10;

-- Step 5: Show price comparison for a few devices
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '💰 Price Comparison (Standard vs Premium):';
END $$;

SELECT 
  b.name || ' ' || dm.name as device,
  s.name as service,
  MAX(CASE WHEN dp.pricing_tier = 'standard' THEN dp.base_price END) as standard_price,
  MAX(CASE WHEN dp.pricing_tier = 'premium' THEN dp.base_price END) as premium_price,
  MAX(CASE WHEN dp.pricing_tier = 'premium' THEN dp.base_price END) - 
  MAX(CASE WHEN dp.pricing_tier = 'standard' THEN dp.base_price END) as price_difference
FROM dynamic_pricing dp
JOIN device_models dm ON dp.model_id = dm.id
JOIN brands b ON dm.brand_id = b.id
JOIN services s ON dp.service_id = s.id
WHERE dp.pricing_tier IN ('standard', 'premium')
AND b.name = 'Apple' -- Show Apple examples
GROUP BY b.name, dm.name, s.name
ORDER BY device, service
LIMIT 10;

-- IMPORTANT: Review the results above
-- If everything looks good, run: COMMIT;
-- If you want to undo, run: ROLLBACK;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: This is running in a transaction!';
  RAISE NOTICE '✅ If results look good, run: COMMIT;';
  RAISE NOTICE '❌ To undo changes, run: ROLLBACK;';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Recommended price adjustments by service type:';
  RAISE NOTICE '   • Screen Replacement: 25-35%% premium';
  RAISE NOTICE '   • Battery Replacement: 30-40%% premium';
  RAISE NOTICE '   • Other Repairs: 20-30%% premium';
  RAISE NOTICE '';
  RAISE NOTICE 'Current markup: 30%% across all services';
END $$;

-- Don't auto-commit - let user review and commit manually
