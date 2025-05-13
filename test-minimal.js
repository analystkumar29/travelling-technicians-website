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
  // Create the exact data structure we see in the API endpoint
  const bookingData = {
    reference_number: generateReferenceNumber(),
    device_type: 'mobile',
    device_brand: 'Apple',  // This seems to be causing issues
    device_model: 'iPhone 13',
    service_type: 'screen_replacement',
    booking_date: '2025-05-12',
    booking_time: '09-11',
    customer_name: 'Minimal Test',
    customer_email: 'minimal@example.com',
    customer_phone: '5551234567',
    address: '123 Test St',
    postal_code: 'V6B 1A1',
    issue_description: 'Minimal test insertion',
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
      
      // Let's try with a simpler object structure
      console.log('\nError refers to "brand". Attempting without device_brand field...');
      const minimalData = { ...bookingData };
      delete minimalData.device_brand;
      delete minimalData.device_model;
      
      const { data: minData, error: minError } = await supabase
        .from('bookings')
        .insert(minimalData)
        .select();
      
      if (minError) {
        console.error('Still failed without device_brand field:', minError);
      } else {
        console.log('Success without device_brand field:', minData);
      }
      
      // Let's try with INSERT statement instead
      console.log('\nAttempting with SQL statement directly...');
      const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', {
        sql_query: `
          INSERT INTO bookings (
            reference_number, device_type, service_type, booking_date, booking_time,
            customer_name, customer_email, customer_phone, address, postal_code, status,
            device_brand, device_model, issue_description
          ) VALUES (
            '${generateReferenceNumber()}', 'mobile', 'screen_replacement',
            '2025-05-12', '09-11', 'SQL Test', 'sql@example.com', '5551234567',
            '123 Test St', 'V6B 1A1', 'pending', 'Apple', 'iPhone 13', 'SQL test'
          )
          RETURNING *;
        `
      });
      
      if (sqlError) {
        console.error('SQL insert failed:', sqlError);
      } else {
        console.log('SQL insert successful:', sqlData);
      }
    } else {
      console.log('Insert successful!', data);
    }
  } catch (err) {
    console.error('Exception during test:', err);
  }
}

// Run the test
insertTestRecord(); 