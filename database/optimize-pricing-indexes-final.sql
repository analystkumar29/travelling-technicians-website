-- FINAL CORRECTED Dynamic Pricing Database Optimization Script
-- Phase 1: Remove unused indexes and add optimized composite indexes
-- SAFE TO RUN: All operations are reversible
-- FIXED: Removed ALL constraint-backed indexes from DROP list

-- =============================================
-- 1. ANALYSIS: CONSTRAINT-BACKED INDEXES TO KEEP
-- =============================================

-- These indexes back UNIQUE constraints and are ESSENTIAL for data integrity:
-- ✅ dynamic_pricing_service_id_model_id_pricing_tier_id_key (prevents duplicate pricing)
-- ✅ user_profiles_email_key (prevents duplicate emails)  
-- ✅ technicians_email_key (prevents duplicate technician emails)
-- ✅ warranties_warranty_code_key (prevents duplicate warranty codes)

-- =============================================
-- 2. REMOVE UNUSED NON-CONSTRAINT INDEXES ONLY
-- =============================================

-- These indexes have 0% usage and 0 scans - safe to remove (no constraints)
DROP INDEX IF EXISTS public.idx_dynamic_pricing_valid;
DROP INDEX IF EXISTS public.idx_dynamic_pricing_tier;
DROP INDEX IF EXISTS public.idx_models_name;
DROP INDEX IF EXISTS public.idx_dynamic_pricing_service;
DROP INDEX IF EXISTS public.idx_services_device_type;
DROP INDEX IF EXISTS public.idx_services_category;
DROP INDEX IF EXISTS public.idx_services_active;

-- NOTE: KEEPING ALL *_key indexes as they back UNIQUE constraints:
-- - dynamic_pricing_service_id_model_id_pricing_tier_id_key ✅ (pricing integrity)
-- - user_profiles_email_key ✅ (email uniqueness)
-- - technicians_email_key ✅ (technician email uniqueness) 
-- - warranties_warranty_code_key ✅ (warranty code uniqueness)

-- =============================================
-- 3. ADD OPTIMIZED COMPOSITE INDEXES
-- =============================================

-- Primary pricing lookup index (most common query pattern)
-- Used by: /api/pricing/calculate and booking system
CREATE INDEX IF NOT EXISTS idx_pricing_lookup_optimized 
ON public.dynamic_pricing(model_id, service_id, pricing_tier_id, is_active) 
WHERE is_active = true;

-- Enhanced model lookup for management panel
-- Used by: admin pricing management interface
CREATE INDEX IF NOT EXISTS idx_models_brand_name_active 
ON public.device_models(brand_id, name, is_active) 
WHERE is_active = true;

-- Service lookup optimization
-- Used by: service selection in booking and management
CREATE INDEX IF NOT EXISTS idx_services_category_device_active 
ON public.services(category_id, device_type_id, is_active) 
WHERE is_active = true;

-- Brand lookup with device type filtering
-- Used by: device selection dropdowns
CREATE INDEX IF NOT EXISTS idx_brands_device_name_active 
ON public.brands(device_type_id, name, is_active) 
WHERE is_active = true;

-- Dynamic pricing with date validation (for promotional pricing)
-- Used by: current active pricing queries
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_active_dates 
ON public.dynamic_pricing(is_active, valid_from, valid_until) 
WHERE is_active = true;

-- Management panel filtering optimization
-- Used by: admin panel filtering by pricing tier
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_tier_active 
ON public.dynamic_pricing(pricing_tier_id, is_active) 
WHERE is_active = true;

-- Service doorstep eligibility (frequently queried)
-- Used by: booking form service filtering
CREATE INDEX IF NOT EXISTS idx_services_doorstep_device_active 
ON public.services(is_doorstep_eligible, device_type_id, is_active) 
WHERE is_active = true AND is_doorstep_eligible = true;

-- =============================================
-- 4. ANALYZE TABLES FOR STATISTICS UPDATE
-- =============================================

-- Update table statistics for query planner
ANALYZE public.dynamic_pricing;
ANALYZE public.device_models;
ANALYZE public.brands;
ANALYZE public.services;
ANALYZE public.pricing_tiers;
ANALYZE public.service_categories;
ANALYZE public.device_types;

-- =============================================
-- 5. PERFORMANCE TEST QUERIES
-- =============================================

-- Test query 1: Primary pricing lookup (most common)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT dp.base_price, dp.discounted_price, pt.price_multiplier
FROM dynamic_pricing dp
JOIN device_models dm ON dp.model_id = dm.id
JOIN brands b ON dm.brand_id = b.id
JOIN device_types dt ON b.device_type_id = dt.id
JOIN services s ON dp.service_id = s.id
JOIN pricing_tiers pt ON dp.pricing_tier_id = pt.id
WHERE dt.name = 'mobile'
AND b.name = 'Apple'
AND dm.name = 'iPhone 16'
AND s.name = 'screen_replacement'
AND pt.name = 'standard'
AND dp.is_active = true;

-- Test query 2: Management panel model lookup
EXPLAIN (ANALYZE, BUFFERS)
SELECT dm.id, dm.name, b.name as brand_name, dt.name as device_type
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id
JOIN device_types dt ON b.device_type_id = dt.id
WHERE dt.name = 'mobile'
AND b.name = 'Apple'
AND dm.is_active = true
ORDER BY dm.name;

-- Test query 3: Service filtering for device type
EXPLAIN (ANALYZE, BUFFERS)
SELECT s.id, s.name, s.display_name, sc.display_name as category
FROM services s
JOIN service_categories sc ON s.category_id = sc.id
WHERE s.device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')
AND s.is_doorstep_eligible = true
AND s.is_active = true
ORDER BY sc.sort_order, s.sort_order;

-- =============================================
-- 6. INDEX SIZE ANALYSIS AFTER OPTIMIZATION
-- =============================================

-- Query to check index sizes after optimization
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as index_scans,
    round((100 * idx_scan / GREATEST(seq_scan + idx_scan, 1))::numeric, 2) as index_usage_pct
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('dynamic_pricing', 'device_models', 'brands', 'services', 'pricing_tiers')
ORDER BY pg_relation_size(indexrelid) DESC;

-- =============================================
-- 7. VACUUM AND REINDEX FOR CLEANUP
-- =============================================

-- Clean up deleted index space and update statistics
VACUUM ANALYZE public.dynamic_pricing;
VACUUM ANALYZE public.device_models;
VACUUM ANALYZE public.brands;
VACUUM ANALYZE public.services;

-- =============================================
-- 8. CONSTRAINT VERIFICATION
-- =============================================

-- Verify that important UNIQUE constraints are still intact
SELECT 
    'CONSTRAINT VERIFICATION' as section,
    constraint_name,
    table_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public'
AND constraint_type = 'UNIQUE'
AND table_name IN ('dynamic_pricing', 'user_profiles', 'technicians', 'warranties')
ORDER BY table_name, constraint_name;

-- Success message
SELECT 'FINAL Database optimization completed successfully! ✅' as status,
       'Removed unused indexes only, preserved ALL data integrity constraints' as details; 