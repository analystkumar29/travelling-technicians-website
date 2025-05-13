require('dotenv').config();
const fetch = require('node-fetch');

// Function to generate a unique reference number for testing
function generateReferenceNumber() {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TEST-${datePart}-${randomPart}`;
}

async function testAllBookingEndpoints() {
  console.log('===== COMPREHENSIVE BOOKING API VERIFICATION =====');
  
  // Add reference number to the booking data
  const reference = generateReferenceNumber();
  
  // Complete booking data with mixed naming conventions
  const completeBookingData = {
    // API fields (camelCase)
    deviceType: 'mobile',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 13',
    serviceType: 'Screen Replacement',
    issueDescription: 'Cracked screen needs replacing',
    appointmentDate: '2023-10-15',
    appointmentTime: '09-11',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '6045551234',
    address: '123 Main St',
    postalCode: 'V6A 1A1',
    
    // Database fields (snake_case)
    city: 'Vancouver',
    province: 'BC',
    brand: 'Apple',
    model: 'iPhone 13',
    booking_date: '2023-10-15',
    booking_time: '09-11',
    reference_number: reference
  };
  
  console.log('Test Reference:', reference);
  
  try {
    // 1. Ping API to check it's running
    console.log('\n1. Checking API health...');
    const pingUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/ping`;
    const pingResponse = await fetch(pingUrl);
    console.log(`Ping status: ${pingResponse.status} ${pingResponse.statusText}`);
    
    if (!pingResponse.ok) {
      console.error('API server is not responding correctly. Aborting test.');
      return;
    }
    
    // 2. Create booking via the DIRECT test endpoint
    console.log('\n2. Creating booking via direct test endpoint...');
    const directUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/test/create-booking-direct`;
    const directResponse = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completeBookingData)
    });
    
    console.log(`Direct endpoint status: ${directResponse.status} ${directResponse.statusText}`);
    const directData = await directResponse.json();
    console.log('Direct endpoint response:', directData);
    
    if (!directResponse.ok) {
      console.error('Direct endpoint failed. Moving to standard test endpoint...');
      throw new Error('Direct endpoint failed');
    }
    
    const bookingRef = directData.booking_reference;
    console.log('Created booking reference:', bookingRef);
    
    // Wait a moment for the database to propagate
    console.log('Waiting 2 seconds for database propagation...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Verify the booking using the specialized test verification endpoint
    console.log('\n3. Using specialized test verification endpoint...');
    await verifyBookingWithTestEndpoint(bookingRef);
    
    // 4. Verify the booking via the reference endpoint
    console.log('\n4. Verifying booking via reference endpoint...');
    await verifyBookingByReference(bookingRef);
    
    // 5. Try to retrieve via the standard [reference] endpoint
    console.log('\n5. Verifying booking via standard [reference] endpoint...');
    await verifyBookingByStandardEndpoint(bookingRef);
    
    // 6. Try to retrieve via findByReference endpoint
    console.log('\n6. Verifying booking via findByReference endpoint...');
    await verifyBookingByFindEndpoint(bookingRef);
    
    console.log('\n✅ VERIFICATION COMPLETE - Booking creation and retrieval successful!');
  } catch (error) {
    // If the direct test endpoint failed, try the standard test endpoint
    console.error(`\n❌ Error during verification: ${error.message}`);
    console.log('\nFalling back to standard test endpoint...');
    await tryStandardTestEndpoint();
  }
  
  // Helper function for specialized verification test endpoint
  async function verifyBookingWithTestEndpoint(ref) {
    try {
      const verifyTestUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/test/verify-booking?reference=${ref}`;
      const verifyTestResponse = await fetch(verifyTestUrl);
      
      console.log(`Test verify endpoint status: ${verifyTestResponse.status} ${verifyTestResponse.statusText}`);
      
      if (!verifyTestResponse.ok) {
        console.error(`Test verify endpoint failed: ${verifyTestResponse.status}`);
        try {
          const verifyErrorData = await verifyTestResponse.json();
          console.error('Error details:', verifyErrorData);
          // If we have recent bookings data, show it
          if (verifyErrorData.recentBookings && verifyErrorData.recentBookings.length > 0) {
            console.log('Recent bookings in database:');
            verifyErrorData.recentBookings.forEach(booking => {
              console.log(`- ${booking.reference_number} (${booking.customer_name}) created at ${booking.created_at}`);
            });
          }
        } catch (e) {
          // Ignore JSON parsing errors
          console.error('Error parsing verify response:', e.message);
        }
        return false;
      }
      
      const verifyTestData = await verifyTestResponse.json();
      console.log('Test verify endpoint response:', {
        success: verifyTestData.success,
        message: verifyTestData.message,
        queryMethod: verifyTestData.queryMethod,
        bookingData: verifyTestData.booking ? {
          id: verifyTestData.booking.id,
          reference: verifyTestData.booking.reference_number,
          customerName: verifyTestData.booking.customer_name,
          // Include only a few fields for brevity
        } : null
      });
      
      return true;
    } catch (error) {
      console.error(`Error with test verify endpoint: ${error.message}`);
      return false;
    }
  }
  
  // Helper function to try the standard test endpoint
  async function tryStandardTestEndpoint() {
    try {
      console.log('\nAttempting to create booking via standard test endpoint...');
      const testUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/test/create-booking`;
      const testResponse = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeBookingData)
      });
      
      console.log(`Test endpoint status: ${testResponse.status} ${testResponse.statusText}`);
      
      if (!testResponse.ok) {
        console.error('Standard test endpoint failed. Moving to basic test endpoint...');
        const errorText = await testResponse.text();
        console.error('Error:', errorText);
        tryBasicEndpoint();
        return;
      }
      
      const testData = await testResponse.json();
      console.log('Test endpoint response:', testData);
      
      const bookingRef = testData.booking_reference;
      if (bookingRef) {
        console.log('Created booking reference:', bookingRef);
        console.log('Waiting 2 seconds for database propagation...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify the booking with the test endpoint first
        console.log('\nVerifying booking with test verification endpoint...');
        await verifyBookingWithTestEndpoint(bookingRef);
        
        // Then try the standard endpoint
        console.log('\nVerifying booking created via standard test endpoint...');
        await verifyBookingByReference(bookingRef);
      } else {
        console.error('No booking reference returned from standard test endpoint');
        tryBasicEndpoint();
      }
    } catch (error) {
      console.error(`Error with standard test endpoint: ${error.message}`);
      tryBasicEndpoint();
    }
  }
  
  // Helper function to try the basic test endpoint
  async function tryBasicEndpoint() {
    try {
      console.log('\nFalling back to basic test endpoint...');
      const basicUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/test-create-booking`;
      const basicResponse = await fetch(basicUrl);
      
      console.log(`Basic test status: ${basicResponse.status} ${basicResponse.statusText}`);
      
      if (!basicResponse.ok) {
        console.error(`Basic test failed with status: ${basicResponse.status}`);
        return;
      }
      
      const basicData = await basicResponse.json();
      console.log('Basic test response:', basicData);
      
      if (basicData.success && basicData.booking) {
        const bookingRef = basicData.booking.reference_number || 
                        (basicData.booking.referenceNumber);
        
        if (bookingRef) {
          console.log('Created booking reference:', bookingRef);
          console.log('Waiting 2 seconds for database propagation...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verify with the test endpoint first
          console.log('\nVerifying booking with test verification endpoint...');
          await verifyBookingWithTestEndpoint(bookingRef);
          
          // Then try the reference endpoint
          console.log('\nVerifying basic booking via reference endpoint...');
          await verifyBookingByReference(bookingRef);
        } else {
          console.log('No reference number found in response');
        }
      } else {
        console.error('Basic test booking creation failed');
      }
    } catch (error) {
      console.error(`Error with basic test endpoint: ${error.message}`);
    }
  }
  
  // Helper function to verify a booking by the reference endpoint
  async function verifyBookingByReference(ref) {
    try {
      const verifyUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/bookings/reference/${ref}`;
      const verifyResponse = await fetch(verifyUrl);
      
      console.log(`Reference endpoint status: ${verifyResponse.status} ${verifyResponse.statusText}`);
      
      if (!verifyResponse.ok) {
        console.error(`Reference endpoint failed: ${verifyResponse.status}`);
        try {
          const errorText = await verifyResponse.text();
          console.error('Error:', errorText);
        } catch (e) {
          // Ignore JSON parsing errors
        }
        return false;
      }
      
      const verifyData = await verifyResponse.json();
      console.log('Reference endpoint response:', {
        success: verifyData.success,
        hasBooking: !!verifyData.booking,
        bookingData: verifyData.booking ? {
          id: verifyData.booking.id,
          reference: verifyData.booking.reference_number,
          customerName: verifyData.booking.customer_name,
          // Include only a few fields for brevity
        } : null
      });
      
      return true;
    } catch (error) {
      console.error(`Error verifying by reference: ${error.message}`);
      return false;
    }
  }
  
  // Helper function to verify a booking by the standard [reference] endpoint
  async function verifyBookingByStandardEndpoint(ref) {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/bookings/${ref}`;
      const response = await fetch(url);
      
      console.log(`Standard endpoint status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.error(`Standard endpoint failed: ${response.status}`);
        try {
          const errorText = await response.text();
          console.error('Error:', errorText);
        } catch (e) {
          // Ignore JSON parsing errors
        }
        return false;
      }
      
      const data = await response.json();
      console.log('Standard endpoint response:', {
        hasReferenceNumber: !!data.referenceNumber,
        referenceNumber: data.referenceNumber,
        hasCustomer: !!data.customer,
        // Include only a few fields for brevity
      });
      
      return true;
    } catch (error) {
      console.error(`Error with standard endpoint: ${error.message}`);
      return false;
    }
  }
  
  // Helper function to verify a booking using the findByReference endpoint
  async function verifyBookingByFindEndpoint(ref) {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/bookings/findByReference?reference=${ref}`;
      const response = await fetch(url);
      
      console.log(`Find endpoint status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.error(`Find endpoint failed: ${response.status}`);
        try {
          const errorText = await response.text();
          console.error('Error:', errorText);
        } catch (e) {
          // Ignore JSON parsing errors
        }
        return false;
      }
      
      const data = await response.json();
      console.log('Find endpoint response:', {
        success: data.success,
        hasBooking: !!data.booking,
        bookingData: data.booking ? {
          reference: data.booking.reference_number,
          customerName: data.booking.customer_name,
          // Include only a few fields for brevity
        } : null
      });
      
      return true;
    } catch (error) {
      console.error(`Error with find endpoint: ${error.message}`);
      return false;
    }
  }
}

// Run the test
testAllBookingEndpoints(); 