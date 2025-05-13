// Test script to verify Supabase integration for the booking flow
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Generate a reference number for testing
function generateReferenceNumber() {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// Function to generate test booking data matching the exact schema in create.ts API endpoint
function generateTestBookingData() {
  const referenceNumber = generateReferenceNumber();
  return {
    // Client-side request format (camelCase with brand instead of device_brand)
    deviceType: 'mobile',
    brand: 'Apple', // Using brand instead of device_brand to match the API endpoint
    model: 'iPhone 13', // Using model instead of device_model to match the API endpoint
    serviceType: 'screen_replacement',
    appointmentDate: new Date().toISOString().split('T')[0], // Today's date
    appointmentTime: '09-11',
    customerName: 'Test User',
    customerEmail: `test_${Date.now()}@example.com`,
    customerPhone: `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    address: '123 Test Street, Vancouver, BC',
    postalCode: 'V6B 1A1',
    message: 'Test booking for Supabase integration verification'
  };
}

// First, let's test if we can query the database structure
async function testDatabaseStructure() {
  console.log('--- Testing Database Structure ---');
  
  try {
    // This will list all tables in the public schema
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing bookings table:', error);
      return false;
    }
    
    console.log('Successfully accessed bookings table');
    
    // Let's also check the schema of the bookings table
    const { data: info, error: infoError } = await supabase.rpc('get_table_information', {
      table_name: 'bookings'
    });
    
    if (infoError) {
      console.error('Error getting table info:', infoError);
    } else if (info) {
      console.log('Bookings table schema:', info);
    }
    
    return true;
  } catch (err) {
    console.error('Exception during database structure test:', err);
    return false;
  }
}

// Test functions
async function testCreateBooking() {
  console.log('--- Testing Booking Creation ---');
  const bookingData = generateTestBookingData();
  
  console.log(`Creating test booking with reference: ${bookingData.reference_number || 'To be generated'}`);
  console.log('Booking data:', bookingData);
  
  try {
    // This is how the API would transform the data
    const supabaseBookingData = {
      reference_number: generateReferenceNumber(),
      device_type: bookingData.deviceType === 'tablet' ? 'mobile' : bookingData.deviceType,
      device_brand: bookingData.brand || bookingData.deviceBrand,
      device_model: bookingData.model || bookingData.deviceModel,
      service_type: bookingData.serviceType,
      booking_date: bookingData.appointmentDate || bookingData.bookingDate,
      booking_time: bookingData.appointmentTime || bookingData.bookingTime,
      customer_name: bookingData.customerName,
      customer_email: bookingData.customerEmail,
      customer_phone: bookingData.customerPhone,
      address: bookingData.address,
      postal_code: bookingData.postalCode,
      issue_description: bookingData.message || bookingData.issueDescription,
      status: 'pending'
    };
    
    console.log('Transformed booking data for Supabase:', supabaseBookingData);
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(supabaseBookingData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating booking:', error);
      return false;
    }
    
    console.log('Booking created successfully:', {
      id: data.id,
      reference: data.reference_number,
      customer: data.customer_name,
      created_at: data.created_at
    });
    
    return supabaseBookingData.reference_number;
  } catch (err) {
    console.error('Exception during booking creation:', err);
    return false;
  }
}

async function testGetBookingByReference(referenceNumber) {
  console.log(`\n--- Testing Booking Retrieval: ${referenceNumber} ---`);
  
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', referenceNumber)
      .single();
    
    if (error) {
      console.error('Error retrieving booking:', error);
      return false;
    }
    
    console.log('Booking retrieved successfully:', {
      id: data.id,
      reference: data.reference_number,
      customer: data.customer_name,
      device: `${data.device_brand} ${data.device_model}`,
      service: data.service_type,
      date: data.booking_date,
      time: data.booking_time,
      status: data.status
    });
    
    return data;
  } catch (err) {
    console.error('Exception during booking retrieval:', err);
    return false;
  }
}

async function testUpdateBooking(referenceNumber) {
  console.log(`\n--- Testing Booking Update: ${referenceNumber} ---`);
  
  const updateData = {
    booking_time: '13-15', // Changed time slot
    issue_description: 'Updated test description',
    status: 'confirmed'
  };
  
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('reference_number', referenceNumber)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating booking:', error);
      return false;
    }
    
    console.log('Booking updated successfully:', {
      reference: data.reference_number,
      time: data.booking_time, // Should show updated time
      status: data.status, // Should show confirmed
      description: data.issue_description
    });
    
    return data;
  } catch (err) {
    console.error('Exception during booking update:', err);
    return false;
  }
}

async function testDeleteBooking(referenceNumber) {
  console.log(`\n--- Testing Booking Deletion: ${referenceNumber} ---`);
  
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('reference_number', referenceNumber);
    
    if (error) {
      console.error('Error deleting booking:', error);
      return false;
    }
    
    console.log(`Booking with reference ${referenceNumber} deleted successfully`);
    
    // Verify deletion
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', referenceNumber);
    
    if (data && data.length === 0) {
      console.log('Deletion verified: Booking no longer exists in database');
      return true;
    } else {
      console.error('Deletion verification failed: Booking still exists');
      return false;
    }
  } catch (err) {
    console.error('Exception during booking deletion:', err);
    return false;
  }
}

async function countBookings() {
  console.log('\n--- Checking Total Bookings in Database ---');
  
  try {
    const { data, error, count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('Error counting bookings:', error);
      return false;
    }
    
    console.log(`Total bookings in database: ${data.length}`);
    return data.length;
  } catch (err) {
    console.error('Exception during booking count:', err);
    return false;
  }
}

// Run all tests in sequence
async function runAllTests() {
  console.log('=== SUPABASE BOOKING FLOW TESTING ===');
  console.log('Supabase URL:', supabaseUrl);
  
  // Check database structure first
  const structureTest = await testDatabaseStructure();
  if (!structureTest) {
    console.error('Database structure test failed. Please check the connection details and table structure.');
    return;
  }
  
  // Initial count
  await countBookings();
  
  // Test 1: Create a booking
  const referenceNumber = await testCreateBooking();
  if (!referenceNumber) {
    console.error('Booking creation test failed. Aborting further tests.');
    return;
  }
  
  // Test 2: Retrieve the booking
  const bookingData = await testGetBookingByReference(referenceNumber);
  if (!bookingData) {
    console.error('Booking retrieval test failed. Aborting further tests.');
    return;
  }
  
  // Test 3: Update the booking
  const updatedBooking = await testUpdateBooking(referenceNumber);
  if (!updatedBooking) {
    console.error('Booking update test failed. Aborting further tests.');
    return;
  }
  
  // Test 4: Delete the booking (cleanup)
  const deleted = await testDeleteBooking(referenceNumber);
  if (!deleted) {
    console.error('Booking deletion test failed.');
  }
  
  // Final count
  await countBookings();
  
  console.log('\n=== TESTING COMPLETED ===');
  
  // Final test result summary
  if (referenceNumber && bookingData && updatedBooking && deleted) {
    console.log('✅ ALL TESTS PASSED - Supabase booking flow is working correctly');
  } else {
    console.log('❌ SOME TESTS FAILED - Check the logs for details');
  }
}

// Run all tests
runAllTests(); 