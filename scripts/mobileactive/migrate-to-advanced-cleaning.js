#!/usr/bin/env node

/**
 * Migration Script: Advanced MobileActive Data Cleaning System v3.0
 * 
 * This script helps migrate from the old cleaning system to the new advanced system
 * and provides integration with the existing database and pricing system.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TMP_DIR = path.join(process.cwd(), 'tmp');
const OLD_DATA_PATH = path.join(TMP_DIR, 'mobileactive-parts.csv');
const NEW_DATA_PATH = path.join(TMP_DIR, 'mobileactive-enhanced-v3.csv');
const MIGRATION_REPORT_PATH = path.join(TMP_DIR, 'migration-report-v3.json');

const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' }[level];
  console.log(`${timestamp} ${emoji} ${message}`);
};

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim().replace(/"/g, '') : '';
    });
    data.push(row);
  }
  
  return data;
}

function compareData(oldData, newData) {
  const comparison = {
    summary: {
      old_total: oldData.length,
      new_total: newData.length,
      improvement: newData.length - oldData.length
    },
    quality_improvements: {
      samsung_normalization: 0,
      model_contamination_fixed: 0,
      brand_detection_improved: 0,
      service_classification_improved: 0
    },
    sample_improvements: []
  };
  
  // Create lookup maps
  const oldLookup = new Map();
  oldData.forEach(item => {
    const key = `${item['Product Title'] || item['Raw Title']}`;
    oldLookup.set(key, item);
  });
  
  const newLookup = new Map();
  newData.forEach(item => {
    const key = item['Raw Title'];
    newLookup.set(key, item);
  });
  
  // Compare improvements
  newData.forEach(newItem => {
    const oldItem = oldLookup.get(newItem['Raw Title']);
    
    if (oldItem) {
      // Check Samsung normalization
      if (oldItem['Brand'] === 'samsung' && oldItem['Model Name'].includes('SGN')) {
        comparison.quality_improvements.samsung_normalization++;
        comparison.sample_improvements.push({
          title: newItem['Raw Title'],
          old_model: oldItem['Model Name'],
          new_model: newItem['Clean Model'],
          improvement: 'Samsung abbreviation expanded'
        });
      }
      
      // Check model contamination
      if (oldItem['Model Name'].includes('QV') || oldItem['Model Name'].includes('V2') || oldItem['Model Name'].includes('V3')) {
        comparison.quality_improvements.model_contamination_fixed++;
      }
      
      // Check brand detection
      if (oldItem['Brand'] === 'unknown' && newItem['Clean Brand'] !== 'unknown') {
        comparison.quality_improvements.brand_detection_improved++;
      }
      
      // Check service classification
      if (oldItem['Service Type'] === 'unknown' && newItem['Service Type'] !== 'unknown') {
        comparison.quality_improvements.service_classification_improved++;
      }
    }
  });
  
  return comparison;
}

function generateDatabaseMigrationScript(newData) {
  const migrationSQL = [];
  
  migrationSQL.push('-- Advanced MobileActive Data Cleaning v3.0 Migration Script');
  migrationSQL.push('-- Generated on: ' + new Date().toISOString());
  migrationSQL.push('');
  
  // Create temporary table for new data
  migrationSQL.push('-- Create temporary table for new cleaned data');
  migrationSQL.push(`
CREATE TEMP TABLE mobileactive_v3_cleaned (
  product_id BIGINT,
  clean_brand VARCHAR(50),
  clean_model VARCHAR(100),
  clean_type VARCHAR(20),
  service_type VARCHAR(50),
  price DECIMAL(10,2),
  brand_confidence DECIMAL(3,2),
  device_confidence DECIMAL(3,2),
  service_confidence DECIMAL(3,2),
  price_source VARCHAR(50),
  raw_title TEXT,
  source_collection VARCHAR(200),
  tags TEXT,
  sku VARCHAR(100),
  validation_issues TEXT,
  is_valid BOOLEAN
);
`);
  
  // Insert new data
  migrationSQL.push('-- Insert new cleaned data');
  migrationSQL.push('INSERT INTO mobileactive_v3_cleaned VALUES');
  
  const values = newData.slice(1, 100).map(item => `(
  ${item['Product ID'] || 'NULL'},
  '${item['Clean Brand'] || ''}',
  '${item['Clean Model'] || ''}',
  '${item['Clean Type'] || ''}',
  '${item['Service Type'] || ''}',
  ${item['Price'] || 0},
  ${item['Brand Confidence'] || 0},
  ${item['Device Confidence'] || 0},
  ${item['Service Confidence'] || 0},
  '${item['Price Source'] || ''}',
  '${(item['Raw Title'] || '').replace(/'/g, "''")}',
  '${(item['Source Collection'] || '').replace(/'/g, "''")}',
  '${(item['Tags'] || '').replace(/'/g, "''")}',
  '${item['SKU'] || ''}',
  '${(item['Validation Issues'] || '').replace(/'/g, "''")}',
  ${item['Validation Issues'] ? 'false' : 'true'}
)`).join(',\n');
  
  migrationSQL.push(values + ';');
  
  // Update existing pricing data
  migrationSQL.push(`
-- Update existing pricing entries with new cleaned data
UPDATE pricing_entries pe
SET 
  brand = v3.clean_brand,
  model_name = v3.clean_model,
  device_type = v3.clean_type,
  service_type = v3.service_type,
  base_price = v3.price,
  updated_at = NOW()
FROM mobileactive_v3_cleaned v3
WHERE pe.product_id = v3.product_id
  AND v3.is_valid = true;
`);
  
  // Insert new pricing entries for valid products
  migrationSQL.push(`
-- Insert new pricing entries for products not in existing system
INSERT INTO pricing_entries (
  product_id, brand, model_name, device_type, service_type, 
  base_price, pricing_tier_id, created_at, updated_at
)
SELECT 
  v3.product_id,
  v3.clean_brand,
  v3.clean_model,
  v3.clean_type,
  v3.service_type,
  v3.price,
  1, -- Default to standard tier
  NOW(),
  NOW()
FROM mobileactive_v3_cleaned v3
WHERE v3.is_valid = true
  AND NOT EXISTS (
    SELECT 1 FROM pricing_entries pe 
    WHERE pe.product_id = v3.product_id
  );
`);
  
  return migrationSQL.join('\n');
}

async function runMigration() {
  log('🚀 Starting migration to Advanced MobileActive Data Cleaning v3.0...');
  
  try {
    // Check if files exist
    if (!fs.existsSync(OLD_DATA_PATH)) {
      throw new Error(`Old data file not found: ${OLD_DATA_PATH}`);
    }
    
    if (!fs.existsSync(NEW_DATA_PATH)) {
      throw new Error(`New data file not found: ${NEW_DATA_PATH}. Run advanced cleaning first.`);
    }
    
    // Load data
    log('📥 Loading old and new data...');
    const oldCSV = fs.readFileSync(OLD_DATA_PATH, 'utf8');
    const newCSV = fs.readFileSync(NEW_DATA_PATH, 'utf8');
    
    const oldData = parseCSV(oldCSV);
    const newData = parseCSV(newCSV);
    
    log(`✅ Loaded ${oldData.length} old records and ${newData.length} new records`);
    
    // Compare data
    log('🔍 Comparing data quality...');
    const comparison = compareData(oldData, newData);
    
    // Generate migration report
    const migrationReport = {
      migration_time: new Date().toISOString(),
      version: '3.0',
      comparison: comparison,
      recommendations: [
        'Review sample improvements to validate quality',
        'Test database migration on staging environment first',
        'Monitor pricing accuracy after migration',
        'Update any hardcoded model references in application code'
      ],
      next_steps: [
        'Run database migration script',
        'Update application code to use new model names',
        'Test pricing API with new data',
        'Monitor system performance'
      ]
    };
    
    // Save migration report
    fs.writeFileSync(MIGRATION_REPORT_PATH, JSON.stringify(migrationReport, null, 2));
    
    // Generate database migration script
    const migrationSQL = generateDatabaseMigrationScript(newData);
    const sqlPath = path.join(TMP_DIR, 'database-migration-v3.sql');
    fs.writeFileSync(sqlPath, migrationSQL);
    
    // Display results
    log('📊 Migration Analysis Results:');
    console.log(JSON.stringify(comparison, null, 2));
    
    log('📁 Files generated:');
    log(`   Migration Report: ${MIGRATION_REPORT_PATH}`, 'success');
    log(`   Database Migration SQL: ${sqlPath}`, 'success');
    
    log('🎉 Migration analysis completed successfully!', 'success');
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  compareData,
  generateDatabaseMigrationScript
}; 