#!/usr/bin/env node

/**
 * Test script for the cron job endpoint
 * 
 * Usage:
 *   node scripts/test-cron-endpoint.js [local|production]
 * 
 * Example:
 *   node scripts/test-cron-endpoint.js local
 *   node scripts/test-cron-endpoint.js production
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const environments = {
  local: {
    url: 'http://localhost:3000/api/cron/process-sitemap-queue',
    secret: process.env.CRON_SECRET || 'test-secret-local'
  },
  production: {
    url: 'https://travelling-technicians.ca/api/cron/process-sitemap-queue',
    secret: process.env.CRON_SECRET || 'test-secret-production'
  }
};

async function testCronEndpoint(env = 'local') {
  const config = environments[env];
  
  if (!config) {
    console.error(`❌ Unknown environment: ${env}`);
    console.log('Available environments: local, production');
    process.exit(1);
  }

  console.log(`🚀 Testing cron endpoint for ${env} environment`);
  console.log(`📋 URL: ${config.url}`);
  console.log(`🔑 Using secret: ${config.secret ? 'Yes' : 'No (may fail)'}`);
  
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cron-Secret': config.secret,
        'User-Agent': 'Travelling-Technicians-Cron-Tester/1.0'
      },
      timeout: 30000 // 30 seconds
    });

    const responseText = await response.text();
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📦 Response Headers:`);
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log(`📄 Response Body (JSON):`);
      console.log(JSON.stringify(data, null, 2));
      
      if (response.ok && data.success) {
        console.log('✅ Cron endpoint test PASSED');
        return true;
      } else {
        console.log('❌ Cron endpoint test FAILED');
        return false;
      }
    } catch (parseError) {
      console.log(`📄 Response Body (Raw): ${responseText.substring(0, 500)}...`);
      console.log('❌ Failed to parse JSON response');
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    return false;
  }
}

// Run the test
const env = process.argv[2] || 'local';
testCronEndpoint(env).then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});