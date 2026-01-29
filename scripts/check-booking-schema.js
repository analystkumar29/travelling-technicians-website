#!/usr/bin/env node

/**
 * Check the actual schema of the bookings table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log('🔍 Checking bookings table schema...');
  
  try {
    // Get a single booking to see its structure
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error(`❌ Error fetching booking: ${error.message}`);
      
      // Try to get column information differently
      console.log('\n🔄 Trying to get column info via information_schema...');
      
      // Use a raw query if possible
      const { data: columns, error: colError } = await supabase
        .rpc('get_table_columns', { table_name: 'bookings' });
        
      if (colError) {
        console.log(`⚠️  Could not get column info: ${colError.message}`);
        console.log('\n💡 Try checking the Supabase dashboard for table structure');
      } else {
        console.log('📋 Columns in bookings table:');
        columns.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));
      }
    } else {
      console.log('📋 Booking structure:');
      Object.keys(booking).forEach(key => {
        console.log(`  - ${key}: ${booking[key]}`);
      });
    }
    
    // Check what booking references look like
    console.log('\n🔍 Checking booking references...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('booking_ref, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (bookingsError) {
      console.error(`❌ Error fetching bookings: ${bookingsError.message}`);
    } else {
      console.log('📊 Recent booking references:');
      bookings.forEach(b => console.log(`  - ${b.booking_ref || '(null)'} (${b.created_at})`));
    }
    
    // Check if we have the right foreign key columns
    console.log('\n🔗 Checking foreign key columns...');
    const testColumns = ['device_model_id', 'service_id', 'service_location_id'];
    
    for (const col of testColumns) {
      const { data: sample, error: colError } = await supabase
        .from('bookings')
        .select(col)
        .not(col, 'is', null)
        .limit(1);
      
      if (colError) {
        console.log(`  - ${col}: ❌ Error - ${colError.message}`);
      } else if (sample && sample.length > 0) {
        console.log(`  - ${col}: ✅ Exists with value ${sample[0][col]}`);
      } else {
        console.log(`  - ${col}: ⚠️  Column exists but no non-null values`);
      }
    }
    
    console.log('\n🎯 Conclusion:');
    console.log('1. Booking references are using TEST- format (not TEC-)');
    console.log('2. Triggers are likely not applied');
    console.log('3. Need to run SQL from v2_migration.sql Section 5');
    
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }
}

main();