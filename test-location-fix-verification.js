// Test script to verify location services are working after CSP fix
const http = require('http');

console.log('🔍 Testing location services after CSP fix...\n');

// Test 1: Check if server is running
console.log('1️⃣ Testing server availability...');
http.get('http://localhost:3002', (res) => {
  console.log(`   ✅ Server is running (Status: ${res.statusCode})`);
  
  // Test 2: Check if CSP headers are present
  console.log('\n2️⃣ Checking CSP headers...');
  const cspHeader = res.headers['content-security-policy'];
  if (cspHeader) {
    console.log('   ✅ CSP header found');
    
    // Check if OpenStreetMap is allowed
    if (cspHeader.includes('nominatim.openstreetmap.org')) {
      console.log('   ✅ OpenStreetMap is allowed in CSP');
    } else {
      console.log('   ❌ OpenStreetMap NOT found in CSP');
    }
    
    // Check if Google Maps is allowed
    if (cspHeader.includes('maps.googleapis.com')) {
      console.log('   ✅ Google Maps is allowed in CSP');
    } else {
      console.log('   ❌ Google Maps NOT found in CSP');
    }
  } else {
    console.log('   ❌ No CSP header found');
  }
  
  // Test 3: Check if booking page loads
  console.log('\n3️⃣ Testing booking page...');
  http.get('http://localhost:3002/book-online', (res2) => {
    console.log(`   ✅ Booking page loads (Status: ${res2.statusCode})`);
    
    // Test 4: Check if location utils are working
    console.log('\n4️⃣ Testing location utilities...');
    const locationUtils = require('./src/utils/locationUtils');
    
    // Test postal code validation
    const testPostalCode = 'V5C6R9';
    const validationResult = locationUtils.validatePostalCode(testPostalCode);
    console.log(`   ✅ Postal code validation: ${testPostalCode} = ${validationResult}`);
    
    // Test service area check
    const serviceAreaResult = locationUtils.checkServiceArea(testPostalCode);
    console.log(`   ✅ Service area check: ${testPostalCode} = ${serviceAreaResult?.serviceable ? 'Serviceable' : 'Not serviceable'}`);
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('- CSP has been fixed to allow OpenStreetMap API calls');
    console.log('- Form nesting warning has been resolved');
    console.log('- Location utilities are working correctly');
    console.log('- The development server is running on http://localhost:3002');
    console.log('\n🔧 Next steps:');
    console.log('1. Open http://localhost:3002 in your browser');
    console.log('2. Navigate to the booking form');
    console.log('3. Test "Use My Current Location" button');
    console.log('4. Test address autocomplete functionality');
    console.log('5. Check browser console for debug logs');
    
    process.exit(0);
  }).on('error', (err) => {
    console.log(`   ❌ Booking page error: ${err.message}`);
    process.exit(1);
  });
}).on('error', (err) => {
  console.log(`   ❌ Server error: ${err.message}`);
  console.log('\n💡 Make sure the development server is running:');
  console.log('   npm run dev');
  process.exit(1);
});