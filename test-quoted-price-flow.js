#!/usr/bin/env node

/**
 * Test script to verify quoted_price is being saved correctly
 * This simulates a booking creation with quoted_price
 */

const fetch = require('node-fetch');

async function testBookingWithQuotedPrice() {
  console.log('🧪 Testing Booking Flow with quoted_price...\n');
  
  // Test data - iPhone 16 Pro screen replacement
  const bookingData = {
    deviceType: 'mobile',
    deviceBrand: 'apple',
    deviceModel: 'iPhone 16 Pro',
    serviceType: ['screen-replacement'],
    issueDescription: 'Test booking with quoted_price verification',
    appointmentDate: '2026-02-01',
    appointmentTime: 'morning',
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    customerPhone: '1234567890',
    address: '123 Test St',
    postalCode: 'V5C 6R9',
    city: 'Burnaby',
    province: 'BC',
    pricingTier: 'standard',
    brand: 'apple',
    model: 'iPhone 16 Pro',
    quoted_price: 299.99  // Explicitly set quoted_price for testing
  };
  
  console.log('📋 Test Booking Data:');
  console.log(JSON.stringify(bookingData, null, 2));
  console.log('\n---\n');
  
  try {
    // Make API request to create booking
    console.log('📤 Sending booking creation request...');
    const response = await fetch('http://localhost:3000/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    console.log('📥 API Response:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n---\n');
    
    if (response.ok && result.success) {
      console.log('✅ Booking created successfully!');
      console.log(`📞 Reference: ${result.reference}`);
      console.log(`💰 quoted_price sent: ${bookingData.quoted_price}`);
      
      // Check if booking object has quoted_price
      if (result.booking) {
        console.log(`📊 Booking object received:`, result.booking);
        
        // Check if quoted_price is in the response
        if (result.booking.quoted_price !== undefined) {
          console.log(`✅ quoted_price in response: ${result.booking.quoted_price}`);
        } else {
          console.log('⚠️  quoted_price not found in booking response');
        }
      }
      
      // Now query the database directly to verify
      console.log('\n🔍 Verifying database storage...');
      await verifyDatabaseStorage(result.reference, bookingData.quoted_price);
      
    } else {
      console.log('❌ Booking creation failed:');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${result.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

async function verifyDatabaseStorage(reference, expectedPrice) {
  try {
    // Use Supabase MCP tool to query the database
    const { exec } = require('child_process');
    
    // First, let's check if we can query the bookings table
    console.log('📊 Querying database for booking...');
    
    // We'll use a simple curl command to check the API endpoint that lists bookings
    const checkResponse = await fetch('http://localhost:3000/api/bookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (checkResponse.ok) {
      const bookings = await checkResponse.json();
      console.log(`📊 Found ${bookings.length} bookings in system`);
      
      // Find our test booking
      const testBooking = bookings.find(b => b.booking_ref === reference);
      if (testBooking) {
        console.log('✅ Found test booking in database:');
        console.log(`   Reference: ${testBooking.booking_ref}`);
        console.log(`   quoted_price: ${testBooking.quoted_price}`);
        console.log(`   Expected: ${expectedPrice}`);
        
        if (testBooking.quoted_price === expectedPrice) {
          console.log('🎉 SUCCESS: quoted_price correctly saved to database!');
        } else if (testBooking.quoted_price === null || testBooking.quoted_price === undefined) {
          console.log('❌ FAILURE: quoted_price is null/undefined in database');
        } else {
          console.log(`⚠️  WARNING: quoted_price mismatch. Got ${testBooking.quoted_price}, expected ${expectedPrice}`);
        }
      } else {
        console.log('⚠️  Test booking not found in bookings list');
      }
    } else {
      console.log('⚠️  Could not fetch bookings list');
    }
    
  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
  }
}

// Run the test
testBookingWithQuotedPrice().catch(console.error);