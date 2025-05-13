// Script to create a test booking in Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Generate a reference number
function generateReferenceNumber() {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

async function createTestBooking() {
  console.log('=== CREATING TEST BOOKING ===');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return { success: false, error: 'Missing Supabase environment variables' };
  }
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  // Generate a reference number
  const referenceNumber = generateReferenceNumber();
  console.log(`Generated reference number: ${referenceNumber}`);
  
  // Create booking data matching exact schema
  const bookingDate = new Date();
  bookingDate.setDate(bookingDate.getDate() + 2); // Booking in 2 days
  
  const bookingData = {
    reference_number: referenceNumber,
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '604-123-4567',
    device_type: 'mobile', // 'mobile' or 'laptop'
    device_brand: 'Apple',
    device_model: 'iPhone 13',
    issue_description: 'Screen cracked, need replacement',
    service_type: 'screen_replacement',
    address: '123 Test Street, Vancouver, BC',
    postal_code: 'V6B 1S5',
    booking_date: bookingDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
    booking_time: '14:00-16:00',
    status: 'pending'
  };
  
  console.log('Inserting booking with data:', bookingData);
  
  try {
    // Insert booking into database
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Booking created successfully:', {
      reference: data.reference_number,
      id: data.id,
      customer: data.customer_name,
      date: data.booking_date
    });
    
    // Now try to fetch the booking to verify
    console.log('\nVerifying booking was created by fetching it...');
    const { data: fetchedBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', referenceNumber)
      .single();
    
    if (fetchError) {
      console.error('Error fetching booking:', fetchError);
    } else {
      console.log('Booking verified in database:', {
        reference: fetchedBooking.reference_number,
        status: fetchedBooking.status,
        device: `${fetchedBooking.device_brand} ${fetchedBooking.device_model}`
      });
    }
    
    return { success: true, booking: data, reference: referenceNumber };
  } catch (err) {
    console.error('Exception during booking creation:', err);
    return { success: false, error: err.message };
  }
}

// Run the function
createTestBooking(); 