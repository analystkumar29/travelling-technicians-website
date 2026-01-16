const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client using environment variables (old database)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOldDatabase() {
  console.log('🔍 Checking Old Database State');
  console.log('=' .repeat(50));
  
  console.log('📊 Database URL:', supabaseUrl);
  console.log('🔑 Service Role Key:', supabaseServiceKey ? 'Set' : 'Not set');
  
  try {
    // Test basic connection
    console.log('\n🔌 Testing basic connection...');
    const { data, error } = await supabase.from('device_types').select('*').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('🔧 Error details:', error);
    } else {
      console.log('✅ Connection successful');
      console.log('📋 Data:', data);
    }
    
    // Test all tables
    console.log('\n📊 Testing all tables...');
    const tables = [
      'device_types', 
      'brands', 
      'device_models', 
      'services', 
      'pricing_tiers',
      'dynamic_pricing',
      'service_locations',
      'bookings'
    ];
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${count || 0} records`);
          if (data && data.length > 0) {
            console.log(`   Sample:`, data[0]);
          }
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
    // Check if tables exist at all
    console.log('\n🔍 Checking if tables exist...');
    const { data: tableList, error: tableError } = await supabase
      .rpc('get_table_names');
    
    if (tableError) {
      console.log('⚠️ Could not get table list, trying alternative method...');
      // Try a simple query to see what's available
      const { data: testData, error: testError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (testError) {
        console.log('❌ Could not access information_schema:', testError.message);
      } else {
        console.log('📋 Available tables:', testData?.map(t => t.table_name) || []);
      }
    } else {
      console.log('📋 Available tables:', tableList || []);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

checkOldDatabase().catch(console.error); 