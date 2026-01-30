// Test script to verify booking creation with location_id
const fetch = require('node-fetch');

async function testBookingCreation() {
  const bookingData = {
    deviceType: 'mobile',
    deviceBrand: 'apple',
    deviceModel: 'iPhone 16 Plus',
    serviceType: 'battery-replacement',
    appointmentDate: '2026-01-30',
    appointmentTime: 'afternoon',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '6041234567',
    address: '820 Duthie Avenue',
    postalCode: 'V5K 0A1',
    city: 'Vancouver',
    province: 'BC',
    pricingTier: 'standard'
  };

  console.log('Testing booking creation with location mapping...');
  console.log('Booking data:', JSON.stringify(bookingData, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    
    console.log('\nResponse status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Booking created successfully!');
      console.log('Reference:', result.reference);
      
      // Check if location_id was set
      if (result.booking && result.booking.location_id) {
        console.log('✅ location_id was set:', result.booking.location_id);
      } else {
        console.log('⚠️  location_id was NOT set in the booking');
      }
      
      // Check for notes about location
      if (result.booking && result.booking.notes) {
        console.log('📝 Location notes:', result.booking.notes);
      }
    } else {
      console.log('\n❌ Booking creation failed:', result.message);
      if (result.missingFields) {
        console.log('Missing fields:', result.missingFields);
      }
    }
  } catch (error) {
    console.error('❌ Error testing booking creation:', error.message);
  }
}

// Run the test
testBookingCreation();