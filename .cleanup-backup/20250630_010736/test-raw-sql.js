// Test script with raw SQL queries
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Generate a reference number
function generateReferenceNumber() {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

async function createBookingWithRawSql() {
  console.log('=== CREATING BOOKING WITH RAW SQL ===');
  
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
    // Directly execute a raw SQL query
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 2); // Booking in 2 days
    const formattedDate = bookingDate.toISOString().split('T')[0];
    
    const query = `
      INSERT INTO bookings(
        reference_number, 
        customer_name, 
        customer_email, 
        customer_phone, 
        device_type, 
        device_brand, 
        device_model, 
        service_type, 
        issue_description, 
        address, 
        postal_code, 
        booking_date, 
        booking_time, 
        status
      ) VALUES(
        '${referenceNumber}', 
        'Test Customer', 
        'test@example.com', 
        '604-123-4567', 
        'mobile', 
        'Apple', 
        'iPhone 13', 
        'screen_replacement', 
        'Screen cracked, need replacement', 
        '123 Test Street, Vancouver, BC', 
        'V6B 1S5', 
        '${formattedDate}', 
        '14:00-16:00', 
        'pending'
      ) 
      RETURNING id, reference_number;
    `;
    
    console.log('Executing raw SQL query...');
    const { data, error } = await supabase.rpc('exec_sql', { 
      query: query 
    });
    
    if (error) {
      console.error('Error executing raw SQL:', error);
      
      // Try an alternative approach - use the REST API directly
      console.log('Trying a direct REST API call...');
      
      // Get access to perform database queries with elevated privileges
      const { data: tokenData, error: tokenError } = await supabase.auth.admin.createClient();
      
      if (tokenError) {
        console.error('Error creating admin client:', tokenError);
        return { success: false, error: tokenError.message };
      }
      
      // Create minimal booking data for API
      const minimalBookingData = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          appointment: {
            date: formattedDate,
            time: '14:00-16:00'
          },
          customer: {
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '604-123-4567'
          },
          device: {
            type: 'mobile',
            brand: 'Apple',
            model: 'iPhone 13'
          },
          service: {
            type: 'screen_replacement',
            description: 'Screen cracked, need replacement'
          },
          location: {
            address: '123 Test Street, Vancouver, BC',
            postalCode: 'V6B 1S5'
          },
          referenceNumber: referenceNumber
        })
      };
      
      // Skip actually calling the API in this test
      console.log('Would call API with data:', minimalBookingData);
      
      // Instead, let's just check if there are any bookings in the database
      const { data: bookings, error: countError } = await supabase
        .from('bookings')
        .select('*');
      
      if (countError) {
        console.error('Error counting bookings:', countError);
      } else {
        console.log(`Found ${bookings.length} total bookings in the database`);
        if (bookings.length > 0) {
          console.log('Sample booking:', {
            reference: bookings[0].reference_number,
            customer: bookings[0].customer_name,
            date: bookings[0].booking_date
          });
        }
      }
      
      return { success: false, error: error.message };
    }
    
    console.log('Booking created successfully with raw SQL!', data);
    
    // Verify booking was created
    const { data: verification, error: verifyError } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', referenceNumber);
    
    if (verifyError) {
      console.error('Error verifying booking:', verifyError);
    } else {
      console.log(`Verification found ${verification.length} bookings with reference ${referenceNumber}`);
      if (verification.length > 0) {
        console.log('Verified booking:', {
          reference: verification[0].reference_number,
          customer: verification[0].customer_name,
          date: verification[0].booking_date
        });
      }
    }
    
    return { success: true, reference: referenceNumber, data };
  } catch (err) {
    console.error('Exception during booking creation:', err);
    return { success: false, error: err.message };
  }
}

// Run the function
createBookingWithRawSql(); 