// Test script for the bookings endpoints
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testBookingEndpoints() {
  console.log('=== TESTING BOOKING ENDPOINTS ===');
  
  try {
    // Send request to the bookings index endpoint
    console.log('Fetching all bookings via API...');
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${devServer}/api/bookings`);
    
    console.log(`API response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API fetch failed:', errorText.substring(0, 500) + '...');
      
      // Try the findByReference endpoint with a test reference
      console.log('\nTrying findByReference endpoint...');
      const testRef = 'TEST-999999-999';
      const refResponse = await fetch(`${devServer}/api/bookings/findByReference?reference=${testRef}`);
      console.log(`findByReference API response status: ${refResponse.status} ${refResponse.statusText}`);
      
      if (!refResponse.ok) {
        const refErrorText = await refResponse.text();
        console.error('findByReference API fetch failed:', refErrorText.substring(0, 500) + '...');
      } else {
        const refData = await refResponse.json();
        console.log('findByReference API response data:', refData);
      }
      
      return { success: false, error: 'API fetch failed' };
    }
    
    const data = await response.json();
    console.log('API response data:', {
      success: data.success,
      bookingsCount: data.bookings?.length || 0
    });
    
    if (data.bookings && data.bookings.length > 0) {
      console.log('\nSample booking data (first booking):');
      const first = data.bookings[0];
      console.log({
        referenceNumber: first.referenceNumber,
        customer: first.customer && {
          name: first.customer.name,
          email: first.customer.email && `${first.customer.email.slice(0, 3)}...`
        },
        device: first.device && {
          type: first.device.type,
          brand: first.device.brand,
          model: first.device.model
        },
        service: first.service && {
          type: first.service.type
        },
        status: first.status,
        appointment: first.appointment && {
          date: first.appointment.date,
          time: first.appointment.time
        }
      });
      
      // Now try to fetch this specific booking by reference
      const reference = first.referenceNumber;
      console.log(`\nFetching specific booking with reference: ${reference}`);
      
      const getReferenceResponse = await fetch(`${devServer}/api/bookings/${reference}`);
      
      console.log(`Get reference API response status: ${getReferenceResponse.status} ${getReferenceResponse.statusText}`);
      
      if (!getReferenceResponse.ok) {
        const refErrorText = await getReferenceResponse.text();
        console.error('Get reference API fetch failed:', refErrorText.substring(0, 500) + '...');
      } else {
        const refData = await getReferenceResponse.json();
        console.log('Get reference API response data:', {
          referenceNumber: refData.referenceNumber,
          customerName: refData.customer && refData.customer.name,
          status: refData.status
        });
      }
    } else {
      console.log('No bookings found in the database.');
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Exception during test:', err);
    return { success: false, error: err.message };
  }
}

// Run the test
testBookingEndpoints(); 