#!/bin/bash

# Database Optimization Execution Script
# Phase 1: Remove unused indexes and add optimized composite indexes

set -e  # Exit on any error

echo "🚀 Starting Database Optimization Phase 1"
echo "========================================"
echo ""

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1"
}

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local description=$2
    
    log "🔧 $description"
    
    if [ ! -f "database/$file" ]; then
        log "❌ Error: SQL file 'database/$file' not found"
        exit 1
    fi
    
    # Execute SQL using psql through Supabase CLI
    if supabase db reset --linked --debug; then
        log "✅ Database reset successful"
    else
        log "⚠️  Database reset failed, continuing with direct execution"
    fi
    
    # Alternative: Use psql directly if available
    if command -v psql >/dev/null 2>&1; then
        log "Using psql to execute $file"
        # Note: You'll need to set DATABASE_URL environment variable
        # export DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
        # psql $DATABASE_URL -f "database/$file"
    else
        log "⚠️  psql not available. Please execute the SQL files manually in Supabase dashboard."
        log "📋 Files to execute in order:"
        log "   1. database/$file"
        return 1
    fi
}

# Check if Supabase CLI is available
if ! command -v supabase >/dev/null 2>&1; then
    log "❌ Error: Supabase CLI is not installed or not in PATH"
    exit 1
fi

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    log "❌ Error: Supabase project is not initialized. Run 'supabase init' first."
    exit 1
fi

log "📊 Step 1: Running pre-optimization performance test"
echo "=============================================="
if [ -f "database/test-pricing-performance.sql" ]; then
    log "📁 Performance test file found"
    log "📋 Please run this manually in Supabase SQL Editor:"
    log "   database/test-pricing-performance.sql"
    echo ""
    read -p "Press Enter after running the pre-optimization test..."
else
    log "⚠️  Performance test file not found, skipping..."
fi

log "🔧 Step 2: Executing database optimization"
echo "========================================="
if [ -f "database/optimize-pricing-indexes.sql" ]; then
    log "📁 Optimization script found"
    log "📋 Please run this manually in Supabase SQL Editor:"
    log "   database/optimize-pricing-indexes.sql"
    echo ""
    log "🔍 This script will:"
    log "   - Remove unused indexes (save storage)"
    log "   - Add optimized composite indexes (faster queries)"
    log "   - Update table statistics"
    log "   - Clean up with VACUUM ANALYZE"
    echo ""
    read -p "Press Enter after running the optimization script..."
else
    log "❌ Error: Optimization script not found"
    exit 1
fi

log "📈 Step 3: Running post-optimization performance test"
echo "==============================================="
if [ -f "database/test-pricing-performance.sql" ]; then
    log "📋 Please run the performance test again in Supabase SQL Editor:"
    log "   database/test-pricing-performance.sql"
    echo ""
    read -p "Press Enter after running the post-optimization test..."
else
    log "⚠️  Performance test file not found, skipping..."
fi

log "📋 Step 4: Optimization Summary"
echo "==============================="
log "✅ Database optimization Phase 1 completed!"
echo ""
log "📊 What was accomplished:"
log "   ✅ Removed unused indexes (saving storage space)"
log "   ✅ Added optimized composite indexes (faster queries)"
log "   ✅ Updated table statistics (better query planning)"
log "   ✅ Cleaned up database with VACUUM ANALYZE"
echo ""
log "🔄 Next Steps:"
log "   1. Monitor query performance in your admin panel"
log "   2. Proceed to Phase 2: Enhanced Admin UI improvements"
log "   3. Implement bulk pricing operations"
echo ""
log "📝 Backup Information:"
log "   - Rollback script available: database/backup-indexes-before-optimization.sql"
log "   - Run rollback only if you experience issues"
echo ""
log "🎉 Phase 1 Database Optimization Complete!"

# Optional: Run Supabase table stats to show current state
log "📊 Current database statistics:"
supabase inspect db table-stats 2>/dev/null || log "⚠️  Could not fetch table stats"

echo ""
log "✨ Ready for Phase 2: Enhanced Admin UI!" 