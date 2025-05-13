// Test script for the full booking flow
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Helper to generate unique reference for testing
const generateTestReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp}-${random}`;
};

// Test the full booking flow
async function testFullBookingFlow() {
  console.log('=== TESTING FULL BOOKING FLOW ===');
  
  // Create unique identifiers for this test run
  const testRef = generateTestReference();
  
  // Step 1: Create test booking data
  const bookingData = {
    // This matches the format expected by the frontend/API
    deviceType: 'mobile',
    brand: 'Apple', // Using 'brand' as the API expects this
    model: 'iPhone 13',
    serviceType: 'screen_replacement',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09-11',
    customerName: `Test User ${testRef}`,
    customerEmail: `test_${testRef}@example.com`,
    customerPhone: '5551234567',
    address: '123 Test Street, Vancouver, BC',
    postalCode: 'V6B 1A1',
    message: `Test booking created for automated testing. Reference: ${testRef}`
  };
  
  console.log('Test data:', {
    customerName: bookingData.customerName,
    reference: testRef,
    device: `${bookingData.brand} ${bookingData.model}`,
    service: bookingData.serviceType
  });
  
  let bookingReference;
  
  try {
    // Step 2: Submit the booking via API
    console.log('\n--- STEP 1: Creating booking ---');
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    
    // Create booking - workaround due to direct Supabase issues
    const response = await fetch(`${devServer}/api/test/create-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.booking_reference) {
      throw new Error(`API returned success=false: ${JSON.stringify(result)}`);
    }
    
    bookingReference = result.booking_reference;
    console.log(`Booking created successfully with reference: ${bookingReference}`);
    
    // Step 3: Retrieve the booking
    console.log('\n--- STEP 2: Retrieving booking ---');
    const getResponse = await fetch(`${devServer}/api/bookings/${bookingReference}`);
    
    if (!getResponse.ok) {
      const error = await getResponse.text();
      throw new Error(`Get API error: ${getResponse.status} - ${error}`);
    }
    
    const booking = await getResponse.json();
    console.log('Retrieved booking successfully:', {
      reference: booking.referenceNumber,
      customer: booking.customer.name,
      device: `${booking.device.brand} ${booking.device.model}`,
      status: booking.status
    });
    
    // Step 4: Update the booking
    console.log('\n--- STEP 3: Updating booking ---');
    const updateData = {
      appointmentTime: '13-15', // Change time slot
      issueDescription: `Updated test description ${testRef}`
    };
    
    const updateResponse = await fetch(`${devServer}/api/bookings/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: bookingReference,
        ...updateData
      })
    });
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Update API error: ${updateResponse.status} - ${error}`);
    }
    
    const updateResult = await updateResponse.json();
    console.log('Booking updated successfully:', {
      reference: updateResult.booking.referenceNumber,
      appointmentTime: updateResult.booking.appointment.time,
      issueDescription: updateResult.booking.service.description
    });
    
    // Step 5: Clean up (delete booking)
    // Note: You might need to create an endpoint for this as it's an admin operation
    
    // Final result
    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
    console.log(`Booking reference for manual verification: ${bookingReference}`);
    
    return {
      success: true,
      reference: bookingReference
    };
    
  } catch (error) {
    console.error('Test failed with error:', error);
    return {
      success: false,
      error: error.message,
      reference: bookingReference
    };
  }
}

// Run the test
testFullBookingFlow(); 