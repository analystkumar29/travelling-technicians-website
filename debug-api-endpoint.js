// Debug script to identify exact API endpoint validation failures
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Function to generate test data with all fields
function generateCompleteBookingData(testRef) {
  return {
    // Core required fields
    deviceType: 'mobile',
    serviceType: 'screen_replacement',
    customerName: `API Test User ${testRef}`,
    customerEmail: `api_test_${testRef}@example.com`,
    customerPhone: '5551234567',
    address: '123 Test Street',
    postalCode: 'V6B 1A1',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09-11',
    
    // Fields needed due to schema/triggers
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 13',
    brand: 'Apple',  // Same as deviceBrand
    model: 'iPhone 13',  // Same as deviceModel
    city: 'Vancouver',
    province: 'BC',
    
    // Optional fields
    message: `API test for updated schema ${testRef}`
  };
}

// Function to test API with different field combinations
async function testAPIWithFields(fieldSet) {
  const testRef = Date.now().toString().slice(-6);
  console.log(`\n=== TESTING API WITH FIELD SET: ${fieldSet} ===`);
  
  // Start with complete data
  const completeData = generateCompleteBookingData(testRef);
  let testData;
  
  // Create different subsets of fields based on the fieldSet parameter
  switch (fieldSet) {
    case 'minimal':
      // Only the absolutely required fields according to API validation
      testData = {
        deviceType: completeData.deviceType,
        serviceType: completeData.serviceType,
        customerName: completeData.customerName,
        customerEmail: completeData.customerEmail,
        customerPhone: completeData.customerPhone,
        address: completeData.address,
        postalCode: completeData.postalCode,
        appointmentDate: completeData.appointmentDate,
        appointmentTime: completeData.appointmentTime,
      };
      break;
    case 'trigger-fields':
      // Include fields needed by triggers
      testData = {
        ...completeData,
        // Remove potential problematic fields
        city: undefined,
        province: undefined,
        message: undefined
      };
      break;
    case 'alternative-names':
      // Try using different field names seen in other parts of the code
      testData = {
        ...completeData,
        // Use alternative names for some fields
        bookingDate: completeData.appointmentDate,
        bookingTime: completeData.appointmentTime,
        appointmentDate: undefined,
        appointmentTime: undefined,
        issueDescription: completeData.message,
        message: undefined
      };
      break;
    case 'db-names':
      // Try using database column names directly
      testData = {
        device_type: completeData.deviceType,
        service_type: completeData.serviceType,
        customer_name: completeData.customerName,
        customer_email: completeData.customerEmail,
        customer_phone: completeData.customerPhone,
        address: completeData.address,
        postal_code: completeData.postalCode,
        booking_date: completeData.appointmentDate,
        booking_time: completeData.appointmentTime,
        device_brand: completeData.deviceBrand,
        device_model: completeData.deviceModel,
        issue_description: completeData.message,
        city: completeData.city,
        province: completeData.province,
        brand: completeData.brand,
        model: completeData.model,
      };
      break;
    case 'complete':
    default:
      // Use all fields
      testData = { ...completeData };
      break;
  }
  
  console.log('Sending request with data:', {
    ...testData,
    customerEmail: '[REDACTED]'
  });
  
  try {
    // Send request to API
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const response = await fetch(`${devServer}/api/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    // Print response details
    console.log(`Response status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    
    try {
      // Try to parse as JSON
      const responseData = JSON.parse(responseText);
      console.log('Response data:', responseData);
      
      if (response.ok) {
        console.log(`✅ SUCCESS: Test with field set '${fieldSet}' passed!`);
        return { success: true, data: responseData };
      } else {
        console.log(`❌ FAILED: Test with field set '${fieldSet}' failed.`);
        return { success: false, error: responseData };
      }
    } catch (e) {
      console.log('Response is not valid JSON:', responseText);
      return { success: false, error: 'Invalid JSON response' };
    }
  } catch (err) {
    console.error('Error during API test:', err);
    return { success: false, error: err.message };
  }
}

// Main function to run all tests
async function runAllTests() {
  console.log('=== API ENDPOINT DEBUGGING ===');
  
  // Check server status
  try {
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const serverResponse = await fetch(devServer);
    console.log(`Server status: ${serverResponse.status} ${serverResponse.statusText}`);
  } catch (err) {
    console.error(`ERROR: Server not running at http://localhost:3000. Please start it with 'npm run dev'`);
    return;
  }
  
  // Test with different field combinations
  const tests = [
    'complete',
    'minimal',
    'trigger-fields',
    'alternative-names',
    'db-names',
  ];
  
  const results = {};
  
  for (const test of tests) {
    const result = await testAPIWithFields(test);
    results[test] = result.success;
    
    // If any test passes, we can stop and use that data format
    if (result.success) {
      console.log(`\n✅ TEST PASSED: Found working field set '${test}'`);
      console.log('You can use this format for your API requests');
      break;
    }
  }
  
  // Summary
  console.log('\n=== TEST SUMMARY ===');
  for (const [test, success] of Object.entries(results)) {
    console.log(`${success ? '✅' : '❌'} ${test}`);
  }
  
  // If all tests failed, suggest fixing the API endpoint
  if (Object.values(results).every(r => !r)) {
    console.log('\n❌ ALL TESTS FAILED');
    console.log('Next step: Fix the API endpoint validation or create a custom endpoint.');
  }
}

// Run the tests
runAllTests(); 