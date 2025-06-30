// Minimal test to isolate the booking issue
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Function to generate a reference number
function generateReferenceNumber() {
  return `TEST-${Date.now()}`;
}

async function insertTestRecord() {
  // Create the exact data structure needed for the database
  const referenceNumber = generateReferenceNumber();
  const bookingData = {
    reference_number: referenceNumber,
    device_type: 'mobile',
    device_brand: 'Apple',
    service_type: 'screen_replacement',
    booking_date: '2025-05-12',
    booking_time: '09-11',
    customer_name: 'Minimal Test',
    customer_email: 'minimal@example.com',
    customer_phone: '5551234567',
    address: '123 Test St',
    postal_code: 'V6B 1A1',
    issue_description: 'Minimal test insertion',
    brand: 'Apple',  // Add this field for the trigger
    city: 'Vancouver',  // Add the city field
    province: 'BC',  // Add the province field
    status: 'pending'
  };

  console.log('=== MINIMAL TEST ===');
  console.log('Attempting insert with the following data:');
  console.log(JSON.stringify(bookingData, null, 2));

  try {
    console.log('\nUsing Supabase insert...');
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select();

    if (error) {
      console.error('Error during insert:', error);
      return { success: false, error };
    }
    
    console.log('Insert successful!');
    console.log('Booking data:', data[0]);
    
    // Clean up the test data
    console.log('\nCleaning up test data...');
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('reference_number', referenceNumber);
      
    if (deleteError) {
      console.error('Error deleting test data:', deleteError);
    } else {
      console.log('Test data cleaned up successfully');
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Exception during test:', err);
    return { success: false, error: err };
  }
}

// Run the test
insertTestRecord(); 