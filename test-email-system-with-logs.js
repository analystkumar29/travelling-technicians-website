#!/usr/bin/env node

const https = require('https');

async function testEmailSystemWithLogging() {
  console.log('🔍 TESTING EMAIL SYSTEM WITH COMPREHENSIVE LOGGING');
  console.log('=' .repeat(65));
  
  const productionUrl = 'https://travelling-technicians-website-dbs3ad9df.vercel.app';
  
  // Test booking creation (which should trigger detailed email logging)
  const bookingData = {
    customerName: 'Test Customer for Logging',
    customerEmail: 'test@example.com', // Change this to your email
    customerPhone: '+1-604-555-0123',
    deviceType: 'mobile',
    deviceBrand: 'Apple', 
    deviceModel: 'iPhone 14',
    serviceType: 'Screen Replacement',
    issueDescription: 'Screen is cracked and not responding to touch - Testing logging system',
    appointmentDate: '2024-12-31',
    appointmentTime: '10:00',
    address: '123 Test Street',
    city: 'Vancouver',
    postalCode: 'V6B 1A1',
    urgencyLevel: 'standard',
    agreedToTerms: true
  };

  console.log('\n🧪 STEP 1: Testing Booking Creation with Email Logging...');
  console.log(`   URL: ${productionUrl}/api/bookings/create`);
  console.log(`   Customer: ${bookingData.customerName}`);
  console.log(`   Email: ${bookingData.customerEmail}`);
  console.log(`   Device: ${bookingData.deviceBrand} ${bookingData.deviceModel}`);
  
  try {
    const response = await fetch(`${productionUrl}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EmailLoggingTest/1.0'
      },
      body: JSON.stringify(bookingData)
    });
    
    console.log(`\n📡 Response Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ BOOKING CREATION SUCCESS:');
      console.log(`   Reference: ${result.booking?.reference_number || result.reference || 'N/A'}`);
      console.log(`   Booking ID: ${result.booking?.id || 'N/A'}`);
      console.log(`   Success: ${result.success}`);
      console.log(`   Message: ${result.message}`);
      
      console.log('\n📧 EMAIL SYSTEM ANALYSIS:');
      console.log('   The booking was created successfully.');
      console.log('   Check Vercel Function Logs for detailed email logging:');
      console.log('   1. Go to Vercel Dashboard');
      console.log('   2. Select your project');
      console.log('   3. Go to Functions tab');
      console.log('   4. Look for recent function calls');
      console.log('   5. Check logs for:');
      console.log('      - 🌍 EMAIL API - Environment Variables Check');
      console.log('      - 📧 EMAIL API - Request Data Received');
      console.log('      - 🔧 EMAIL API - SendGrid Configuration Check');
      console.log('      - 📧 BOOKING API - Starting email confirmation process');
      console.log('      - 🔍 EMAIL SERVICE - Environment Check');
      console.log('      - 🌐 EMAIL SERVICE - Making API request');
      console.log('      - 📡 EMAIL SERVICE - API response received');
      
    } else {
      console.log('\n❌ BOOKING CREATION FAILED:');
      const errorText = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${errorText.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.log('\n❌ CONNECTION ERROR:');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n🧪 STEP 2: Testing Direct Email API...');
  try {
    const emailTestData = {
      to: 'test@example.com',
      name: 'Direct Test Customer',
      bookingReference: 'TTR-LOGGING-TEST',
      bookingDate: 'December 31, 2024',
      bookingTime: '10:00 AM',
      service: 'Screen Replacement',
      deviceType: 'mobile',
      brand: 'Apple',
      model: 'iPhone 14',
      address: '123 Test Street, Vancouver, BC V6B 1A1'
    };

    const emailResponse = await fetch(`${productionUrl}/api/send-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EmailLoggingTest/1.0'
      },
      body: JSON.stringify(emailTestData)
    });
    
    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      console.log('\n✅ DIRECT EMAIL API SUCCESS:');
      console.log(`   Success: ${emailResult.success}`);
      console.log(`   Message: ${emailResult.message}`);
      console.log(`   Sent To: ${emailResult.sentTo || 'N/A'}`);
      
      if (emailResult.debug) {
        console.log(`   Debug Info: ${JSON.stringify(emailResult.debug, null, 2)}`);
      }
      
      if (emailResult.message && emailResult.message.includes('simulated')) {
        console.log('\n❌ EMAIL IN SIMULATION MODE');
        console.log('   Reason: Environment variables not properly set on Vercel');
      } else {
        console.log('\n✅ EMAIL SYSTEM WORKING');
        console.log('   Real emails are being sent!');
      }
    } else {
      console.log(`   Email API failed: ${emailResponse.status}`);
    }
  } catch (error) {
    console.log(`   Email API error: ${error.message}`);
  }
  
  console.log('\n📋 WHAT TO DO NEXT:');
  console.log('1. 📊 Check Vercel Function Logs for detailed logging');
  console.log('2. 🔍 Look for the specific log messages mentioned above');
  console.log('3. 📧 If emails are simulated, verify environment variables');
  console.log('4. 🚀 If real emails are sent, test with your actual email');
  
  console.log('\n🔗 HELPFUL LINKS:');
  console.log(`   Vercel Dashboard: https://vercel.com/dashboard`);
  console.log(`   Live Site: ${productionUrl}`);
  console.log(`   Booking Form: ${productionUrl}/book-online`);
}

// Support both Node.js and browser fetch
if (typeof fetch === 'undefined') {
  const fetch = require('node-fetch');
  global.fetch = fetch;
}

testEmailSystemWithLogging().catch(console.error); 