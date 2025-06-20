const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testWarrantiesAPI() {
  console.log('Testing Warranties API...\n');
  
  try {
    // Test 1: Check if warranty-related tables exist
    console.log('1. Checking warranty-related tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['warranties', 'repair_completions', 'technicians']);
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError.message);
    } else {
      console.log('Found tables:', tables.map(t => t.table_name));
    }
    
    // Test 2: Check warranties table directly
    console.log('\n2. Checking warranties table...');
    
    const { data: warranties, error: warrantiesError } = await supabase
      .from('warranties')
      .select('*')
      .limit(5);
    
    if (warrantiesError) {
      console.error('Error querying warranties:', warrantiesError.message);
    } else {
      console.log(`Found ${warranties.length} warranties`);
      if (warranties.length > 0) {
        console.log('Sample warranty:', warranties[0]);
      }
    }
    
    // Test 3: Check technicians table
    console.log('\n3. Checking technicians table...');
    
    const { data: technicians, error: techniciansError } = await supabase
      .from('technicians')
      .select('*')
      .limit(5);
    
    if (techniciansError) {
      console.error('Error querying technicians:', techniciansError.message);
    } else {
      console.log(`Found ${technicians.length} technicians`);
      if (technicians.length > 0) {
        console.log('Sample technician:', technicians[0]);
      }
    }
    
    // Test 4: Check repair_completions table
    console.log('\n4. Checking repair_completions table...');
    
    const { data: repairs, error: repairsError } = await supabase
      .from('repair_completions')
      .select('*')
      .limit(5);
    
    if (repairsError) {
      console.error('Error querying repair_completions:', repairsError.message);
    } else {
      console.log(`Found ${repairs.length} repair completions`);
      if (repairs.length > 0) {
        console.log('Sample repair completion:', repairs[0]);
      }
    }
    
    // Test 5: Test the API endpoint directly
    console.log('\n5. Testing warranties API endpoint...');
    
    try {
      const response = await fetch(`${supabaseUrl.replace('/supabase', '')}/api/warranties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const apiData = await response.json();
        console.log('API Response:', apiData);
      } else {
        console.error('API Error:', response.status, await response.text());
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError.message);
      console.log('Note: This is expected when running locally without the Next.js server');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testWarrantiesAPI(); 