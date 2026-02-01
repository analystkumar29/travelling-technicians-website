-- ============================================================================
-- SEED MISSING PRICING COMBINATIONS
-- ============================================================================
-- Purpose: Add all 295 missing pricing combinations without overriding existing data
-- Created: 2026-01-02
-- Total Missing: 295 combinations
-- ============================================================================

-- Start transaction for safety
BEGIN;

-- Create temporary function to calculate intelligent pricing
CREATE OR REPLACE FUNCTION calculate_intelligent_price(
  p_device_type TEXT,
  p_brand TEXT,
  p_model_name TEXT,
  p_service_name TEXT,
  p_pricing_tier TEXT
) RETURNS TABLE (
  base_price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2)
) AS $$
DECLARE
  v_base_price DECIMAL(10,2);
  v_model_multiplier DECIMAL(3,2) := 1.0;
  v_age_factor DECIMAL(3,2) := 1.0;
  v_tier_multiplier DECIMAL(3,2) := 1.0;
  v_category_base DECIMAL(10,2);
BEGIN
  -- Set category base prices
  IF p_device_type = 'Mobile' THEN
    IF p_service_name LIKE '%Screen%' THEN
      CASE p_brand
        WHEN 'Apple' THEN v_category_base := 249;
        WHEN 'Samsung' THEN v_category_base := 229;
        WHEN 'Google' THEN v_category_base := 219;
        ELSE v_category_base := 199;
      END CASE;
    ELSE -- Battery Replacement
      CASE p_brand
        WHEN 'Apple' THEN v_category_base := 109;
        WHEN 'Samsung' THEN v_category_base := 99;
        WHEN 'Google' THEN v_category_base := 89;
        ELSE v_category_base := 79;
      END CASE;
    END IF;
  ELSE -- Laptop
    IF p_service_name LIKE '%Screen%' THEN
      v_category_base := 399; -- MacBooks
    ELSE -- Battery Replacement
      v_category_base := 179; -- MacBooks
    END IF;
  END IF;

  -- Model tier multiplier
  IF p_model_name ILIKE '%Pro Max%' OR p_model_name ILIKE '%Ultra%' THEN
    v_model_multiplier := 1.35;
  ELSIF p_model_name ILIKE '%Pro%' AND NOT p_model_name ILIKE '%Pro Max%' THEN
    v_model_multiplier := 1.20;
  ELSIF p_model_name ILIKE '%Plus%' THEN
    v_model_multiplier := 1.15;
  ELSIF p_model_name ILIKE '%SE%' OR p_model_name ILIKE '% A%' THEN
    v_model_multiplier := 0.80;
  ELSE
    v_model_multiplier := 1.0;
  END IF;

  -- Age factor (newer models cost more)
  IF p_model_name ILIKE '%16%' OR p_model_name ILIKE '%M3%' OR p_model_name ILIKE '%2024%' OR p_model_name ILIKE '%S24%' OR p_model_name ILIKE '%9%' THEN
    v_age_factor := 1.1;
  ELSIF p_model_name ILIKE '%15%' OR p_model_name ILIKE '%M2%' OR p_model_name ILIKE '%2023%' OR p_model_name ILIKE '%2022%' OR p_model_name ILIKE '%S23%' OR p_model_name ILIKE '%8%' THEN
    v_age_factor := 1.0;
  ELSIF p_model_name ILIKE '%14%' OR p_model_name ILIKE '%13%' OR p_model_name ILIKE '%M1%' OR p_model_name ILIKE '%2021%' OR p_model_name ILIKE '%2020%' OR p_model_name ILIKE '%S22%' OR p_model_name ILIKE '%S21%' OR p_model_name ILIKE '%7%' THEN
    v_age_factor := 0.9;
  ELSE
    v_age_factor := 0.75; -- Older/legacy models
  END IF;

  -- Tier multiplier
  IF p_pricing_tier = 'premium' THEN
    v_tier_multiplier := 1.25;
  ELSE
    v_tier_multiplier := 1.0;
  END IF;

  -- Calculate final base price
  v_base_price := ROUND(v_category_base * v_model_multiplier * v_age_factor * v_tier_multiplier);

  -- Return pricing
  RETURN QUERY SELECT 
    v_base_price,
    ROUND(v_base_price * 1.18) as compare_at_price; -- 18% markup for compare-at price
END;
$$ LANGUAGE plpgsql;

-- Insert all missing combinations with intelligent pricing
INSERT INTO dynamic_pricing (
  model_id,
  service_id,
  base_price,
  compare_at_price,
  discounted_price,
  pricing_tier,
  part_quality,
  part_warranty_months,
  includes_installation,
  is_active,
  created_at
)
SELECT 
  apc.model_id,
  apc.service_id,
  pricing.base_price,
  pricing.compare_at_price,
  NULL as discounted_price,
  apc.pricing_tier,
  CASE WHEN apc.pricing_tier = 'premium' THEN 'OEM' ELSE 'High Quality' END as part_quality,
  CASE WHEN apc.pricing_tier = 'premium' THEN 12 ELSE 6 END as part_warranty_months,
  true as includes_installation,
  true as is_active,
  NOW() as created_at
FROM (
  -- All possible combinations
  SELECT 
    dm.id as model_id,
    dm.name as model_name,
    b.name as brand_name,
    dt.name as device_type_name,
    s.id as service_id,
    s.name as service_name,
    tier as pricing_tier
  FROM device_models dm
  JOIN brands b ON dm.brand_id = b.id
  JOIN device_types dt ON dm.type_id = dt.id
  CROSS JOIN services s
  CROSS JOIN (VALUES ('standard'), ('premium')) AS t(tier)
  WHERE b.name IN ('Apple', 'Samsung', 'Google')
    AND dt.name IN ('Mobile', 'Laptop')
    AND s.name IN ('Screen Replacement', 'Battery Replacement')
    AND s.is_active = true
    AND (
      (dt.name = 'Mobile' AND s.slug LIKE '%mobile%') OR
      (dt.name = 'Laptop' AND s.slug LIKE '%laptop%')
    )
) apc
LEFT JOIN dynamic_pricing existing_dp 
  ON apc.model_id = existing_dp.model_id 
  AND apc.service_id = existing_dp.service_id 
  AND apc.pricing_tier = existing_dp.pricing_tier
CROSS JOIN LATERAL calculate_intelligent_price(
  apc.device_type_name,
  apc.brand_name,
  apc.model_name,
  apc.service_name,
  apc.pricing_tier
) as pricing
WHERE existing_dp.id IS NULL; -- Only insert missing combinations

-- Drop the temporary function
DROP FUNCTION calculate_intelligent_price;

-- Commit transaction
COMMIT;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the insertion:
-- SELECT COUNT(*) as total_inserted FROM dynamic_pricing WHERE created_at > NOW() - INTERVAL '1 minute';
-- 
-- Expected result: 295 rows
-- ============================================================================

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This script:
-- 1. Creates intelligent pricing based on device category, model tier, and age
-- 2. Inserts ONLY missing combinations (no overrides)
-- 3. Calculates both standard and premium tier pricing
-- 4. Sets compare-at prices 18% higher than base price
-- 5. Marks all as active and non-promotional
-- 
-- Pricing Strategy:
-- - iPhone Screen: $249 base (varies by model)
-- - iPhone Battery: $109 base (varies by model)
-- - Samsung Screen: $229 base (varies by model)
-- - Samsung Battery: $99 base (varies by model)
-- - Google Screen: $219 base (varies by model)
-- - Google Battery: $89 base (varies by model)
-- - MacBook Screen: $399 base (varies by model)
-- - MacBook Battery: $179 base (varies by model)
-- - Premium Tier: +25% over standard
-- - Pro/Max/Ultra models: +35% multiplier
-- - Newer models (2024): +10% age factor
-- ============================================================================
