-- ============================================================
-- ADD PRICING DATA TO DYNAMIC ROUTES PAYLOAD
-- File: 20260202_add_pricing_to_payload.sql
-- Description: Adds standard and premium tier pricing to route payloads
-- ============================================================

-- Drop the existing view to recreate it with pricing data
DROP VIEW IF EXISTS view_active_repair_routes CASCADE;

-- Recreate the view with pricing information included
CREATE OR REPLACE VIEW view_active_repair_routes AS
SELECT 
    -- Construct the URL slug: /repair/city/service/model
    'repair/' || loc.slug || '/' || svc.slug || '/' || mod.slug AS slug_path,
    
    -- Route metadata
    'model-service-page'::text as route_type,
    
    -- Foreign key references
    loc.id as city_id,
    svc.id as service_id,
    mod.id as model_id,
    
    -- Slug components for URL construction
    loc.slug as city_slug,
    svc.slug as service_slug,
    mod.slug as model_slug,
    dt.slug as type_slug,
    b.slug as brand_slug,
    
    -- Pre-computed content payload for performance
    -- NOW INCLUDES PRICING DATA FROM BOTH STANDARD AND PREMIUM TIERS
    jsonb_build_object(
        'city', jsonb_build_object(
            'id', loc.id,
            'name', loc.city_name,
            'slug', loc.slug,
            'local_content', loc.local_content,
            'local_phone', loc.local_phone,
            'local_email', loc.local_email,
            'operating_hours', loc.operating_hours
        ),
        'service', jsonb_build_object(
            'id', svc.id,
            'name', svc.name,
            'slug', svc.slug,
            'description', svc.description,
            'display_name', svc.display_name,
            'estimated_duration_minutes', svc.estimated_duration_minutes,
            'is_doorstep_eligible', svc.is_doorstep_eligible
        ),
        'model', jsonb_build_object(
            'id', mod.id,
            'name', mod.name,
            'slug', mod.slug,
            'display_name', mod.display_name,
            'release_year', mod.release_year,
            'popularity_score', mod.popularity_score
        ),
        'type', jsonb_build_object(
            'id', dt.id,
            'name', dt.name,
            'slug', dt.slug
        ),
        'brand', jsonb_build_object(
            'id', b.id,
            'name', b.name,
            'slug', b.slug,
            'display_name', b.display_name
        ),
        -- NEW: STANDARD TIER PRICING (used for main display)
        'standard_pricing', COALESCE(
            (SELECT jsonb_build_object(
                'base_price', CAST(dp_std.base_price AS numeric),
                'compare_at_price', CAST(dp_std.compare_at_price AS numeric),
                'pricing_tier', dp_std.pricing_tier,
                'part_quality', dp_std.part_quality,
                'part_warranty_months', dp_std.part_warranty_months,
                'display_warranty_days', dp_std.display_warranty_days
            )
            FROM dynamic_pricing dp_std
            WHERE dp_std.model_id = mod.id
            AND dp_std.service_id = svc.id
            AND dp_std.pricing_tier = 'standard'
            AND dp_std.is_active = true
            LIMIT 1),
            '{}'::jsonb
        ),
        -- NEW: PREMIUM TIER PRICING (used for price range and upgrade option)
        'premium_pricing', COALESCE(
            (SELECT jsonb_build_object(
                'base_price', CAST(dp_prem.base_price AS numeric),
                'compare_at_price', CAST(dp_prem.compare_at_price AS numeric),
                'pricing_tier', dp_prem.pricing_tier,
                'part_quality', dp_prem.part_quality,
                'part_warranty_months', dp_prem.part_warranty_months,
                'display_warranty_days', dp_prem.display_warranty_days
            )
            FROM dynamic_pricing dp_prem
            WHERE dp_prem.model_id = mod.id
            AND dp_prem.service_id = svc.id
            AND dp_prem.pricing_tier = 'premium'
            AND dp_prem.is_active = true
            LIMIT 1),
            '{}'::jsonb
        )
    ) as payload,
    
    -- Statistics for monitoring
    loc.city_name as city_name,
    svc.name as service_name,
    mod.name as model_name,
    dt.name as device_type_name,
    b.name as brand_name
    
FROM service_locations loc
-- Cross join: Every city with every model
CROSS JOIN device_models mod
-- Join device type for the model
JOIN device_types dt ON mod.type_id = dt.id
-- Join brand for the model
JOIN brands b ON mod.brand_id = b.id
-- Join services that match the device type (CRITICAL BUSINESS RULE)
JOIN services svc ON svc.device_type_id = dt.id

-- BUSINESS RULES FILTERS:
WHERE 
    -- Active locations only
    loc.is_active = true 
    -- Active models only
    AND mod.is_active = true
    -- Active device types only
    AND dt.is_active = true
    -- Active brands only
    AND b.is_active = true
    -- Active services only
    AND svc.is_active = true
    -- Doorstep eligible services only
    AND svc.is_doorstep_eligible = true
    -- Exclude services that require diagnostics (optional business rule)
    AND svc.requires_diagnostics = false;

COMMENT ON VIEW view_active_repair_routes IS 'Master view that includes pricing tiers for psychological pricing strategy';

-- Note: Triggers will automatically refresh dynamic_routes when view is recreated
-- No need to manually call refresh function
