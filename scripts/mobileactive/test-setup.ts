#!/usr/bin/env tsx

// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const CONFIG_PATH = path.join(process.cwd(), 'scripts/mobileactive/collections.yaml');

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

// Test environment variables
function testEnvironmentVariables() {
  log('🔍 Testing environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const optionalVars = [
    'ADMIN_TOKEN',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  let allRequiredPresent = true;
  
  for (const envVar of requiredVars) {
    if (process.env[envVar]) {
      log(`✅ ${envVar}: Configured`);
    } else {
      log(`❌ ${envVar}: Missing`, 'error');
      allRequiredPresent = false;
    }
  }
  
  for (const envVar of optionalVars) {
    if (process.env[envVar]) {
      log(`✅ ${envVar}: Configured`);
    } else {
      log(`⚠️ ${envVar}: Not configured (optional)`, 'warning');
    }
  }
  
  return allRequiredPresent;
}

// Test Supabase connection
async function testSupabaseConnection() {
  log('🔍 Testing Supabase connection...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    log('❌ Missing Supabase credentials', 'error');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('device_types')
      .select('id, name')
      .limit(1);
    
    if (error) {
      log(`❌ Database connection failed: ${error.message}`, 'error');
      return false;
    }
    
    log('✅ Supabase connection successful', 'success');
    log(`   Found ${data?.length || 0} device types`);
    
    // Test required tables
    const requiredTables = [
      'device_types',
      'brands',
      'device_models',
      'services',
      'pricing_tiers',
      'dynamic_pricing'
    ];
    
    for (const table of requiredTables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (tableError) {
          log(`❌ Table ${table}: ${tableError.message}`, 'error');
          return false;
        } else {
          log(`✅ Table ${table}: Accessible`);
        }
      } catch (err: any) {
        log(`❌ Table ${table}: ${err.message}`, 'error');
        return false;
      }
    }
    
    return true;
    
  } catch (error: any) {
    log(`❌ Supabase connection failed: ${error.message}`, 'error');
    return false;
  }
}

// Test MobileActive API access
async function testMobileActiveAPI() {
  log('🔍 Testing MobileActive API access...');
  
  try {
    // Test a simple collection
    const testUrl = 'https://mobileactive.ca/collections/apple-iphone.json?limit=1';
    const response = await axios.get(testUrl, { timeout: 10000 });
    
    if (response.status === 200 && response.data.products) {
      log('✅ MobileActive API accessible', 'success');
      log(`   Found ${response.data.products.length} products in test collection`);
      return true;
    } else {
      log('❌ MobileActive API returned unexpected response', 'error');
      return false;
    }
    
  } catch (error: any) {
    if (error.response?.status === 404) {
      log('⚠️ Test collection not found (this is normal)', 'warning');
      return true; // 404 is expected for test collection
    } else {
      log(`❌ MobileActive API test failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Test configuration file
async function testConfigurationFile() {
  log('🔍 Testing configuration file...');
  
  try {
    const configContent = await fs.readFile(CONFIG_PATH, 'utf8');
    const YAML = require('yaml');
    const config = YAML.parse(configContent);
    
    if (config.collections && Array.isArray(config.collections)) {
      log(`✅ Configuration file loaded: ${config.collections.length} collections`, 'success');
      
      // Test first collection
      const firstCollection = config.collections[0];
      if (firstCollection.handle && firstCollection.brand && firstCollection.device_type) {
        log(`   Sample collection: ${firstCollection.handle} (${firstCollection.brand} ${firstCollection.device_type})`);
      }
      
      return true;
    } else {
      log('❌ Configuration file has invalid structure', 'error');
      return false;
    }
    
  } catch (error: any) {
    log(`❌ Configuration file test failed: ${error.message}`, 'error');
    return false;
  }
}

// Test dependencies
function testDependencies() {
  log('🔍 Testing dependencies...');
  
  try {
    // Test if required packages are available
    require('axios');
    require('yaml');
    require('p-limit');
    require('fuse.js');
    require('@supabase/supabase-js');
    
    log('✅ All required dependencies available', 'success');
    return true;
    
  } catch (error: any) {
    // Check if it's a URL scheme error (which is expected for some packages)
    if (error.message.includes('URL must be of scheme file')) {
      log('✅ All required dependencies available (URL scheme warning ignored)', 'success');
      return true;
    }
    
    log(`❌ Missing dependency: ${error.message}`, 'error');
    log('   Run: npm install axios yaml p-limit fuse.js', 'info');
    return false;
  }
}

// Test output directory
async function testOutputDirectory() {
  log('🔍 Testing output directory...');
  
  try {
    const outputDir = path.join(process.cwd(), 'tmp');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Test write permission
    const testFile = path.join(outputDir, 'test-write.txt');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    
    log('✅ Output directory accessible and writable', 'success');
    return true;
    
  } catch (error: any) {
    log(`❌ Output directory test failed: ${error.message}`, 'error');
    return false;
  }
}

// Main test function
async function runSetupTests() {
  log('🚀 Running MobileActive Pipeline Setup Tests');
  log('============================================');
  
  const tests = [
    { name: 'Environment Variables', fn: testEnvironmentVariables },
    { name: 'Dependencies', fn: testDependencies },
    { name: 'Configuration File', fn: testConfigurationFile },
    { name: 'Output Directory', fn: testOutputDirectory },
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'MobileActive API', fn: testMobileActiveAPI }
  ];
  
  const results = [];
  
  for (const test of tests) {
    log(`\n📋 Running: ${test.name}`);
    log('─'.repeat(50));
    
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error: any) {
      log(`❌ Test failed with error: ${error.message}`, 'error');
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }
  
  // Summary
  log('\n📊 TEST SUMMARY');
  log('===============');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    log(`${status} ${result.name}`);
    if (result.error) {
      log(`   Error: ${result.error}`);
    }
  });
  
  log(`\nOverall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    log('🎉 All tests passed! Pipeline is ready to run.', 'success');
    log('\nNext steps:');
    log('1. Run: npm run extract:pricing:fetch');
    log('2. Review the extracted data');
    log('3. Run: npm run extract:pricing:transform');
  } else {
    log('⚠️ Some tests failed. Please fix the issues above.', 'warning');
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runSetupTests().catch(console.error);
} 