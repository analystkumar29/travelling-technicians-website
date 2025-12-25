#!/usr/bin/env tsx

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

// Configuration
const SCRIPTS_DIR = path.join(process.cwd(), 'scripts/mobileactive');
const FETCH_SCRIPT = path.join(SCRIPTS_DIR, 'fetch-parts.ts');
const TRANSFORM_SCRIPT = path.join(SCRIPTS_DIR, 'transform-to-pricing.ts');

// Utility functions
const log = (message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[level];
  console.log(`${timestamp} ${emoji} ${message}`);
};

// Run a script and return promise
function runScript(scriptPath: string, scriptName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    log(`🚀 Running ${scriptName}...`);
    
    const child = spawn('npx', ['tsx', scriptPath], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ ${scriptName} completed successfully`, 'success');
        resolve();
      } else {
        log(`❌ ${scriptName} failed with exit code ${code}`, 'error');
        reject(new Error(`${scriptName} failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      log(`❌ Failed to start ${scriptName}: ${error.message}`, 'error');
      reject(error);
    });
  });
}

// Check if required files exist
async function checkPrerequisites() {
  log('🔍 Checking prerequisites...');
  
  const requiredFiles = [
    FETCH_SCRIPT,
    TRANSFORM_SCRIPT,
    path.join(SCRIPTS_DIR, 'collections.yaml')
  ];
  
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
      log(`✅ Found ${path.basename(file)}`);
    } catch (error) {
      log(`❌ Missing required file: ${path.basename(file)}`, 'error');
      throw new Error(`Missing required file: ${path.basename(file)}`);
    }
  }
  
  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      log(`❌ Missing environment variable: ${envVar}`, 'error');
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  }
  
  log('✅ All prerequisites met', 'success');
}

// Main execution function
async function runMobileActiveExtraction() {
  log('🚀 Starting MobileActive Data Extraction Pipeline');
  log('================================================');
  
  try {
    // Check prerequisites
    await checkPrerequisites();
    
    // Step 1: Extract data from MobileActive
    log('\n📦 STEP 1: Extracting data from MobileActive');
    log('============================================');
    await runScript(FETCH_SCRIPT, 'Data Extraction');
    
    // Step 2: Transform and upload to database
    log('\n🔄 STEP 2: Transforming and uploading to database');
    log('==================================================');
    await runScript(TRANSFORM_SCRIPT, 'Data Transformation');
    
    // Final summary
    log('\n🎉 MOBILEACTIVE EXTRACTION PIPELINE COMPLETED');
    log('==============================================');
    log('📁 Check the following files for results:');
    log('   • tmp/mobileactive-raw.json - Raw extracted data');
    log('   • tmp/mobileactive-processed.json - Processed data');
    log('   • tmp/mobileactive-parts.csv - CSV summary');
    log('   • tmp/mobileactive-mapping-log.json - Successful mappings');
    log('   • tmp/mobileactive-failed-mappings.json - Failed mappings');
    
    log('\n📊 Next steps:');
    log('   1. Review the CSV file to verify data quality');
    log('   2. Check failed mappings and fix any issues');
    log('   3. Verify pricing in your admin panel');
    log('   4. Set up automated scheduling if needed');
    
  } catch (error: any) {
    log(`❌ Pipeline failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'fetch-only') {
  log('🔄 Running fetch-only mode...');
  runScript(FETCH_SCRIPT, 'Data Extraction')
    .then(() => log('✅ Fetch completed', 'success'))
    .catch((error) => {
      log(`❌ Fetch failed: ${error.message}`, 'error');
      process.exit(1);
    });
} else if (command === 'transform-only') {
  log('🔄 Running transform-only mode...');
  runScript(TRANSFORM_SCRIPT, 'Data Transformation')
    .then(() => log('✅ Transform completed', 'success'))
    .catch((error) => {
      log(`❌ Transform failed: ${error.message}`, 'error');
      process.exit(1);
    });
} else if (command === 'help' || command === '--help' || command === '-h') {
  log('📖 MobileActive Data Extraction Pipeline');
  log('========================================');
  log('');
  log('Usage:');
  log('  npx tsx scripts/mobileactive/run-extraction.ts [command]');
  log('');
  log('Commands:');
  log('  (no command)     Run complete pipeline (fetch + transform)');
  log('  fetch-only       Only extract data from MobileActive');
  log('  transform-only   Only transform and upload to database');
  log('  help             Show this help message');
  log('');
  log('Prerequisites:');
  log('  • NEXT_PUBLIC_SUPABASE_URL environment variable');
  log('  • SUPABASE_SERVICE_ROLE_KEY environment variable');
  log('  • Database must be set up with dynamic pricing tables');
  log('  • Admin token configured for bulk upload API');
  log('');
  log('Output files:');
  log('  • tmp/mobileactive-raw.json - Raw Shopify API data');
  log('  • tmp/mobileactive-processed.json - Cleaned and categorized data');
  log('  • tmp/mobileactive-parts.csv - Human-readable CSV summary');
  log('  • tmp/mobileactive-mapping-log.json - Successful database mappings');
  log('  • tmp/mobileactive-failed-mappings.json - Failed mappings for review');
} else {
  // Run complete pipeline
  runMobileActiveExtraction().catch(console.error);
} 