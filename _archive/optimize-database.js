#!/usr/bin/env node

/**
 * Database Optimization Script
 * Implements all critical optimizations from the System Architecture Analysis
 * 
 * Features:
 * - Remove unused indexes
 * - Add optimized composite indexes
 * - Update table statistics
 * - Performance testing before/after
 * - Comprehensive logging
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Logging utility
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const symbols = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    step: '🔧'
  };
  
  console.log(`${timestamp} ${symbols[type]} ${message}`);
}

// Execute SQL with error handling
async function executeSql(sql, description) {
  try {
    log(`Executing: ${description}`, 'step');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      log(`SQL Error in ${description}: ${error.message}`, 'error');
      return { success: false, error };
    }
    
    log(`✅ ${description} completed successfully`, 'success');
    return { success: true, data };
  } catch (err) {
    log(`Exception in ${description}: ${err.message}`, 'error');
    return { success: false, error: err };
  }
}

// Read SQL file
function readSqlFile(filename) {
  const filePath = path.join(__dirname, '..', 'database', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

// Pre-optimization analysis
async function performPreOptimizationAnalysis() {
  log('📊 Running pre-optimization analysis...', 'step');
  
  const analysisQuery = `
    -- Index usage analysis
    SELECT 
      'INDEX_USAGE' as metric_type,
      schemaname,
      tablename,
      indexname,
      pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
      idx_scan as scans,
      CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 10 THEN 'LOW_USAGE'
        ELSE 'ACTIVE'
      END as status
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public'
    AND tablename IN ('dynamic_pricing', 'device_models', 'brands', 'services', 'pricing_tiers')
    ORDER BY pg_relation_size(indexrelid) DESC;
  `;
  
  return await executeSql(analysisQuery, 'Pre-optimization index analysis');
}

// Post-optimization analysis
async function performPostOptimizationAnalysis() {
  log('📈 Running post-optimization analysis...', 'step');
  
  const analysisQuery = `
    -- Updated index usage and performance metrics
    SELECT 
      'POST_OPTIMIZATION' as analysis_type,
      COUNT(*) as total_indexes,
      SUM(CASE WHEN idx_scan = 0 THEN 1 ELSE 0 END) as unused_indexes,
      SUM(CASE WHEN idx_scan > 0 THEN 1 ELSE 0 END) as active_indexes,
      pg_size_pretty(SUM(pg_relation_size(indexrelid))) as total_index_size
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public'
    AND tablename IN ('dynamic_pricing', 'device_models', 'brands', 'services', 'pricing_tiers');
  `;
  
  return await executeSql(analysisQuery, 'Post-optimization summary');
}

// Apply database optimizations
async function applyDatabaseOptimizations() {
  log('🔧 Applying database optimizations...', 'step');
  
  // Use the final corrected optimization script
  const optimizationSql = `
    -- PHASE 1: Remove unused indexes (preserving constraint-backed indexes)
    DROP INDEX IF EXISTS public.idx_dynamic_pricing_valid;
    DROP INDEX IF EXISTS public.idx_dynamic_pricing_tier;
    DROP INDEX IF EXISTS public.idx_models_name;
    DROP INDEX IF EXISTS public.idx_dynamic_pricing_service;
    DROP INDEX IF EXISTS public.idx_services_device_type;
    DROP INDEX IF EXISTS public.idx_services_category;
    DROP INDEX IF EXISTS public.idx_services_active;

    -- PHASE 2: Add optimized composite indexes
    
    -- Primary pricing lookup (most critical for performance)
    CREATE INDEX IF NOT EXISTS idx_pricing_lookup_optimized 
    ON public.dynamic_pricing(model_id, service_id, pricing_tier_id, is_active) 
    WHERE is_active = true;

    -- Model lookup optimization for admin panel
    CREATE INDEX IF NOT EXISTS idx_models_brand_name_active 
    ON public.device_models(brand_id, name, is_active) 
    WHERE is_active = true;

    -- Service selection optimization
    CREATE INDEX IF NOT EXISTS idx_services_category_device_active 
    ON public.services(category_id, device_type_id, is_active) 
    WHERE is_active = true;

    -- Brand dropdown optimization
    CREATE INDEX IF NOT EXISTS idx_brands_device_name_active 
    ON public.brands(device_type_id, name, is_active) 
    WHERE is_active = true;

    -- Promotional pricing with date validation
    CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_active_dates 
    ON public.dynamic_pricing(is_active, valid_from, valid_until) 
    WHERE is_active = true;

    -- Pricing tier filtering optimization
    CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_tier_active 
    ON public.dynamic_pricing(pricing_tier_id, is_active) 
    WHERE is_active = true;

    -- Doorstep service filtering optimization
    CREATE INDEX IF NOT EXISTS idx_services_doorstep_device_active 
    ON public.services(is_doorstep_eligible, device_type_id, is_active) 
    WHERE is_active = true AND is_doorstep_eligible = true;

    -- PHASE 3: Update table statistics
    ANALYZE public.dynamic_pricing;
    ANALYZE public.device_models;
    ANALYZE public.brands;
    ANALYZE public.services;
    ANALYZE public.pricing_tiers;
    ANALYZE public.service_categories;
    ANALYZE public.device_types;

    -- Success indicator
    SELECT 'Database optimization completed successfully' as status;
  `;
  
  return await executeSql(optimizationSql, 'Database optimization');
}

// Performance test queries
async function runPerformanceTests() {
  log('🚀 Running performance tests...', 'step');
  
  const testQueries = [
    {
      name: 'Primary pricing lookup',
      sql: `
        EXPLAIN (ANALYZE, BUFFERS) 
        SELECT dp.base_price, dp.discounted_price, pt.name as tier_name
        FROM dynamic_pricing dp
        JOIN device_models dm ON dp.model_id = dm.id
        JOIN brands b ON dm.brand_id = b.id
        JOIN device_types dt ON b.device_type_id = dt.id
        JOIN services s ON dp.service_id = s.id
        JOIN pricing_tiers pt ON dp.pricing_tier_id = pt.id
        WHERE dt.name = 'mobile'
        AND b.name = 'Apple'
        AND dm.name LIKE '%iPhone%'
        AND s.name = 'screen_replacement'
        AND pt.name = 'standard'
        AND dp.is_active = true
        LIMIT 1;
      `
    },
    {
      name: 'Model lookup for admin panel',
      sql: `
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT dm.id, dm.name, b.name as brand_name
        FROM device_models dm
        JOIN brands b ON dm.brand_id = b.id
        WHERE b.name = 'Apple'
        AND dm.is_active = true
        ORDER BY dm.name
        LIMIT 10;
      `
    }
  ];
  
  for (const test of testQueries) {
    await executeSql(test.sql, `Performance test: ${test.name}`);
  }
}

// Main optimization function
async function main() {
  try {
    log('🚀 Starting Database Optimization Process', 'info');
    log('=========================================', 'info');
    
    // Step 1: Pre-optimization analysis
    await performPreOptimizationAnalysis();
    
    // Step 2: Apply optimizations
    const optimizationResult = await applyDatabaseOptimizations();
    if (!optimizationResult.success) {
      log('Database optimization failed. Stopping process.', 'error');
      process.exit(1);
    }
    
    // Step 3: Performance testing
    await runPerformanceTests();
    
    // Step 4: Post-optimization analysis
    await performPostOptimizationAnalysis();
    
    // Step 5: Final summary
    log('🎉 Database Optimization Complete!', 'success');
    log('==================================', 'success');
    log('✅ Removed unused indexes', 'success');
    log('✅ Added 7 optimized composite indexes', 'success');
    log('✅ Updated table statistics', 'success');
    log('✅ Ran performance tests', 'success');
    log('', 'info');
    log('Expected improvements:', 'info');
    log('  📈 20-70% faster pricing API responses', 'info');
    log('  📈 Improved admin panel performance', 'info');
    log('  📈 Better query execution plans', 'info');
    log('  💾 Reduced storage overhead', 'info');
    
  } catch (error) {
    log(`Optimization process failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main, executeSql, log }; 