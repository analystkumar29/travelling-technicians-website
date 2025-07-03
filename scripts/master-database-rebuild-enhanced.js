#!/usr/bin/env node

/**
 * Enhanced Master Database Rebuild Script
 * Uses Enhanced AI Cleaned Data v2.0 for superior results
 * 
 * Features:
 * - Uses enhanced cleaned data with 98.6% model extraction success
 * - Strategic Samsung normalization integration
 * - Multi-device handling support
 * - Enhanced progress tracking and reporting
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  skipCleaning: process.argv.includes('--skip-cleaning'),
  useEnhanced: true, // Always use enhanced data
  dataPath: 'scripts/mobileactive/tmp/mobileactive-enhanced-cleaned.json'
};

// Enhanced logging utilities
class EnhancedLogger {
  static log(message, type = 'info') {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const icons = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      progress: '📈',
      system: '🔧'
    };
    
    console.log(`${icons[type] || '📋'} [${timestamp}] ${message}`);
  }

  static section(title) {
    console.log('\n' + '=' .repeat(70));
    console.log(`🎯 ${title}`);
    console.log('=' .repeat(70));
  }

  static subsection(title) {
    console.log(`\n🔹 ${title}`);
    console.log('-' .repeat(50));
  }
}

// Enhanced progress tracker
class EnhancedProgressTracker {
  constructor(totalSteps) {
    this.totalSteps = totalSteps;
    this.currentStep = 0;
    this.startTime = Date.now();
    this.stepTimes = [];
  }

  step(stepName, details = '') {
    this.currentStep++;
    const elapsed = Date.now() - this.startTime;
    this.stepTimes.push(elapsed);
    
    const progress = Math.round((this.currentStep / this.totalSteps) * 100);
    const timeStr = this.formatTime(elapsed);
    
    EnhancedLogger.log(
      `Step ${this.currentStep}/${this.totalSteps} (${progress}%) - ${stepName} ${details} [${timeStr}]`,
      'progress'
    );
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  }

  complete() {
    const totalTime = Date.now() - this.startTime;
    EnhancedLogger.log(
      `All steps completed in ${this.formatTime(totalTime)}`,
      'success'
    );
  }
}

// Enhanced data analyzer
class EnhancedDataAnalyzer {
  static analyzeCleanedData() {
    try {
      const dataPath = path.join(process.cwd(), CONFIG.dataPath);
      
      if (!fs.existsSync(dataPath)) {
        throw new Error(`Enhanced cleaned data not found: ${dataPath}`);
      }

      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      const analysis = {
        total: data.length,
        brands: {},
        deviceTypes: {},
        models: {},
        services: {},
        enhanced: {
          improved: 0,
          samsungExpanded: 0,
          multiDevice: 0,
          avgConfidence: 0
        }
      };

      let confidenceSum = 0;
      let confidenceCount = 0;

      data.forEach(item => {
        // Count brands
        analysis.brands[item.brand] = (analysis.brands[item.brand] || 0) + 1;
        
        // Count device types
        analysis.deviceTypes[item.device_type] = (analysis.deviceTypes[item.device_type] || 0) + 1;
        
        // Count models (only known ones)
        if (item.model_name !== 'unknown') {
          analysis.models[item.model_name] = (analysis.models[item.model_name] || 0) + 1;
        }
        
        // Count services
        analysis.services[item.service_type] = (analysis.services[item.service_type] || 0) + 1;
        
        // Enhanced metadata analysis
        if (item.enhanced_metadata) {
          if (item.enhanced_metadata.improvements_made) {
            analysis.enhanced.improved++;
          }
          
          // Calculate average confidence
          const brandConf = item.enhanced_metadata.brand_confidence || 0;
          const deviceConf = item.enhanced_metadata.device_confidence || 0;
          const modelConf = item.enhanced_metadata.model_confidence || 0;
          
          confidenceSum += (brandConf + deviceConf + modelConf) / 3;
          confidenceCount++;
        }
        
        // Multi-device handling
        if (item.additional_models && item.additional_models.length > 0) {
          analysis.enhanced.multiDevice++;
        }
      });

      analysis.enhanced.avgConfidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0;

      // Samsung expansion count (estimated from brand and model patterns)
      const samsungProducts = data.filter(item => item.brand === 'samsung');
      analysis.enhanced.samsungExpanded = samsungProducts.filter(item => 
        item.model_name && item.model_name.startsWith('Galaxy')
      ).length;

      return analysis;
    } catch (error) {
      EnhancedLogger.log(`Data analysis failed: ${error.message}`, 'error');
      return null;
    }
  }

  static displayAnalysis(analysis) {
    if (!analysis) return;

    EnhancedLogger.subsection('Enhanced Data Quality Analysis');
    
    EnhancedLogger.log(`Total Products: ${analysis.total.toLocaleString()}`);
    EnhancedLogger.log(`Enhanced Improvements: ${analysis.enhanced.improved.toLocaleString()} (${(analysis.enhanced.improved/analysis.total*100).toFixed(1)}%)`);
    EnhancedLogger.log(`Samsung Galaxy Products: ${analysis.enhanced.samsungExpanded.toLocaleString()}`);
    EnhancedLogger.log(`Multi-Device Products: ${analysis.enhanced.multiDevice.toLocaleString()}`);
    EnhancedLogger.log(`Average Confidence: ${(analysis.enhanced.avgConfidence * 100).toFixed(1)}%`);
    
    EnhancedLogger.subsection('Data Distribution');
    EnhancedLogger.log(`Unique Brands: ${Object.keys(analysis.brands).length}`);
    EnhancedLogger.log(`Unique Device Types: ${Object.keys(analysis.deviceTypes).length}`);
    EnhancedLogger.log(`Unique Models: ${Object.keys(analysis.models).length}`);
    EnhancedLogger.log(`Unique Services: ${Object.keys(analysis.services).length}`);
    
    // Show top brands
    const topBrands = Object.entries(analysis.brands)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    EnhancedLogger.log('Top Brands:');
    topBrands.forEach(([brand, count]) => {
      const percentage = (count / analysis.total * 100).toFixed(1);
      EnhancedLogger.log(`  ${brand}: ${count.toLocaleString()} (${percentage}%)`);
    });

    // Show device type distribution
    EnhancedLogger.log('Device Types:');
    Object.entries(analysis.deviceTypes).forEach(([type, count]) => {
      const percentage = (count / analysis.total * 100).toFixed(1);
      EnhancedLogger.log(`  ${type}: ${count.toLocaleString()} (${percentage}%)`);
    });
  }
}

// Enhanced execution engine
class EnhancedExecutionEngine {
  static async executeCommand(command, description) {
    return new Promise((resolve, reject) => {
      if (CONFIG.dryRun) {
        EnhancedLogger.log(`[DRY RUN] Would execute: ${command}`, 'system');
        resolve({ stdout: '[DRY RUN] Command would be executed', stderr: '', success: true });
        return;
      }

      if (CONFIG.verbose) {
        EnhancedLogger.log(`Executing: ${command}`, 'system');
      }

      exec(command, (error, stdout, stderr) => {
        if (error) {
          EnhancedLogger.log(`${description} failed: ${error.message}`, 'error');
          if (CONFIG.verbose) {
            console.log('STDOUT:', stdout);
            console.log('STDERR:', stderr);
          }
          reject({ error, stdout, stderr, success: false });
        } else {
          if (CONFIG.verbose && stdout) {
            console.log('STDOUT:', stdout);
          }
          resolve({ stdout, stderr, success: true });
        }
      });
    });
  }

  static async executeStep(command, description, tracker) {
    try {
      tracker.step(description);
      const result = await this.executeCommand(command, description);
      
      if (result.success) {
        EnhancedLogger.log(`${description} completed successfully`, 'success');
        return result;
      } else {
        throw new Error(`${description} failed`);
      }
    } catch (error) {
      EnhancedLogger.log(`${description} failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Main enhanced rebuild function
async function enhancedMasterRebuild() {
  const startTime = Date.now();
  
  EnhancedLogger.section('Enhanced Master Database Rebuild v2.0');
  
  // Display configuration
  EnhancedLogger.subsection('Configuration');
  EnhancedLogger.log(`Dry Run: ${CONFIG.dryRun ? 'Yes' : 'No'}`);
  EnhancedLogger.log(`Verbose: ${CONFIG.verbose ? 'Yes' : 'No'}`);
  EnhancedLogger.log(`Skip Cleaning: ${CONFIG.skipCleaning ? 'Yes' : 'No'}`);
  EnhancedLogger.log(`Enhanced Data: ${CONFIG.useEnhanced ? 'Yes' : 'No'}`);
  EnhancedLogger.log(`Data Source: ${CONFIG.dataPath}`);

  try {
    // Validate environment
    EnhancedLogger.subsection('Environment Validation');
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
    }
    EnhancedLogger.log('Environment variables validated', 'success');

    // Analyze enhanced data
    EnhancedLogger.subsection('Enhanced Data Analysis');
    const analysis = EnhancedDataAnalyzer.analyzeCleanedData();
    EnhancedDataAnalyzer.displayAnalysis(analysis);

    // Determine steps
    const totalSteps = CONFIG.skipCleaning ? 2 : 3;
    const tracker = new EnhancedProgressTracker(totalSteps);

    // Step 1: Enhanced data cleaning (if not skipped)
    if (!CONFIG.skipCleaning) {
      await EnhancedExecutionEngine.executeStep(
        'node scripts/ai-data-cleaner-enhanced.js',
        'Enhanced AI Data Cleaning v2.0',
        tracker
      );
    } else {
      EnhancedLogger.log('Skipping enhanced data cleaning (--skip-cleaning)', 'warning');
    }

    // Verify enhanced cleaned data exists
    const dataPath = path.join(process.cwd(), CONFIG.dataPath);
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Enhanced cleaned data not found: ${dataPath}. Run cleaning step first.`);
    }

    // Step 2: Database rebuild with enhanced data
    await EnhancedExecutionEngine.executeStep(
      'node scripts/rebuild-database.js --use-enhanced',
      'Database Rebuild with Enhanced Data',
      tracker
    );

    // Step 3: Enhanced performance testing
    await EnhancedExecutionEngine.executeStep(
      'node scripts/test-api-performance.js',
      'Enhanced API Performance Testing',
      tracker
    );

    tracker.complete();

    // Final results
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    EnhancedLogger.section('Enhanced Rebuild Complete!');
    EnhancedLogger.log(`Total Execution Time: ${Math.round(totalTime / 1000)}s`, 'success');
    
    if (analysis) {
      EnhancedLogger.subsection('Enhanced Data Impact');
      EnhancedLogger.log(`Products Processed: ${analysis.total.toLocaleString()}`);
      EnhancedLogger.log(`Improvements Made: ${analysis.enhanced.improved.toLocaleString()} (${(analysis.enhanced.improved/analysis.total*100).toFixed(1)}%)`);
      EnhancedLogger.log(`Samsung Galaxy Products: ${analysis.enhanced.samsungExpanded.toLocaleString()}`);
      EnhancedLogger.log(`Average Confidence: ${(analysis.enhanced.avgConfidence * 100).toFixed(1)}%`);
      EnhancedLogger.log(`Unique Device Models: ${Object.keys(analysis.models).length.toLocaleString()}`);
    }

    EnhancedLogger.log('Enhanced database rebuild completed successfully!', 'success');
    EnhancedLogger.log('🚀 The Travelling Technicians system is ready with enhanced data quality!');

  } catch (error) {
    EnhancedLogger.log(`Enhanced rebuild failed: ${error.message}`, 'error');
    if (CONFIG.verbose && error.stack) {
      console.log(error.stack);
    }
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  enhancedMasterRebuild();
}

module.exports = {
  enhancedMasterRebuild,
  EnhancedLogger,
  EnhancedProgressTracker,
  EnhancedDataAnalyzer
}; 