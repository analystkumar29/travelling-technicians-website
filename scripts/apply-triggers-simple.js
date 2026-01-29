#!/usr/bin/env node

/**
 * Simple script to apply missing triggers using Supabase client
 * Uses service role key to bypass RLS
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function executeSQL(sql) {
  console.log(`📝 Executing: ${sql.substring(0, 100)}...`);
  
  try {
    // Use the rpc method to execute SQL
    // Note: This requires a function in the database, but we can try direct SQL execution
    // Alternatively, we can use the REST API with the SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ SQL Error (${response.status}): ${errorText}`);
      return false;
    }

    console.log('✅ SQL executed successfully');
    return true;
  } catch (error) {
    console.error(`❌ Network error: ${error.message}`);
    return false;
  }
}

async function checkExistingTriggers() {
  console.log('🔍 Checking existing triggers...');
  
  try {
    // Check if booking_ref trigger exists
    const { data: bookingTriggers, error: bookingError } = await supabase
      .rpc('get_triggers', { table_name: 'bookings' });
    
    if (bookingError) {
      console.log('⚠️  Could not check triggers (function may not exist)');
    } else {
      console.log(`📋 Found ${bookingTriggers?.length || 0} triggers on bookings table`);
    }
    
    // Check current booking references
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('booking_ref')
      .limit(5);
    
    if (bookingsError) {
      console.error(`❌ Error fetching bookings: ${bookingsError.message}`);
    } else {
      console.log('📊 Sample booking references:');
      bookings.forEach(b => console.log(`  - ${b.booking_ref || '(null)'}`));
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error checking triggers: ${error.message}`);
    return false;
  }
}

async function testTrigger() {
  console.log('\n🧪 Testing trigger functionality...');
  
  try {
    // Create a test booking with null booking_ref
    const { data: testBooking, error } = await supabase
      .from('bookings')
      .insert({
        customer_name: 'Trigger Test',
        customer_phone: '+15551234567',
        customer_email: 'trigger@test.com',
        device_model_id: 1,
        service_id: 1,
        service_location_id: 1,
        booking_date: new Date().toISOString(),
        status: 'pending',
        booking_ref: null, // Should be set by trigger
      })
      .select('booking_ref, id')
      .single();

    if (error) {
      console.error(`❌ Test booking failed: ${error.message}`);
      
      // Check if it's an RLS policy error
      if (error.message.includes('row-level security policy')) {
        console.log('🔒 RLS policy is preventing insertion');
        console.log('💡 We need to update the RLS policy first');
        return false;
      }
      
      // Check if it's a foreign key error
      if (error.message.includes('foreign key')) {
        console.log('🔗 Foreign key constraint failed');
        console.log('💡 Need valid device_model_id, service_id, service_location_id');
        
        // Try with different IDs
        console.log('🔄 Trying with different IDs...');
        
        // Get first available IDs
        const { data: deviceModels } = await supabase
          .from('device_models')
          .select('id')
          .limit(1)
          .single();
        
        const { data: services } = await supabase
          .from('services')
          .select('id')
          .limit(1)
          .single();
        
        const { data: serviceLocations } = await supabase
          .from('service_locations')
          .select('id')
          .limit(1)
          .single();
        
        if (deviceModels && services && serviceLocations) {
          const { data: testBooking2, error: error2 } = await supabase
            .from('bookings')
            .insert({
              customer_name: 'Trigger Test',
              customer_phone: '+15551234567',
              customer_email: 'trigger@test.com',
              device_model_id: deviceModels.id,
              service_id: services.id,
              service_location_id: serviceLocations.id,
              booking_date: new Date().toISOString(),
              status: 'pending',
              booking_ref: null,
            })
            .select('booking_ref, id')
            .single();
            
          if (error2) {
            console.error(`❌ Second attempt failed: ${error2.message}`);
            return false;
          }
          
          console.log(`✅ Test booking created with reference: ${testBooking2.booking_ref}`);
          console.log(`📋 Trigger ${testBooking2.booking_ref?.startsWith('TEC-') ? '✅ IS working' : '❌ NOT working'}`);
          
          // Clean up
          await supabase
            .from('bookings')
            .delete()
            .eq('id', testBooking2.id);
          console.log('🧹 Cleaned up test booking');
          
          return testBooking2.booking_ref?.startsWith('TEC-');
        }
      }
      
      return false;
    } else {
      console.log(`✅ Test booking created with reference: ${testBooking.booking_ref}`);
      console.log(`📋 Trigger ${testBooking.booking_ref?.startsWith('TEC-') ? '✅ IS working' : '❌ NOT working'}`);
      
      // Clean up
      await supabase
        .from('bookings')
        .delete()
        .eq('id', testBooking.id);
      console.log('🧹 Cleaned up test booking');
      
      return testBooking.booking_ref?.startsWith('TEC-');
    }
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    // Test connection by counting bookings
    const { count, error } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`❌ Connection failed: ${error.message}`);
      process.exit(1);
    }

    console.log(`✅ Connected to Supabase (bookings count: ${count || 0})`);
    
    // Check existing triggers
    await checkExistingTriggers();
    
    // Test current trigger state
    console.log('\n🔬 Testing current trigger state...');
    const triggerWorks = await testTrigger();
    
    if (triggerWorks) {
      console.log('\n✨ Trigger is already working!');
      console.log('🎯 Booking references are being generated automatically');
    } else {
      console.log('\n⚠️  Trigger is NOT working');
      console.log('💡 Need to apply triggers manually via Supabase dashboard');
      console.log('\n📋 Manual steps:');
      console.log('1. Go to https://supabase.com/dashboard/project/uypdcusjyrfamohuwdxn/sql');
      console.log('2. Run the SQL from plans/Proposed Sql Schema for operation ready/v2_migration.sql');
      console.log('3. Focus on Section 5: Triggers & Automation (lines 270-325)');
      console.log('4. Also check Section 6: Security (RLS) for policy updates');
    }
    
    process.exit(triggerWorks ? 0 : 1);
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

main();