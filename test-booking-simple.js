require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testBookingCreation() {
  console.log('Testing booking creation...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const testBooking = {
    reference_number: `TTR-${Date.now()}-001`,
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '604-123-4567',
    device_type: 'mobile',
    device_brand: 'Apple',
    device_model: 'iPhone 12',
    brand: 'Apple',
    model: 'iPhone 12',
    service_type: 'Screen Replacement',
    issue_description: 'Cracked screen',
    booking_date: '2024-06-15',
    booking_time: '10:00',
    address: '123 Test St',
    postal_code: 'V5K 2A1',
    city: 'Vancouver',
    province: 'BC',
    status: 'pending'
  };
  
  try {
    console.log('Inserting booking:', testBooking.reference_number);
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([testBooking])
      .select();
    
    if (error) {
      console.error('Error creating booking:', error);
      return false;
    }
    
    console.log('✅ Booking created successfully:', data[0]);
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

testBookingCreation().then(success => {
  console.log(success ? 'Test passed!' : 'Test failed!');
  process.exit(success ? 0 : 1);
}); 