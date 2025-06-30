require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runQueries() {
  console.log('Running test queries...\n');
  
  try {
    // Run queries using direct RPC approach
    const queries = [
      "SELECT COUNT(*) FROM technicians;",
      "SELECT COUNT(*) FROM bookings;",
      "SELECT COUNT(*) FROM repair_completions;", 
      "SELECT COUNT(*) FROM warranties;",
      "SELECT t.full_name, t.email, COUNT(w.id) AS warranty_count FROM technicians t LEFT JOIN warranties w ON t.id = w.technician_id GROUP BY t.id LIMIT 10;",
      "SELECT b.reference_number, b.customer_name, w.warranty_code, w.status, w.expiry_date FROM bookings b LEFT JOIN warranties w ON b.id = w.booking_id WHERE b.reference_number LIKE '%TEST%' OR w.warranty_code LIKE '%TEST%' LIMIT 10;"
    ];
    
    for (const query of queries) {
      console.log(`QUERY: ${query}`);
      const { data, error } = await supabase.rpc('execute_sql', { 
        sql_query: query 
      });
      
      if (error) {
        console.error('Error:', error.message);
      } else {
        console.log('Result:', data);
      }
      console.log('----------');
    }
    
    // Try a different approach - direct table queries
    console.log('\nDirect table query approach:');
    
    const { data: techData, error: techError } = await supabase
      .from('technicians')
      .select('*')
      .limit(5);
    
    console.log('Technicians table query:');
    if (techError) {
      console.error('Error:', techError.message);
    } else {
      console.log('Count:', techData.length);
      if (techData.length > 0) {
        console.log('Sample:', techData[0]);
      }
    }
    
    // Try a direct query to bookings
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .limit(5);
    
    console.log('\nBookings table query:');
    if (bookingError) {
      console.error('Error:', bookingError.message);
    } else {
      console.log('Count:', bookingData.length);
      if (bookingData.length > 0) {
        console.log('Sample:', bookingData[0]);
      }
    }
    
  } catch (err) {
    console.error('Exception:', err.message);
  }
}

runQueries(); 