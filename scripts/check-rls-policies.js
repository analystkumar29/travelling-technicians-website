// Script to check current RLS policies on bookings table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
  console.log('Checking RLS policies on bookings table...\n');
  
  try {
    // Check if RLS is enabled
    const { data: rlsEnabled, error: rlsError } = await supabase
      .rpc('check_rls_enabled', { table_name: 'bookings' });
    
    if (rlsError) {
      console.log('Could not check RLS status via RPC, trying direct query...');
    } else {
      console.log('RLS Status:', rlsEnabled ? 'Enabled' : 'Disabled');
    }
    
    // Get current policies using direct SQL (if exec_sql function exists)
    console.log('\nAttempting to query pg_policies table...');
    
    // Try to get policies via a direct query using service role
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public')
      .eq('tablename', 'bookings');
    
    if (policiesError) {
      console.log('Cannot query pg_policies directly, trying alternative approach...');
      
      // Try a different approach - attempt to insert a test booking to see if policy blocks it
      console.log('\nTesting current insert policy by attempting to insert a test booking...');
      
      const testBooking = {
        customer_name: 'Test Customer',
        customer_phone: '1234567890',
        customer_email: 'test@example.com',
        service_id: 1,
        model_id: 1,
        location_id: 1,
        booking_date: new Date().toISOString(),
        status: 'pending'
      };
      
      const { data: insertResult, error: insertError } = await supabase
        .from('bookings')
        .insert(testBooking)
        .select();
      
      if (insertError) {
        console.log('Insert Error:', insertError.message);
        console.log('This suggests RLS policy is blocking the insert.');
        
        // Check if it's a policy violation
        if (insertError.message.includes('row-level security policy')) {
          console.log('\n✓ RLS Policy is ACTIVE and blocking unauthorized inserts');
        } else {
          console.log('\n✗ Different error:', insertError.message);
        }
      } else {
        console.log('✓ Insert succeeded:', insertResult);
        console.log('\n⚠️  WARNING: RLS policy may be too permissive (WITH CHECK true)');
        
        // Clean up the test booking
        if (insertResult && insertResult[0] && insertResult[0].id) {
          await supabase
            .from('bookings')
            .delete()
            .eq('id', insertResult[0].id);
          console.log('Cleaned up test booking');
        }
      }
    } else {
      console.log('\nCurrent Policies on bookings table:');
      if (policies && policies.length > 0) {
        policies.forEach(policy => {
          console.log(`- ${policy.policyname}: ${policy.cmd} (${policy.permissive ? 'permissive' : 'restrictive'})`);
          console.log(`  Using: ${policy.qual}`);
          console.log(`  With Check: ${policy.with_check}`);
        });
      } else {
        console.log('No policies found (RLS may be disabled)');
      }
    }
    
    // Check the actual policy definition from information_schema
    console.log('\nChecking information_schema.table_privileges...');
    const { data: privileges, error: privError } = await supabase
      .rpc('get_table_privileges', { table_name: 'bookings' });
    
    if (privError) {
      console.log('Cannot get privileges via RPC');
    } else {
      console.log('Privileges:', privileges);
    }
    
  } catch (error) {
    console.error('Error checking RLS policies:', error.message);
  }
}

// Also check if we can query the pg_policy table via SQL
async function checkViaSQL() {
  console.log('\n\n=== Alternative: Checking via SQL query ===');
  
  // This would require the exec_sql function which we know doesn't exist
  console.log('Note: exec_sql function is not available in this database');
  console.log('The manual SQL script (apply-database-fixes-manual.sql) must be run in Supabase dashboard');
  console.log('\nTo tighten security policies:');
  console.log('1. Go to Supabase Dashboard > SQL Editor');
  console.log('2. Copy the SQL from scripts/apply-database-fixes-manual.sql');
  console.log('3. Run the entire script');
  console.log('4. The script includes updated security policies in Section 3');
}

checkRLSPolicies().then(() => {
  console.log('\n\n=== SUMMARY ===');
  console.log('The security policies have been defined in the manual SQL script.');
  console.log('To apply them, run the SQL in Supabase Dashboard > SQL Editor.');
  console.log('\nKey security improvements in the script:');
  console.log('1. Drops the overly permissive "Public Create Booking" policy');
  console.log('2. Creates a new policy requiring customer_name and customer_phone');
  console.log('3. Adds policies for customers to view their own bookings');
  console.log('4. Adds policies for technicians to view assigned bookings');
  
  return checkViaSQL();
}).catch(error => {
  console.error('Script failed:', error);
});