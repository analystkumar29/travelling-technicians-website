// Minimal test booking insertion
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Generate a reference number
function generateReferenceNumber() {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

async function createMinimalBooking() {
  console.log('=== CREATING MINIMAL TEST BOOKING ===');
  
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
  
  try {
    // Attempt to directly execute SQL to bypass any triggers
    const { data, error } = await supabase.rpc('insert_booking', {
      p_reference_number: referenceNumber,
      p_customer_name: 'Test Customer',
      p_customer_email: 'test@example.com',
      p_customer_phone: '604-123-4567',
      p_device_type: 'mobile',
      p_device_brand: 'Apple',
      p_device_model: 'iPhone 13',
      p_issue_description: 'Screen cracked, need replacement',
      p_service_type: 'screen_replacement',
      p_address: '123 Test Street, Vancouver, BC',
      p_postal_code: 'V6B 1S5',
      p_booking_date: new Date().toISOString().split('T')[0], // Today's date
      p_booking_time: '14:00-16:00',
      p_status: 'pending'
    });
    
    if (error) {
      console.error('Error calling RPC function:', error);
      
      // Fall back to raw SQL query
      console.log('Trying direct SQL insertion...');
      
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 2); // Booking in 2 days
      const formattedDate = bookingDate.toISOString().split('T')[0];
      
      const { data: sqlData, error: sqlError } = await supabase.from('bookings').insert({
        reference_number: referenceNumber,
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '604-123-4567',
        device_type: 'mobile',
        device_brand: 'Apple',
        device_model: 'iPhone 13',
        issue_description: 'Screen cracked, need replacement',
        service_type: 'screen_replacement',
        address: '123 Test Street, Vancouver, BC',
        postal_code: 'V6B 1S5',
        booking_date: formattedDate,
        booking_time: '14:00-16:00',
        status: 'pending'
      }).select();
      
      if (sqlError) {
        console.error('Error with direct SQL insertion:', sqlError);
        
        // Try an even more minimal approach - just the required fields
        console.log('Trying minimal required fields insertion...');
        
        const { data: minimalData, error: minimalError } = await supabase.from('bookings').insert({
          reference_number: referenceNumber,
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          customer_phone: '604-123-4567',
          device_type: 'mobile',
          device_brand: 'Apple',
          service_type: 'screen_replacement',
          address: '123 Test Street, Vancouver, BC',
          postal_code: 'V6B 1S5',
          booking_date: formattedDate,
          booking_time: '14:00-16:00'
        }).select();
        
        if (minimalError) {
          console.error('Error with minimal fields insertion:', minimalError);
          return { success: false, error: minimalError.message };
        }
        
        console.log('Booking created successfully with minimal fields!');
        return { success: true, reference: referenceNumber };
      }
      
      console.log('Booking created successfully with direct SQL!');
      return { success: true, reference: referenceNumber };
    }
    
    console.log('Booking created successfully with RPC function!');
    return { success: true, reference: referenceNumber };
  } catch (err) {
    console.error('Exception during booking creation:', err);
    return { success: false, error: err.message };
  }
}

// Run the function
createMinimalBooking(); 