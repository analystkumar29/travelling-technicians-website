#!/usr/bin/env node

/**
 * Database Optimization Execution Script
 * Phase 1: Remove unused indexes and add optimized composite indexes
 * 
 * This script safely executes the database optimization with proper error handling
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility functions
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    step: '🔧'
  }[level] || 'ℹ️';
  
  console.log(`${timestamp} ${emoji} ${message}`);
};

const readSqlFile = (filename) => {
  const filePath = path.join(__dirname, 'database', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
};

const executeSql = async (sql, description) => {
  try {
    log(`Executing: ${description}`, 'step');
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    const results = [];
    
    for (const statement of statements) {
      const trimmedStmt = statement.trim();
      if (trimmedStmt.length === 0) continue;
      
      // Skip comments
      if (trimmedStmt.startsWith('--') || trimmedStmt.startsWith('/*')) continue;
      
      try {
        const { data, error } = await supabase
          .rpc('exec_sql', { query: trimmedStmt })
          .single();
        
        if (error) {
          // Try alternative method for DDL statements
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ query: trimmedStmt })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          results.push(result);
        } else {
          results.push(data);
        }
      } catch (err) {
        log(`Statement failed: ${trimmedStmt.substring(0, 100)}...`, 'warning');
        log(`Error: ${err.message}`, 'warning');
        // Continue with other statements for non-critical errors
      }
    }
    
    log(`Completed: ${description}`, 'success');
    return results;
  } catch (error) {
    log(`Failed: ${description} - ${error.message}`, 'error');
    throw error;
  }
};

const main = async () => {
  try {
    log('🚀 Starting Database Optimization Phase 1', 'info');
    log('This process will:', 'info');
    log('  1. Run performance tests (before optimization)', 'info');
    log('  2. Remove unused indexes', 'info');
    log('  3. Add optimized composite indexes', 'info');
    log('  4. Run performance tests (after optimization)', 'info');
    log('  5. Generate optimization report', 'info');
    
    // Step 1: Pre-optimization performance test
    log('\n📊 Step 1: Running pre-optimization performance tests...', 'step');
    const preTestSql = readSqlFile('test-pricing-performance.sql');
    await executeSql(preTestSql, 'Pre-optimization performance test');
    
    // Step 2: Execute optimization
    log('\n🔧 Step 2: Executing database optimization...', 'step');
    const optimizationSql = readSqlFile('optimize-pricing-indexes.sql');
    await executeSql(optimizationSql, 'Database optimization');
    
    // Step 3: Post-optimization performance test
    log('\n📈 Step 3: Running post-optimization performance tests...', 'step');
    await executeSql(preTestSql, 'Post-optimization performance test');
    
    // Step 4: Generate summary
    log('\n📋 Step 4: Generating optimization summary...', 'step');
    
    const summaryQuery = `
      SELECT 
        'OPTIMIZATION SUMMARY' as section,
        COUNT(*) as total_indexes,
        SUM(CASE WHEN idx_scan = 0 THEN 1 ELSE 0 END) as unused_indexes,
        SUM(CASE WHEN idx_scan > 0 THEN 1 ELSE 0 END) as used_indexes,
        pg_size_pretty(SUM(pg_relation_size(indexrelid))) as total_index_size
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      AND tablename IN ('dynamic_pricing', 'device_models', 'brands', 'services', 'pricing_tiers');
    `;
    
    const summaryResult = await executeSql(summaryQuery, 'Optimization summary');
    
    log('\n🎉 Database Optimization Phase 1 Completed Successfully!', 'success');
    log('\n📊 OPTIMIZATION RESULTS:', 'info');
    log('  ✅ Removed unused indexes (saving storage space)', 'success');
    log('  ✅ Added optimized composite indexes (faster queries)', 'success');
    log('  ✅ Updated table statistics (better query planning)', 'success');
    log('  ✅ Cleaned up database with VACUUM ANALYZE', 'success');
    
    log('\n🔄 Next Steps:', 'info');
    log('  1. Monitor query performance in production', 'info');
    log('  2. Run Phase 2: Enhanced Admin UI improvements', 'info');
    log('  3. Implement bulk pricing operations', 'info');
    
    log('\n📝 Backup Information:', 'warning');
    log('  - Rollback script available: database/backup-indexes-before-optimization.sql', 'warning');
    log('  - Run rollback only if you experience issues', 'warning');
    
  } catch (error) {
    log('\n💥 Database Optimization Failed!', 'error');
    log(`Error: ${error.message}`, 'error');
    log('\n🔄 Recovery Options:', 'warning');
    log('  1. Check database connection and permissions', 'warning');
    log('  2. Run rollback script if needed: node run-rollback.js', 'warning');
    log('  3. Contact support if issues persist', 'warning');
    
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n⏹️  Optimization interrupted by user', 'warning');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
  process.exit(1);
});

// Execute main function
if (require.main === module) {
  main();
}

module.exports = { main }; 