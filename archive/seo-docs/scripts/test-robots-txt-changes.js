#!/usr/bin/env node

/**
 * Test script to verify robots.txt changes for API access
 * This script checks if public APIs are allowed and private APIs are blocked
 */

const fs = require('fs');
const path = require('path');

// Read robots.txt
const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');

// Test cases
const testCases = [
  // Public APIs - should be ALLOWED
  { path: '/api/ping', expected: 'allow', description: 'Health check endpoint' },
  { path: '/api/check-postal-code', expected: 'allow', description: 'Postal code checker' },
  { path: '/api/geocode', expected: 'allow', description: 'Geocoding service' },
  { path: '/api/sitemap.xml', expected: 'allow', description: 'Dynamic sitemap' },
  { path: '/api/pricing/calculate', expected: 'allow', description: 'Pricing calculator' },
  { path: '/api/pricing/calculate-fixed', expected: 'allow', description: 'Fixed pricing' },
  { path: '/api/devices/models', expected: 'allow', description: 'Device models' },
  { path: '/api/devices/brands', expected: 'allow', description: 'Device brands' },
  
  // Private APIs - should be DISALLOWED
  { path: '/api/management/login', expected: 'disallow', description: 'Admin login' },
  { path: '/api/bookings/create', expected: 'disallow', description: 'Booking creation' },
  { path: '/api/bookings/update', expected: 'disallow', description: 'Booking update' },
  { path: '/api/debug/env-check', expected: 'disallow', description: 'Debug endpoint' },
  { path: '/api/cache/invalidate', expected: 'disallow', description: 'Cache management' },
  { path: '/api/webhooks/sitemap-regenerate', expected: 'disallow', description: 'Webhook' },
  { path: '/api/technicians', expected: 'disallow', description: 'Technician data' },
  { path: '/api/warranties', expected: 'disallow', description: 'Warranty data' },
  
  // Other private areas
  { path: '/management/bookings', expected: 'disallow', description: 'Management panel' },
  { path: '/login', expected: 'disallow', description: 'Login page' },
  { path: '/admin', expected: 'disallow', description: 'Admin area' },
  { path: '/debug', expected: 'disallow', description: 'Debug page' },
  
  // Public pages - should be ALLOWED
  { path: '/services/mobile-repair', expected: 'allow', description: 'Mobile repair service page' },
  { path: '/locations/vancouver', expected: 'allow', description: 'Vancouver location page' },
  { path: '/book-online', expected: 'allow', description: 'Booking page' },
  { path: '/contact', expected: 'allow', description: 'Contact page' },
];

// Better robots.txt parser that follows "longest matching rule wins"
function checkPath(pathToCheck) {
  const lines = robotsContent.split('\n');
  let userAgent = '*';
  const rules = []; // Store all matching rules
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Check for User-agent
    if (trimmed.toLowerCase().startsWith('user-agent:')) {
      userAgent = trimmed.substring(11).trim();
      continue;
    }
    
    // Only process rules for * user-agent
    if (userAgent !== '*') continue;
    
    // Check for Allow/Disallow
    let type = null;
    let pattern = null;
    
    if (trimmed.toLowerCase().startsWith('allow:')) {
      type = 'allow';
      pattern = trimmed.substring(6).trim();
    } else if (trimmed.toLowerCase().startsWith('disallow:')) {
      type = 'disallow';
      pattern = trimmed.substring(9).trim();
    }
    
    if (type && pattern) {
      // Check if this rule applies to our path
      if (pattern === '/' || pathToCheck.startsWith(pattern)) {
        rules.push({
          type,
          pattern,
          length: pattern.length,
          line: trimmed
        });
      }
    }
  }
  
  // Sort by pattern length (longest first) as per robots.txt spec
  rules.sort((a, b) => b.length - a.length);
  
  // If we have matching rules, use the first (longest) one
  if (rules.length > 0) {
    return rules[0].type;
  }
  
  // Default is allow if no rules match
  return 'allow';
}

// Run tests
console.log('🔍 Testing robots.txt API access rules\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = checkPath(test.path);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  
  if (result === test.expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${status} ${test.path}`);
  console.log(`   Expected: ${test.expected.toUpperCase()}, Got: ${result.toUpperCase()}`);
  console.log(`   ${test.description}`);
  console.log();
}

console.log('='.repeat(80));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\n⚠️  Some tests failed. Please review the robots.txt rules.');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed! The robots.txt configuration looks good.');
  process.exit(0);
}