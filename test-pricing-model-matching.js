/**
 * Test script to verify pricing API model matching fix
 * 
 * Tests that base models (iPhone 17) don't incorrectly match variant pricing (iPhone 17 Pro)
 * 
 * Run: node test-pricing-model-matching.js
 */

const BASE_URL = 'http://localhost:3000';

async function testPricingAPI(params, expectedModel, expectedTier) {
  const url = `${BASE_URL}/api/pricing/calculate?${new URLSearchParams(params)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const result = {
      params: `${params.model} (${params.tier})`,
      success: data.success,
      basePrice: data.data?.base_price,
      finalPrice: data.data?.final_price,
      matchedModel: data.data?.device_info?.model,
      source: data.debug_info?.source || 'unknown',
      fallbackUsed: data.fallback_used || false
    };
    
    // Check if we got the right model
    const modelMatchCorrect = result.matchedModel?.toLowerCase().includes(expectedModel.toLowerCase()) || 
                              (!result.matchedModel && result.fallbackUsed);
    
    result.PASS = modelMatchCorrect;
    
    return result;
  } catch (error) {
    return {
      params: `${params.model} (${params.tier})`,
      success: false,
      error: error.message,
      PASS: false
    };
  }
}

async function runTests() {
  console.log('='.repeat(80));
  console.log('PRICING API MODEL MATCHING TEST');
  console.log('='.repeat(80));
  console.log('\nTesting that base models do NOT match variant pricing...\n');
  
  const tests = [
    // iPhone 17 tests - should return $379 premium, $239 standard (NOT $465/$278 from Pro)
    {
      params: { deviceType: 'mobile', brand: 'apple', model: 'iPhone 17', service: 'screen-replacement', tier: 'premium' },
      expectedModel: 'iPhone 17',
      expectedPrice: 379,
      description: 'iPhone 17 Premium should be $379 (not $465 from Pro)'
    },
    {
      params: { deviceType: 'mobile', brand: 'apple', model: 'iPhone 17', service: 'screen-replacement', tier: 'standard' },
      expectedModel: 'iPhone 17',
      expectedPrice: 239,
      description: 'iPhone 17 Standard should be $239 (not $278 from Pro)'
    },
    
    // iPhone 17 Pro tests - should return $465 premium, $278 standard
    {
      params: { deviceType: 'mobile', brand: 'apple', model: 'iPhone 17 Pro', service: 'screen-replacement', tier: 'premium' },
      expectedModel: 'iPhone 17 Pro',
      expectedPrice: 465,
      description: 'iPhone 17 Pro Premium should be $465'
    },
    {
      params: { deviceType: 'mobile', brand: 'apple', model: 'iPhone 17 Pro', service: 'screen-replacement', tier: 'standard' },
      expectedModel: 'iPhone 17 Pro',
      expectedPrice: 278,
      description: 'iPhone 17 Pro Standard should be $278'
    },
    
    // iPhone 17 Pro Max tests - should return $569 premium, $379 standard
    {
      params: { deviceType: 'mobile', brand: 'apple', model: 'iPhone 17 Pro Max', service: 'screen-replacement', tier: 'premium' },
      expectedModel: 'iPhone 17 Pro Max',
      expectedPrice: 569,
      description: 'iPhone 17 Pro Max Premium should be $569'
    },
    {
      params: { deviceType: 'mobile', brand: 'apple', model: 'iPhone 17 Pro Max', service: 'screen-replacement', tier: 'standard' },
      expectedModel: 'iPhone 17 Pro Max',
      expectedPrice: 379,
      description: 'iPhone 17 Pro Max Standard should be $379'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testPricingAPI(test.params, test.expectedModel, test.params.tier);
    
    const priceCorrect = result.basePrice === test.expectedPrice;
    const status = priceCorrect ? '✅ PASS' : '❌ FAIL';
    
    console.log(`${status}: ${test.description}`);
    console.log(`   Request: ${test.params.model} (${test.params.tier})`);
    console.log(`   Expected: $${test.expectedPrice} | Got: $${result.basePrice}`);
    console.log(`   Matched Model: ${result.matchedModel || 'N/A (fallback used)'}`);
    console.log(`   Source: ${result.source}`);
    console.log('');
    
    if (priceCorrect) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('='.repeat(80));
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(80));
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The pricing API model matching fix is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the pricing API model matching logic.');
  }
}

// Run tests
runTests().catch(console.error);
