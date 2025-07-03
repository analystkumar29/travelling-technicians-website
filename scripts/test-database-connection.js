const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for the NEW database
const supabase = createClient(
  'https://vrsavtcofatvrvvfglrt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyc2F2dGNvZmF0dnJ2dmZnbHJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTUxODQyMywiZXhwIjoyMDY3MDk0NDIzfQ.mi1uR6frYoK1Bbd-lWcxmsEPR-Uln-1t7XIaPJi6hdM'
);

async function testConnection() {
  console.log('🔍 Testing Database Connection');
  console.log('=' .repeat(50));
  
  console.log('📊 Database URL: https://vrsavtcofatvrvvfglrt.supabase.co');
  console.log('🔑 Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyc2F2dGNvZmF0dnJ2dmZnbHJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTUxODQyMywiZXhwIjoyMDY3MDk0NDIzfQ.mi1uR6frYoK1Bbd-lWcxmsEPR-Uln-1t7XIaPJi6hdM');
  
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
    
    // Test table existence using the same method as check script
    console.log('\n📊 Testing table existence...');
    const tables = ['device_types', 'brands', 'device_models', 'services'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('id', { count: 'exact', head: true });
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${data?.length || 0} records`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection(); 