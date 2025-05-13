// Test script to test the booking API endpoint
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testBookingApi() {
  console.log('=== TESTING BOOKING API ENDPOINT ===');
  
  // Generate a reference for logging
  const logRef = Date.now().toString().slice(-6);
  
  // Create test booking data in the format expected by the frontend
  const bookingData = {
    deviceType: 'mobile',
    brand: 'Apple',
    model: 'iPhone 13',
    serviceType: 'screen_replacement',
    appointmentDate: new Date().toISOString().split('T')[0], // Today's date
    appointmentTime: '09-11',
    customerName: `API Test User ${logRef}`,
    customerEmail: `api_test_${logRef}@example.com`,
    customerPhone: `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    address: '123 Test Street, Vancouver, BC',
    postalCode: 'V6B 1A1',
    message: `API test booking ${logRef}`
  };
  
  console.log('Booking data to send:', bookingData);
  
  try {
    // Send POST request to the booking API endpoint
    console.log('\nSending request to booking API...');
    const response = await fetch('http://localhost:3000/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    // Parse response
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log('Response is not valid JSON:', responseText);
      return;
    }
    
    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      console.error('Error details:', responseData);
      return;
    }
    
    console.log('API request succeeded:', response.status);
    console.log('Response data:', responseData);
    
    // If we got a booking reference, try to fetch it
    if (responseData.booking_reference) {
      console.log(`\nFetching created booking with reference: ${responseData.booking_reference}`);
      
      const getResponse = await fetch(`http://localhost:3000/api/bookings/${responseData.booking_reference}`);
      
      if (!getResponse.ok) {
        console.error('Failed to retrieve booking:', getResponse.status, getResponse.statusText);
        return;
      }
      
      const getResponseData = await getResponse.json();
      console.log('Retrieved booking:', getResponseData);
    }
  } catch (err) {
    console.error('Exception during API test:', err);
  }
}

// Run the API test
testBookingApi(); 