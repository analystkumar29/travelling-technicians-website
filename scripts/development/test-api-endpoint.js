// Test script to analyze API error
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Create full booking data
function createFullBookingData() {
  // Generate a unique reference for logging
  const refNum = Date.now().toString().slice(-6);
  
  // Try several combinations of field names
  return {
    // Field variations
    deviceType: 'mobile',
    brand: 'Apple',
    model: 'iPhone 13',
    deviceBrand: 'Apple (backup field)',  // Alternative field name
    deviceModel: 'iPhone 13 (backup field)',  // Alternative field name
    
    serviceType: 'screen_replacement',
    
    // Various date/time field names
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09-11',
    bookingDate: new Date().toISOString().split('T')[0],  // Alternative field name
    bookingTime: '09-11',  // Alternative field name
    
    // Contact info
    customerName: `API Test User ${refNum}`,
    customerEmail: `api_test_${refNum}@example.com`,
    customerPhone: `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    
    // Location info
    address: '123 Test Street, Vancouver, BC',
    postalCode: 'V6B 1A1',
    
    // Additional fields
    message: `API test booking ${refNum}`,
    issueDescription: `API test booking description ${refNum}`,  // Alternative field name
  };
}

async function testApiCall(data, description) {
  console.log(`\n--- Testing API with ${description} ---`);
  console.log('Request data:', data);
  
  try {
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const response = await fetch(`${devServer}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Response data:', responseData);
    } catch (e) {
      console.log('Response is not valid JSON:', responseText);
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    };
  } catch (err) {
    console.error('Exception during test:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

async function runApiTests() {
  console.log('=== API ENDPOINT ANALYSIS ===');
  
  // Start with full data
  const fullData = createFullBookingData();
  
  // Test full data
  const fullResult = await testApiCall(fullData, 'full data set');
  
  // If full data doesn't work, let's try individual field combinations
  if (!fullResult.success) {
    console.log('\n=== Testing Field Combinations ===');
    
    // Test with different appointment date/time field combinations
    const dateTimeTest = {
      ...fullData,
      // Remove all date fields, then add back specific ones
      appointmentDate: undefined,
      appointmentTime: undefined,
      bookingDate: undefined,
      bookingTime: undefined
    };
    
    // Test 1: appointmentDate + appointmentTime only
    await testApiCall({
      ...dateTimeTest,
      appointmentDate: fullData.appointmentDate,
      appointmentTime: fullData.appointmentTime
    }, 'appointmentDate + appointmentTime fields');
    
    // Test 2: bookingDate + bookingTime only
    await testApiCall({
      ...dateTimeTest,
      bookingDate: fullData.bookingDate,
      bookingTime: fullData.bookingTime
    }, 'bookingDate + bookingTime fields');
    
    // Test device fields
    const deviceTest = {
      ...fullData,
      brand: undefined,
      model: undefined,
      deviceBrand: undefined,
      deviceModel: undefined
    };
    
    // Test 3: deviceBrand + deviceModel only
    await testApiCall({
      ...deviceTest,
      deviceBrand: fullData.deviceBrand,
      deviceModel: fullData.deviceModel
    }, 'deviceBrand + deviceModel fields');
    
    // Test 4: brand + model only
    await testApiCall({
      ...deviceTest,
      brand: fullData.brand,
      model: fullData.model
    }, 'brand + model fields');
    
    // Test message fields
    const messageTest = {
      ...fullData,
      message: undefined,
      issueDescription: undefined
    };
    
    // Test 5: message field only
    await testApiCall({
      ...messageTest,
      message: fullData.message
    }, 'message field only');
    
    // Test 6: issueDescription field only
    await testApiCall({
      ...messageTest,
      issueDescription: fullData.issueDescription
    }, 'issueDescription field only');
    
    // Based on API error, try with essential fields only
    console.log('\n=== Testing Essential Fields ===');
    const essentialFields = {
      deviceType: fullData.deviceType,
      serviceType: fullData.serviceType,
      customerName: fullData.customerName,
      customerEmail: fullData.customerEmail,
      customerPhone: fullData.customerPhone,
      address: fullData.address,
      postalCode: fullData.postalCode,
      appointmentDate: fullData.appointmentDate,
      appointmentTime: fullData.appointmentTime
    };
    
    await testApiCall(essentialFields, 'essential fields only');
    
    // Add optional fields one by one to see if any causes errors
    await testApiCall({
      ...essentialFields,
      brand: fullData.brand,
      model: fullData.model
    }, 'essential fields + brand/model');
    
    await testApiCall({
      ...essentialFields,
      message: fullData.message
    }, 'essential fields + message');
  }
}

// Run all the tests
runApiTests(); 