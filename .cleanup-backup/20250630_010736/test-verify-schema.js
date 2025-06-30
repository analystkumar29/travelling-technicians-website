// Script to verify the bookings table schema and test a minimal insert
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Function to generate a reference number
function generateReferenceNumber() {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

async function verifySchema() {
  console.log('=== VERIFYING UPDATED SCHEMA ===');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  try {
    // 1. Check the column structure
    console.log('Checking bookings table structure...');
    
    const { data: columns, error: colError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        ORDER BY ordinal_position;
      `
    });
    
    if (colError) {
      console.error('Error fetching schema:', colError);
      return;
    }
    
    console.log('Bookings table columns:');
    if (columns && columns.rows) {
      columns.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log(columns);
    }
    
    // Check for specific columns
    const columnsToCheck = ['city', 'province', 'brand', 'device_brand'];
    console.log('\nChecking for required columns:');
    let allColumnsExist = true;
    
    for (const column of columnsToCheck) {
      let found = false;
      
      if (columns && columns.rows) {
        found = columns.rows.some(col => col.column_name === column);
      }
      
      console.log(`- ${column}: ${found ? 'EXISTS' : 'MISSING'}`);
      if (!found) allColumnsExist = false;
    }
    
    // 2. Test creating a booking with all fields
    if (allColumnsExist) {
      console.log('\nTesting booking creation with all fields...');
      
      const reference = generateReferenceNumber();
      const bookingData = {
        reference_number: reference,
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '604-123-4567',
        device_type: 'mobile',
        device_brand: 'Apple',
        device_model: 'iPhone 13',
        service_type: 'screen_replacement',
        issue_description: 'Test booking after schema update',
        address: '123 Test Street',
        postal_code: 'V6B 1S5',
        city: 'Vancouver',
        province: 'BC',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '14:00-16:00',
        status: 'pending'
      };
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select();
      
      if (bookingError) {
        console.error('Error creating booking:', bookingError);
      } else {
        console.log('Booking created successfully!');
        console.log('Booking data:', booking[0]);
        
        // Verify that city and province were saved
        console.log('\nVerifying city and province were saved:');
        console.log(`City: ${booking[0].city || 'NOT SAVED'}`);
        console.log(`Province: ${booking[0].province || 'NOT SAVED'}`);
        
        // Verify if brand field works (if it exists)
        if (columns.rows.some(col => col.column_name === 'brand')) {
          console.log(`Brand: ${booking[0].brand || 'NOT SAVED'}`);
        }
        
        // Clean up - delete the test booking
        console.log('\nCleaning up - deleting test booking...');
        const { error: deleteError } = await supabase
          .from('bookings')
          .delete()
          .eq('reference_number', reference);
        
        if (deleteError) {
          console.error('Error deleting booking:', deleteError);
        } else {
          console.log('Test booking deleted successfully');
        }
      }
    }
    
  } catch (err) {
    console.error('Exception during verification:', err);
  }
}

// Run the verification
verifySchema(); 