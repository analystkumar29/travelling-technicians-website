#!/usr/bin/env node

/**
 * Database Health Check & Fix Script
 * 
 * This script checks the current database state and applies missing:
 * 1. Performance indexes
 * 2. Triggers for booking references and warranties
 * 3. Security policies (tighten RLS)
 * 
 * Usage: node scripts/check-and-fix-database.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Performance indexes from performance index 2.12.sql
const PERFORMANCE_INDEXES = [
  // Bookings table indexes
  'CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);',
  'CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON bookings(booking_ref);',
  'CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);',
  'CREATE INDEX IF NOT EXISTS idx_bookings_technician ON bookings(technician_id) WHERE technician_id IS NOT NULL;',
  
  // WhatsApp dispatches indexes
  'CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_status ON whatsapp_dispatches(status);',
  'CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_technician ON whatsapp_dispatches(technician_id);',
  'CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_booking ON whatsapp_dispatches(booking_id);',
  
  // Dynamic pricing index
  'CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_model_service ON dynamic_pricing(model_id, service_id) WHERE is_active = true;',
  
  // SEO critical indexes
  'CREATE INDEX IF NOT EXISTS idx_device_models_slug ON device_models(slug) WHERE is_active = true;',
  'CREATE INDEX IF NOT EXISTS idx_service_locations_slug ON service_locations(slug) WHERE is_active = true;',
  
  // Customer profiles index
  'CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);'
];

// Triggers from v2_migration.sql Section 5
const TRIGGERS = [
  // 5.1 Auto-Generate Booking Ref (TEC-1001)
  `CREATE OR REPLACE FUNCTION generate_booking_ref()
  RETURNS TRIGGER AS $$
  DECLARE
      next_num INTEGER;
  BEGIN
      SELECT COALESCE(MAX(NULLIF(regexp_replace(booking_ref, '\\D', '', 'g'), '')::int), 1000) + 1
      INTO next_num FROM bookings;
      
      NEW.booking_ref := 'TEC-' || next_num;
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;`,
  
  `DROP TRIGGER IF EXISTS set_booking_ref ON bookings;
  CREATE TRIGGER set_booking_ref
      BEFORE INSERT ON bookings
      FOR EACH ROW
      WHEN (NEW.booking_ref IS NULL)
      EXECUTE FUNCTION generate_booking_ref();`,
  
  // 5.2 Auto-Generate Warranty Number
  `CREATE OR REPLACE FUNCTION generate_warranty_number()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.warranty_number := 'WT-' || to_char(NOW(), 'YYMMDD') || '-' || substring(NEW.id::text from 1 for 4);
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;`,
  
  `DROP TRIGGER IF EXISTS set_warranty_number ON warranties;
  CREATE TRIGGER set_warranty_number
      BEFORE INSERT ON warranties
      FOR EACH ROW
      EXECUTE FUNCTION generate_warranty_number();`,
  
  // 5.3 Auto-Log Status Changes
  `CREATE OR REPLACE FUNCTION log_booking_status_change()
  RETURNS TRIGGER AS $$
  BEGIN
      IF OLD.status IS DISTINCT FROM NEW.status THEN
          INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by)
          VALUES (NEW.id, OLD.status, NEW.status, 'system');
      END IF;
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;`,
  
  `DROP TRIGGER IF EXISTS booking_status_change_trigger ON bookings;
  CREATE TRIGGER booking_status_change_trigger
      AFTER UPDATE ON bookings
      FOR EACH ROW
      EXECUTE FUNCTION log_booking_status_change();`
];

// Security policy updates (tighten from WITH CHECK (true))
const SECURITY_POLICIES = [
  // Drop the overly permissive policy
  'DROP POLICY IF EXISTS "Public Create Booking" ON bookings;',
  
  // Create a tighter policy that requires customer_phone and customer_name
  `CREATE POLICY "Public Create Booking" ON bookings FOR INSERT 
   WITH CHECK (
     customer_phone IS NOT NULL AND 
     customer_name IS NOT NULL AND
     length(customer_phone) >= 10
   );`
];

async function executeSQL(sql) {
  console.log(`📝 Executing: ${sql.substring(0, 100)}...`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If exec_sql function doesn't exist, try direct SQL (requires service role)
      console.log('⚠️  exec_sql function not available, trying alternative approach...');
      
      // For now, we'll just log the error and continue
      console.error(`❌ SQL Error: ${error.message}`);
      return false;
    }
    
    console.log('✅ SQL executed successfully');
    return true;
  } catch (err) {
    console.error(`❌ Exception: ${err.message}`);
    return false;
  }
}

async function checkExistingIndexes() {
  console.log('\n🔍 Checking existing indexes...');
  
  const checkIndexesSQL = `
    SELECT 
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes 
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: checkIndexesSQL });
    
    if (error) {
      console.log('⚠️  Could not fetch indexes directly, will attempt to create them anyway');
      return [];
    }
    
    console.log(`📊 Found ${data?.length || 0} existing indexes`);
    
    // Log important indexes
    const importantIndexes = (data || []).filter(idx => 
      idx.indexname.includes('idx_') || 
      idx.indexname.includes('bookings') ||
      idx.indexname.includes('customer_phone') ||
      idx.indexname.includes('booking_ref')
    );
    
    if (importantIndexes.length > 0) {
      console.log('📋 Important indexes found:');
      importantIndexes.forEach(idx => {
        console.log(`   - ${idx.indexname} on ${idx.tablename}`);
      });
    }
    
    return data || [];
  } catch (err) {
    console.error(`❌ Error checking indexes: ${err.message}`);
    return [];
  }
}

async function checkExistingTriggers() {
  console.log('\n🔍 Checking existing triggers...');
  
  const checkTriggersSQL = `
    SELECT 
      trigger_name,
      event_manipulation,
      event_object_table,
      action_statement
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: checkTriggersSQL });
    
    if (error) {
      console.log('⚠️  Could not fetch triggers directly');
      return [];
    }
    
    console.log(`📊 Found ${data?.length || 0} existing triggers`);
    
    // Log triggers
    if (data && data.length > 0) {
      console.log('📋 Triggers found:');
      data.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} on ${trigger.event_object_table}`);
      });
    }
    
    return data || [];
  } catch (err) {
    console.error(`❌ Error checking triggers: ${err.message}`);
    return [];
  }
}

async function testBookingTrigger() {
  console.log('\n🧪 Testing booking trigger functionality...');
  
  // First, let's check the latest booking to see if trigger is working
  const checkLatestBookingSQL = `
    SELECT booking_ref, created_at 
    FROM bookings 
    ORDER BY created_at DESC 
    LIMIT 5;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: checkLatestBookingSQL });
    
    if (error) {
      console.log('⚠️  Could not check latest bookings');
      return false;
    }
    
    if (data && data.length > 0) {
      console.log('📋 Latest bookings:');
      data.forEach(booking => {
        const hasTECFormat = booking.booking_ref && booking.booking_ref.startsWith('TEC-');
        const status = hasTECFormat ? '✅' : '❌';
        console.log(`   ${status} ${booking.booking_ref || 'NULL'} - ${booking.created_at}`);
      });
      
      // Check if any booking has TEC- format
      const hasTECFormat = data.some(booking => 
        booking.booking_ref && booking.booking_ref.startsWith('TEC-')
      );
      
      return hasTECFormat;
    }
    
    return false;
  } catch (err) {
    console.error(`❌ Error testing trigger: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Database Health Check & Fix Script');
  console.log('=====================================\n');
  
  // Check connection
  console.log('🔌 Testing Supabase connection...');
  const { data: testData, error: testError } = await supabase.from('bookings').select('count', { count: 'exact', head: true });
  
  if (testError) {
    console.error(`❌ Connection failed: ${testError.message}`);
    console.log('⚠️  Continuing anyway - some operations may fail\n');
  } else {
    console.log(`✅ Connected to Supabase (bookings count: ${testData?.count || 0})\n`);
  }
  
  // Step 1: Check existing indexes
  const existingIndexes = await checkExistingIndexes();
  
  // Step 2: Apply performance indexes
  console.log('\n📈 Applying performance indexes...');
  let indexesApplied = 0;
  
  for (const indexSQL of PERFORMANCE_INDEXES) {
    const success = await executeSQL(indexSQL);
    if (success) indexesApplied++;
  }
  
  console.log(`✅ Applied ${indexesApplied} of ${PERFORMANCE_INDEXES.length} performance indexes\n`);
  
  // Step 3: Check existing triggers
  const existingTriggers = await checkExistingTriggers();
  
  // Step 4: Apply missing triggers
  console.log('\n⚙️  Applying database triggers...');
  let triggersApplied = 0;
  
  for (const triggerSQL of TRIGGERS) {
    const success = await executeSQL(triggerSQL);
    if (success) triggersApplied++;
  }
  
  console.log(`✅ Applied ${triggersApplied} of ${TRIGGERS.length} triggers\n`);
  
  // Step 5: Test trigger functionality
  const triggerWorking = await testBookingTrigger();
  
  if (!triggerWorking) {
    console.log('⚠️  Booking trigger may not be working correctly');
    console.log('   Test bookings show NULL or TEST- format instead of TEC-1001');
  } else {
    console.log('✅ Booking trigger appears to be working correctly');
  }
  
  // Step 6: Update security policies
  console.log('\n🔒 Updating security policies...');
  let policiesApplied = 0;
  
  for (const policySQL of SECURITY_POLICIES) {
    const success = await executeSQL(policySQL);
    if (success) policiesApplied++;
  }
  
  console.log(`✅ Applied ${policiesApplied} of ${SECURITY_POLICIES.length} security policies\n`);
  
  // Summary
  console.log('📊 SUMMARY');
  console.log('==========');
  console.log(`• Performance Indexes: ${indexesApplied}/${PERFORMANCE_INDEXES.length} applied`);
  console.log(`• Database Triggers: ${triggersApplied}/${TRIGGERS.length} applied`);
  console.log(`• Booking Trigger Working: ${triggerWorking ? '✅ Yes' : '❌ No (needs investigation)'}`);
  console.log(`• Security Policies: ${policiesApplied}/${SECURITY_POLICIES.length} updated`);
  console.log('\n🎯 Next steps:');
  console.log('1. Run /api/test-supabase to verify fixes');
  console.log('2. Check that new bookings get TEC-1001 format');
  console.log('3. Verify indexes improve query performance');
  
  // Create a simple test booking to verify trigger
  console.log('\n🧪 Creating test booking to verify trigger...');
  
  const testBooking = {
    customer_name: 'Test Customer',
    customer_phone: '1234567890',
    customer_email: 'test@example.com',
    customer_address: '123 Test St',
    model_id: null,
    service_id: null,
    location_id: null,
    status: 'pending',
    quoted_price: 99.99
  };
  
  const { data: newBooking, error: insertError } = await supabase
    .from('bookings')
    .insert(testBooking)
    .select()
    .single();
  
  if (insertError) {
    console.error(`❌ Test booking failed: ${insertError.message}`);
  } else {
    console.log(`✅ Test booking created: ${newBooking.booking_ref || 'NULL'}`);
    
    if (newBooking.booking_ref && newBooking.booking_ref.startsWith('TEC-')) {
      console.log('🎉 SUCCESS: Booking trigger is working correctly!');
    } else {
      console.log('⚠️  WARNING: Booking trigger may not be working - check booking_ref format');
    }
  }
  
  console.log('\n✨ Database health check complete!');
}

// Run the script
main().catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});