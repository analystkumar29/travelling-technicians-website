const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || 'https://lzgrpcgfcevmnrxbvpfw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ No Supabase service key found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateBookingsTable() {
  try {
    console.log('🔄 Adding pricing_tier column to bookings table...');
    
    // Add pricing_tier column if it doesn't exist
    const addColumnSQL = `
      ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pricing_tier TEXT DEFAULT 'standard';
      
      -- Add a comment to document the column
      COMMENT ON COLUMN public.bookings.pricing_tier IS 'Pricing tier selected by customer: standard or premium';
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: addColumnSQL });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }
    
    console.log('✅ Successfully updated bookings table with pricing_tier column');
    
    // Check if the column was added
    const { data: columnCheck, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'bookings')
      .eq('column_name', 'pricing_tier');
    
    if (checkError) {
      console.log('⚠️  Could not verify column addition:', checkError.message);
    } else if (columnCheck && columnCheck.length > 0) {
      console.log('✅ Confirmed: pricing_tier column exists in bookings table');
    } else {
      console.log('⚠️  pricing_tier column may not have been added');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

updateBookingsTable(); 