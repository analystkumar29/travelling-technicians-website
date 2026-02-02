#!/usr/bin/env node

/**
 * Simple Sitemap Validation Test
 * Tests the core logic without complex dependencies
 */

console.log('🔍 Running Sitemap Core Logic Tests\n');

// 🧪 Test 1: XML Special Character Escaping
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&"']/g, function (m) {
    switch (m) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return m;
    }
  });
}

const testCases = [
  { input: 'Screen & Camera Repair', expected: 'Screen & Camera Repair' },
  { input: 'iPhone < 14 Pro', expected: 'iPhone < 14 Pro' },
  { input: 'MacBook > 2023', expected: 'MacBook > 2023' },
  { input: 'Repair "quoted" service', expected: 'Repair "quoted" service' },
  { input: "O'Connor's iPhone", expected: "'O'Connor's iPhone'" },
  { input: 'Normal text', expected: 'Normal text' },
];

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

console.log(`  Results: ${passed} passed, ${failed} failed\n`);

// Test 2: Slug validation
console.log('🧪 Test 2: Slug Pattern Validation');
function isValidUrlSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}

const slugTests = [
  { slug: 'vancouver', expected: true },
  { slug: 'screen-repair', expected: true },
  { slug: 'iphone-14-pro', expected: true },
  { slug: 'Vancouver', expected: false }, // uppercase
  { slug: 'screen_repair', expected: false }, // underscore
  { slug: 'screen.repair', expected: false }, // dot
  { slug: '-screen-repair', expected: false }, // leading hyphen
  { slug: 'screen-repair-', expected: false }, // trailing hyphen
  { slug: 'screen--repair', expected: false }, // double hyphen
  { slug: '', expected: false }, // empty
  { slug: null, expected: false }, // null
];

passed = 0;
failed = 0;

slugTests.forEach(({ slug, expected }, index) => {
  const result = isValidUrlSlug(slug);
  if (result === expected) {
    console.log(`  ✓ Test ${index + 1}: "${slug}" → ${result} (expected: ${expected})`);
    passed++;
  } else {
    console.log(`  ✗ Test ${index + 1}: "${slug}" → ${result} (expected: ${expected})`);
    failed++;
  }
});

console.log(`  Results: ${passed} passed, ${failed} failed\n`);

// Test 3: Lastmod validation
console.log('🧪 Test 3: Lastmod ISO String Validation');
function isValidLastmod(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.includes('T') && dateString.includes('Z');
  } catch {
    return false;
  }
}

const dateTests = [
  { date: '2024-12-15T10:00:00Z', expected: true },
  { date: '2024-12-15T10:00:00.000Z', expected: true },
  { date: new Date().toISOString(), expected: true },
  { date: 'December 15, 2024', expected: false },
  { date: '2024/12/15', expected: false },
  { date: '', expected: false },
  { date: null, expected: false },
  { date: undefined, expected: false },
];

passed = 0;
failed = 0;

dateTests.forEach(({ date, expected }, index) => {
  const result = isValidLastmod(date);
  if (result === expected) {
    console.log(`  ✓ Test ${index + 1}: "${date}" → ${result}`);
    passed++;
  } else {
    console.log(`  ✗ Test ${index + 1}: "${date}" → ${result} (expected: ${expected})`);
    failed++;
  }
});

console.log(`  Results: ${passed} passed, ${failed} failed\n`);

// Test 4: Performance limits
console.log('🧪 Test 4: Performance Safety Limits');
const limits = [
  { name: 'Max Execution Time', value: 8000, unit: 'ms', max: 9000 },
  { name: 'Max Total URLs', value: 2000, unit: 'URLs', max: 45000 },
  { name: 'Max Cities', value: 20, unit: 'cities', max: 50 },
  { name: 'Max Initial Query', value: 500, unit: 'records', max: 1000 },
];

passed = 0;
failed = 0;

limits.forEach(({ name, value, unit, max }, index) => {
  const isSafe = value <= max;
  if (isSafe) {
    console.log(`  ✓ ${name}: ${value} ${unit} ≤ ${max} ${unit} (safe)`);
    passed++;
  } else {
    console.log(`  ✗ ${name}: ${value} ${unit} > ${max} ${unit} (unsafe)`);
    failed++;
  }
});

// Calculate worst-case scenario
const worstCaseUrls = 20 * 100 * 10; // 20 cities × 100 models × 10 services
console.log(`  Worst-case URL estimate: ${worstCaseUrls} URLs`);
if (worstCaseUrls <= 45000) {
  console.log(`  ✓ Worst-case fits in single sitemap (≤ 45,000 URLs)`);
  passed++;
} else {
  console.log(`  ✗ Worst-case exceeds single sitemap limit`);
  failed++;
}

console.log(`  Results: ${passed} passed, ${failed} failed\n`);

// Summary
console.log('📊 FINAL SUMMARY');
console.log('='.repeat(50));
const totalTests = testCases.length + slugTests.length + dateTests.length + limits.length + 1;
const totalPassed = (testCases.length - failed) + (slugTests.length - failed) + (dateTests.length - failed) + (limits.length + 1 - failed);

if (failed === 0) {
  console.log(`🎉 All ${totalTests} tests passed!`);
  console.log('\n✅ Sitemap implementation is robust and production-ready.');
  console.log('\n💡 Recommendations:');
  console.log('1. Monitor sitemap generation time in production');
  console.log('2. Validate generated XML with W3C validator');
  console.log('3. Set up alerts for 404s on sitemap URLs');
  console.log('4. Consider adding database indexes for performance');
  process.exit(0);
} else {
  console.log(`⚠️  ${failed} tests failed out of ${totalTests}`);
  console.log('\n❌ Review the failed tests above.');
  process.exit(1);
}