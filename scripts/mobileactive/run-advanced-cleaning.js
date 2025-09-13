#!/usr/bin/env node

/**
 * Runner script for Advanced MobileActive Data Cleaning System v3.0
 * Integrates with existing pipeline and provides easy usage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SCRIPTS_DIR = path.join(process.cwd(), 'scripts/mobileactive');
const TMP_DIR = path.join(SCRIPTS_DIR, 'tmp');
const RAW_DATA_PATH = path.join(TMP_DIR, 'mobileactive-raw.json');

const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' }[level];
  console.log(`${timestamp} ${emoji} ${message}`);
};

function printUsage() {
  console.log(`
🧹 Advanced MobileActive Data Cleaning System v3.0

Usage: node run-advanced-cleaning.js [options]

Options:
  --extract     Extract fresh data from MobileActive.ca first
  --test        Run tests to validate cleaning logic
  --clean       Run advanced cleaning on existing raw data
  --full        Run full pipeline (extract + clean)
  --help        Show this help message

Examples:
  node run-advanced-cleaning.js --test          # Run tests
  node run-advanced-cleaning.js --clean         # Clean existing data
  node run-advanced-cleaning.js --full          # Full pipeline
  node run-advanced-cleaning.js --extract       # Extract only

Files produced:
  tmp/mobileactive-raw.json                     # Raw extracted data
  tmp/mobileactive-enhanced-v3.json             # Enhanced cleaned data
  tmp/mobileactive-enhanced-v3.csv              # Enhanced CSV export
  tmp/validation-report-v3.json                 # Validation report

Key improvements in v3.0:
  ✅ Model contamination removal (QV7, V2, etc.)
  ✅ Samsung abbreviation expansion (SGN → Galaxy Note)
  ✅ Multi-device compatibility parsing
  ✅ Enhanced brand/device detection with fallbacks
  ✅ Improved price extraction from variants
  ✅ Garbage model filtering with blacklist
  ✅ Better utilization of tags and collection context
  `);
}

async function ensureDirectories() {
  await fs.promises.mkdir(TMP_DIR, { recursive: true });
}

async function runExtraction() {
  log('🚀 Starting data extraction from MobileActive.ca...');
  
  try {
    // Check if extract script exists
    const extractScript = path.join(SCRIPTS_DIR, 'fetch-parts.js');
    if (!fs.existsSync(extractScript)) {
      throw new Error(`Extract script not found: ${extractScript}`);
    }
    
    // Change to scripts directory and run extraction
    process.chdir(SCRIPTS_DIR);
    execSync(`node fetch-parts.js`, { stdio: 'inherit' });
    
    log('✅ Data extraction completed successfully!', 'success');
    return true;
    
  } catch (error) {
    log(`❌ Data extraction failed: ${error.message}`, 'error');
    return false;
  }
}

async function runTests() {
  log('🧪 Running advanced cleaning tests...');
  
  try {
    // Check if test script exists
    const testScript = path.join(SCRIPTS_DIR, 'test-advanced-cleaner.js');
    if (!fs.existsSync(testScript)) {
      throw new Error(`Test script not found: ${testScript}`);
    }
    
    // Change to scripts directory and run tests
    process.chdir(SCRIPTS_DIR);
    execSync(`node test-advanced-cleaner.js`, { stdio: 'inherit' });
    
    log('✅ Tests completed successfully!', 'success');
    return true;
    
  } catch (error) {
    log(`❌ Tests failed: ${error.message}`, 'error');
    return false;
  }
}

async function runAdvancedCleaning() {
  log('🧹 Starting advanced data cleaning...');
  
  try {
    // Check if raw data exists
    if (!fs.existsSync(RAW_DATA_PATH)) {
      throw new Error(`Raw data not found: ${RAW_DATA_PATH}. Run with --extract first.`);
    }
    
    // Check if cleaning script exists
    const cleaningScript = path.join(SCRIPTS_DIR, 'advanced-cleaner-v3.js');
    if (!fs.existsSync(cleaningScript)) {
      throw new Error(`Cleaning script not found: ${cleaningScript}`);
    }
    
    // Change to scripts directory and run cleaning
    process.chdir(SCRIPTS_DIR);
    execSync(`node advanced-cleaner-v3.js`, { stdio: 'inherit' });
    
    log('✅ Advanced cleaning completed successfully!', 'success');
    return true;
    
  } catch (error) {
    log(`❌ Advanced cleaning failed: ${error.message}`, 'error');
    return false;
  }
}

async function runFullPipeline() {
  log('🚀 Starting full pipeline (extract + clean)...');
  
  // Step 1: Extract data
  const extractSuccess = await runExtraction();
  if (!extractSuccess) {
    log('❌ Pipeline stopped due to extraction failure', 'error');
    return false;
  }
  
  // Step 2: Clean data
  const cleanSuccess = await runAdvancedCleaning();
  if (!cleanSuccess) {
    log('❌ Pipeline stopped due to cleaning failure', 'error');
    return false;
  }
  
  log('🎉 Full pipeline completed successfully!', 'success');
  return true;
}

async function checkFilesAndReport() {
  log('📊 Checking output files...');
  
  const files = [
    { path: path.join(TMP_DIR, 'mobileactive-raw.json'), name: 'Raw data' },
    { path: path.join(TMP_DIR, 'mobileactive-enhanced-v3.json'), name: 'Enhanced cleaned data' },
    { path: path.join(TMP_DIR, 'mobileactive-enhanced-v3.csv'), name: 'Enhanced CSV export' },
    { path: path.join(TMP_DIR, 'validation-report-v3.json'), name: 'Validation report' }
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path);
      const size = (stats.size / 1024 / 1024).toFixed(2);
      log(`✅ ${file.name}: ${size} MB`, 'success');
    } else {
      log(`❌ ${file.name}: Not found`, 'error');
    }
  });
  
  // Show validation report summary if available
  const reportPath = path.join(TMP_DIR, 'validation-report-v3.json');
  if (fs.existsSync(reportPath)) {
    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      log('\n📋 Validation Report Summary:');
      console.log(`   Total Products: ${report.summary.total_products}`);
      console.log(`   Valid Products: ${report.summary.valid_products}`);
      console.log(`   Validation Rate: ${report.summary.validation_rate}`);
      console.log(`   Model Extraction: ${report.quality_metrics.model_extraction_success}`);
      console.log(`   Brand Detection: ${report.quality_metrics.brand_detection_success}`);
      console.log(`   Device Classification: ${report.quality_metrics.device_classification_success}`);
    } catch (error) {
      log('⚠️  Could not parse validation report', 'warning');
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    printUsage();
    return;
  }
  
  await ensureDirectories();
  
  let success = true;
  
  if (args.includes('--test')) {
    success = await runTests();
  } else if (args.includes('--extract')) {
    success = await runExtraction();
  } else if (args.includes('--clean')) {
    success = await runAdvancedCleaning();
  } else if (args.includes('--full')) {
    success = await runFullPipeline();
  } else {
    log('❌ Unknown option. Use --help for usage information.', 'error');
    success = false;
  }
  
  if (success) {
    await checkFilesAndReport();
  }
  
  process.exit(success ? 0 : 1);
}

// Run the main function
main().catch(error => {
  log(`❌ Unexpected error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
}); 