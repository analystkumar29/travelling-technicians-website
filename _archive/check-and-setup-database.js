const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for the NEW database
const supabase = createClient(
  'https://vrsavtcofatvrvvfglrt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyc2F2dGNvZmF0dnJ2dmZnbHJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTUxODQyMywiZXhwIjoyMDY3MDk0NDIzfQ.mi1uR6frYoK1Bbd-lWcxmsEPR-Uln-1t7XIaPJi6hdM'
);

async function checkDatabaseStatus() {
  console.log('🔍 Checking Database Status');
  console.log('=' .repeat(50));
  
  const tables = [
    'device_types',
    'brands', 
    'device_models',
    'services',
    'pricing_tiers',
    'mobileactive_products',
    'dynamic_pricing',
    'service_locations',
    'bookings'
  ];
  
  console.log('\n📊 Table Status:');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${data?.length || 0} records`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Table does not exist`);
    }
  }
  
  console.log('\n📋 SETUP INSTRUCTIONS:');
  console.log('=' .repeat(50));
  console.log('1. Go to: https://supabase.com/dashboard/project/vrsavtcofatvrvvfglrt');
  console.log('2. Click "SQL Editor" in the left sidebar');
  console.log('3. Copy the contents of database/create-fresh-schema.sql');
  console.log('4. Paste into SQL Editor and click "Run"');
  console.log('5. Wait for "Database schema created successfully!" message');
  console.log('6. Then run: node scripts/create-fresh-database-direct.js');
  
  console.log('\n📁 SQL File Location: database/create-fresh-schema.sql');
  console.log('🚀 Migration Script: scripts/create-fresh-database-direct.js');
  
  console.log('\n⚠️  IMPORTANT: Run the SQL schema FIRST, then the migration script!');
}

checkDatabaseStatus(); 