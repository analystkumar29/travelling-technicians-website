#!/usr/bin/env node

/**
 * Test script for the FIXED pricing API
 * Verifies the new simple query + JavaScript filtering approach works
 */

require('dotenv').config({ path: '.env.local' });

const FIXED_API_URL = 'http://localhost:3000/api/pricing/calculate-fixed';
const ORIGINAL_API_URL = 'http://localhost:3000/api/pricing/calculate';

// Test cases based on known database entries
const testCases = [
  {
    name: 'iPhone 16 Screen Replacement (Standard)',
    params: {
      deviceType: 'mobile',
      brand: 'apple',
      model: 'iPhone 16',
      service: 'screen-replacement',
      tier: 'standard'
    },
    expected: {
      shouldWork: true,
      expectedSource: 'database',
      expectedPrice: 85 // Based on memory of promotional pricing
    }
  },
  {
    name: 'iPhone 16 Screen Replacement (Premium)',
    params: {
      deviceType: 'mobile',
      brand: 'apple',
      model: 'iPhone 16',
      service: 'screen-replacement',
      tier: 'premium'
    },
    expected: {
      shouldWork: true,
      expectedSource: 'database'
    }
  },
  {
    name: 'Samsung Galaxy S24 Battery (Standard)',
    params: {
      deviceType: 'mobile',
      brand: 'samsung',
      model: 'Galaxy S24',
      service: 'battery-replacement',
      tier: 'standard'
    },
    expected: {
      shouldWork: true,
      expectedSource: 'database'
    }
  },
  {
    name: 'MacBook Pro Screen (Premium)',
    params: {
      deviceType: 'laptop',
      brand: 'apple',
      model: 'MacBook Pro 16" (M3 Pro/Max)',
      service: 'screen-replacement',
      tier: 'premium'
    },
    expected: {
      shouldWork: true,
      expectedSource: 'database'
    }
  },
  {
    name: 'Non-existent Device (Should fallback)',
    params: {
      deviceType: 'mobile',
      brand: 'unknown',
      model: 'Unknown Model',
      service: 'screen-replacement',
      tier: 'standard'
    },
    expected: {
      shouldWork: true,
      expectedSource: 'static',
      expectedPrice: 149 // Static fallback
    }
  }
];

async function testAPI(url, testCase) {
  try {
    const queryParams = new URLSearchParams(testCase.params);
    const fullUrl = `${url}?${queryParams}`;
    
    console.log(`  🔗 Testing: ${fullUrl}`);
    
    const response = await fetch(fullUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }
    
    return {
      success: true,
      data,
      url: fullUrl
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: `${url}?${new URLSearchParams(testCase.params)}`
    };
  }
}

async function runTests() {
  console.log('🧪 Testing FIXED vs ORIGINAL Pricing APIs\n');
  
  // Check if .env.local is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('📋 Environment Check:');
  console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Not set'}`);
  console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${serviceKey && serviceKey !== 'your_supabase_service_role_key_here' ? '✅ Set' : '❌ Not set (update .env.local)'}`);
  
  if (!serviceKey || serviceKey === 'your_supabase_service_role_key_here') {
    console.log('\n⚠️  Please update your .env.local file with the actual Supabase service role key');
    console.log('1. Get key from: https://supabase.com/dashboard/project/lzgrpcgfcevmnrxbvpfw/settings/api');
    console.log('2. Look for "service_role" key (marked as secret)');
    console.log('3. Replace "your_supabase_service_role_key_here" in .env.local');
    console.log('\nSkipping database tests - only static fallback will work.\n');
  }
  
  let totalTests = 0;
  let fixedApiSuccesses = 0;
  let originalApiSuccesses = 0;
  let fixedApiDatabaseHits = 0;
  let originalApiDatabaseHits = 0;
  
  for (const testCase of testCases) {
    totalTests++;
    console.log(`\n📱 Test ${totalTests}: ${testCase.name}`);
    console.log('   Parameters:', JSON.stringify(testCase.params, null, 2));
    
    // Test FIXED API
    console.log('\n  🔧 Testing FIXED API:');
    const fixedResult = await testAPI(FIXED_API_URL, testCase);
    
    if (fixedResult.success) {
      fixedApiSuccesses++;
      const calculation = fixedResult.data.calculation;
      const finalPrice = calculation?.pricing?.final_price;
      const source = calculation?.pricing?.discounted_price ? 'database (promotional)' : 
                     finalPrice === 149 ? 'static' : 'database';
      
      if (source.includes('database')) {
        fixedApiDatabaseHits++;
      }
      
      console.log(`     ✅ Success - Price: $${finalPrice} (${source})`);
      
      if (testCase.expected.expectedPrice && Math.abs(finalPrice - testCase.expected.expectedPrice) > 0.01) {
        console.log(`     ⚠️  Price mismatch: expected $${testCase.expected.expectedPrice}, got $${finalPrice}`);
      }
    } else {
      console.log(`     ❌ Failed: ${fixedResult.error}`);
    }
    
    // Test ORIGINAL API
    console.log('\n  🔧 Testing ORIGINAL API:');
    const originalResult = await testAPI(ORIGINAL_API_URL, testCase);
    
    if (originalResult.success) {
      originalApiSuccesses++;
      const calculation = originalResult.data.calculation;
      const finalPrice = calculation?.pricing?.final_price;
      const source = calculation?.pricing?.discounted_price ? 'database (promotional)' : 
                     finalPrice === 149 ? 'static' : 'database';
      
      if (source.includes('database')) {
        originalApiDatabaseHits++;
      }
      
      console.log(`     ✅ Success - Price: $${finalPrice} (${source})`);
    } else {
      console.log(`     ❌ Failed: ${originalResult.error}`);
    }
    
    console.log('   ────────────────────────────────────────');
  }
  
  // Results Summary
  console.log('\n📊 Test Results Summary:');
  console.log('════════════════════════════════════════');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`\n🔧 FIXED API:`);
  console.log(`   Success Rate: ${fixedApiSuccesses}/${totalTests} (${Math.round(fixedApiSuccesses/totalTests*100)}%)`);
  console.log(`   Database Hits: ${fixedApiDatabaseHits}/${totalTests} (${Math.round(fixedApiDatabaseHits/totalTests*100)}%)`);
  console.log(`   Static Fallbacks: ${fixedApiSuccesses - fixedApiDatabaseHits}/${totalTests}`);
  
  console.log(`\n🔧 ORIGINAL API:`);
  console.log(`   Success Rate: ${originalApiSuccesses}/${totalTests} (${Math.round(originalApiSuccesses/totalTests*100)}%)`);
  console.log(`   Database Hits: ${originalApiDatabaseHits}/${totalTests} (${Math.round(originalApiDatabaseHits/totalTests*100)}%)`);
  console.log(`   Static Fallbacks: ${originalApiSuccesses - originalApiDatabaseHits}/${totalTests}`);
  
  // Analysis
  console.log('\n📈 Analysis:');
  if (fixedApiDatabaseHits > originalApiDatabaseHits) {
    console.log(`✅ FIXED API shows ${fixedApiDatabaseHits - originalApiDatabaseHits} more database hits than original!`);
  } else if (fixedApiDatabaseHits === originalApiDatabaseHits) {
    console.log(`⚖️  Both APIs have equal database hit rates`);
  } else {
    console.log(`⚠️  FIXED API has fewer database hits - check configuration`);
  }
  
  if (fixedApiSuccesses === totalTests) {
    console.log('🎉 FIXED API: Perfect success rate!');
  } else {
    console.log(`⚠️  FIXED API: ${totalTests - fixedApiSuccesses} failures need investigation`);
  }
  
  console.log('\n🔗 Next Steps:');
  if (fixedApiDatabaseHits > 0) {
    console.log('1. ✅ Database connection working');
    console.log('2. 🔄 Replace original API with fixed version');
    console.log('3. 🧪 Test in booking flow');
  } else {
    console.log('1. ⚠️  Verify Supabase service role key in .env.local');
    console.log('2. 🔍 Check database has pricing entries');
    console.log('3. 🔄 Re-run test after fixing connection');
  }
}

// Start the test
console.log('🚀 Starting API comparison test...');
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
}); 