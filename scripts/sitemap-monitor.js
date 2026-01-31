#!/usr/bin/env node

/**
 * Sitemap Monitoring Script
 * Monitors sitemap health, performance, and validity
 */

const https = require('https');
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SITEMAP_URL = 'http://localhost:3000/api/sitemap.xml';
const STATIC_SITEMAP_URL = 'http://localhost:3000/sitemap.xml';
const MAX_EXECUTION_TIME = 8000; // 8 seconds
const MAX_URLS = 45000; // Google limit

console.log('🔍 Sitemap Health Monitor\n');
console.log(`Monitoring sitemap at: ${SITEMAP_URL}`);
console.log(`Time: ${new Date().toISOString()}\n`);

/**
 * Test 1: API Endpoint Availability
 */
async function testApiAvailability() {
  console.log('🧪 Test 1: API Endpoint Availability');
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    http.get(SITEMAP_URL, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`  Status Code: ${res.statusCode}`);
      console.log(`  Response Time: ${responseTime}ms`);
      console.log(`  Content-Type: ${res.headers['content-type']}`);
      
      if (res.statusCode === 200) {
        console.log(`  ✓ API endpoint is available and responding`);
        resolve({ success: true, responseTime, statusCode: res.statusCode });
      } else {
        console.log(`  ✗ API endpoint returned status ${res.statusCode}`);
        resolve({ success: false, responseTime, statusCode: res.statusCode });
      }
      
      res.resume(); // Consume response data to free up memory
    }).on('error', (err) => {
      console.log(`  ✗ API endpoint error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Test 2: XML Validity Check
 */
async function testXmlValidity() {
  console.log('\n🧪 Test 2: XML Structure Validation');
  
  return new Promise((resolve) => {
    let xmlData = '';
    
    http.get(SITEMAP_URL, (res) => {
      res.on('data', (chunk) => {
        xmlData += chunk;
      });
      
      res.on('end', () => {
        // Basic XML validation
        const hasXmlDeclaration = xmlData.includes('<?xml version="1.0"');
        const hasUrlset = xmlData.includes('<urlset');
        const hasUrls = (xmlData.match(/<url>/g) || []).length;
        const hasClosingTags = xmlData.includes('</urlset>');
        
        console.log(`  XML Declaration: ${hasXmlDeclaration ? '✓' : '✗'}`);
        console.log(`  URLSet Tag: ${hasUrlset ? '✓' : '✗'}`);
        console.log(`  URL Count: ${hasUrls}`);
        console.log(`  Closing Tags: ${hasClosingTags ? '✓' : '✗'}`);
        
        // Check for common XML errors
        const hasUnescapedAmpersands = xmlData.includes(' & ') && !xmlData.includes(' & ');
        const hasUnescapedLtGt = xmlData.includes('<') && xmlData.includes('>') && 
                                !xmlData.includes('<') && !xmlData.includes('>');
        
        if (hasUnescapedAmpersands) {
          console.log(`  ⚠️  Warning: Possible unescaped ampersands`);
        }
        if (hasUnescapedLtGt) {
          console.log(`  ⚠️  Warning: Possible unescaped < or > characters`);
        }
        
        const isValid = hasXmlDeclaration && hasUrlset && hasUrls > 0 && hasClosingTags;
        
        if (isValid) {
          console.log(`  ✓ XML structure appears valid with ${hasUrls} URLs`);
          resolve({ success: true, urlCount: hasUrls, xmlData });
        } else {
          console.log(`  ✗ XML structure validation failed`);
          resolve({ success: false, urlCount: hasUrls, xmlData });
        }
      });
    }).on('error', (err) => {
      console.log(`  ✗ Failed to fetch XML: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Test 3: Performance Check
 */
async function testPerformance() {
  console.log('\n🧪 Test 3: Performance Check');
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    let timedOut = false;
    
    const timeout = setTimeout(() => {
      timedOut = true;
      console.log(`  ✗ Sitemap generation timed out (> ${MAX_EXECUTION_TIME}ms)`);
      resolve({ success: false, timedOut: true, executionTime: MAX_EXECUTION_TIME });
    }, MAX_EXECUTION_TIME + 1000); // Add 1 second buffer
    
    http.get(SITEMAP_URL, (res) => {
      clearTimeout(timeout);
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      console.log(`  Execution Time: ${executionTime}ms`);
      console.log(`  Timeout Limit: ${MAX_EXECUTION_TIME}ms`);
      
      if (executionTime <= MAX_EXECUTION_TIME) {
        console.log(`  ✓ Sitemap generated within ${MAX_EXECUTION_TIME}ms limit`);
        resolve({ success: true, executionTime, timedOut: false });
      } else {
        console.log(`  ⚠️  Warning: Sitemap generation took ${executionTime}ms (over ${MAX_EXECUTION_TIME}ms limit)`);
        resolve({ success: true, executionTime, timedOut: false, warning: 'Slow generation' });
      }
      
      res.resume();
    }).on('error', (err) => {
      clearTimeout(timeout);
      console.log(`  ✗ Performance test failed: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Test 4: Static vs Dynamic Comparison
 */
async function testStaticVsDynamic() {
  console.log('\n🧪 Test 4: Static vs Dynamic Sitemap Comparison');
  
  return new Promise((resolve) => {
    http.get(STATIC_SITEMAP_URL, (res) => {
      let staticData = '';
      res.on('data', (chunk) => { staticData += chunk; });
      
      res.on('end', () => {
        const staticUrlCount = (staticData.match(/<url>/g) || []).length;
        
        http.get(SITEMAP_URL, (res2) => {
          let dynamicData = '';
          res2.on('data', (chunk) => { dynamicData += chunk; });
          
          res2.on('end', () => {
            const dynamicUrlCount = (dynamicData.match(/<url>/g) || []).length;
            
            console.log(`  Static Sitemap URLs: ${staticUrlCount}`);
            console.log(`  Dynamic Sitemap URLs: ${dynamicUrlCount}`);
            
            if (dynamicUrlCount > staticUrlCount) {
              console.log(`  ✓ Dynamic sitemap has ${dynamicUrlCount - staticUrlCount} more URLs than static`);
            } else if (dynamicUrlCount === staticUrlCount) {
              console.log(`  ⚠️  Warning: Dynamic and static sitemaps have same URL count`);
            } else {
              console.log(`  ✗ Dynamic sitemap has fewer URLs than static`);
            }
            
            // Check if static sitemap is just a redirect notice
            const isRedirectNotice = staticData.includes('Dynamic Sitemap Redirect') || 
                                    staticData.includes('temporary static sitemap');
            
            if (isRedirectNotice) {
              console.log(`  ✓ Static sitemap is correctly configured as redirect notice`);
            } else {
              console.log(`  ⚠️  Warning: Static sitemap may not be configured as redirect`);
            }
            
            resolve({ 
              success: true, 
              staticUrlCount, 
              dynamicUrlCount,
              isRedirectNotice 
            });
          });
        }).on('error', (err) => {
          console.log(`  ✗ Failed to fetch dynamic sitemap: ${err.message}`);
          resolve({ success: false, error: err.message });
        });
      });
    }).on('error', (err) => {
      console.log(`  ✗ Failed to fetch static sitemap: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Test 5: Lastmod Field Validation
 */
async function testLastmodFields() {
  console.log('\n🧪 Test 5: Lastmod Field Validation');
  
  return new Promise((resolve) => {
    http.get(SITEMAP_URL, (res) => {
      let xmlData = '';
      res.on('data', (chunk) => { xmlData += chunk; });
      
      res.on('end', () => {
        // Extract all lastmod dates
        const lastmodMatches = xmlData.match(/<lastmod>([^<]+)<\/lastmod>/g) || [];
        const lastmodDates = lastmodMatches.map(match => 
          match.replace('<lastmod>', '').replace('</lastmod>', '')
        );
        
        console.log(`  Total lastmod fields: ${lastmodDates.length}`);
        
        // Check for valid ISO dates
        const validDates = lastmodDates.filter(date => {
          try {
            const d = new Date(date);
            return !isNaN(d.getTime()) && date.includes('T') && date.includes('Z');
          } catch {
            return false;
          }
        });
        
        const invalidDates = lastmodDates.filter(date => !validDates.includes(date));
        
        console.log(`  Valid ISO dates: ${validDates.length}`);
        console.log(`  Invalid dates: ${invalidDates.length}`);
        
        if (invalidDates.length > 0) {
          console.log(`  ⚠️  Warning: Found ${invalidDates.length} invalid lastmod dates`);
          invalidDates.slice(0, 3).forEach(date => {
            console.log(`    - "${date}"`);
          });
        }
        
        // Check for hardcoded dates (all same)
        const uniqueDates = [...new Set(lastmodDates)];
        console.log(`  Unique date values: ${uniqueDates.length}`);
        
        if (uniqueDates.length === 1 && lastmodDates.length > 10) {
          console.log(`  ⚠️  Warning: All ${lastmodDates.length} URLs have same lastmod date`);
        }
        
        resolve({ 
          success: invalidDates.length === 0, 
          totalDates: lastmodDates.length,
          validDates: validDates.length,
          invalidDates: invalidDates.length,
          uniqueDates: uniqueDates.length
        });
      });
    }).on('error', (err) => {
      console.log(`  ✗ Failed to fetch sitemap: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Main test runner
 */
async function runAllTests() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  try {
    const test1 = await testApiAvailability();
    results.tests.push({ name: 'API Availability', ...test1 });
    
    const test2 = await testXmlValidity();
    results.tests.push({ name: 'XML Validity', ...test2 });
    
    const test3 = await testPerformance();
    results.tests.push({ name: 'Performance', ...test3 });
    
    const test4 = await testStaticVsDynamic();
    results.tests.push({ name: 'Static vs Dynamic', ...test4 });
    
    const test5 = await testLastmodFields();
    results.tests.push({ name: 'Lastmod Fields', ...test5 });
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(50));
    
    const passedTests = results.tests.filter(t => t.success).length;
    const totalTests = results.tests.length;
    
    results.tests.forEach((test, index) => {
      const icon = test.success ? '✅' : '❌';
      console.log(`${icon} Test ${index + 1}: ${test.name}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! Sitemap is healthy and production-ready.');
    } else {
      console.log('\n⚠️  Some tests failed. Review the issues above.');
    }
    
    // Save results to file
    const resultsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const reportFile = path.join(resultsDir, `sitemap-health-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    console.log(`\n📄 Report saved to: ${reportFile}`);
    
    return results;
    
  } catch (error) {
    console.error('Fatal error running tests:', error);
    return { success: false, error: error.message };
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then(results => {
    process.exit(results.tests?.every(t => t.success) ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };