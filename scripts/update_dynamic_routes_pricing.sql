-- ============================================================
-- UPDATE DYNAMIC ROUTES PRICING DATA
-- File: update_dynamic_routes_pricing.sql
-- Description: Updates existing dynamic_routes records to include 
--              both standard and premium pricing tiers
-- ============================================================

-- First, let's see what we're working with
SELECT COUNT(*) as total_routes FROM dynamic_routes;

-- Create a temporary view to get the updated pricing data
CREATE OR REPLACE TEMP VIEW temp_updated_routes AS
SELECT 
    dr.slug_path,
    dr.route_type,
    dr.city_id,
    dr.service_id,
    dr.model_id,
    
    -- Update the payload with both pricing tiers
    jsonb_set(
        jsonb_set(
            dr.payload,
            '{standard_pricing}',
            COALESCE(
                (SELECT jsonb_build_object(
                    'base_price', CAST(dp_std.base_price AS numeric),
                    'compare_at_price', CAST(dp_std.compare_at_price AS numeric),
                    'pricing_tier', dp_std.pricing_tier,
                    'part_quality', dp_std.part_quality,
                    'part_warranty_months', dp_std.part_warranty_months,
                    'display_warranty_days', dp_std.display_warranty_days
                )
                FROM dynamic_pricing dp_std
                WHERE dp_std.model_id = dr.model_id
                AND dp_std.service_id = dr.service_id
                AND dp_std.pricing_tier = 'standard'
                AND dp_std.is_active = true
                LIMIT 1),
                '{}'::jsonb
            )
        ),
        '{premium_pricing}',
        COALESCE(
            (SELECT jsonb_build_object(
                'base_price', CAST(dp_prem.base_price AS numeric),
                'compare_at_price', CAST(dp_prem.compare_at_price AS numeric),
                'pricing_tier', dp_prem.pricing_tier,
                'part_quality', dp_prem.part_quality,
                'part_warranty_months', dp_prem.part_warranty_months,
                'display_warranty_days', dp_prem.display_warranty_days
            )
            FROM dynamic_pricing dp_prem
            WHERE dp_prem.model_id = dr.model_id
            AND dp_prem.service_id = dr.service_id
            AND dp_prem.pricing_tier = 'premium'
            AND dp_prem.is_active = true
            LIMIT 1),
            '{}'::jsonb
        )
    ) as updated_payload
    
FROM dynamic_routes dr
WHERE dr.route_type = 'model-service-page';

-- Show a sample of what will be updated
SELECT 
    slug_path,
    updated_payload->'standard_pricing' as standard_pricing,
    updated_payload->'premium_pricing' as premium_pricing,
    updated_payload->'pricing' as old_pricing
FROM temp_updated_routes 
WHERE slug_path = 'repair/surrey/battery-replacement-mobile/iphone-17'
LIMIT 5;

-- Count how many routes will get standard pricing
SELECT 
    COUNT(*) as total_routes,
    COUNT(CASE WHEN updated_payload->'standard_pricing' != '{}' THEN 1 END) as with_standard_pricing,
    COUNT(CASE WHEN updated_payload->'premium_pricing' != '{}' THEN 1 END) as with_premium_pricing
FROM temp_updated_routes;

-- Now update the dynamic_routes table
UPDATE dynamic_routes dr
SET 
    payload = tur.updated_payload,
    last_updated = NOW()
FROM temp_updated_routes tur
WHERE dr.slug_path = tur.slug_path
AND dr.route_type = 'model-service-page'
AND (
    -- Only update if there's a difference in pricing data
    dr.payload->'standard_pricing' IS DISTINCT FROM tur.updated_payload->'standard_pricing'
    OR dr.payload->'premium_pricing' IS DISTINCT FROM tur.updated_payload->'premium_pricing'
);

-- Show the updated record for verification
SELECT 
    slug_path,
    payload->'standard_pricing' as standard_pricing,
    payload->'premium_pricing' as premium_pricing,
    payload->'pricing' as old_pricing
FROM dynamic_routes 
WHERE slug_path = 'repair/surrey/battery-replacement-mobile/iphone-17'
LIMIT 1;

-- Clean up
DROP VIEW IF EXISTS temp_updated_routes;

-- Report on the update
SELECT 
    'Update complete' as status,
    COUNT(*) as routes_updated
FROM dynamic_routes 
WHERE last_updated > NOW() - INTERVAL '5 minutes'
AND route_type = 'model-service-page';