#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testHydrationFix() {
  console.log('🧪 Testing hydration fix for DeviceModelSelector...');
  
  let browser;
  let testPassed = true;
  const errors = [];
  const consoleMessages = [];
  
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Track console messages and errors
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      
      // Look for hydration warnings specifically
      if (text.includes('Warning: Use the `defaultValue` or `value` props on <select>')) {
        errors.push('❌ HYDRATION ERROR: ' + text);
        testPassed = false;
      }
      
      // Look for Fast Refresh warnings
      if (text.includes('Fast Refresh had to perform a full reload')) {
        errors.push('❌ FAST REFRESH ERROR: ' + text);
        testPassed = false;
      }
      
      console.log('📝 Console:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    });
    
    page.on('pageerror', error => {
      errors.push('❌ PAGE ERROR: ' + error.message);
      testPassed = false;
    });
    
    // Navigate to booking page
    console.log('🔗 Loading booking page...');
    await page.goto('http://localhost:3000/book-online', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for the form to load
    await page.waitForSelector('select', { timeout: 10000 });
    
    // Test device type selection
    console.log('🔧 Testing device type selection...');
    await page.click('input[value="mobile"]');
    
    // Wait a bit to see if any hydration errors occur
    await page.waitForTimeout(2000);
    
    // Test brand selection
    console.log('🔧 Testing brand selection...');
    await page.click('input[value="apple"]');
    
    // Wait for model selector to update
    await page.waitForTimeout(2000);
    
    // Check if model selector is working
    const modelSelector = await page.$('select');
    const isDisabled = await page.evaluate(el => el.disabled, modelSelector);
    
    if (isDisabled) {
      errors.push('❌ MODEL SELECTOR ERROR: Still disabled after brand selection');
      testPassed = false;
    } else {
      console.log('✅ Model selector enabled correctly');
    }
    
    // Test model selection
    console.log('🔧 Testing model selection...');
    await page.select('select', 'iPhone 15 Pro Max');
    
    // Wait to see if any errors occur
    await page.waitForTimeout(3000);
    
    console.log('\n📊 TEST RESULTS:');
    console.log('================');
    
    if (testPassed) {
      console.log('🎉 SUCCESS! No hydration errors detected');
      console.log('✅ DeviceModelSelector working correctly');
      console.log('✅ No Fast Refresh reload loops');
      console.log('✅ Form interaction working smoothly');
    } else {
      console.log('❌ ISSUES DETECTED:');
      errors.forEach(error => console.log(error));
    }
    
    console.log(`\n📝 Total console messages: ${consoleMessages.length}`);
    console.log(`❌ Errors found: ${errors.length}`);
    
    return testPassed;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testHydrationFix()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = testHydrationFix; 