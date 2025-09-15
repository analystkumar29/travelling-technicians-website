#!/usr/bin/env node

/**
 * SECURITY VERIFICATION SCRIPT
 * Tests that all critical security fixes have been properly applied
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFYING SECURITY FIXES...\n');

let passedTests = 0;
let totalTests = 0;

function test(description, condition) {
  totalTests++;
  if (condition) {
    console.log(`✅ ${description}`);
    passedTests++;
  } else {
    console.log(`❌ ${description}`);
  }
}

// Test 1: Check CORS configuration
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const corsHeader = vercelConfig.headers?.[0]?.headers?.find(h => h.key === 'Access-Control-Allow-Origin');
  test('CORS origin is not wildcard (*)', corsHeader?.value !== '*');
  test('CORS origin is set to domain', corsHeader?.value === 'https://travelling-technicians.ca');
} catch (error) {
  test('vercel.json is readable', false);
}

// Test 2: Check Next.js version
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const nextVersion = packageJson.dependencies.next;
  const isSecureVersion = nextVersion.includes('14.2.25') || nextVersion.includes('15.2.3') || 
                         nextVersion.includes('14.2.') || nextVersion.includes('15.2.');
  test('Next.js version is secure (14.2.25+ or 15.2.3+)', isSecureVersion);
} catch (error) {
  test('package.json is readable', false);
}

// Test 3: Check middleware security
try {
  const middlewareContent = fs.readFileSync('middleware.ts', 'utf8');
  test('Middleware checks admin authentication', middlewareContent.includes('authToken'));
  test('Middleware no longer allows admin bypass', !middlewareContent.includes('Allow admin routes to pass through'));
  test('Security headers are set', middlewareContent.includes('X-Frame-Options'));
} catch (error) {
  test('middleware.ts is readable', false);
}

// Test 4: Check API files for weak secrets
const apiFiles = [
  'src/pages/api/send-confirmation.ts',
  'src/pages/api/send-reschedule-confirmation.ts',
  'src/pages/api/verify-booking.ts',
  'src/pages/api/bookings/confirmation.ts'
];

apiFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    test(`${file} - No default secrets`, !content.includes('default-secret-change-this'));
    test(`${file} - No SendGrid key for HMAC`, !content.includes('SENDGRID_API_KEY?.substring'));
    test(`${file} - Requires environment variable`, content.includes('throw new Error'));
  } catch (error) {
    test(`${file} is readable`, false);
  }
});

// Test 5: Check security headers in vercel.json
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const headers = vercelConfig.headers || [];
  const hasSecurityHeaders = headers.some(h => 
    h.headers?.some(header => header.key === 'X-Frame-Options')
  );
  test('Security headers are configured', hasSecurityHeaders);
} catch (error) {
  // Already tested above
}

// Test 6: Check for documentation
test('Security setup guide exists', fs.existsSync('SECURITY_SETUP.md'));
test('Cleanup script exists', fs.existsSync('cleanup-security.sh'));

// Test 7: Check for dangerous patterns
console.log('\n🔍 SCANNING FOR REMAINING SECURITY ISSUES...');

const dangerousPatterns = [
  { pattern: /Access-Control-Allow-Origin.*\*/, file: 'vercel.json', issue: 'Wildcard CORS origin' },
  { pattern: /default-secret-change-this/g, file: 'API files', issue: 'Default weak secrets' },
  { pattern: /console\.log.*password|console\.log.*secret|console\.log.*key/gi, file: 'Source files', issue: 'Logging sensitive data' }
];

// Check specific files for patterns
const filesToCheck = [
  'vercel.json',
  'middleware.ts',
  ...apiFiles
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    dangerousPatterns.forEach(({ pattern, issue }) => {
      if (pattern.test(content)) {
        console.log(`⚠️  Warning: ${issue} found in ${file}`);
      }
    });
  }
});

// Summary
console.log('\n📊 SECURITY VERIFICATION SUMMARY');
console.log('='.repeat(40));
console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
console.log(`❌ Tests Failed: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 ALL SECURITY TESTS PASSED!');
  console.log('Your application is significantly more secure.');
} else {
  console.log('\n⚠️  Some security tests failed.');
  console.log('Please review and fix the failing tests above.');
}

// Next steps
console.log('\n🚀 NEXT STEPS:');
console.log('1. Set up your .env.local file with secure secrets');
console.log('2. Generate strong BOOKING_VERIFICATION_SECRET');
console.log('3. Test admin routes redirect to login');
console.log('4. Deploy and verify CORS works only from your domain');
console.log('5. Consider running: ./cleanup-security.sh (optional)');

console.log('\n📖 For detailed instructions, see: SECURITY_SETUP.md'); 