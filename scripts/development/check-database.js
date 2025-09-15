// Script to check if the booking exists in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
console.log('Using service role key:', supabaseServiceKey ? 'Key provided (hidden)' : 'Missing key');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkDatabase() {
  console.log('Checking database for warranty system tables...\n');
  
  // Define expected tables from warranty system
  const warrantyTables = [
    'technicians',
    'user_profiles',
    'repair_completions',
    'warranties',
    'warranty_claims',
    'technician_schedules'
  ];
  
  // Check each table individually
  console.log('Warranty System Implementation Status:');
  console.log('=====================================');
  
  const results = {};
  
  for (const table of warrantyTables) {
    try {
      // Check if table exists by attempting to query it
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      // Determine if table exists based on error type
      const exists = !error || !error.message.includes('does not exist');
      results[table] = exists;
      
      console.log(`- ${table}: ${exists ? '✅ Implemented' : '❌ Missing'}`);
    } catch (err) {
      console.log(`- ${table}: ❌ Error checking (${err.message})`);
      results[table] = false;
    }
  }
  
  // Check for bookings table - needed for the warranty system relationships
  try {
    const { error: bookingsError } = await supabase
      .from('bookings')
      .select('count')
      .limit(1);
    
    const bookingsExist = !bookingsError || !bookingsError.message.includes('does not exist');
    console.log(`- bookings: ${bookingsExist ? '✅ Exists' : '❌ Missing (required for warranty relationships)'}`);
  } catch (err) {
    console.log(`- bookings: ❌ Error checking (${err.message})`);
  }
  
  // Check for sample data
  console.log('\nChecking for sample data:');
  
  if (results['technicians']) {
    try {
      const { data: technicians, error } = await supabase
        .from('technicians')
        .select('*');
      
      if (error) {
        console.log('- Sample technician: ❌ Error checking');
      } else {
        console.log(`- Technicians: ${technicians.length > 0 ? `✅ ${technicians.length} found` : '❌ None found'}`);
      }
    } catch (err) {
      console.log('- Sample technician: ❌ Error checking');
    }
  }
  
  if (results['warranties']) {
    try {
      const { data: warranties, error } = await supabase
        .from('warranties')
        .select('*');
      
      if (error) {
        console.log('- Sample warranties: ❌ Error checking');
      } else {
        console.log(`- Warranties: ${warranties.length > 0 ? `✅ ${warranties.length} found` : '❌ None found'}`);
      }
    } catch (err) {
      console.log('- Sample warranties: ❌ Error checking');
    }
  }
  
  // Check for a booking with warranty
  try {
    if (results['warranties']) {
      const { data, error } = await supabase
        .from('warranties')
        .select('id, warranty_code, booking_id, status')
        .limit(1);
      
      if (!error && data && data.length > 0) {
        console.log('- Booking with warranty: ✅ Found (warranty code:', data[0].warranty_code, ')');
      } else {
        console.log('- Booking with warranty: ❌ None found');
      }
    }
  } catch (err) {
    console.log('- Booking with warranty: ❌ Error checking');
  }
  
  // Print next steps
  console.log('\nNext Steps:');
  const missingTables = warrantyTables.filter(table => !results[table]);
  
  if (missingTables.length === warrantyTables.length) {
    console.log('It appears none of the warranty system tables have been created yet.');
    console.log('1. Create the tables using the SQL scripts in sql/004-technician-warranty-system.sql');
    console.log('2. Set up triggers with sql/005-warranty-triggers.sql');
    console.log('3. Insert sample data for testing');
  } else if (missingTables.length > 0) {
    console.log(`Several warranty tables are missing: ${missingTables.join(', ')}`);
    console.log('1. Complete table creation for missing tables');
    console.log('2. Ensure triggers are set up for automated warranty creation');
  } else {
    console.log('✅ All tables appear to be created!');
    console.log('1. Test the warranty creation flow with a completed repair');
    console.log('2. Ensure warranty UI components are implemented');
  }
}

// Run the database check
checkDatabase().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
}); 