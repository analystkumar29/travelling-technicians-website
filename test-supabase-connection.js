const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lzgrpcgfcevmnrxbvpfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6Z3JwY2dmY2V2bW5yeGJ2cGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1Nzk0MzAsImV4cCI6MjA1MTE1NTQzMH0.OVcuvt5eNgYJ2rZvXn-F1S7aGlS9nDqGRqaEqZr1K_U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    const { count, error } = await supabase
      .from('bookings')
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful, found', count || 0, 'bookings');
    
    // Check for pricing_tier column
    console.log('🔍 Checking for pricing_tier column...');
    
    const { data: testBooking, error: testError } = await supabase
      .from('bookings')
      .select('pricing_tier')
      .limit(1);
      
    if (testError) {
      if (testError.message.includes('pricing_tier')) {
        console.log('⚠️  pricing_tier column does not exist yet');
        console.log('📝 You will need to manually add it to your Supabase database:');
        console.log('   ALTER TABLE public.bookings ADD COLUMN pricing_tier TEXT DEFAULT \'standard\';');
      } else {
        console.error('❌ Error checking pricing_tier:', testError.message);
      }
    } else {
      console.log('✅ pricing_tier column exists and is accessible');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnection(); 