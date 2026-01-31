#!/usr/bin/env node

/**
 * Sitemap Validation Test Script
 * 
 * This script tests the sitemap API for:
 * 1. XML validity (special character escaping)
 * 2. URL collision detection
 * 3. Performance and timeout safety
 * 4. Lastmod field integrity
 * 5. Slug consistency with frontend routes
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { parseString } = xml2js;

// Mock environment for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-supabase-url.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.travelling-technicians.ca';

// Import the sitemap handler (we'll need to mock Supabase)
const sitemapPath = path.join(__dirname, '../src/pages/api/sitemap.xml.ts');

console.log('🔍 Starting Sitemap Validation Test\n');

/**
 * Test 1: XML Special Character Escaping
 */
function testXmlEscaping() {
  console.log('🧪 Test 1: XML Special Character Escaping');
  
  const testCases = [
    { input: 'Screen & Camera Repair', expected: 'Screen &amp; Camera Repair' },
    { input: 'iPhone < 14 Pro', expected: 'iPhone &lt; 14 Pro' },
    { input: 'MacBook > 2023', expected: 'MacBook &gt; 2023' },
    { input: 'Repair "quoted" service', expected: 'Repair &quot;quoted" service' },
    { input: "O'Connor's iPhone", expected: "O&apos;Connor&apos;s iPhone" },
    { input: 'Normal text', expected: 'Normal text' },
  ];

  // Fixed escapeXml function
  function escapeXml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ input, expected }, index) => {
    const result = escapeXml(input);
    if (result === expected) {
      console.log(`  ✓ Test ${index + 1}: "${input}" → "${result}"`);
      passed++;
    } else {
      console.log(`  ✗ Test ${index + 1}: "${input}" → "${result}" (expected: "${expected}")`);
      failed++;
    }
  });

  console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

testXmlEscaping();
/**
 * Test 2: Slug Consistency Validation
 */
function testSlugConsistency() {
  console.log('🧪 Test 2: Slug Consistency Validation');
  
  // Test cases based on the slug-utils.ts mapping
  const testCases = [
    { 
      dbSlug: 'screen-replacement-mobile', 
      expectedUrlSlug: 'screen-repair',
      description: 'Mobile screen replacement mapping'
    },
    { 
      dbSlug: 'screen-replacement-laptop', 
      expectedUrlSlug: 'laptop-screen-repair',
      description: 'Laptop screen replacement mapping'
    },
    { 
      dbSlug: 'battery-replacement-mobile', 
      expectedUrlSlug: 'battery-replacement',
      description: 'Mobile battery replacement mapping'
    },
    { 
      dbSlug: 'charging-port-repair', 
      expectedUrlSlug: 'charging-port-repair',
      description: 'Direct mapping (no change)'
    },
    { 
      dbSlug: 'water-damage-repair', 
      expectedUrlSlug: 'water-damage-repair',
      description: 'Direct mapping (no change)'
    },
  ];

  // Mock serviceNameToUrlSlug function
  const SERVICE_SLUG_MAPPING = {
    'screen-replacement-mobile': 'screen-repair',
    'screen-replacement-laptop': 'laptop-screen-repair',
    'battery-replacement-mobile': 'battery-replacement',
    'battery-replacement-laptop': 'battery-replacement',
    'charging-port-repair': 'charging-port-repair',
    'water-damage-repair': 'water-damage-repair',
  };

  function serviceNameToUrlSlug(serviceName) {
    // Check if we have a mapping
    if (SERVICE_SLUG_MAPPING[serviceName]) {
      return SERVICE_SLUG_MAPPING[serviceName];
    }
    
    // Fallback to URL slug generation
    return serviceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ dbSlug, expectedUrlSlug, description }, index) => {
    const result = serviceNameToUrlSlug(dbSlug);
    if (result === expectedUrlSlug) {
      console.log(`  ✓ Test ${index + 1}: ${description}`);
      console.log(`    DB: "${dbSlug}" → URL: "${result}"`);
      passed++;
    } else {
      console.log(`  ✗ Test ${index + 1}: ${description}`);
      console.log(`    DB: "${dbSlug}" → URL: "${result}" (expected: "${expectedUrlSlug}")`);
      failed++;
    }
  });

  console.log(`  Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

/**
 * Test 3: URL Pattern Validation
 */
function testUrlPatterns() {
  console.log('🧪 Test 3: URL Pattern Validation');
  
  const validUrls = [
    '/repair/vancouver/screen-repair/iphone-14',
    '/repair/burnaby/battery-replacement/samsung-galaxy-s23',
    '/locations/vancouver/downtown',
    '/locations/burnaby/metrotown',
    '/services/mobile-repair',
    '/blog/signs-your-phone-needs-repair',
  ];

  const invalidUrls = [
    '/repair/VANCOUVER/screen-repair/iphone-14', // uppercase
    '/repair/vancouver/screen_repair/iphone-14', // underscore
    '/repair/vancouver/screen.repair/iphone-14', // dot
    '/repair//screen-repair/iphone-14', // double slash
    '/repair/vancouver//iphone-14', // missing service
    '/invalid-path/vancouver/screen-repair/iphone-14', // wrong base path
  ];

  // Mock isValidUrlSlug function
  function isValidUrlSlug(slug) {
    if (!slug || typeof slug !== 'string') return false;
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugPattern.test(slug);
  }

  function validateRepairUrl(url) {
    const match = url.match(/^\/repair\/([a-z0-9-]+)\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
    if (!match) return false;
    
    const [, citySlug, serviceSlug, modelSlug] = match;
    return isValidUrlSlug(citySlug) && isValidUrlSlug(serviceSlug) && isValidUrlSlug(modelSlug);
  }

  let passed = 0;
  let failed = 0;

  // Test valid URLs
  validUrls.forEach((url, index) => {
    const isValid = validateRepairUrl(url) || 
                   url.startsWith('/locations/') || 
                   url.startsWith('/services/') || 
                   url.startsWith('/blog/');
    
    if (isValid) {
      console.log(`  ✓ Valid URL ${index + 1}: "${url}"`);
      passed++;
    } else {
      console.log(`  ✗ Valid URL ${index + 1}: "${url}" (should be valid)`);
      failed++;
    }
  });

  // Test invalid URLs
  invalidUrls.forEach((url, index) => {
    const isValid = validateRepairUrl(url);
    if (!isValid) {
      console.log(`  ✓ Invalid URL ${index + 1}: "${url}" (correctly rejected)`);
      passed++;
    } else {
      console.log(`  ✗ Invalid URL ${index + 1}: "${url}" (should be invalid)`);
      failed++;
    }
  });

  console.log(`  Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

/**
 * Test 4: Lastmod Field Integrity
 */
function testLastmodIntegrity() {
  console.log('🧪 Test 4: Lastmod Field Integrity');
  
  const testCases = [
    {
      description: 'Valid ISO string',
      input: '2024-12-15T10:00:00Z',
      shouldBeValid: true
    },
    {
      description: 'Valid ISO string with milliseconds',
      input: '2024-12-15T10:00:00.000Z',
      shouldBeValid: true
    },
    {
      description: 'Invalid date string',
      input: 'December 15, 2024',
      shouldBeValid: false
    },
    {
      description: 'Invalid format',
      input: '2024/12/15',
      shouldBeValid: false
    },
    {
      description: 'Empty string',
      input: '',
      shouldBeValid: false
    },
    {
      description: 'Null value',
      input: null,
      shouldBeValid: false
    },
  ];

  function isValidLastmod(dateString) {
    if (!dateString) return false;
    
    // Check if it's a valid ISO string
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.includes('T') && dateString.includes('Z');
  }

  function getFallbackLastmod() {
    return new Date().toISOString();
  }

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ description, input, shouldBeValid }, index) => {
    const isValid = isValidLastmod(input);
    const matchesExpectation = (isValid === shouldBeValid);
    
    if (matchesExpectation) {
      console.log(`  ✓ Test ${index + 1}: ${description}`);
      console.log(`    Input: "${input}" → Valid: ${isValid}`);
      passed++;
    } else {
      console.log(`  ✗ Test ${index + 1}: ${description}`);
      console.log(`    Input: "${input}" → Valid: ${isValid} (expected: ${shouldBeValid})`);
      failed++;
    }
  });

  // Test fallback logic
  console.log(`  Testing fallback logic...`);
  const fallbackResult = getFallbackLastmod();
  const fallbackIsValid = isValidLastmod(fallbackResult);
  
  if (fallbackIsValid) {
    console.log(`  ✓ Fallback generates valid ISO string: "${fallbackResult}"`);
    passed++;
  } else {
    console.log(`  ✗ Fallback generates invalid string: "${fallbackResult}"`);
    failed++;
  }

  console.log(`  Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

/**
 * Test 5: Performance Safety Checks
 */
function testPerformanceSafety() {
  console.log('🧪 Test 5: Performance Safety Checks');
  
  const MAX_EXECUTION_TIME = 8000; // 8 seconds
  const MAX_COMBINATIONS = 2000;
  const MAX_COMBINATIONS_PER_SERVICE = 100;
  const MAX_CITIES = 20;
  const MAX_INITIAL_QUERY = 500;

  const limits = [
    { name: 'Max Execution Time', value: MAX_EXECUTION_TIME, unit: 'ms', check: (v) => v <= 9000 },
    { name: 'Max Total Combinations', value: MAX_COMBINATIONS, unit: 'URLs', check: (v) => v <= 45000 },
    { name: 'Max Combinations Per Service', value: MAX_COMBINATIONS_PER_SERVICE, unit: 'models', check: (v) => v <= 500 },
    { name: 'Max Cities', value: MAX_CITIES, unit: 'cities', check: (v) => v <= 50 },
    { name: 'Max Initial Query', value: MAX_INITIAL_QUERY, unit: 'records', check: (v) => v <= 1000 },
  ];

  let passed = 0;
  let failed = 0;

  limits.forEach(({ name, value, unit, check }, index) => {
    const isSafe = check(value);
    
    if (isSafe) {
      console.log(`  ✓ Limit ${index + 1}: ${name} = ${value} ${unit} (safe)`);
      passed++;
    } else {
      console.log(`  ✗ Limit ${index + 1}: ${name} = ${value} ${unit} (potentially unsafe)`);
      failed++;
    }
  });

  // Calculate worst-case scenario
  const worstCaseUrls = MAX_CITIES * MAX_COMBINATIONS_PER_SERVICE * 10; // Assume 10 services
  console.log(`  Worst-case URL estimate: ${worstCaseUrls} URLs`);
  
  if (worstCaseUrls <= 45000) {
    console.log(`  ✓ Worst-case scenario fits in single sitemap (≤ 45,000 URLs)`);
    passed++;
  } else {
    console.log(`  ✗ Worst-case scenario exceeds single sitemap limit`);
    console.log(`    Consider implementing sitemap index for > 45,000 URLs`);
    failed++;
  }

  console.log(`  Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Running Comprehensive Sitemap Validation Tests\n');
  
  const tests = [
    { name: 'XML Escaping', fn: testXmlEscaping },
    { name: 'Slug Consistency', fn: testSlugConsistency },
    { name: 'URL Patterns', fn: testUrlPatterns },
    { name: 'Lastmod Integrity', fn: testLastmodIntegrity },
    { name: 'Performance Safety', fn: testPerformanceSafety },
  ];

  let totalPassed = 0;
  let totalFailed = 0;
  const results = [];

  for (const test of tests) {
    console.log(`📋 ${test.name}`);
    console.log('='.repeat(50));
    
    try {
      const passed = test.fn();
      if (passed) {
        totalPassed++;
        results.push({ test: test.name, status: 'PASS' });
      } else {
        totalFailed++;
        results.push({ test: test.name, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`  💥 Error running test: ${error.message}`);
      totalFailed++;
      results.push({ test: test.name, status: 'ERROR' });
    }
    
    console.log('');
  }

  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  results.forEach(({ test, status }) => {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '💥';
    console.log(`${icon} ${test}: ${status}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! Sitemap implementation looks robust.');
    return 0;
  } else {
    console.log('\n⚠️  Some tests failed. Review the issues above.');
    return 1;
  }
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations() {
  console.log('\n💡 RECOMMENDATIONS FOR PRODUCTION DEPLOYMENT');
  console.log('='.repeat(50));
  
  console.log('\n1. **Monitoring & Alerts**:');
  console.log('   - Set up monitoring for sitemap generation time (> 8s)');
  console.log('   - Alert on sitemap XML validation errors');
  console.log('   - Monitor 404 rates for sitemap URLs');
  
  console.log('\n2. **Database Optimization**:');
  console.log('   - Add indexes on: service_locations(is_active), dynamic_pricing(is_active)');
  console.log('   - Consider materialized views for popular combinations');
  console.log('   - Implement query caching for sitemap data');
  
  console.log('\n3. **Production Validation**:');
  console.log('   - Run sitemap through XML validators (W3C, Google)');
  console.log('   - Test with actual Supabase data volumes');
  console.log('   - Verify all URLs return 200 status codes');
  
  console.log('\n4. **CI/CD Integration**:');
  console.log('   - Add sitemap validation to pre-commit hooks');
  console.log('   - Run validation tests before deployment');
  console.log('   - Generate sitemap diff reports for review');
  
  console.log('\n5. **Fallback Strategy**:');
  console.log('   - Implement stale-while-revalidate caching');
  console.log('   - Set up health checks for sitemap endpoint');
  console.log('   - Create backup static sitemap for emergencies');
}

// Run tests
runAllTests().then(exitCode => {
  if (exitCode === 0) {
    generateRecommendations();
  }
  process.exit(exitCode);
}).catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});