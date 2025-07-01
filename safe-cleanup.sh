#!/bin/bash

# ==============================================
# SAFE CLEANUP SCRIPT - CONSERVATIVE APPROACH
# ==============================================

echo "🔍 SAFE cleanup - only removing verified unused files..."

# Create backup directory
mkdir -p .cleanup-backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=".cleanup-backup/$(date +%Y%m%d_%H%M%S)"

echo "📦 Creating backup in $BACKUP_DIR..."

# Function to safely remove files with backup
safe_remove() {
    local file="$1"
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/" 2>/dev/null
        rm "$file"
        echo "  ✅ Removed: $file"
    fi
}

# === SAFE TO REMOVE: Test Files ===
echo "🧪 Removing standalone test files..."
safe_remove "test-warranty-system.js"
safe_remove "test-api-booking.js" 
safe_remove "test-minimal.js"
safe_remove "test-api-direct.js"
safe_remove "minimal-test-booking.js"
safe_remove "minimal-test-technician.js"
safe_remove "test-password-reset.js"
safe_remove "test-supabase-connection.js"
safe_remove "test-api-create.js"
safe_remove "test-auth-url.js"
safe_remove "test-booking-creation.js"
safe_remove "test-booking-flow.js"
safe_remove "test-booking-form-stability.js"
safe_remove "test-booking-simple.js"
safe_remove "test-complete-booking-flow.js"
safe_remove "test-direct-query.js"
safe_remove "test-fetch-endpoint.js"
safe_remove "test-final-verification.js"
safe_remove "test-full-booking-flow.js"
safe_remove "test-hydration-final-verification.js"
safe_remove "test-hydration-final.js"
safe_remove "test-hydration-fix-verification.js"
safe_remove "test-minimal-api.js"
safe_remove "test-minimal-flow-debug.js"
safe_remove "test-minimal-flow.js"
safe_remove "test-query.js"
safe_remove "test-raw-sql.js"
safe_remove "test-supabase-booking-flow.js"
safe_remove "test-supabase-booking.js"
safe_remove "test-supabase-schema.js"
safe_remove "test-verify-schema.js"

# === SAFE TO REMOVE: SQL Model Files ===
echo "📄 Removing unused SQL model files..."
safe_remove "add-apple-models-only.sql"
safe_remove "add-dell-brand.sql"
safe_remove "add-hp-brand.sql"
safe_remove "add-lenovo-tablet-brand.sql"
safe_remove "add-missing-tablet-brands.sql"
safe_remove "apple-ipad-models-complete.sql"
safe_remove "apple-macbook-models-complete.sql"
safe_remove "apple-mobile-models-complete.sql"
safe_remove "asus-laptop-models.sql"
safe_remove "asus-mobile-models.sql"
safe_remove "asus-tablet-models.sql"
safe_remove "simple-apple-models.sql"
safe_remove "complete-apple-models.sql"
safe_remove "complete-device-models-insert.sql"
safe_remove "comprehensive-device-models-complete.sql"
safe_remove "comprehensive-device-models-part2.sql"
safe_remove "corrected-comprehensive-device-models.sql"
safe_remove "corrected-laptop-tablet-models.sql"
safe_remove "dell-laptop-models.sql"
safe_remove "final-comprehensive-device-models.sql"
safe_remove "google-mobile-models-complete.sql"
safe_remove "google-tablet-models-complete.sql"
safe_remove "hp-laptop-models.sql"
safe_remove "laptop-tablet-models-complete.sql"
safe_remove "lenovo-laptop-models-complete.sql"
safe_remove "lenovo-laptop-models.sql"
safe_remove "lenovo-tablet-models.sql"
safe_remove "microsoft-tablet-models-complete.sql"
safe_remove "oneplus-mobile-models.sql"
safe_remove "oneplus-phones.sql"
safe_remove "oneplus-tablet-models.sql"
safe_remove "samsung-laptop-models-complete.sql"
safe_remove "samsung-laptop-models.sql"
safe_remove "samsung-mobile-models-complete.sql"
safe_remove "samsung-tablet-models-complete.sql"
safe_remove "xiaomi-mobile-models-complete.sql"
safe_remove "xiaomi-mobile-models.sql"
safe_remove "xiaomi-phones.sql"
safe_remove "xiaomi-tablet-models.sql"

# === SAFE TO REMOVE: Old Documentation ===
echo "📚 Removing superseded documentation..."
safe_remove "AUTH_FIXES.md"
safe_remove "AUTH_NAVIGATION_IMPROVEMENTS.md" 
safe_remove "AUTH_REMOVAL_SUMMARY.md"
safe_remove "AUTH_STATE_PROTECTION.md"
safe_remove "FIX-AUTH-REDIRECT-ERRORS.md"
safe_remove "README-EMAIL-TEMPLATES.md"
safe_remove "README-SYNTAX-FIXES.md"
safe_remove "README-WARRANTY-SYSTEM.md"
safe_remove "TEMPLATE_LITERAL_FIXES.md"
safe_remove "TESTING-WARRANTY-SYSTEM.md"

# === SAFE TO REMOVE: Unused Scripts ===
echo "🔧 Removing unused utility scripts..."
safe_remove "debug-api-endpoint.js"
safe_remove "direct-sql-execute.js"
safe_remove "drop-brand-column.js"
safe_remove "minimal-insert-test.js"
safe_remove "create-test-booking.js"
safe_remove "minimal-test-technician.js"

echo ""
echo "✅ Safe cleanup completed!"
echo "📊 Files removed: $(ls -1 $BACKUP_DIR 2>/dev/null | wc -l)"
echo "💾 Backup location: $BACKUP_DIR"
echo ""
echo "⚠️  PRESERVED (active references found):"
echo "    - All fix-*.js files (used by router system)"
echo "    - check-template-literals.js (used by reset script)" 
echo "    - verify-router-fixes.js (verification tool)"
echo "    - All migration scripts (database updates)"
echo "    - Start/dev scripts (development tools)" 