#!/usr/bin/env node

/**
 * Master Database Rebuild Script
 * 
 * This script orchestrates the complete database rebuild process:
 * 1. AI-powered data cleaning of MobileActive data
 * 2. Database schema reset and population
 * 3. Validation and reporting
 * 
 * Usage: node scripts/master-database-rebuild.js [--skip-cleaning] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const SCRIPTS_DIR = path.join(__dirname);
const TMP_DIR = path.join(__dirname, 'tmp');
const AI_CLEANER_SCRIPT = path.join(SCRIPTS_DIR, 'ai-data-cleaner.js');
const REBUILD_SCRIPT = path.join(SCRIPTS_DIR, 'rebuild-database.js');

// Command line arguments
const args = process.argv.slice(2);
const SKIP_CLEANING = args.includes('--skip-cleaning');
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');

// Logging utilities
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().substring(11, 19);
  const symbols = {
    info: '💬',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    step: '🚀',
    progress: '⏳',
    debug: '🔍'
  };
  
  console.log(`[${timestamp}] ${symbols[type]} ${message}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title.toUpperCase(), 'step');
  console.log('='.repeat(80));
}

// Environment validation
function validateEnvironment() {
  logSection('Environment Validation');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    log('Missing required environment variables:', 'error');
    missing.forEach(envVar => log(`  - ${envVar}`, 'error'));
    log('Please set these variables and try again.', 'error');
    process.exit(1);
  }
  
  log('All required environment variables are present', 'success');
  
  // Create tmp directory if it doesn't exist
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
    log('Created tmp directory', 'success');
  }
  
  // Check for input data
  const inputDataPath = path.join(__dirname, 'mobileactive/tmp/mobileactive-improved-cleaned.json');
  if (!fs.existsSync(inputDataPath)) {
    log('Input data file not found:', 'error');
    log(`  Expected: ${inputDataPath}`, 'error');
    log('Please ensure MobileActive data has been extracted first.', 'error');
    process.exit(1);
  }
  
  const inputData = JSON.parse(fs.readFileSync(inputDataPath, 'utf8'));
  log(`Found input data: ${inputData.length} products`, 'success');
  
  return {
    inputDataPath,
    inputDataCount: inputData.length
  };
}

// Execute script with progress monitoring
function executeScript(scriptPath, description) {
  return new Promise((resolve, reject) => {
    log(`Starting: ${description}`, 'progress');
    
    if (DRY_RUN) {
      log(`DRY RUN: Would execute ${scriptPath}`, 'debug');
      resolve({ success: true, dryRun: true });
      return;
    }
    
    const startTime = Date.now();
    
    const child = spawn('node', [scriptPath], {
      stdio: VERBOSE ? 'inherit' : 'pipe',
      env: process.env
    });
    
    let output = '';
    let errorOutput = '';
    
    if (!VERBOSE) {
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });
    }
    
    child.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (code === 0) {
        log(`Completed: ${description} (${duration}s)`, 'success');
        resolve({ 
          success: true, 
          duration: parseFloat(duration),
          output,
          dryRun: false
        });
      } else {
        log(`Failed: ${description} (${duration}s)`, 'error');
        if (!VERBOSE && errorOutput) {
          log('Error output:', 'error');
          console.error(errorOutput);
        }
        reject(new Error(`Script failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      log(`Error executing ${description}: ${error.message}`, 'error');
      reject(error);
    });
  });
}

// Analyze results
function analyzeResults() {
  logSection('Results Analysis');
  
  const files = {
    cleaningStats: path.join(TMP_DIR, 'ai-cleaning-stats.json'),
    rebuildStats: path.join(TMP_DIR, 'rebuild-stats.json'),
    cleanedData: path.join(TMP_DIR, 'mobileactive-ai-cleaned.json')
  };
  
  const results = {};
  
  // Load cleaning statistics
  if (fs.existsSync(files.cleaningStats)) {
    results.cleaning = JSON.parse(fs.readFileSync(files.cleaningStats, 'utf8'));
    log(`AI Cleaning Results:`, 'info');
    log(`  Products Improved: ${results.cleaning.improved}`, 'info');
    log(`  Average Confidence: ${(results.cleaning.avgConfidence * 100).toFixed(1)}%`, 'info');
    log(`  Valid Products: ${results.cleaning.validCount}/${results.cleaning.totalProcessed}`, 'info');
  }
  
  // Load rebuild statistics
  if (fs.existsSync(files.rebuildStats)) {
    results.rebuild = JSON.parse(fs.readFileSync(files.rebuildStats, 'utf8'));
    log(`Database Rebuild Results:`, 'info');
    log(`  Device Types: ${results.rebuild.deviceTypes}`, 'info');
    log(`  Brands: ${results.rebuild.brands}`, 'info');
    log(`  Services: ${results.rebuild.services}`, 'info');
    log(`  Models: ${results.rebuild.models}`, 'info');
    log(`  Pricing Entries: ${results.rebuild.pricingEntries}`, 'info');
  }
  
  // Calculate coverage statistics
  if (results.rebuild) {
    const totalPossibleCombinations = results.rebuild.models * results.rebuild.services * 4; // 4 pricing tiers
    const coverage = (results.rebuild.pricingEntries / totalPossibleCombinations * 100).toFixed(1);
    log(`Pricing Coverage: ${coverage}% (${results.rebuild.pricingEntries}/${totalPossibleCombinations})`, 'info');
  }
  
  return results;
}

// Generate summary report
function generateSummaryReport(results, timings) {
  logSection('Summary Report');
  
  const totalTime = timings.reduce((sum, timing) => sum + timing.duration, 0);
  
  const report = {
    timestamp: new Date().toISOString(),
    totalDuration: totalTime,
    steps: timings,
    results: results,
    success: true,
    recommendations: []
  };
  
  // Add recommendations based on results
  if (results.cleaning && results.cleaning.avgConfidence < 0.7) {
    report.recommendations.push('Consider improving AI patterns for better classification confidence');
  }
  
  if (results.rebuild && results.rebuild.pricingEntries < 1000) {
    report.recommendations.push('Low pricing coverage - consider expanding data sources');
  }
  
  // Save report
  const reportPath = path.join(TMP_DIR, 'rebuild-summary-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`Summary Report:`, 'success');
  log(`  Total Duration: ${totalTime.toFixed(2)}s`, 'info');
  log(`  Steps Completed: ${timings.length}`, 'info');
  log(`  Report Saved: ${reportPath}`, 'info');
  
  if (report.recommendations.length > 0) {
    log(`Recommendations:`, 'warning');
    report.recommendations.forEach(rec => log(`  - ${rec}`, 'warning'));
  }
  
  return report;
}

// Main execution function
async function main() {
  try {
    console.log('\n🔧 TRAVELLING TECHNICIANS - MASTER DATABASE REBUILD 🔧\n');
    
    // Validate environment
    const envInfo = validateEnvironment();
    
    const timings = [];
    
    // Step 1: AI Data Cleaning (unless skipped)
    if (!SKIP_CLEANING) {
      const cleaningResult = await executeScript(
        AI_CLEANER_SCRIPT,
        'AI-Powered Data Cleaning'
      );
      timings.push({
        step: 'AI Data Cleaning',
        duration: cleaningResult.duration || 0,
        success: cleaningResult.success
      });
    } else {
      log('Skipping AI data cleaning (--skip-cleaning flag)', 'warning');
      
      // Verify cleaned data exists
      const cleanedDataPath = path.join(TMP_DIR, 'mobileactive-ai-cleaned.json');
      if (!fs.existsSync(cleanedDataPath)) {
        log('No AI-cleaned data found, but cleaning was skipped', 'error');
        log('Please run without --skip-cleaning or ensure cleaned data exists', 'error');
        process.exit(1);
      }
    }
    
    // Step 2: Database Rebuild
    const rebuildResult = await executeScript(
      REBUILD_SCRIPT,
      'Database Schema Rebuild'
    );
    timings.push({
      step: 'Database Rebuild',
      duration: rebuildResult.duration || 0,
      success: rebuildResult.success
    });
    
    // Step 3: Analysis and Reporting
    const results = analyzeResults();
    const report = generateSummaryReport(results, timings);
    
    // Final success message
    logSection('Process Complete');
    log('🎉 Master database rebuild completed successfully!', 'success');
    log(`📊 Total time: ${timings.reduce((sum, t) => sum + t.duration, 0).toFixed(2)}s`, 'info');
    log(`📁 Results saved in: ${TMP_DIR}`, 'info');
    
    if (DRY_RUN) {
      log('This was a DRY RUN - no actual changes were made', 'warning');
    }
    
  } catch (error) {
    logSection('Process Failed');
    log(`❌ Master rebuild failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Help text
function showHelp() {
  console.log(`
🔧 TRAVELLING TECHNICIANS - MASTER DATABASE REBUILD 🔧

Usage: node scripts/master-database-rebuild.js [options]

Options:
  --skip-cleaning    Skip the AI data cleaning step (use existing cleaned data)
  --dry-run         Show what would be done without executing
  --verbose         Show detailed output from all scripts
  --help            Show this help message

Process Overview:
  1. Environment validation
  2. AI-powered data cleaning (extracts brands, models, services)
  3. Database rebuild (clears and repopulates all tables)
  4. Results analysis and reporting

Requirements:
  - NEXT_PUBLIC_SUPABASE_URL environment variable
  - SUPABASE_SERVICE_ROLE_KEY environment variable
  - MobileActive data in scripts/mobileactive/tmp/mobileactive-improved-cleaned.json

Output Files:
  - tmp/mobileactive-ai-cleaned.json       (AI-cleaned data)
  - tmp/ai-cleaning-stats.json            (Cleaning statistics)
  - tmp/rebuild-stats.json                (Database rebuild stats)
  - tmp/rebuild-summary-report.json       (Complete summary)
`);
}

// Handle command line arguments
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Execute main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 