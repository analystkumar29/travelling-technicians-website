#!/usr/bin/env node

const path = require('path');
const DataCleaningPipeline = require('./data-cleaning-pipeline');

console.log('🧹 COMPREHENSIVE DATA CLEANING & VALIDATION PIPELINE');
console.log('====================================================');
console.log('');
console.log('This pipeline will:');
console.log('1. 🔍 Normalize brand names (apple → Apple, blanks → Unknown)');
console.log('2. 🕵️ Categorize & reduce unknown model names using SKU mapping');
console.log('3. 🧠 Validate service types against controlled list');
console.log('4. 🧾 Analyze SKU patterns for model mapping');
console.log('5. 🧪 Clean up variant handling inconsistencies');
console.log('6. 📊 Generate comprehensive validation report');
console.log('');

const pipeline = new DataCleaningPipeline();
const inputFile = path.join(__dirname, 'tmp', 'manual-review.csv');
const outputFile = path.join(__dirname, 'tmp', 'cleaned-data.csv');

async function main() {
    try {
        console.log('⏳ Starting data cleaning process...');
        const cleanedRecords = await pipeline.processData(inputFile, outputFile);
        
        console.log('');
        console.log('✅ SUCCESS! Data cleaning completed.');
        console.log('');
        console.log('📁 Output files generated:');
        console.log(`   • Cleaned data: ${outputFile}`);
        console.log(`   • Cleaning report: ${path.join(__dirname, 'tmp', 'cleaning-report.json')}`);
        console.log('');
        console.log('🎯 Next steps:');
        console.log('   1. Review the cleaning report for quality metrics');
        console.log('   2. Manually review records with validation errors');
        console.log('   3. Spot-check cleaned data for accuracy');
        console.log('   4. Import cleaned data into your database');
        
    } catch (error) {
        console.error('❌ Error during data cleaning:', error.message);
        process.exit(1);
    }
}

main(); 