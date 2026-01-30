// Complete test for booking creation with all fields
const fetch = require('node-fetch');

async function testCompleteBooking() {
  const bookingData = {
    deviceType: 'mobile',
    deviceBrand: 'apple',
    deviceModel: 'iPhone 16 Plus',
    serviceType: ['screen-replacement', 'battery-replacement'],
    appointmentDate: '2026-01-30',
    appointmentTime: 'afternoon',
    customerName: 'Manmohan Test',
    customerEmail: 'manmohan@example.com',
    customerPhone: '6049876543',
    address: '123 Test Street',
    postalCode: 'V6B 1A1',
    city: 'Vancouver',
    province: 'BC',
    issueDescription: 'Test booking with all data fields',
    pricingTier: 'standard',
    quoted_price: 249.99  // Add quoted price to test
  };

  console.log('Testing COMPLETE booking creation with all fields...');
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
    
    console.log('\n=== RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    console.log('Reference:', result.reference);
    
    if (result.booking) {
      console.log('\n=== BOOKING DATA SAVED TO DATABASE ===');
      console.log('Booking ID:', result.booking.id);
      console.log('Customer Name:', result.booking.customer_name);
      console.log('Email:', result.booking.customer_email);
      console.log('Phone:', result.booking.customer_phone);
      console.log('Address:', result.booking.customer_address);
      console.log('City:', result.booking.city);
      console.log('Province:', result.booking.province);
      console.log('Issue Description:', result.booking.issue_description);
      console.log('Quoted Price:', result.booking.quoted_price);
      console.log('Location ID:', result.booking.location_id);
      console.log('Creation Date:', result.booking.created_at);
      
      if (result.booking.location_id) {
        console.log('\n✅ SUCCESS: location_id was set:', result.booking.location_id);
      } else {
        console.log('\n❌ WARNING: location_id was NOT set');
      }
      
      if (result.booking.issue_description) {
        console.log('✅ SUCCESS: issue_description was saved:', result.booking.issue_description);
      } else {
        console.log('❌ WARNING: issue_description was NOT saved');
      }
      
      if (result.booking.quoted_price !== undefined && result.booking.quoted_price !== null) {
        console.log('✅ SUCCESS: quoted_price was saved:', result.booking.quoted_price);
      } else {
        console.log('❌ WARNING: quoted_price was NOT saved');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing booking creation:', error.message);
  }
}

// Run the test
testCompleteBooking();