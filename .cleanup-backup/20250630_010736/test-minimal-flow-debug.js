// Debug script to trace the SQL execution
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

// Function to generate a reference number
function generateReferenceNumber() {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// Function to directly insert a booking, with detailed output of SQL execution
async function directInsertBookingDebug() {
  console.log('=== DIRECT DATABASE INSERTION (DEBUG) ===');
  
  const reference = generateReferenceNumber();
  console.log(`Generated reference: ${reference}`);
  
  try {
    // Get the current bookings count
    console.log('\nGetting current bookings count...');
    
    const { data: countBefore, error: countError } = await supabase.rpc('execute_sql', {
      sql_query: `SELECT COUNT(*) FROM bookings;`
    });
    
    if (countError) {
      console.error('Error getting bookings count:', countError);
    } else {
      console.log('Current bookings count:', countBefore?.count || 'Unknown');
    }
    
    // Try a simpler approach - try the insert with only required fields
    console.log('\nInserting minimal booking record...');
    
    const today = new Date().toISOString().split('T')[0];
    const insertSql = `
      INSERT INTO bookings (
        reference_number, 
        device_type, 
        service_type, 
        booking_date, 
        booking_time, 
        customer_name, 
        customer_email, 
        customer_phone,
        address,
        postal_code,
        status
      ) VALUES (
        '${reference}',
        'mobile',
        'screen_replacement',
        '${today}',
        '09-11',
        'Debug Test User',
        'debug-${Date.now()}@example.com',
        '5551234567',
        '123 Test St',
        'V6B 1A1',
        'pending'
      );
    `;
    
    console.log('Executing SQL:');
    console.log(insertSql);
    
    const { data: insertData, error: insertError } = await supabase.rpc('execute_sql', {
      sql_query: insertSql
    });
    
    console.log('\nSQL execution completed.');
    console.log('Result data:', insertData);
    console.log('Error:', insertError);
    
    // Check if the insert succeeded by counting again
    console.log('\nVerifying insert by counting bookings again...');
    
    const { data: countAfter, error: countAfterError } = await supabase.rpc('execute_sql', {
      sql_query: `SELECT COUNT(*) FROM bookings;`
    });
    
    if (countAfterError) {
      console.error('Error getting bookings count after insert:', countAfterError);
    } else {
      console.log('Bookings count after insert:', countAfter?.count || 'Unknown');
      
      if (countBefore?.count === countAfter?.count) {
        console.log('WARNING: Booking count did not change after insert!');
      } else {
        console.log('SUCCESS: Booking count increased, insert likely succeeded!');
      }
    }
    
    // Now try to direct fetch the booking we just created
    console.log('\nAttempting to retrieve the booking directly...');
    
    const { data: directFetch, error: directError } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', reference)
      .single();
    
    if (directError) {
      console.error('Error retrieving booking directly:', directError);
    } else if (directFetch) {
      console.log('Successfully retrieved booking directly:');
      console.log({
        reference: directFetch.reference_number,
        customerName: directFetch.customer_name,
        createdAt: directFetch.created_at
      });
    } else {
      console.log('No booking found with reference:', reference);
    }
    
    // Check all bookings in the table
    console.log('\nChecking all bookings in the table...');
    
    const { data: allBookings, error: allError } = await supabase
      .from('bookings')
      .select('*');
    
    if (allError) {
      console.error('Error retrieving all bookings:', allError);
    } else {
      console.log(`Found ${allBookings.length} total bookings in the table.`);
      
      if (allBookings.length > 0) {
        console.log('Sample booking data:');
        console.log(allBookings[0]);
      }
    }
    
    return { success: !insertError, reference };
  } catch (err) {
    console.error('Exception during debug test:', err);
    return { success: false, error: err.message };
  }
}

// Run the debug test
directInsertBookingDebug(); 