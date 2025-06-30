// Test script for the Supabase booking flow using the test API endpoint
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Generate a unique test reference
function generateTestReference() {
  return `${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

// Test booking creation via the test endpoint
async function testBookingCreation() {
  console.log('=== TESTING BOOKING CREATION ===');
  
  // Create a unique reference for this test
  const testRef = generateTestReference();
  
  // Create test booking data
  const bookingData = {
    deviceType: 'mobile',
    brand: 'Apple',
    model: 'iPhone 13',
    serviceType: 'screen_replacement',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09-11',
    customerName: `Test User ${testRef}`,
    customerEmail: `test_${testRef}@example.com`,
    customerPhone: '5551234567',
    address: '123 Test Street, Vancouver, BC',
    postalCode: 'V6B 1A1',
    message: `Test booking for verification ${testRef}`
  };
  
  console.log('Test booking data:', {
    reference: testRef,
    name: bookingData.customerName,
    device: `${bookingData.brand} ${bookingData.model}`,
    date: bookingData.appointmentDate
  });
  
  try {
    // Use our special test endpoint to create the booking
    console.log('\nCreating booking via test endpoint...');
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${devServer}/api/test/create-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
      console.log('API response:', responseData);
    } catch (e) {
      console.error('Response is not valid JSON:', responseText);
      return { success: false, error: 'Invalid JSON response' };
    }
    
    if (!response.ok || !responseData.success) {
      console.error('API request failed:', response.status, response.statusText);
      return { success: false, error: responseData.message || 'Unknown error' };
    }
    
    const bookingReference = responseData.booking_reference;
    console.log(`Booking created successfully with reference: ${bookingReference}`);
    
    return { success: true, reference: bookingReference };
  } catch (error) {
    console.error('Exception during booking creation:', error);
    return { success: false, error: error.message };
  }
}

// Test fetching a booking by reference
async function testFetchBooking(reference) {
  console.log('\n=== TESTING BOOKING RETRIEVAL ===');
  console.log(`Fetching booking with reference: ${reference}`);
  
  try {
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const response = await fetch(`${devServer}/api/bookings/${reference}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch booking:', response.status, errorText);
      return { success: false, error: errorText };
    }
    
    const bookingData = await response.json();
    console.log('Booking retrieved successfully:', {
      reference: bookingData.referenceNumber,
      customer: bookingData.customer?.name,
      device: `${bookingData.device?.brand || 'Unknown'} ${bookingData.device?.model || ''}`,
      status: bookingData.status
    });
    
    return { success: true, booking: bookingData };
  } catch (error) {
    console.error('Exception during booking retrieval:', error);
    return { success: false, error: error.message };
  }
}

// Test updating a booking
async function testUpdateBooking(reference) {
  console.log('\n=== TESTING BOOKING UPDATE ===');
  console.log(`Updating booking with reference: ${reference}`);
  
  const updateData = {
    reference: reference,
    appointmentTime: '13-15', // Change to afternoon
    issueDescription: `Updated description at ${new Date().toISOString()}`
  };
  
  try {
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const response = await fetch(`${devServer}/api/bookings/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update booking:', response.status, errorText);
      return { success: false, error: errorText };
    }
    
    const result = await response.json();
    console.log('Booking updated successfully:', {
      reference: result.booking.referenceNumber,
      time: result.booking.appointment.time,
      description: result.booking.service.description
    });
    
    return { success: true, booking: result.booking };
  } catch (error) {
    console.error('Exception during booking update:', error);
    return { success: false, error: error.message };
  }
}

// Run all tests in sequence
async function runAllTests() {
  console.log('=======================================');
  console.log('=== SUPABASE BOOKING FLOW TEST SUITE ===');
  console.log('=======================================\n');
  
  // Test 1: Create a booking
  const createResult = await testBookingCreation();
  if (!createResult.success) {
    console.error('\n❌ TEST FAILED: Could not create booking');
    return false;
  }
  
  const reference = createResult.reference;
  
  // Test 2: Fetch the booking
  const fetchResult = await testFetchBooking(reference);
  if (!fetchResult.success) {
    console.error('\n❌ TEST FAILED: Could not fetch booking');
    return false;
  }
  
  // Test 3: Update the booking
  const updateResult = await testUpdateBooking(reference);
  if (!updateResult.success) {
    console.error('\n❌ TEST FAILED: Could not update booking');
    return false;
  }
  
  // All tests passed!
  console.log('\n✅ ALL TESTS PASSED!');
  console.log(`Booking reference for manual verification: ${reference}`);
  console.log('=======================================');
  
  return true;
}

// Run the tests
runAllTests(); 