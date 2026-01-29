-- ===================================================================
-- Add Screen Replacement Pricing for ALL iPhone Models
-- Run this in Supabase Dashboard > SQL Editor
-- This adds both Standard and Premium tier pricing
-- ===================================================================

-- Add Screen Replacement pricing for all Apple iPhone models
WITH iphone_models AS (
  SELECT id, name FROM device_models 
  WHERE name LIKE '%iPhone%'
    AND name NOT LIKE '%SE%' -- Exclude SE models for now
  ORDER BY name
),
screen_service AS (
  SELECT id FROM services 
  WHERE slug = 'screen-replacement-mobile'
  LIMIT 1
)
INSERT INTO dynamic_pricing (model_id, service_id, base_price, compare_at_price, pricing_tier, part_quality, includes_installation, is_active)
SELECT 
  m.id,
  s.id,
  -- Standard tier base pricing
  CASE 
    -- iPhone 11 series
    WHEN m.name LIKE '%iPhone 11 Pro Max%' THEN 229.00
    WHEN m.name LIKE '%iPhone 11 Pro%' THEN 219.00
    WHEN m.name LIKE '%iPhone 11%' THEN 199.00
    
    -- iPhone 12 series
    WHEN m.name LIKE '%iPhone 12 Pro Max%' THEN 249.00
    WHEN m.name LIKE '%iPhone 12 Pro%' THEN 239.00
    WHEN m.name LIKE '%iPhone 12 mini%' THEN 199.00
    WHEN m.name LIKE '%iPhone 12%' THEN 219.00
    
    -- iPhone 13 series
    WHEN m.name LIKE '%iPhone 13 Pro Max%' THEN 269.00
    WHEN m.name LIKE '%iPhone 13 Pro%' THEN 259.00
    WHEN m.name LIKE '%iPhone 13 mini%' THEN 219.00
    WHEN m.name LIKE '%iPhone 13%' THEN 239.00
    
    -- iPhone 14 series
    WHEN m.name LIKE '%iPhone 14 Pro Max%' THEN 289.00
    WHEN m.name LIKE '%iPhone 14 Pro%' THEN 279.00
    WHEN m.name LIKE '%iPhone 14 Plus%' THEN 259.00
    WHEN m.name LIKE '%iPhone 14%' THEN 249.00
    
    -- iPhone 15 series
    WHEN m.name LIKE '%iPhone 15 Pro Max%' THEN 299.00
    WHEN m.name LIKE '%iPhone 15 Pro%' THEN 289.00
    WHEN m.name LIKE '%iPhone 15 Plus%' THEN 269.00
    WHEN m.name LIKE '%iPhone 15%' THEN 259.00
    
    -- iPhone 16 series
    WHEN m.name LIKE '%iPhone 16 Pro Max%' THEN 309.00
    WHEN m.name LIKE '%iPhone 16 Pro%' THEN 299.00
    WHEN m.name LIKE '%iPhone 16 Plus%' THEN 289.00
    WHEN m.name LIKE '%iPhone 16%' THEN 279.00
    
    ELSE 199.00 -- Default price for unlisted models
  END as base_price,
  
  -- Compare at price (MSRP)
  CASE 
    -- iPhone 11 series
    WHEN m.name LIKE '%iPhone 11 Pro Max%' THEN 279.00
    WHEN m.name LIKE '%iPhone 11 Pro%' THEN 269.00
    WHEN m.name LIKE '%iPhone 11%' THEN 249.00
    
    -- iPhone 12 series
    WHEN m.name LIKE '%iPhone 12 Pro Max%' THEN 299.00
    WHEN m.name LIKE '%iPhone 12 Pro%' THEN 289.00
    WHEN m.name LIKE '%iPhone 12 mini%' THEN 249.00
    WHEN m.name LIKE '%iPhone 12%' THEN 269.00
    
    -- iPhone 13 series
    WHEN m.name LIKE '%iPhone 13 Pro Max%' THEN 319.00
    WHEN m.name LIKE '%iPhone 13 Pro%' THEN 309.00
    WHEN m.name LIKE '%iPhone 13 mini%' THEN 269.00
    WHEN m.name LIKE '%iPhone 13%' THEN 289.00
    
    -- iPhone 14 series
    WHEN m.name LIKE '%iPhone 14 Pro Max%' THEN 339.00
    WHEN m.name LIKE '%iPhone 14 Pro%' THEN 329.00
    WHEN m.name LIKE '%iPhone 14 Plus%' THEN 309.00
    WHEN m.name LIKE '%iPhone 14%' THEN 299.00
    
    -- iPhone 15 series
    WHEN m.name LIKE '%iPhone 15 Pro Max%' THEN 349.00
    WHEN m.name LIKE '%iPhone 15 Pro%' THEN 339.00
    WHEN m.name LIKE '%iPhone 15 Plus%' THEN 319.00
    WHEN m.name LIKE '%iPhone 15%' THEN 309.00
    
    -- iPhone 16 series
    WHEN m.name LIKE '%iPhone 16 Pro Max%' THEN 359.00
    WHEN m.name LIKE '%iPhone 16 Pro%' THEN 349.00
    WHEN m.name LIKE '%iPhone 16 Plus%' THEN 339.00
    WHEN m.name LIKE '%iPhone 16%' THEN 329.00
    
    ELSE 249.00 -- Default compare price
  END as compare_at_price,
  
  tier,
  
  -- Part quality based on tier
  CASE tier
    WHEN 'standard' THEN 'OEM Quality'
    WHEN 'premium' THEN 'Original Apple Parts'
  END as part_quality,
  
  true as includes_installation,
  true as is_active
  
FROM iphone_models m
CROSS JOIN screen_service s
CROSS JOIN (VALUES ('standard'), ('premium')) AS t(tier)
WHERE NOT EXISTS (
  SELECT 1 FROM dynamic_pricing dp 
  WHERE dp.model_id = m.id 
    AND dp.service_id = s.id 
    AND dp.pricing_tier = t.tier
);

-- Show count of what was inserted
SELECT 
  COUNT(*) as total_inserted,
  COUNT(DISTINCT model_id) as models_with_pricing
FROM dynamic_pricing dp
WHERE dp.created_at > NOW() - INTERVAL '1 minute';

-- Verify the pricing data
SELECT 
  dm.name as model,
  s.name as service,
  dp.pricing_tier as tier,
  dp.base_price,
  dp.compare_at_price,
  dp.part_quality
FROM dynamic_pricing dp
JOIN device_models dm ON dp.model_id = dm.id
JOIN services s ON dp.service_id = s.id
WHERE dm.name LIKE '%iPhone%'
  AND s.name LIKE '%Screen%'
  AND dm.name NOT LIKE '%SE%'
ORDER BY 
  CASE 
    WHEN dm.name LIKE '%iPhone 16%' THEN 1
    WHEN dm.name LIKE '%iPhone 15%' THEN 2
    WHEN dm.name LIKE '%iPhone 14%' THEN 3
    WHEN dm.name LIKE '%iPhone 13%' THEN 4
    WHEN dm.name LIKE '%iPhone 12%' THEN 5
    WHEN dm.name LIKE '%iPhone 11%' THEN 6
    ELSE 7
  END,
  dm.name,
  dp.pricing_tier;

-- Expected result: Should see pricing for all iPhone models (11-16), both standard and premium tiers
