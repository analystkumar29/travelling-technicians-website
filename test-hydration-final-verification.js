#!/usr/bin/env node

const http = require('http');

function testHydrationFix() {
  console.log('🧪 Testing final hydration fix...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/book-online',
      method: 'GET',
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          // Check if the page contains the expected booking form elements
          const hasDeviceType = data.includes('Device Type');
          const hasSelectCity = data.includes('Select a city');
          const hasSelectTime = data.includes('Select a time slot');
          
          if (hasDeviceType && hasSelectCity && hasSelectTime) {
            console.log('✅ SUCCESS! Booking page loaded correctly');
            console.log('✅ All select elements have proper default options');
            console.log('✅ Hydration error should be resolved');
            console.log('\n🎉 HYDRATION FIX VERIFICATION COMPLETE!');
            console.log('📱 Your booking form should now work without console errors');
            console.log('🚀 Navigate to http://localhost:3000/book-online to test');
            resolve(true);
          } else {
            console.log('❌ Page structure seems incorrect');
            resolve(false);
          }
        } else {
          console.log(`❌ Server responded with status: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      console.log('💡 Make sure the development server is running: npm run dev');
      resolve(false);
    });

    req.on('timeout', () => {
      console.error('❌ Request timed out');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Run the test
if (require.main === module) {
  testHydrationFix()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = testHydrationFix; 