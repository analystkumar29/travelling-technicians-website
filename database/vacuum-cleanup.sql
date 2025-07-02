-- Database Cleanup Script (Run AFTER optimization)
-- This script performs VACUUM operations to clean up deleted index space
-- Run each command SEPARATELY in Supabase SQL Editor (one at a time)

-- =============================================
-- VACUUM CLEANUP COMMANDS
-- =============================================
-- Note: Run these commands ONE AT A TIME in separate queries

-- Clean up dynamic_pricing table
VACUUM ANALYZE public.dynamic_pricing;

-- Clean up device_models table  
VACUUM ANALYZE public.device_models;

-- Clean up brands table
VACUUM ANALYZE public.brands;

-- Clean up services table
VACUUM ANALYZE public.services;

-- Clean up pricing_tiers table
VACUUM ANALYZE public.pricing_tiers;

-- Clean up service_categories table
VACUUM ANALYZE public.service_categories;

-- Clean up device_types table
VACUUM ANALYZE public.device_types;

-- =============================================
-- VERIFICATION QUERY
-- =============================================

-- Check final table sizes after cleanup
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('dynamic_pricing', 'device_models', 'brands', 'services', 'pricing_tiers')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC; 