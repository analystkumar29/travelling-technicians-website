const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

async function testBookingFormStability() {
  console.log('🧪 Testing booking form stability...');
  
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Track console messages to detect reload loops
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      console.log('📝 Console:', msg.text());
    });
    
    // Track navigation to detect page reloads
    let navigationCount = 0;
    page.on('framenavigated', () => {
      navigationCount++;
      console.log(`🔄 Navigation count: ${navigationCount}`);
    });
    
    console.log('📱 Navigating to booking page...');
    await page.goto('http://localhost:3000/book-online', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('⏱️  Waiting 10 seconds to check for stability...');
    await page.waitForTimeout(10000);
    
    // Check if there were excessive navigations (indicating reload loops)
    if (navigationCount > 3) {
      console.error(`❌ FAILED: Too many reloads detected (${navigationCount})`);
      return false;
    }
    
    // Check for Fast Refresh warnings
    const fastRefreshWarnings = consoleMessages.filter(msg => 
      msg.includes('Fast Refresh had to perform a full reload')
    );
    
    if (fastRefreshWarnings.length > 2) {
      console.error(`❌ FAILED: Too many Fast Refresh warnings (${fastRefreshWarnings.length})`);
      return false;
    }
    
    console.log('✅ SUCCESS: Booking form is stable!');
    console.log(`📊 Stats: ${navigationCount} navigations, ${fastRefreshWarnings.length} Fast Refresh warnings`);
    
    return true;
    
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
if (require.main === module) {
  testBookingFormStability()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test error:', error);
      process.exit(1);
    });
}

module.exports = { testBookingFormStability }; 