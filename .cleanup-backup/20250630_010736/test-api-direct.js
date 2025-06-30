// Simple test for the existing booking API
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testExistingBookingApi() {
  console.log('=== TESTING EXISTING BOOKING API ===');
  
  // Create test booking data in the format expected by the frontend
  const bookingData = {
    deviceType: 'mobile',
    brand: 'Apple',
    model: 'iPhone 13',
    serviceType: 'screen_replacement',
    appointmentDate: new Date().toISOString().split('T')[0], // Today's date
    appointmentTime: '09-11',
    customerName: `API Test User ${Date.now().toString().slice(-6)}`,
    customerEmail: `api_test_${Date.now()}@example.com`,
    customerPhone: `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    address: '123 Test Street, Vancouver, BC',
    postalCode: 'V6B 1A1',
    message: 'API test booking'
  };
  
  console.log('Booking data to send:', bookingData);
  
  try {
    // Send POST request to the booking API endpoint
    console.log('\nSending request to booking API...');
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const response = await fetch(`${devServer}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log('Response text:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Response data:', responseData);
    } catch (e) {
      console.log('Response is not valid JSON');
    }
    
    if (!response.ok) {
      console.error('API request failed');
    } else {
      console.log('API request succeeded');
      
      // If we have a reference, try to retrieve it
      if (responseData && responseData.booking_reference) {
        const ref = responseData.booking_reference;
        console.log(`\nTrying to fetch booking with reference: ${ref}`);
        
        const getResponse = await fetch(`${devServer}/api/bookings/${ref}`);
        const getData = await getResponse.json();
        
        console.log(`Get response status: ${getResponse.status}`);
        console.log('Retrieved booking data:', getData);
      }
    }
  } catch (err) {
    console.error('Exception during test:', err);
  }
}

// Run the test
testExistingBookingApi(); 