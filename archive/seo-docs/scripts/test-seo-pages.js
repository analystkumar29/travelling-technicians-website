#!/usr/bin/env node

/**
 * Test script to verify all important SEO pages listed in robots.txt
 * Checks if pages are accessible and return proper HTTP status codes
 */

const https = require('https');
const { execSync } = require('child_process');

const baseUrl = 'https://www.travelling-technicians.ca';
const pages = [
  '/',
  '/services/',           // Directory - allows all service pages
  '/repair',             // Without trailing slash
  '/locations/',         // Directory - allows all location pages
  '/service-areas',      // Without trailing slash
  '/contact',
  '/about',
  '/book-online',
  '/pricing',
  '/faq',
  '/privacy-policy',
  '/terms-conditions'
];

// Also test a few location pages to ensure they work
const locationPages = [
  '/locations/vancouver',
  '/locations/burnaby',
  '/locations/surrey',
  '/locations/richmond',
  '/locations/coquitlam'
];

// Test API endpoints that should be accessible
const publicApis = [
  '/api/ping',
  '/api/check-postal-code?code=V5H',
  '/api/sitemap.xml'
];

function testUrl(url) {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    const startTime = Date.now();
    
    const req = https.get(fullUrl, (res) => {
      const data = [];
      res.on('data', (chunk) => {
        data.push(chunk);
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        const content = Buffer.concat(data).toString();
        const hasContent = content.length > 100; // Basic content check
        
        resolve({
          url: fullUrl,
          status: res.statusCode,
          responseTime,
          hasContent,
          contentType: res.headers['content-type'] || 'unknown',
          size: content.length,
          redirected: res.responseUrl !== fullUrl
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url: fullUrl,
        status: 0,
        error: error.message,
        responseTime: Date.now() - startTime,
        hasContent: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url: fullUrl,
        status: 0,
        error: 'Timeout',
        responseTime: Date.now() - startTime,
        hasContent: false
      });
    });
  });
}

async function runTests() {
  console.log('🔍 Testing SEO pages on production site\n');
  console.log('='.repeat(100));
  
  const allTests = [
    ...pages.map(url => ({ url, category: 'SEO Pages' })),
    ...locationPages.map(url => ({ url, category: 'Location Pages' })),
    ...publicApis.map(url => ({ url, category: 'Public APIs' }))
  ];
  
  const results = [];
  
  for (const test of allTests) {
    process.stdout.write(`Testing ${test.url}... `);
    const result = await testUrl(test.url);
    results.push({ ...test, ...result });
    
    if (result.status === 200 && result.hasContent) {
      console.log(`✅ ${result.status} (${result.responseTime}ms, ${result.size} bytes)`);
    } else if (result.status === 200) {
      console.log(`⚠️  ${result.status} but low content (${result.size} bytes)`);
    } else if (result.status > 0) {
      console.log(`❌ ${result.status}`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(100));
  console.log('\n📊 Summary Report\n');
  
  // Group by category
  const byCategory = {};
  results.forEach(result => {
    if (!byCategory[result.category]) {
      byCategory[result.category] = [];
    }
    byCategory[result.category].push(result);
  });
  
  for (const [category, categoryResults] of Object.entries(byCategory)) {
    console.log(`\n${category}:`);
    console.log('-'.repeat(50));
    
    const successful = categoryResults.filter(r => r.status === 200 && r.hasContent);
    const issues = categoryResults.filter(r => !(r.status === 200 && r.hasContent));
    
    console.log(`✅ ${successful.length}/${categoryResults.length} pages working correctly`);
    
    if (issues.length > 0) {
      console.log('\nIssues found:');
      issues.forEach(issue => {
        if (issue.status === 200 && !issue.hasContent) {
          console.log(`  • ${issue.url}: Returns 200 but low content (${issue.size} bytes)`);
        } else if (issue.status > 0) {
          console.log(`  • ${issue.url}: HTTP ${issue.status}`);
        } else {
          console.log(`  • ${issue.url}: ${issue.error}`);
        }
      });
    }
  }
  
  // Overall statistics
  const totalSuccessful = results.filter(r => r.status === 200 && r.hasContent).length;
  const totalTests = results.length;
  
  console.log('\n' + '='.repeat(100));
  console.log(`\n📈 Overall: ${totalSuccessful}/${totalTests} tests passed (${Math.round(totalSuccessful/totalTests*100)}%)`);
  
  if (totalSuccessful === totalTests) {
    console.log('\n🎉 All SEO pages are working correctly!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some pages need attention. Check the issues above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});