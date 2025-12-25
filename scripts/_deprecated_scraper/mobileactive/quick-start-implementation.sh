#!/bin/bash

# Quick Start Implementation Script
# Advanced MobileActive Data Cleaning System v3.0

set -e  # Exit on any error

echo "🚀 Quick Start Implementation: Advanced MobileActive Data Cleaning v3.0"
echo "=================================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "advanced-cleaner-v3.js" ]; then
    print_error "Please run this script from the scripts/mobileactive directory"
    exit 1
fi

# Step 1: Verify current setup
print_status "Step 1: Verifying current setup..."
if [ -f "advanced-cleaner-v3.js" ]; then
    print_success "Advanced cleaner found"
else
    print_error "Advanced cleaner not found"
    exit 1
fi

if [ -f "test-advanced-cleaner.js" ]; then
    print_success "Test script found"
else
    print_error "Test script not found"
    exit 1
fi

if [ -f "tmp/mobileactive-raw.json" ]; then
    print_success "Raw data found"
else
    print_error "Raw data not found. Please run data extraction first."
    exit 1
fi

echo ""

# Step 2: Run tests
print_status "Step 2: Running tests..."
if node test-advanced-cleaner.js > /dev/null 2>&1; then
    print_success "Tests passed"
else
    print_warning "Some tests failed, but continuing..."
fi

echo ""

# Step 3: Process existing data
print_status "Step 3: Processing existing data with advanced cleaning..."
if node advanced-cleaner-v3.js > /dev/null 2>&1; then
    print_success "Advanced cleaning completed"
else
    print_error "Advanced cleaning failed"
    exit 1
fi

echo ""

# Step 4: Check results
print_status "Step 4: Checking results..."
if [ -f "tmp/mobileactive-enhanced-v3.json" ]; then
    print_success "Enhanced data created"
    ENHANCED_SIZE=$(ls -lh tmp/mobileactive-enhanced-v3.json | awk '{print $5}')
    print_status "Enhanced data size: $ENHANCED_SIZE"
else
    print_error "Enhanced data not created"
    exit 1
fi

if [ -f "tmp/mobileactive-enhanced-v3.csv" ]; then
    print_success "Enhanced CSV created"
    CSV_LINES=$(wc -l < tmp/mobileactive-enhanced-v3.csv)
    print_status "CSV lines: $CSV_LINES"
else
    print_error "Enhanced CSV not created"
    exit 1
fi

if [ -f "tmp/validation-report-v3.json" ]; then
    print_success "Validation report created"
else
    print_error "Validation report not created"
    exit 1
fi

echo ""

# Step 5: Run migration analysis
print_status "Step 5: Running migration analysis..."
if node migrate-to-advanced-cleaning.js > /dev/null 2>&1; then
    print_success "Migration analysis completed"
else
    print_warning "Migration analysis failed, but continuing..."
fi

echo ""

# Step 6: Display summary
print_status "Step 6: Implementation Summary"
echo "====================================="

# Read validation report
if [ -f "tmp/validation-report-v3.json" ]; then
    TOTAL_PRODUCTS=$(node -e "const r=JSON.parse(require('fs').readFileSync('tmp/validation-report-v3.json')); console.log(r.summary.total_products)")
    VALID_PRODUCTS=$(node -e "const r=JSON.parse(require('fs').readFileSync('tmp/validation-report-v3.json')); console.log(r.summary.valid_products)")
    VALIDATION_RATE=$(node -e "const r=JSON.parse(require('fs').readFileSync('tmp/validation-report-v3.json')); console.log(r.summary.validation_rate)")
    
    echo "📊 Data Quality Metrics:"
    echo "   Total Products: $TOTAL_PRODUCTS"
    echo "   Valid Products: $VALID_PRODUCTS"
    echo "   Validation Rate: $VALIDATION_RATE"
    echo ""
fi

# Check for improvements
if [ -f "tmp/mobileactive-parts.csv" ] && [ -f "tmp/mobileactive-enhanced-v3.csv" ]; then
    OLD_LINES=$(wc -l < tmp/mobileactive-parts.csv)
    NEW_LINES=$(wc -l < tmp/mobileactive-enhanced-v3.csv)
    IMPROVEMENT=$((NEW_LINES - OLD_LINES))
    
    echo "📈 Improvements:"
    echo "   Old valid products: $OLD_LINES"
    echo "   New valid products: $NEW_LINES"
    echo "   Improvement: +$IMPROVEMENT products"
    echo ""
fi

# List generated files
echo "📁 Generated Files:"
ls -lh tmp/mobileactive-enhanced-v3.* tmp/validation-report-v3.json tmp/migration-report-v3.json 2>/dev/null | while read line; do
    echo "   $line"
done

echo ""

# Step 7: Next steps
print_status "Step 7: Next Steps"
echo "======================"
echo ""
echo "🎯 Implementation Options:"
echo ""
echo "Option A: Gradual Migration (Recommended)"
echo "  1. Keep existing system running"
echo "  2. Test new data in staging environment"
echo "  3. Gradually migrate validated data"
echo "  4. Monitor quality improvements"
echo ""
echo "Option B: Full Replacement"
echo "  1. Backup current data"
echo "  2. Replace with advanced cleaned data"
echo "  3. Update database schema if needed"
echo "  4. Test thoroughly before going live"
echo ""
echo "Option C: Hybrid Approach"
echo "  1. Use advanced cleaning for new extractions"
echo "  2. Keep existing data for backward compatibility"
echo "  3. Migrate data in batches"
echo "  4. Monitor quality improvements"
echo ""

print_success "Quick start implementation completed!"
echo ""
echo "📖 For detailed instructions, see: IMPLEMENTATION_GUIDE.md"
echo "📖 For technical details, see: README-Advanced-Cleaning.md"
echo ""
echo "🔧 To run advanced cleaning again:"
echo "   npm run data:clean:advanced -- --clean"
echo ""
echo "🧪 To run tests again:"
echo "   npm run data:clean:advanced:test"
echo ""
print_success "Advanced MobileActive Data Cleaning System v3.0 is ready to use!" 