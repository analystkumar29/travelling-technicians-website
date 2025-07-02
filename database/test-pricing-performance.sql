-- Database Performance Testing Script
-- Run this BEFORE and AFTER optimization to measure improvements

-- =============================================
-- 1. CURRENT INDEX USAGE ANALYSIS
-- =============================================

SELECT 
    '=== CURRENT INDEX USAGE ANALYSIS ===' as section;

SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED ⚠️'
        WHEN idx_scan < 10 THEN 'LOW USAGE 📊'
        WHEN idx_scan < 100 THEN 'MODERATE USAGE 📈'
        ELSE 'HIGH USAGE ✅'
    END as usage_status
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND tablename IN ('dynamic_pricing', 'device_models', 'brands', 'services')
ORDER BY pg_relation_size(indexrelid) DESC;

-- =============================================
-- 2. TABLE SIZE ANALYSIS
-- =============================================

SELECT 
    '=== TABLE SIZE ANALYSIS ===' as section;

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

-- =============================================
-- 3. PERFORMANCE TEST QUERIES
-- =============================================

SELECT 
    '=== PERFORMANCE TEST 1: Primary Pricing Lookup ===' as test;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
SELECT dp.base_price, dp.discounted_price, pt.price_multiplier,
       s.display_name as service_name,
       dm.name as model_name,
       b.name as brand_name
FROM dynamic_pricing dp
JOIN device_models dm ON dp.model_id = dm.id
JOIN brands b ON dm.brand_id = b.id
JOIN device_types dt ON b.device_type_id = dt.id
JOIN services s ON dp.service_id = s.id
JOIN pricing_tiers pt ON dp.pricing_tier_id = pt.id
WHERE dt.name = 'mobile'
AND b.name = 'Apple'
AND dm.name ILIKE '%iPhone 16%'
AND s.name = 'screen_replacement'
AND pt.name = 'standard'
AND dp.is_active = true;

SELECT 
    '=== PERFORMANCE TEST 2: Management Panel Model Lookup ===' as test;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT dm.id, dm.name, dm.display_name, 
       b.name as brand_name, 
       dt.name as device_type,
       COUNT(dp.id) as pricing_entries
FROM device_models dm
JOIN brands b ON dm.brand_id = b.id
JOIN device_types dt ON b.device_type_id = dt.id
LEFT JOIN dynamic_pricing dp ON dm.id = dp.model_id AND dp.is_active = true
WHERE dt.name = 'mobile'
AND dm.is_active = true
GROUP BY dm.id, dm.name, dm.display_name, b.name, dt.name
ORDER BY dm.name
LIMIT 20;

SELECT 
    '=== PERFORMANCE TEST 3: Service Filtering ===' as test;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT s.id, s.name, s.display_name, 
       sc.display_name as category,
       COUNT(dp.id) as pricing_entries
FROM services s
JOIN service_categories sc ON s.category_id = sc.id
LEFT JOIN dynamic_pricing dp ON s.id = dp.service_id AND dp.is_active = true
WHERE s.device_type_id = (SELECT id FROM device_types WHERE name = 'mobile')
AND s.is_doorstep_eligible = true
AND s.is_active = true
GROUP BY s.id, s.name, s.display_name, sc.display_name, sc.sort_order, s.sort_order
ORDER BY sc.sort_order, s.sort_order;

SELECT 
    '=== PERFORMANCE TEST 4: Complex Pricing Query (Admin Panel) ===' as test;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT 
    dt.display_name as device_type,
    b.display_name as brand,
    dm.display_name as model,
    s.display_name as service,
    pt.display_name as tier,
    dp.base_price,
    dp.discounted_price,
    CASE 
        WHEN dp.discounted_price IS NOT NULL 
        THEN dp.discounted_price 
        ELSE dp.base_price * pt.price_multiplier 
    END as final_price
FROM dynamic_pricing dp
JOIN services s ON dp.service_id = s.id
JOIN service_categories sc ON s.category_id = sc.id
JOIN device_models dm ON dp.model_id = dm.id
JOIN brands b ON dm.brand_id = b.id
JOIN device_types dt ON b.device_type_id = dt.id
JOIN pricing_tiers pt ON dp.pricing_tier_id = pt.id
WHERE dp.is_active = true
AND s.is_active = true
AND dm.is_active = true
AND b.is_active = true
AND dt.is_active = true
AND pt.is_active = true
AND (dp.valid_until IS NULL OR dp.valid_until > NOW())
ORDER BY dt.name, b.name, dm.name, sc.sort_order, s.sort_order, pt.sort_order
LIMIT 50;

-- =============================================
-- 4. QUERY STATISTICS SUMMARY
-- =============================================

SELECT 
    '=== QUERY STATISTICS SUMMARY ===' as section;

SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE query ILIKE '%dynamic_pricing%'
OR query ILIKE '%device_models%'
ORDER BY total_time DESC
LIMIT 10;

-- =============================================
-- 5. CACHE HIT RATIO
-- =============================================

SELECT 
    '=== DATABASE CACHE HIT RATIO ===' as section;

SELECT 
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit)  as heap_hit,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables
WHERE schemaname = 'public'
AND relname IN ('dynamic_pricing', 'device_models', 'brands', 'services');

-- End of performance test
SELECT 
    '=== PERFORMANCE TEST COMPLETED ===' as status,
    NOW() as timestamp; 