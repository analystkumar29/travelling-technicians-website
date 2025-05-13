// Simple test script to verify the Supabase booking flow
// This uses the direct Supabase client to work around any API issues
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Create a Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to generate a reference number
function generateReferenceNumber() {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// Function to directly insert a booking into the database
async function directInsertBooking() {
  console.log('=== DIRECT DATABASE INSERTION ===');
  
  const reference = generateReferenceNumber();
  console.log(`Generated reference: ${reference}`);
  
  try {
    // Use raw SQL to insert the most minimal record possible
    console.log('Inserting minimal booking record...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Try the insert with only required fields to avoid any triggers
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: `
        INSERT INTO bookings (
          reference_number, 
          device_type, 
          service_type, 
          booking_date, 
          booking_time, 
          customer_name, 
          customer_email, 
          customer_phone,
          address,
          postal_code,
          status
        ) VALUES (
          '${reference}',
          'mobile',
          'screen_replacement',
          '${today}',
          '09-11',
          'Minimal Test User',
          'minimal-${Date.now()}@example.com',
          '5551234567',
          '123 Test St',
          'V6B 1A1',
          'pending'
        );
        
        SELECT * FROM bookings WHERE reference_number = '${reference}';
      `
    });
    
    if (error) {
      console.error('Database insert failed:', error);
      return { success: false, error };
    }
    
    console.log('Booking created successfully:', {
      reference
    });
    
    // Now try to get it via the API
    console.log('\n=== RETRIEVING VIA API ===');
    console.log(`Fetching booking with reference: ${reference}`);
    
    const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const response = await fetch(`${devServer}/api/bookings/${reference}`);
    
    if (!response.ok) {
      console.error('API fetch failed:', response.status);
      return { success: false, error: 'API fetch failed' };
    }
    
    const bookingData = await response.json();
    console.log('API fetch succeeded:', {
      reference: bookingData.referenceNumber,
      customerName: bookingData.customer?.name,
      deviceType: bookingData.device?.type,
      status: bookingData.status
    });
    
    // Now try to update it
    console.log('\n=== UPDATING VIA API ===');
    
    const updateResponse = await fetch(`${devServer}/api/bookings/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference,
        appointmentTime: '13-15',
        issueDescription: 'Updated via direct test'
      })
    });
    
    if (!updateResponse.ok) {
      console.error('API update failed:', updateResponse.status);
      return { success: false, error: 'API update failed' };
    }
    
    const updateData = await updateResponse.json();
    console.log('API update succeeded:', {
      reference: updateData.booking.referenceNumber,
      time: updateData.booking.appointment.time,
      description: updateData.booking.service.description
    });
    
    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
    console.log(`Booking reference for manual verification: ${reference}`);
    
    return { success: true, reference };
  } catch (err) {
    console.error('Exception during test:', err);
    return { success: false, error: err.message };
  }
}

// Run the test
directInsertBooking(); 