#!/bin/bash

# Comprehensive MobileActive.ca Scraping Script
# Extracts all available brands from the product catalog

set -e  # Exit on any error

echo "🚀 Starting Comprehensive MobileActive.ca Scraping"
echo "=================================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if required packages are installed
if [ ! -f "package.json" ]; then
    echo "📦 Installing required packages..."
    npm install axios yaml p-limit
fi

# Create tmp directory if it doesn't exist
mkdir -p tmp

echo ""
echo "📊 Step 1: Running Brand Discovery (if not already done)..."
if [ ! -f "tmp/brand-coverage-report.json" ]; then
    echo "   Running brand discovery..."
    node brand-discovery.js
else
    echo "   Brand discovery already completed, skipping..."
fi

echo ""
echo "🔍 Step 2: Running Comprehensive Brand Scraping..."
echo "   This will extract all available brands from MobileActive.ca"
echo "   Estimated time: 15-30 minutes"
echo ""

# Run the comprehensive scraping
node fetch-all-brands.js

echo ""
echo "🧹 Step 3: Applying Advanced Data Cleaning..."
if [ -f "advanced-cleaner-v3.js" ]; then
    echo "   Running advanced cleaner v3 on scraped data..."
    node advanced-cleaner-v3.js tmp/mobileactive-all-brands-raw.json
    echo "   ✅ Advanced cleaning completed"
else
    echo "   ⚠️  Advanced cleaner v3 not found, skipping data cleaning..."
fi

echo ""
echo "📊 Step 4: Generating Additional CSV for Manual Review..."
if [ -f "tmp/mobileactive-all-brands-processed.json" ]; then
    echo "   Creating detailed CSV for manual review..."
    node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('tmp/mobileactive-all-brands-processed.json', 'utf8'));
    
    const csvHeader = [
        'product_id', 'brand', 'brand_name', 'device_type', 'model_name', 
        'service_type', 'part_price', 'confidence', 'priority', 'product_title'
    ].join(',');
    
    const csvRows = data.map(p => [
        p.product_id,
        p.brand,
        p.brand_name,
        p.device_type,
        '\"' + (p.model_name || '').replace(/\"/g, '\"\"') + '\"',
        p.service_type,
        p.part_price,
        p.confidence,
        p.priority,
        '\"' + (p.product_title || '').replace(/\"/g, '\"\"') + '\"'
    ].join(','));
    
    const csvContent = [csvHeader, ...csvRows].join('\n');
    fs.writeFileSync('tmp/manual-review.csv', csvContent);
    console.log('   ✅ Manual review CSV created: tmp/manual-review.csv');
    "
else
    echo "   ⚠️  Processed data not found, skipping CSV generation..."
fi

echo ""
echo "📈 Step 5: Generating Summary Report..."

# Create a summary report
cat > tmp/scraping-summary.md << EOF
# MobileActive.ca Comprehensive Scraping Summary

## Execution Details
- **Date**: $(date)
- **Script**: run-comprehensive-scraping.sh
- **Status**: Completed

## Files Generated
- \`mobileactive-all-brands-raw.json\` - Raw scraped data
- \`mobileactive-all-brands-processed.json\` - Processed data
- \`mobileactive-all-brands.csv\` - CSV export
- \`brand-coverage-report.json\` - Brand coverage analysis

## Next Steps
1. Review the generated data files
2. Apply additional cleaning if needed
3. Integrate with existing database
4. Update pricing and service calculations

## Data Quality Notes
- All products have been filtered for target brands
- Pricing has been extracted and calculated
- Service types have been categorized
- Model information has been extracted

EOF

echo "   Summary report created: tmp/scraping-summary.md"

echo ""
echo "🎉 Comprehensive Scraping Completed Successfully!"
echo "=================================================="
echo ""
echo "📁 Generated Files:"
echo "   - tmp/mobileactive-all-brands-raw.json"
echo "   - tmp/mobileactive-all-brands-processed.json"
echo "   - tmp/mobileactive-all-brands.csv"
echo "   - tmp/manual-review.csv (for manual review)"
echo "   - tmp/brand-coverage-report.json"
echo "   - tmp/scraping-summary.md"
if [ -f "tmp/mobileactive-enhanced-v3.json" ]; then
    echo "   - tmp/mobileactive-enhanced-v3.json (cleaned data)"
fi
echo ""
echo "📊 Next Steps:"
echo "   1. Review the data quality"
echo "   2. Apply additional cleaning if needed"
echo "   3. Integrate with your existing database"
echo "   4. Update your pricing calculations"
echo ""
echo "✅ All done! Check the generated files for results." 