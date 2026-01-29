-- ===================================================================
-- Add iPhone 16 Screen Replacement Pricing
-- Run this in Supabase Dashboard > SQL Editor
-- ===================================================================

-- Add Screen Replacement pricing for all iPhone 16 models (Standard + Premium tiers)
WITH iphone_16_models AS (
  SELECT id, name FROM device_models 
  WHERE name LIKE '%iPhone 16%'
),
screen_service AS (
  SELECT id FROM services 
  WHERE slug = 'screen-replacement-mobile'
)
INSERT INTO dynamic_pricing (model_id, service_id, base_price, compare_at_price, pricing_tier, is_active)
SELECT 
  m.id,
  s.id,
  CASE m.name
    WHEN 'iPhone 16' THEN 279.00
    WHEN 'iPhone 16 Plus' THEN 289.00
    WHEN 'iPhone 16 Pro' THEN 299.00
    WHEN 'iPhone 16 Pro Max' THEN 309.00
  END as base_price,
  CASE m.name
    WHEN 'iPhone 16' THEN 329.00
    WHEN 'iPhone 16 Plus' THEN 339.00
    WHEN 'iPhone 16 Pro' THEN 349.00
    WHEN 'iPhone 16 Pro Max' THEN 359.00
  END as compare_at_price,
  tier,
  true
FROM iphone_16_models m
CROSS JOIN screen_service s
CROSS JOIN (VALUES ('standard'), ('premium')) AS t(tier)
WHERE NOT EXISTS (
  SELECT 1 FROM dynamic_pricing dp 
  WHERE dp.model_id = m.id 
    AND dp.service_id = s.id 
    AND dp.pricing_tier = t.tier
);

-- Verify the inserted data
SELECT 
  dm.name as model,
  s.name as service,
  dp.pricing_tier as tier,
  dp.base_price,
  dp.compare_at_price
FROM dynamic_pricing dp
JOIN device_models dm ON dp.model_id = dm.id
JOIN services s ON dp.service_id = s.id
WHERE dm.name LIKE '%iPhone 16%'
  AND s.name LIKE '%Screen%'
ORDER BY dm.name, dp.pricing_tier;

-- Expected result: 8 rows (4 models × 2 tiers)
