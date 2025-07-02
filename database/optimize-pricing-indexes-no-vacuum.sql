-- FINAL SAFE Dynamic Pricing Database Optimization Script
-- Phase 1: Remove unused indexes and add optimized composite indexes
-- NO VACUUM: Avoids transaction block errors in Supabase SQL Editor

-- =============================================
-- 1. REMOVE UNUSED NON-CONSTRAINT INDEXES ONLY
-- =============================================

-- These indexes have 0% usage and 0 scans - safe to remove (no constraints)
DROP INDEX IF EXISTS public.idx_dynamic_pricing_valid;
DROP INDEX IF EXISTS public.idx_dynamic_pricing_tier;
DROP INDEX IF EXISTS public.idx_models_name;
DROP INDEX IF EXISTS public.idx_dynamic_pricing_service;
DROP INDEX IF EXISTS public.idx_services_device_type;
DROP INDEX IF EXISTS public.idx_services_category;
DROP INDEX IF EXISTS public.idx_services_active;

-- PRESERVING ALL *_key indexes as they back UNIQUE constraints:
-- ✅ dynamic_pricing_service_id_model_id_pricing_tier_id_key (pricing integrity)
-- ✅ user_profiles_email_key (email uniqueness)
-- ✅ technicians_email_key (technician email uniqueness) 
-- ✅ warranties_warranty_code_key (warranty code uniqueness)

-- =============================================
-- 2. ADD OPTIMIZED COMPOSITE INDEXES
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
-- 3. UPDATE TABLE STATISTICS
-- =============================================

-- Update table statistics for better query planning
ANALYZE public.dynamic_pricing;
ANALYZE public.device_models;
ANALYZE public.brands;
ANALYZE public.services;
ANALYZE public.pricing_tiers;
ANALYZE public.service_categories;
ANALYZE public.device_types;

-- =============================================
-- 4. VERIFY OPTIMIZATION RESULTS
-- =============================================

-- Check new index sizes after optimization
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
-- 5. VERIFY CONSTRAINTS ARE INTACT
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

-- =============================================
-- 6. SUCCESS MESSAGE
-- =============================================

SELECT 'Database optimization Phase 1 completed successfully! ✅' as status,
       'Removed 7 unused indexes, added 7 optimized indexes, preserved ALL constraints' as details,
       'Run the separate VACUUM script next for cleanup' as next_step; 