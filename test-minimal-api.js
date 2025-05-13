// Minimal API test for booking creation
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Generate a reference number (not needed for API but useful for logging)
function generateReferenceNumber() {
  const prefix = 'API';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

async function testMinimalBookingAPI() {
  console.log('=== TESTING MINIMAL BOOKING API CREATION ===');
  
  // Generate a reference for logging
  const apiRef = generateReferenceNumber();
  console.log(`Test reference: ${apiRef}`);
  
  // Get dev server URL
  const devServer = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
  console.log(`Using server: ${devServer}`);
  
  try {
    // Create absolutely minimal booking data for the API, only including required fields
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 2);
    const formattedDate = bookingDate.toISOString().split('T')[0];
    
    // Only include the absolute minimum required fields
    const minimalBookingData = {
      deviceType: 'mobile',
      deviceBrand: 'Apple',
      serviceType: 'screen_replacement',
      appointmentDate: formattedDate,
      appointmentTime: '14:00-16:00',
      customerName: 'Minimal Test Customer',
      customerEmail: 'minimal-test@example.com',
      customerPhone: '604-123-4567',
      address: '123 Test Street, Vancouver, BC',
      postalCode: 'V6B 1S5'
    };
    
    console.log('Sending minimal request with data:', {
      ...minimalBookingData,
      customerEmail: '[REDACTED for logs]'
    });
    
    // Send request to the API
    const response = await fetch(`${devServer}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalBookingData),
    });
    
    console.log(`API response status: ${response.status} ${response.statusText}`);
    
    const responseData = await response.text();
    
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(responseData);
      console.log('API response data:', jsonData);
      
      if (jsonData.success && jsonData.booking_reference) {
        console.log(`\nBooking created successfully with reference: ${jsonData.booking_reference}`);
        
        // Try to fetch the newly created booking
        const getResponse = await fetch(`${devServer}/api/bookings/${jsonData.booking_reference}`);
        
        console.log(`Get API response status: ${getResponse.status} ${getResponse.statusText}`);
        
        if (getResponse.ok) {
          const bookingDetails = await getResponse.json();
          console.log('Retrieved booking details:', {
            referenceNumber: bookingDetails.referenceNumber,
            customer: bookingDetails.customer && bookingDetails.customer.name,
            device: bookingDetails.device && {
              type: bookingDetails.device.type,
              brand: bookingDetails.device.brand,
              model: bookingDetails.device.model
            },
            status: bookingDetails.status
          });
        } else {
          console.error('Failed to retrieve booking:', await getResponse.text());
        }
        
        return { success: true, reference: jsonData.booking_reference };
      } else {
        return { success: false, error: jsonData.message || 'Unknown error', details: jsonData };
      }
    } catch (parseError) {
      // Not JSON, show as text
      console.error('API response was not valid JSON:', responseData.substring(0, 500) + '...');
      return { success: false, error: 'Invalid JSON response' };
    }
  } catch (err) {
    console.error('Exception during API test:', err);
    return { success: false, error: err.message };
  }
}

// Run the function
testMinimalBookingAPI(); 