#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test URLs that were causing issues
const testUrls = [
  'http://travelling-technicians.ca/',
  'http://www.travelling-technicians.ca/',
  'https://www.travelling-technicians.ca/',
  'https://www.travelling-technicians.ca/contact/',
  'https://travelling-technicians.ca/', // This should be the final canonical URL
];

// Function to check redirects
function checkRedirect(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https://');
    const lib = isHttps ? https : http;
    
    const request = lib.get(url, { timeout: 10000 }, (res) => {
      const statusCode = res.statusCode;
      const location = res.headers.location;
      
      resolve({
        url,
        statusCode,
        location,
        isRedirect: statusCode >= 300 && statusCode < 400,
        finalUrl: location || url
      });
      
      res.on('data', () => {}); // Consume response
      res.on('end', () => {});
    });
    
    request.on('error', (err) => {
      resolve({
        url,
        error: err.message,
        statusCode: 'ERROR'
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve({
        url,
        error: 'Request timeout',
        statusCode: 'TIMEOUT'
      });
    });
  });
}

// Function to check canonical URLs in response
function checkCanonicalUrl(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https://');
    const lib = isHttps ? https : http;
    
    const request = lib.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Extract canonical URL from HTML
        const canonicalMatch = data.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
        const canonical = canonicalMatch ? canonicalMatch[1] : null;
        
        resolve({
          url,
          canonical,
          statusCode: res.statusCode
        });
      });
    });
    
    request.on('error', (err) => {
      resolve({
        url,
        error: err.message,
        canonical: null
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve({
        url,
        error: 'Request timeout',
        canonical: null
      });
    });
  });
}

async function runTests() {
  console.log('🔍 Testing SEO Redirect Fixes\n');
  console.log('=' * 50);
  
  console.log('\n📍 REDIRECT TESTS');
  console.log('-' * 30);
  
  for (const url of testUrls) {
    try {
      const result = await checkRedirect(url);
      
      console.log(`\nURL: ${url}`);
      console.log(`Status: ${result.statusCode}`);
      
      if (result.isRedirect) {
        console.log(`✅ Redirects to: ${result.location}`);
      } else if (result.statusCode === 200) {
        console.log(`✅ Success (200 OK)`);
      } else if (result.error) {
        console.log(`❌ Error: ${result.error}`);
      } else {
        console.log(`⚠️  Unexpected status: ${result.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ Failed to test ${url}: ${error.message}`);
    }
  }
  
  console.log('\n📋 CANONICAL URL TESTS');
  console.log('-' * 30);
  
  // Test canonical URLs on live pages
  const canonicalTestUrls = [
    'https://travelling-technicians.ca/',
    'https://travelling-technicians.ca/contact'
  ];
  
  for (const url of canonicalTestUrls) {
    try {
      const result = await checkCanonicalUrl(url);
      
      console.log(`\nURL: ${url}`);
      console.log(`Status: ${result.statusCode}`);
      
      if (result.canonical) {
        if (result.canonical.includes('www.')) {
          console.log(`❌ Canonical uses www: ${result.canonical}`);
        } else {
          console.log(`✅ Canonical correct: ${result.canonical}`);
        }
      } else if (result.error) {
        console.log(`❌ Error: ${result.error}`);
      } else {
        console.log(`⚠️  No canonical URL found`);
      }
    } catch (error) {
      console.log(`❌ Failed to test ${url}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 EXPECTED BEHAVIOR');
  console.log('-' * 30);
  console.log('✅ All HTTP URLs should redirect to HTTPS');
  console.log('✅ All www URLs should redirect to non-www');
  console.log('✅ All canonical URLs should use travelling-technicians.ca (no www)');
  console.log('✅ No redirect chains longer than 1 hop');
  
  console.log('\n📝 NEXT STEPS');
  console.log('-' * 30);
  console.log('1. Deploy changes to production');
  console.log('2. Wait 24-48 hours for Google to re-crawl');
  console.log('3. Check Google Search Console for error resolution');
  console.log('4. Request re-indexing if needed');
}

runTests().catch(console.error); 