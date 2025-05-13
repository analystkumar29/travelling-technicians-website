// Script to check if the booking exists in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to check bookings in the database
async function checkBookings() {
  console.log('=== CHECKING DATABASE BOOKINGS ===');
  
  try {
    // Get all bookings
    console.log('Fetching all bookings...');
    const { data: allBookings, error: allError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('Error fetching all bookings:', allError);
      return;
    }
    
    console.log(`Found ${allBookings.length} bookings total`);
    
    if (allBookings.length > 0) {
      console.log('\nMost recent bookings:');
      allBookings.slice(0, 5).forEach(booking => {
        console.log(`- ${booking.reference_number} (${booking.created_at}): ${booking.customer_name} - ${booking.device_type} - ${booking.service_type}`);
      });
      
      // Try to fetch the most recent booking by reference
      const mostRecent = allBookings[0];
      console.log(`\nFetching most recent booking (${mostRecent.reference_number}) directly...`);
      
      const { data: singleBooking, error: singleError } = await supabase
        .from('bookings')
        .select('*')
        .eq('reference_number', mostRecent.reference_number)
        .single();
      
      if (singleError) {
        console.error('Error fetching single booking:', singleError);
      } else {
        console.log('Found booking directly:', singleBooking ? 'Yes' : 'No');
        if (singleBooking) {
          console.log({
            reference: singleBooking.reference_number,
            customer: singleBooking.customer_name,
            created: singleBooking.created_at
          });
        }
      }
    }
    
    // Check if test references exist
    const testPrefix = 'TEST-';
    const { data: testBookings, error: testError } = await supabase
      .from('bookings')
      .select('*')
      .ilike('reference_number', `${testPrefix}%`)
      .order('created_at', { ascending: false });
    
    if (testError) {
      console.error('Error fetching test bookings:', testError);
      return;
    }
    
    console.log(`\nFound ${testBookings.length} test bookings`);
    
    if (testBookings.length > 0) {
      console.log('\nRecent test bookings:');
      testBookings.slice(0, 5).forEach(booking => {
        console.log(`- ${booking.reference_number} (${booking.created_at}): ${booking.customer_name} - ${booking.device_type} - ${booking.service_type}`);
      });
    }
  } catch (err) {
    console.error('Exception during database check:', err);
  }
}

// Run the check
checkBookings(); 