#!/bin/bash

# ==============================================
# SECURITY CLEANUP SCRIPT
# ==============================================
# This script removes unused files that could pose security risks
# Review carefully before running!

echo "🧹 Starting security cleanup..."

# Create backup directory
mkdir -p .security-backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=".security-backup/$(date +%Y%m%d_%H%M%S)"

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

# Remove test and debug files (CAREFUL!)
echo "🗑️  Removing test files..."
safe_remove "test-warranty-system.js"
safe_remove "test-api-booking.js"
safe_remove "test-minimal.js"
safe_remove "test-api-direct.js"
safe_remove "minimal-test-booking.js"
safe_remove "minimal-test-technician.js"
safe_remove "test-password-reset.js"
safe_remove "test-supabase-connection.js"

echo "🗑️  Removing check files..."
safe_remove "check-auth-config.js"
safe_remove "check-database.js"
safe_remove "check-template-literals.js"

echo "🗑️  Removing fix files..."
safe_remove "fix-all-errors.js"
safe_remove "fix-and-start.js"
safe_remove "fix-auth-navigation.js"
safe_remove "fix-booking-test.js"
safe_remove "fix-router-precise.js"
safe_remove "fix-router.js"
safe_remove "fix-syntax-errors.js"
safe_remove "fix-syntax.js"
safe_remove "fix-template-literals.js"

echo "🗑️  Removing setup scripts..."
safe_remove "setup-auth-env.js"
safe_remove "setup-env.js"

echo "🗑️  Removing excessive SQL model files..."
# Keep only essential ones, remove the rest
safe_remove "add-apple-models-only.sql"
safe_remove "add-dell-brand.sql"
safe_remove "add-hp-brand.sql"
safe_remove "add-lenovo-tablet-brand.sql"
safe_remove "add-missing-tablet-brands.sql"
safe_remove "simple-apple-models.sql"
safe_remove "complete-apple-models.sql"
safe_remove "comprehensive-device-models-complete.sql"
safe_remove "comprehensive-device-models-part2.sql"
safe_remove "corrected-comprehensive-device-models.sql"
safe_remove "corrected-laptop-tablet-models.sql"
safe_remove "final-comprehensive-device-models.sql"

echo "🗑️  Removing documentation clutter..."
safe_remove "AUTH_FIXES.md"
safe_remove "AUTH_NAVIGATION_IMPROVEMENTS.md"
safe_remove "AUTH_REMOVAL_SUMMARY.md"
safe_remove "AUTH_STATE_PROTECTION.md"
safe_remove "FIX-AUTH-REDIRECT-ERRORS.md"
safe_remove "README-EMAIL-TEMPLATES.md"
safe_remove "README-SYNTAX-FIXES.md"
safe_remove "README-WARRANTY-SYSTEM.md"
safe_remove "TEMPLATE_LITERAL_FIXES.md"

echo "🗑️  Removing update/migration scripts..."
safe_remove "update-bookings-add-pricing-tier.js"
safe_remove "update-warranty-system.js"
safe_remove "run-improved-migration.js"
safe_remove "run-migration-with-env.js"
safe_remove "run-remove-authentication.js"
safe_remove "run-schema-update.js"
safe_remove "run-technician-warranty-migration.js"

echo "📊 Cleanup Summary:"
echo "  📁 Files backed up to: $BACKUP_DIR"
echo "  🗑️  Files removed: $(ls -1 $BACKUP_DIR 2>/dev/null | wc -l)"
echo "  💾 Space saved: $(du -sh $BACKUP_DIR 2>/dev/null | cut -f1)"

echo ""
echo "✅ Security cleanup completed!"
echo "⚠️  If you need any of these files back, check: $BACKUP_DIR"
echo "🗑️  You can delete the backup folder after confirming everything works"

# Show remaining important files
echo ""
echo "📋 Important files that remain:"
ls -la *.md | head -5
echo "   ... and other essential project files" 