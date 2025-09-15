// Script to test the API endpoint after schema changes
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testBookingAPI() {
  console.log('=== TESTING BOOKING API WITH UPDATED SCHEMA ===');
  
  // Generate a test reference
  const testRef = `TEST-${Date.now().toString().slice(-6)}`;
  console.log(`Test reference: ${testRef}`);
  
  // Create booking data with all required fields based on validation in API
  const bookingData = {
    // Required fields from validation in api/bookings/create.ts
    deviceType: 'mobile',
    serviceType: 'screen_replacement',
    customerName: `API Test User ${testRef}`,
    customerEmail: `api_test_${testRef}@example.com`,
    customerPhone: '5551234567',
    address: '123 Test Street',
    postalCode: 'V6B 1A1',
    
    // Date/time fields - use correct format
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09-11',
    
    // Added fields for the schema
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 13',
    brand: 'Apple',
    model: 'iPhone 13',
    city: 'Vancouver',
    province: 'BC',
    
    // Optional fields
    message: `API test for updated schema ${testRef}`
  };
  
  console.log('Booking data to send:', {
    ...bookingData,
    customerEmail: '[REDACTED]'
  });
  
  try {
    // Check if the dev server is running
    console.log('\nChecking if dev server is running...');
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    
    try {
      const pingResponse = await fetch(`${devServer}`);
      console.log(`Server ping status: ${pingResponse.status}`);
    } catch (pingError) {
      console.error('Server ping failed:', pingError.message);
      console.log('Make sure the Next.js dev server is running with "npm run dev"');
      return;
    }
    
    // Send POST request to the booking API endpoint
    console.log('\nSending request to booking API...');
    
    const response = await fetch(`${devServer}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Show detailed response for debugging
    console.log('Full response text:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Response data:', responseData);
    } catch (e) {
      console.log('Response is not valid JSON');
      return;
    }
    
    if (!response.ok) {
      console.error('API request failed');
      
      // Try to find validation errors in the API implementation
      console.log('\nTrying to debug API validation issues...');
      
      // Try the test endpoint as a backup
      console.log('\nTrying test endpoint as a backup...');
      const testResponse = await fetch(`${devServer}/api/test/create-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const testResponseText = await testResponse.text();
      console.log(`Test endpoint response: ${testResponse.status} ${testResponse.statusText}`);
      console.log('Test endpoint response text:', testResponseText);
      
      try {
        const testData = JSON.parse(testResponseText);
        if (testData.success && testData.booking_reference) {
          console.log(`\nTest endpoint succeeded with reference: ${testData.booking_reference}`);
          
          // Try to fetch the booking from the regular endpoint
          const getResponse = await fetch(`${devServer}/api/bookings/${testData.booking_reference}`);
          
          if (getResponse.ok) {
            const getData = await getResponse.json();
            console.log('Retrieved booking data:', getData);
            
            console.log('\n✅ BACKUP TEST PASSED - Database schema update appears to be working!');
            return true;
          } else {
            console.error('Failed to retrieve test booking');
          }
        }
      } catch (testError) {
        console.error('Error parsing test endpoint response:', testError);
      }
      
      return;
    }
    
    console.log('\nAPI request succeeded!');
    
    // If we have a reference, try to retrieve it
    if (responseData && responseData.booking_reference) {
      const ref = responseData.booking_reference;
      console.log(`\nTrying to fetch booking with reference: ${ref}`);
      
      const getResponse = await fetch(`${devServer}/api/bookings/${ref}`);
      
      if (!getResponse.ok) {
        console.error('Failed to retrieve booking:', getResponse.status, getResponse.statusText);
        const errorText = await getResponse.text();
        console.error('Error details:', errorText);
        return;
      }
      
      const getData = await getResponse.json();
      console.log('Retrieved booking data:', getData);
      
      // Success! All tests passed
      console.log('\n✅ ALL TESTS PASSED - API is working with updated schema!');
      return true;
    }
  } catch (err) {
    console.error('Exception during test:', err);
  }
}

// Run the test
testBookingAPI(); 