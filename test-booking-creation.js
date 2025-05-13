require('dotenv').config();
const fetch = require('node-fetch');

// Function to generate a unique reference number for testing
function generateReferenceNumber() {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TEST-${datePart}-${randomPart}`;
}

// Complete booking data with mixed naming conventions to satisfy both the API validation
// and the database schema requirements
const completeBookingData = {
  // API expects camelCase
  deviceType: 'mobile',
  deviceBrand: 'Apple',
  deviceModel: 'iPhone 13',
  serviceType: 'Screen Replacement',
  issueDescription: 'Cracked screen needs replacing',
  
  // API expects camelCase for these too
  appointmentDate: '2023-10-15',
  appointmentTime: '09-11',
  
  customerName: 'John Doe',
  customerEmail: 'john.doe@example.com',
  customerPhone: '6045551234',
  
  address: '123 Main St',
  postalCode: 'V6A 1A1',
  
  // Database fields
  city: 'Vancouver',
  province: 'BC',
  brand: 'Apple',
  model: 'iPhone 13',
  
  // These should not be needed as the API should convert them, but including just in case
  booking_date: '2023-10-15',
  booking_time: '09-11',
};

async function testBookingCreation() {
  console.log('===== Testing Booking Creation =====');
  
  // Add reference number to the booking data
  const reference = generateReferenceNumber();
  completeBookingData.reference_number = reference;
  
  console.log('Reference:', reference);
  console.log('Booking data:', JSON.stringify(completeBookingData, null, 2));
  
  try {
    // First check if API is responding
    const pingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/ping`);
    console.log(`API status: ${pingResponse.status} ${pingResponse.statusText}`);
    
    if (!pingResponse.ok) {
      console.error('API server is not responding correctly. Aborting test.');
      return;
    }
    
    // Try standard booking endpoint first
    console.log('\nAttempting to create a booking via standard endpoint...');
    const standardEndpointUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/bookings/create`;
    const standardResponse = await fetch(
      standardEndpointUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeBookingData),
      }
    );
    
    console.log(`Standard API response status: ${standardResponse.status} ${standardResponse.statusText}`);
    
    // Get the response data
    const standardResponseData = await standardResponse.json();
    console.log('Standard response data:', JSON.stringify(standardResponseData, null, 2));
    
    if (standardResponse.ok) {
      console.log('\n✅ Booking created successfully via standard endpoint!');
      console.log(`Booking reference: ${standardResponseData.booking_reference || standardResponseData.reference_number}`);
      
      // Now try to fetch the booking to verify it was stored correctly
      const ref = standardResponseData.booking_reference || standardResponseData.reference_number || reference;
      verifyBooking(ref);
    } else {
      console.error('\n❌ Booking creation failed via standard endpoint!');
      console.error('Error message:', standardResponseData.error || standardResponseData.message);
      if (standardResponseData.details) {
        console.error('Error details:', standardResponseData.details);
      }
      
      // Fall back to test endpoint
      tryTestEndpoint();
    }
  } catch (error) {
    console.error('Error during test:', error.message);
    tryTestEndpoint();
  }
  
  // Helper function to try the test endpoint
  async function tryTestEndpoint() {
    try {
      console.log('\nFalling back to test endpoint...');
      const testEndpointUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/test/create-booking`;
      const testResponse = await fetch(
        testEndpointUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completeBookingData),
        }
      );
      
      console.log(`Test API response status: ${testResponse.status} ${testResponse.statusText}`);
      
      // Get the response data
      const testResponseData = await testResponse.json();
      console.log('Test response data:', JSON.stringify(testResponseData, null, 2));
      
      if (testResponse.ok) {
        console.log('\n✅ Booking created successfully via test endpoint!');
        const ref = testResponseData.booking_reference || 
                 (testResponseData.booking && testResponseData.booking.reference_number) ||
                 reference;
        console.log(`Booking reference: ${ref}`);
        
        // Verify the booking
        verifyBooking(ref);
      } else {
        console.error('\n❌ Booking creation failed via test endpoint as well!');
        console.error('Error message:', testResponseData.error || testResponseData.message);
        if (testResponseData.details) {
          console.error('Error details:', testResponseData.details);
        }
        
        // Try the very basic API
        tryBasicTestEndpoint();
      }
    } catch (error) {
      console.error('Error during test endpoint call:', error.message);
      tryBasicTestEndpoint();
    }
  }
  
  // Helper function to try the basic test endpoint
  async function tryBasicTestEndpoint() {
    try {
      console.log('\nTrying the basic test endpoint...');
      const basicEndpointUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/test-create-booking`;
      const basicResponse = await fetch(basicEndpointUrl);
      
      console.log(`Basic test API response status: ${basicResponse.status} ${basicResponse.statusText}`);
      
      if (basicResponse.ok) {
        const basicResponseData = await basicResponse.json();
        console.log('Basic test response data:', JSON.stringify(basicResponseData, null, 2));
        
        if (basicResponseData.success) {
          console.log('\n✅ Basic test booking created successfully!');
          const ref = basicResponseData.booking && 
                   (basicResponseData.booking.reference_number || basicResponseData.booking.referenceNumber);
          
          if (ref) {
            console.log(`Booking reference: ${ref}`);
            verifyBooking(ref);
          } else {
            console.log('No reference number in response, cannot verify booking');
          }
        } else {
          console.error('\n❌ Basic test booking creation failed!');
        }
      } else {
        console.error('\n❌ Basic test endpoint failed with status:', basicResponse.status);
      }
    } catch (error) {
      console.error('Error during basic test endpoint call:', error.message);
    }
  }
  
  // Helper function to verify a booking by reference
  async function verifyBooking(ref) {
    try {
      console.log(`\nVerifying booking with reference ${ref}...`);
      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/bookings/reference/${ref}`
      );
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('Verification data:', JSON.stringify(verifyData, null, 2));
        console.log('\n✅ Booking verification successful!');
      } else {
        console.error(`❌ Failed to verify booking: ${verifyResponse.status} ${verifyResponse.statusText}`);
        try {
          const errorData = await verifyResponse.json();
          console.error('Error details:', errorData);
        } catch (e) {
          // Ignore JSON parsing error
        }
      }
    } catch (error) {
      console.error('Error during booking verification:', error.message);
    }
  }
}

// Run the test
testBookingCreation(); 