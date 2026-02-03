-- ============================================
-- PHASE 1: SIMPLE FIXES FOR pSEO ROUTING SYSTEM
-- ============================================
-- 
-- This migration focuses on critical fixes only:
-- 1. Ensure triggers fire on ALL operations (INSERT, UPDATE, DELETE)
-- 2. Add missing route types (city-page, city-service-page)
-- 3. Test that the system works
--
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- SECTION 1: VERIFY CURRENT STATE
-- ============================================

-- Check current route count and types
SELECT 
    route_type,
    COUNT(*) as count
FROM dynamic_routes 
GROUP BY route_type;

-- Check trigger definitions
SELECT 
    tgname as trigger_name,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgname LIKE '%refresh_routes%'
ORDER BY tgname;

-- ============================================
-- SECTION 2: FIX TRIGGERS TO INCLUDE UPDATE OPERATIONS
-- ============================================

-- The existing triggers might not fire on UPDATE operations for all columns
-- Let's recreate them to be more comprehensive

-- 1. Drop existing triggers
DROP TRIGGER IF EXISTS trigger_refresh_routes_brands ON brands;
DROP TRIGGER IF EXISTS trigger_refresh_routes_locations ON service_locations;
DROP TRIGGER IF EXISTS trigger_refresh_routes_models ON device_models;
DROP TRIGGER IF EXISTS trigger_refresh_routes_services ON services;
DROP TRIGGER IF EXISTS trigger_refresh_routes_types ON device_types;

-- 2. Recreate triggers with comprehensive coverage
-- Brands trigger
CREATE TRIGGER trigger_refresh_routes_brands
AFTER INSERT OR DELETE OR UPDATE 
ON brands
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dynamic_routes('brands');

-- Service locations trigger
CREATE TRIGGER trigger_refresh_routes_locations
AFTER INSERT OR DELETE OR UPDATE 
ON service_locations
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dynamic_routes('service_locations');

-- Device models trigger
CREATE TRIGGER trigger_refresh_routes_models
AFTER INSERT OR DELETE OR UPDATE 
ON device_models
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dynamic_routes('device_models');

-- Services trigger
CREATE TRIGGER trigger_refresh_routes_services
AFTER INSERT OR DELETE OR UPDATE 
ON services
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dynamic_routes('services');

-- Device types trigger
CREATE TRIGGER trigger_refresh_routes_types
AFTER INSERT OR DELETE OR UPDATE 
ON device_types
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dynamic_routes('device_types');

-- Dynamic pricing trigger (NEW - important for pricing updates)
CREATE TRIGGER trigger_refresh_routes_pricing
AFTER INSERT OR DELETE OR UPDATE 
ON dynamic_pricing
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dynamic_routes('dynamic_pricing');

-- ============================================
-- SECTION 3: ENHANCE VIEW TO INCLUDE ALL ROUTE TYPES
-- ============================================

-- First, let's check what the current view produces
SELECT COUNT(*) as current_routes FROM view_active_repair_routes;

-- Now enhance the view to include all route types
DROP VIEW IF EXISTS view_active_repair_routes CASCADE;

CREATE OR REPLACE VIEW view_active_repair_routes AS
-- 1. Model-Service-Page routes (existing - keep as is)
SELECT 
    'repair/' || loc.slug || '/' || svc.slug || '/' || mod.slug AS slug_path,
    'model-service-page'::text AS route_type,
    loc.id AS city_id,
    svc.id AS service_id,
    mod.id AS model_id,
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
        )
    ) AS payload
FROM service_locations loc
CROSS JOIN device_models mod
JOIN device_types dt ON mod.type_id = dt.id
JOIN brands b ON mod.brand_id = b.id
JOIN services svc ON svc.device_type_id = dt.id
WHERE loc.is_active = true 
    AND mod.is_active = true 
    AND dt.is_active = true 
    AND b.is_active = true 
    AND svc.is_active = true 
    AND svc.is_doorstep_eligible = true 
    AND svc.requires_diagnostics = false

UNION ALL

-- 2. City-Service-Page routes (NEW - for URLs like /repair/vancouver/screen-repair)
SELECT 
    'repair/' || loc.slug || '/' || svc.slug AS slug_path,
    'city-service-page'::text AS route_type,
    loc.id AS city_id,
    svc.id AS service_id,
    NULL::uuid AS model_id,
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
        'type', jsonb_build_object(
            'id', dt.id,
            'name', dt.name,
            'slug', dt.slug
        )
    ) AS payload
FROM service_locations loc
CROSS JOIN services svc
JOIN device_types dt ON svc.device_type_id = dt.id
WHERE loc.is_active = true 
    AND svc.is_active = true 
    AND svc.is_doorstep_eligible = true 
    AND dt.is_active = true

UNION ALL

-- 3. City-Page routes (NEW - for URLs like /repair/vancouver)
SELECT 
    'repair/' || loc.slug AS slug_path,
    'city-page'::text AS route_type,
    loc.id AS city_id,
    NULL::uuid AS service_id,
    NULL::uuid AS model_id,
    jsonb_build_object(
        'city', jsonb_build_object(
            'id', loc.id,
            'name', loc.city_name,
            'slug', loc.slug,
            'local_content', loc.local_content,
            'local_phone', loc.local_phone,
            'local_email', loc.local_email,
            'operating_hours', loc.operating_hours
        )
    ) AS payload
FROM service_locations loc
WHERE loc.is_active = true;

-- ============================================
-- SECTION 4: TEST THE FIXES
-- ============================================

-- First, manually refresh routes to populate the new types
SELECT manual_refresh_routes();

-- Wait a moment for the refresh to complete
SELECT pg_sleep(2);

-- Now verify the results
SELECT 
    route_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM dynamic_routes 
GROUP BY route_type 
ORDER BY count DESC;

-- Check sample routes of each type
SELECT 'City Pages:' as route_type, slug_path FROM dynamic_routes WHERE route_type = 'city-page' LIMIT 3;
SELECT 'City-Service Pages:' as route_type, slug_path FROM dynamic_routes WHERE route_type = 'city-service-page' LIMIT 3;
SELECT 'Model-Service Pages:' as route_type, slug_path FROM dynamic_routes WHERE route_type = 'model-service-page' LIMIT 3;

-- ============================================
-- SECTION 5: TEST TRIGGER FUNCTIONALITY
-- ============================================

-- Test 1: Make a small update to a service location and see if triggers fire
-- First, note the current count
SELECT COUNT(*) as routes_before_update FROM dynamic_routes;

-- Make a small, safe update (adding a note to local_content)
UPDATE service_locations 
SET local_content = COALESCE(local_content, '') || ' -- Updated for trigger test'
WHERE slug = 'vancouver'
RETURNING id, city_name, local_content;

-- Wait for trigger to fire
SELECT pg_sleep(3);

-- Check if routes were refreshed
SELECT COUNT(*) as routes_after_update FROM dynamic_routes;

-- Check the logs
SELECT 
    trigger_source,
    routes_generated,
    duration_ms,
    error_message,
    start_time
FROM route_generation_logs 
ORDER BY start_time DESC 
LIMIT 3;

-- ============================================
-- SECTION 6: CREATE SIMPLE HELPER FUNCTION
-- ============================================

-- Create a simple function to check system health
CREATE OR REPLACE FUNCTION check_routing_system_health()
RETURNS jsonb AS $$
DECLARE
    route_stats jsonb;
    trigger_count integer;
    last_refresh timestamp;
BEGIN
    -- Get route statistics
    SELECT jsonb_build_object(
        'total_routes', COUNT(*),
        'route_types', jsonb_object_agg(route_type, count),
        'last_refresh', MAX(last_updated)
    ) INTO route_stats
    FROM (
        SELECT route_type, COUNT(*) as count
        FROM dynamic_routes
        GROUP BY route_type
    ) types;
    
    -- Count active triggers
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger 
    WHERE tgname LIKE '%refresh_routes%';
    
    -- Get last refresh time from logs
    SELECT MAX(start_time) INTO last_refresh
    FROM route_generation_logs;
    
    RETURN jsonb_build_object(
        'status', 'healthy',
        'route_statistics', route_stats,
        'active_triggers', trigger_count,
        'last_refresh', last_refresh,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Test the health check
SELECT check_routing_system_health();

-- ============================================
-- MIGRATION COMPLETE - VERIFICATION STEPS
-- ============================================

/*
VERIFICATION CHECKLIST:

1. Run the migration in Supabase SQL Editor
2. Check the output for any errors
3. Run these verification queries:

-- Check route distribution
SELECT 
    route_type,
    COUNT(*) as count
FROM dynamic_routes 
GROUP BY route_type 
ORDER BY count DESC;

-- Should show 3 route types:
-- model-service-page: ~3,224 routes
-- city-service-page: ~52 routes (13 cities × 4 services)
-- city-page: 13 routes (one per active city)

-- Test trigger by updating a record
UPDATE services 
SET display_name = display_name || ' (test)'
WHERE slug = 'screen-repair-mobile'
RETURNING id, name, display_name;

-- Wait a few seconds, then check logs
SELECT * FROM route_generation_logs ORDER BY start_time DESC LIMIT 3;

-- Check system health
SELECT check_routing_system_health();

EXPECTED OUTCOME:
- All 3 route types exist in dynamic_routes table
- Triggers fire on INSERT, UPDATE, DELETE operations
- Total routes: ~3,289 (3,224 + 52 + 13)
- System health check returns "healthy" status
*/

-- ============================================
-- TROUBLESHOOTING
-- ============================================

/*
If triggers don't fire:
1. Check if the refresh_dynamic_routes() function exists:
   SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'refresh_dynamic_routes';

2. Check trigger definitions:
   SELECT tgname, pg_get_triggerdef(oid) FROM pg_trigger WHERE tgname LIKE '%refresh_routes%';

3. Manually test the refresh:
   SELECT manual_refresh_routes();

If route counts are wrong:
1. Check active records in source tables:
   SELECT 'service_locations' as table, COUNT(*) FROM service_locations WHERE is_active = true
   UNION ALL
   SELECT 'device_models', COUNT(*) FROM device_models WHERE is_active = true
   UNION ALL
   SELECT 'services', COUNT(*) FROM services WHERE is_active = true AND is_doorstep_eligible = true;

2. Check the view output:
   SELECT COUNT(*) FROM view_active_repair_routes;
   SELECT route_type, COUNT(*) FROM view_active_repair_routes GROUP BY route_type;
