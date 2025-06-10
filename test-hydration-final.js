const puppeteer = require('puppeteer');

async function testBookingFormHydration() {
  let browser;
  try {
    console.log('🧪 Testing booking form hydration...');
    
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages, especially errors
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      console.log(`🔍 Console: ${text}`);
      consoleMessages.push(text);
    });
    
    // Listen for page errors
    page.on('pageerror', err => {
      console.error('❌ Page Error:', err.message);
    });
    
    console.log('📄 Loading booking page...');
    await page.goto('http://localhost:3000/book-online', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for the form to load
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Booking form loaded');
    
    // Test device type selection
    await page.click('input[value="mobile"]');
    console.log('✅ Selected mobile device type');
    
    // Wait a moment for brand options to appear
    await page.waitForTimeout(1000);
    
    // Test brand selection
    await page.click('input[value="apple"]');
    console.log('✅ Selected Apple brand');
    
    // Wait for model selector to appear
    await page.waitForTimeout(1000);
    
    // Check if DeviceModelSelector appears
    const modelSelector = await page.$('select');
    if (modelSelector) {
      console.log('✅ Device model selector found');
      
      // Try to select a model
      await page.select('select', 'iPhone 15 Pro Max');
      console.log('✅ Selected iPhone model');
    }
    
    // Check for hydration errors in console messages
    const hydrationErrors = consoleMessages.filter(msg => 
      msg.includes('Warning: Use the `defaultValue` or `value` props on <select>') ||
      msg.includes('selected on <option>') ||
      msg.includes('hydration')
    );
    
    if (hydrationErrors.length > 0) {
      console.error('❌ Hydration errors found:');
      hydrationErrors.forEach(err => console.error(`   - ${err}`));
      return false;
    } else {
      console.log('✅ No hydration errors detected!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testBookingFormHydration().then(success => {
  if (success) {
    console.log('🎉 All tests passed! Booking form is working without hydration errors.');
    process.exit(0);
  } else {
    console.log('💥 Tests failed. There are still issues to fix.');
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
}); 