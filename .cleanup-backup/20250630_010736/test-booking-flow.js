// Test the complete booking flow using our new SupabaseStorageService
require('dotenv').config({ path: '.env.local' });

// Import our actual service implementation - using relative paths based on project structure
const SupabaseStorageService = require('./src/services/SupabaseStorageService').default;
const { normalizeBookingData, denormalizeBookingData } = require('./src/services/transformers/bookingTransformer');

// Generate test data
function generateTestData() {
  const now = new Date();
  const bookingDate = new Date(now);
  bookingDate.setDate(now.getDate() + 3); // 3 days from now
  
  return {
    deviceType: 'mobile',
    deviceBrand: 'Samsung',
    deviceModel: 'Galaxy S22',
    serviceType: 'battery_replacement',
    issueDescription: 'Battery drains quickly',
    appointmentDate: bookingDate.toISOString().split('T')[0],
    appointmentTime: '13-15',
    customerName: 'Test Customer',
    customerEmail: `test_${Date.now()}@example.com`,
    customerPhone: `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    address: '456 Test Avenue, Vancouver, BC',
    postalCode: 'V6B 2A9'
  };
}

// Generate a reference number for testing
function generateReferenceNumber() {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// Test the booking flow using SupabaseStorageService
async function testBookingFlow() {
  console.log('=== TESTING FULL BOOKING FLOW WITH SUPABASE INTEGRATION ===');
  
  try {
    // Step 1: Generate booking data
    const testData = generateTestData();
    console.log('Test data generated:', testData);
    
    // Step 2: Generate reference number
    const referenceNumber = generateReferenceNumber();
    console.log('Generated reference number:', referenceNumber);
    
    // Step 3: Prepare data for database
    const bookingData = {
      reference_number: referenceNumber,
      device_type: testData.deviceType,
      device_brand: testData.deviceBrand,
      device_model: testData.deviceModel,
      service_type: testData.serviceType,
      issue_description: testData.issueDescription,
      booking_date: testData.appointmentDate,
      booking_time: testData.appointmentTime,
      customer_name: testData.customerName,
      customer_email: testData.customerEmail,
      customer_phone: testData.customerPhone,
      address: testData.address,
      postal_code: testData.postalCode,
      status: 'pending'
    };
    
    console.log('\n--- Testing Booking Creation Using SupabaseStorageService ---');
    // Step 4: Create booking using our service
    const createdBooking = await SupabaseStorageService.createBooking(bookingData);
    console.log('Booking created successfully:', {
      id: createdBooking.id,
      reference: createdBooking.reference_number,
      created_at: createdBooking.created_at
    });
    
    console.log('\n--- Testing Booking Retrieval Using SupabaseStorageService ---');
    // Step 5: Retrieve booking by reference
    const retrievedBooking = await SupabaseStorageService.getBookingByReference(referenceNumber);
    if (!retrievedBooking) {
      throw new Error('Failed to retrieve booking by reference');
    }
    
    console.log('Booking retrieved successfully:', {
      id: retrievedBooking.id,
      reference: retrievedBooking.reference_number,
      customer: retrievedBooking.customer_name,
      service: retrievedBooking.service_type
    });
    
    // Step 6: Test normalization - simulating what would happen in the app
    console.log('\n--- Testing Booking Data Normalization ---');
    const normalizedBooking = normalizeBookingData(retrievedBooking);
    console.log('Normalized booking data:', {
      referenceNumber: normalizedBooking.referenceNumber,
      customer: normalizedBooking.customer,
      device: normalizedBooking.device,
      service: normalizedBooking.service,
      appointment: normalizedBooking.appointment,
      location: normalizedBooking.location
    });
    
    console.log('\n--- Testing Booking Update Using SupabaseStorageService ---');
    // Step 7: Update booking
    const updateData = {
      booking_time: '15-17', // Changed time slot
      status: 'confirmed',
      issue_description: 'Battery drains quickly - needs replacement'
    };
    
    const updatedBooking = await SupabaseStorageService.updateBooking(referenceNumber, updateData);
    console.log('Booking updated successfully:', {
      reference: updatedBooking.reference_number,
      time: updatedBooking.booking_time,
      status: updatedBooking.status
    });
    
    console.log('\n--- Testing Booking Deletion (Cleanup) ---');
    // Step 8: Delete the test booking
    const deleted = await SupabaseStorageService.deleteBooking(referenceNumber);
    if (!deleted) {
      throw new Error('Failed to delete booking');
    }
    
    console.log(`Test booking with reference ${referenceNumber} deleted successfully`);
    
    console.log('\n✅ ALL TESTS PASSED - Supabase integration is working correctly');
    return true;
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    return false;
  }
}

// Run the test
testBookingFlow(); 