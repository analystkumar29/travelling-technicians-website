#!/usr/bin/env node

/**
 * Script to apply missing triggers for booking references and warranties
 * Uses Supabase REST API with service role key to execute SQL
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
    // Use the REST API to execute SQL via the supabase-js client
    // Note: supabase-js doesn't have direct SQL execution, so we'll use fetch
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

async function applyTriggers() {
  console.log('🚀 Applying Database Triggers');
  console.log('=============================\n');

  // 1. Create function to generate booking reference
  const generateBookingRefSQL = `
    CREATE OR REPLACE FUNCTION generate_booking_ref()
    RETURNS TRIGGER AS $$
    DECLARE
        next_num INTEGER;
    BEGIN
        -- Get the next sequential number
        SELECT COALESCE(MAX(CAST(SUBSTRING(booking_ref FROM 5) AS INTEGER)), 1000) + 1
        INTO next_num
        FROM bookings
        WHERE booking_ref LIKE 'TEC-%';
        
        -- Set the booking reference
        NEW.booking_ref := 'TEC-' || next_num;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // 2. Create trigger for booking reference
  const bookingRefTriggerSQL = `
    DROP TRIGGER IF EXISTS set_booking_ref ON bookings;
    CREATE TRIGGER set_booking_ref
        BEFORE INSERT ON bookings
        FOR EACH ROW
        WHEN (NEW.booking_ref IS NULL OR NEW.booking_ref LIKE 'TEST-%')
        EXECUTE FUNCTION generate_booking_ref();
  `;

  // 3. Create function to generate warranty number
  const generateWarrantyNumberSQL = `
    CREATE OR REPLACE FUNCTION generate_warranty_number()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Generate warranty number: WR-YYYYMMDD-XXXXX
        NEW.warranty_number := 'WR-' || 
            TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' ||
            LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // 4. Create trigger for warranty number
  const warrantyTriggerSQL = `
    DROP TRIGGER IF EXISTS set_warranty_number ON warranties;
    CREATE TRIGGER set_warranty_number
        BEFORE INSERT ON warranties
        FOR EACH ROW
        WHEN (NEW.warranty_number IS NULL)
        EXECUTE FUNCTION generate_warranty_number();
  `;

  // 5. Create function to log booking status changes
  const logBookingStatusChangeSQL = `
    CREATE OR REPLACE FUNCTION log_booking_status_change()
    RETURNS TRIGGER AS $$
    BEGIN
        IF OLD.status != NEW.status THEN
            INSERT INTO booking_audit_logs (
                booking_id,
                old_status,
                new_status,
                changed_by,
                change_reason
            ) VALUES (
                NEW.id,
                OLD.status,
                NEW.status,
                'system',
                'Status updated via trigger'
            );
        END IF;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // 6. Create trigger for booking status changes
  const bookingStatusTriggerSQL = `
    DROP TRIGGER IF EXISTS booking_status_change_trigger ON bookings;
    CREATE TRIGGER booking_status_change_trigger
        AFTER UPDATE OF status ON bookings
        FOR EACH ROW
        EXECUTE FUNCTION log_booking_status_change();
  `;

  const triggers = [
    { name: 'generate_booking_ref function', sql: generateBookingRefSQL },
    { name: 'set_booking_ref trigger', sql: bookingRefTriggerSQL },
    { name: 'generate_warranty_number function', sql: generateWarrantyNumberSQL },
    { name: 'set_warranty_number trigger', sql: warrantyTriggerSQL },
    { name: 'log_booking_status_change function', sql: logBookingStatusChangeSQL },
    { name: 'booking_status_change_trigger', sql: bookingStatusTriggerSQL },
  ];

  let successCount = 0;
  
  for (const trigger of triggers) {
    console.log(`\n🔧 Applying ${trigger.name}...`);
    const success = await executeSQL(trigger.sql);
    if (success) {
      successCount++;
    }
  }

  console.log(`\n📊 SUMMARY: Applied ${successCount}/${triggers.length} triggers`);

  // Test the trigger
  console.log('\n🧪 Testing booking trigger...');
  try {
    // Create a test booking to see if trigger works
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
      .select('booking_ref')
      .single();

    if (error) {
      console.error(`❌ Test booking failed: ${error.message}`);
      console.log('⚠️  This might be due to RLS policies or missing foreign keys');
    } else {
      console.log(`✅ Test booking created with reference: ${testBooking.booking_ref}`);
      console.log(`📋 Trigger ${testBooking.booking_ref?.startsWith('TEC-') ? '✅ IS working' : '❌ NOT working'}`);
      
      // Clean up test booking
      if (testBooking.booking_ref) {
        await supabase
          .from('bookings')
          .delete()
          .eq('booking_ref', testBooking.booking_ref);
        console.log('🧹 Cleaned up test booking');
      }
    }
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }

  return successCount === triggers.length;
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
    
    // Apply triggers
    const success = await applyTriggers();
    
    if (success) {
      console.log('\n✨ All triggers applied successfully!');
      console.log('\n🎯 Next steps:');
      console.log('1. Run /api/test-supabase to verify booking references');
      console.log('2. Check that new bookings get TEC-1001 format');
      console.log('3. Verify warranties get WR-YYYYMMDD-XXXXX format');
    } else {
      console.log('\n⚠️  Some triggers may not have been applied');
      console.log('Check the errors above and consider manual intervention');
    }
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

main();