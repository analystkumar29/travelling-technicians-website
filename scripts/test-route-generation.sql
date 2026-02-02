-- ============================================================
-- TEST SCRIPT: Verify Database Structure for Universal Routing
-- Run this in Supabase SQL Editor BEFORE running the migration
-- ============================================================

-- ============================================================
-- SECTION 1: CHECK ACTIVE RECORD COUNTS
-- ============================================================

DO $$
DECLARE
    active_cities INTEGER;
    active_models INTEGER;
    active_services INTEGER;
    active_types INTEGER;
    active_brands INTEGER;
    expected_routes INTEGER;
BEGIN
    -- Get counts of active records
    SELECT COUNT(*) INTO active_cities FROM service_locations WHERE is_active = true;
    SELECT COUNT(*) INTO active_models FROM device_models WHERE is_active = true;
    SELECT COUNT(*) INTO active_services FROM services WHERE is_active = true AND is_doorstep_eligible = true;
    SELECT COUNT(*) INTO active_types FROM device_types WHERE is_active = true;
    SELECT COUNT(*) INTO active_brands FROM brands WHERE is_active = true;
    
    -- Calculate expected routes
    expected_routes := active_cities * active_models * active_services;
    
    -- Display results
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DATABASE ANALYSIS RESULTS:';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Active Cities: %', active_cities;
    RAISE NOTICE 'Active Models: %', active_models;
    RAISE NOTICE 'Active Services: %', active_services;
    RAISE NOTICE 'Active Device Types: %', active_types;
    RAISE NOTICE 'Active Brands: %', active_brands;
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE 'Expected Dynamic Routes: %', expected_routes;
    RAISE NOTICE '============================================';
    
    -- Check for potential issues
    IF active_cities = 0 THEN
        RAISE WARNING 'WARNING: No active cities found!';
    END IF;
    
    IF active_models = 0 THEN
        RAISE WARNING 'WARNING: No active models found!';
    END IF;
    
    IF active_services = 0 THEN
        RAISE WARNING 'WARNING: No active doorstep-eligible services found!';
    END IF;
    
    IF expected_routes = 0 THEN
        RAISE WARNING 'WARNING: Expected 0 routes. Check your active records!';
    END IF;
END $$;

-- ============================================================
-- SECTION 2: CHECK DEVICE TYPE RELATIONSHIPS
-- ============================================================

SELECT 
    'CHECK 1: Services with device_type_id' as check_name,
    COUNT(*) as total_services,
    COUNT(CASE WHEN device_type_id IS NOT NULL THEN 1 END) as with_device_type,
    COUNT(CASE WHEN device_type_id IS NULL THEN 1 END) as without_device_type
FROM services 
WHERE is_active = true AND is_doorstep_eligible = true;

SELECT 
    'CHECK 2: Models with type_id' as check_name,
    COUNT(*) as total_models,
    COUNT(CASE WHEN type_id IS NOT NULL THEN 1 END) as with_type_id,
    COUNT(CASE WHEN type_id IS NULL THEN 1 END) as without_type_id
FROM device_models 
WHERE is_active = true;

SELECT 
    'CHECK 3: Models with brand_id' as check_name,
    COUNT(*) as total_models,
    COUNT(CASE WHEN brand_id IS NOT NULL THEN 1 END) as with_brand_id,
    COUNT(CASE WHEN brand_id IS NULL THEN 1 END) as without_brand_id
FROM device_models 
WHERE is_active = true;

-- ============================================================
-- SECTION 3: SAMPLE DATA VERIFICATION
-- ============================================================

-- Sample cities
SELECT 'Sample Cities:' as category, city_name, slug FROM service_locations WHERE is_active = true LIMIT 5;

-- Sample device types
SELECT 'Sample Device Types:' as category, name, slug FROM device_types WHERE is_active = true;

-- Sample brands
SELECT 'Sample Brands:' as category, name, slug FROM brands WHERE is_active = true;

-- Sample models by type
SELECT 
    'Sample Models by Type:' as category,
    dt.name as device_type,
    COUNT(dm.id) as model_count,
    STRING_AGG(dm.name, ', ' ORDER BY dm.name LIMIT 3) as sample_models
FROM device_types dt
LEFT JOIN device_models dm ON dt.id = dm.type_id AND dm.is_active = true
WHERE dt.is_active = true
GROUP BY dt.id, dt.name
ORDER BY dt.name;

-- Sample services by device type
SELECT 
    'Sample Services by Type:' as category,
    dt.name as device_type,
    COUNT(s.id) as service_count,
    STRING_AGG(s.name, ', ' ORDER BY s.name) as sample_services
FROM device_types dt
LEFT JOIN services s ON dt.id = s.device_type_id AND s.is_active = true AND s.is_doorstep_eligible = true
WHERE dt.is_active = true
GROUP BY dt.id, dt.name
ORDER BY dt.name;

-- ============================================================
-- SECTION 4: TEST ROUTE GENERATION LOGIC
-- ============================================================

-- Test the view logic (simplified version)
WITH test_routes AS (
    SELECT 
        loc.city_name,
        dt.name as device_type,
        s.name as service_name,
        dm.name as model_name,
        COUNT(*) OVER () as total_combinations
    FROM service_locations loc
    CROSS JOIN device_models dm
    JOIN device_types dt ON dm.type_id = dt.id
    JOIN brands b ON dm.brand_id = b.id
    JOIN services s ON s.device_type_id = dt.id
    WHERE 
        loc.is_active = true 
        AND dm.is_active = true
        AND dt.is_active = true
        AND b.is_active = true
        AND s.is_active = true
        AND s.is_doorstep_eligible = true
        AND s.requires_diagnostics = false
    LIMIT 10
)
SELECT 
    'Test Route Generation:' as test,
    MIN(total_combinations) as estimated_total_routes,
    COUNT(*) as sample_count,
    STRING_AGG(
        CONCAT(city_name, ' - ', device_type, ' - ', service_name, ' - ', model_name),
        ' | ' ORDER BY city_name, device_type, service_name
    ) as sample_routes
FROM test_routes;

-- ============================================================
-- SECTION 5: CHECK FOR POTENTIAL ISSUES
-- ============================================================

-- Check for duplicate slugs (could cause route conflicts)
SELECT 
    'Duplicate Slugs Check:' as check_name,
    table_name,
    slug,
    COUNT(*) as duplicate_count
FROM (
    SELECT 'service_locations' as table_name, slug FROM service_locations WHERE is_active = true
    UNION ALL
    SELECT 'services', slug FROM services WHERE is_active = true
    UNION ALL
    SELECT 'device_models', slug FROM device_models WHERE is_active = true
    UNION ALL
    SELECT 'device_types', slug FROM device_types WHERE is_active = true
    UNION ALL
    SELECT 'brands', slug FROM brands WHERE is_active = true
) all_slugs
GROUP BY table_name, slug
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Check for missing relationships
SELECT 
    'Missing Relationships:' as issue,
    'Service without device_type_id' as description,
    name,
    slug
FROM services 
WHERE is_active = true AND device_type_id IS NULL
UNION ALL
SELECT 
    'Missing Relationships:',
    'Model without type_id',
    name,
    slug
FROM device_models 
WHERE is_active = true AND type_id IS NULL
UNION ALL
SELECT 
    'Missing Relationships:',
    'Model without brand_id',
    name,
    slug
FROM device_models 
WHERE is_active = true AND brand_id IS NULL
ORDER BY description, name;

-- ============================================================
-- SECTION 6: SUMMARY AND RECOMMENDATIONS
-- ============================================================

DO $$
DECLARE
    total_issues INTEGER;
BEGIN
    -- Count potential issues
    SELECT COUNT(*) INTO total_issues FROM (
        -- Duplicate slugs
        SELECT 1 FROM (
            SELECT slug FROM service_locations WHERE is_active = true GROUP BY slug HAVING COUNT(*) > 1
            UNION ALL
            SELECT slug FROM services WHERE is_active = true GROUP BY slug HAVING COUNT(*) > 1
            UNION ALL
            SELECT slug FROM device_models WHERE is_active = true GROUP BY slug HAVING COUNT(*) > 1
        ) dupes
        
        UNION ALL
        
        -- Missing relationships
        SELECT 1 FROM services WHERE is_active = true AND device_type_id IS NULL
        UNION ALL
        SELECT 1 FROM device_models WHERE is_active = true AND type_id IS NULL
        UNION ALL
        SELECT 1 FROM device_models WHERE is_active = true AND brand_id IS NULL
    ) issues;
    
    IF total_issues = 0 THEN
        RAISE NOTICE '✅ All checks passed! Database is ready for migration.';
        RAISE NOTICE 'Next step: Run the migration file: supabase/migrations/20260202000000_create_universal_routing_system.sql';
    ELSE
        RAISE WARNING '⚠️ Found % potential issues. Review the warnings above before proceeding.', total_issues;
        RAISE NOTICE 'Recommended actions:';
        RAISE NOTICE '1. Fix duplicate slugs (if any)';
        RAISE NOTICE '2. Ensure all services have device_type_id';
        RAISE NOTICE '3. Ensure all models have type_id and brand_id';
        RAISE NOTICE '4. Re-run this test script after fixes';
    END IF;
END $$;

-- ============================================================
-- SECTION 7: QUICK MIGRATION READINESS CHECK
-- ============================================================

SELECT 
    'Migration Readiness Check' as category,
    CASE 
        WHEN (SELECT COUNT(*) FROM service_locations WHERE is_active = true) > 0 THEN '✅'
        ELSE '❌'
    END as has_active_cities,
    CASE 
        WHEN (SELECT COUNT(*) FROM device_models WHERE is_active = true) > 0 THEN '✅'
        ELSE '❌'
    END as has_active_models,
    CASE 
        WHEN (SELECT COUNT(*) FROM services WHERE is_active = true AND is_doorstep_eligible = true) > 0 THEN '✅'
        ELSE '❌'
    END as has_active_services,
    CASE 
        WHEN (SELECT COUNT(*) FROM (
            SELECT slug FROM service_locations WHERE is_active = true GROUP BY slug HAVING COUNT(*) > 1
            UNION ALL
            SELECT slug FROM services WHERE is_active = true GROUP BY slug HAVING COUNT(*) > 1
            UNION ALL
            SELECT slug FROM device_models WHERE is_active = true GROUP BY slug HAVING COUNT(*) > 1
        )) = 0 THEN '✅'
        ELSE '❌'
    END as no_duplicate_slugs,
    CASE 
        WHEN (SELECT COUNT(*) FROM services WHERE is_active = true AND device_type_id IS NULL) = 0 THEN '✅'
        ELSE '❌'
    END as all_services_have_device_type,
    CASE 
        WHEN (SELECT COUNT(*) FROM device_models WHERE is_active = true AND type_id IS NULL) = 0 THEN '✅'
        ELSE '❌'
    END as all_models_have_type_id
FROM (VALUES (1)) as t;

-- ============================================================
-- FINAL INSTRUCTIONS
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '============================================';
    RAISE NOTICE '1. Review all warnings and errors above';
    RAISE NOTICE '2. Fix any issues identified';
    RAISE NOTICE '3. Run this test script again to verify';
    RAISE NOTICE '4. When all checks pass ✅, run the migration:';
    RAISE NOTICE '   supabase/migrations/20260202000000_create_universal_routing_system.sql';
    RAISE NOTICE '5. Follow the implementation guide:';
    RAISE NOTICE '   docs/universal-routing-implementation-guide.md';
    RAISE NOTICE '============================================';
END $$;