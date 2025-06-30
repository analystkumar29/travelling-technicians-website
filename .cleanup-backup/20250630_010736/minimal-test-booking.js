// Minimal test booking insertion
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Generate a reference number
function generateReferenceNumber() {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

async function createMinimalBooking() {
  console.log('=== CREATING MINIMAL TEST BOOKING ===');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return { success: false, error: 'Missing Supabase environment variables' };
  }
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  // Generate a reference number
  const referenceNumber = generateReferenceNumber();
  console.log(`Generated reference number: ${referenceNumber}`);
  
  try {
    // Attempt to directly execute SQL to bypass any triggers
    const { data, error } = await supabase.rpc('insert_booking', {
      p_reference_number: referenceNumber,
      p_customer_name: 'Test Customer',
      p_customer_email: 'test@example.com',
      p_customer_phone: '604-123-4567',
      p_device_type: 'mobile',
      p_device_brand: 'Apple',
      p_device_model: 'iPhone 13',
      p_issue_description: 'Screen cracked, need replacement',
      p_service_type: 'screen_replacement',
      p_address: '123 Test Street, Vancouver, BC',
      p_postal_code: 'V6B 1S5',
      p_booking_date: new Date().toISOString().split('T')[0], // Today's date
      p_booking_time: '14:00-16:00',
      p_status: 'pending'
    });
    
    if (error) {
      console.error('Error calling RPC function:', error);
      
      // Fall back to raw SQL query
      console.log('Trying direct SQL insertion...');
      
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 2); // Booking in 2 days
      const formattedDate = bookingDate.toISOString().split('T')[0];
      
      const { data: sqlData, error: sqlError } = await supabase.from('bookings').insert({
        reference_number: referenceNumber,
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '604-123-4567',
        device_type: 'mobile',
        device_brand: 'Apple',
        device_model: 'iPhone 13',
        issue_description: 'Screen cracked, need replacement',
        service_type: 'screen_replacement',
        address: '123 Test Street, Vancouver, BC',
        postal_code: 'V6B 1S5',
        booking_date: formattedDate,
        booking_time: '14:00-16:00',
        status: 'pending'
      }).select();
      
      if (sqlError) {
        console.error('Error with direct SQL insertion:', sqlError);
        
        // Try an even more minimal approach - just the required fields
        console.log('Trying minimal required fields insertion...');
        
        const { data: minimalData, error: minimalError } = await supabase.from('bookings').insert({
          reference_number: referenceNumber,
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          customer_phone: '604-123-4567',
          device_type: 'mobile',
          device_brand: 'Apple',
          service_type: 'screen_replacement',
          address: '123 Test Street, Vancouver, BC',
          postal_code: 'V6B 1S5',
          booking_date: formattedDate,
          booking_time: '14:00-16:00'
        }).select();
        
        if (minimalError) {
          console.error('Error with minimal fields insertion:', minimalError);
          return { success: false, error: minimalError.message };
        }
        
        console.log('Booking created successfully with minimal fields!');
        return { success: true, reference: referenceNumber };
      }
      
      console.log('Booking created successfully with direct SQL!');
      return { success: true, reference: referenceNumber };
    }
    
    console.log('Booking created successfully with RPC function!');
    return { success: true, reference: referenceNumber };
  } catch (err) {
    console.error('Exception during booking creation:', err);
    return { success: false, error: err.message };
  }
}

// Run the function
createMinimalBooking();

async function setupTestData() {
  try {
    console.log('Setting up test data for warranty system...');
    
    // Step 1: Create a test technician
    console.log('\n1. Creating test technician...');
    
    const technicianData = {
      full_name: 'Test Technician',
      email: 'tech@thetravellingtechnicians.com',
      phone: '604-123-4567',
      specializations: ['mobile', 'laptop'],
      active_service_areas: ['V5K', 'V5L', 'V5M'],
      is_active: true,
      hourly_rate: 85.00,
      max_daily_bookings: 8
    };
    
    const { data: technician, error: techError } = await supabase
      .from('technicians')
      .upsert(technicianData, { onConflict: 'email' })
      .select('id, full_name, email')
      .single();
    
    if (techError) {
      console.error('Error creating technician:', techError.message);
      return;
    }
    
    console.log('✅ Technician created:', technician);
    
    // Step 2: Find or create a test booking
    console.log('\n2. Finding existing booking or creating new one...');
    
    // First, check if any bookings exist
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, reference_number, customer_name, device_type, service_type')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (bookingsError) {
      console.error('Error checking for bookings:', bookingsError.message);
      return;
    }
    
    let booking;
    
    if (existingBookings && existingBookings.length > 0) {
      booking = existingBookings[0];
      console.log('✅ Using existing booking:', booking);
    } else {
      console.log('No existing bookings found, creating a test booking...');
      
      const bookingData = {
        reference_number: `TTB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-TEST`,
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '604-555-1234',
        booking_date: new Date().toISOString().slice(0, 10),
        booking_time: '10:00-12:00',
        address: '123 Test Street',
        postal_code: 'V5K 1A1',
        city: 'Vancouver',
        province: 'British Columbia',
        device_type: 'Mobile',
        device_brand: 'iPhone',
        device_model: 'iPhone 12',
        service_type: 'Screen Replacement',
        additional_notes: 'Test booking for warranty system',
        status: 'confirmed'
      };
      
      const { data: newBooking, error: newBookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('id, reference_number, customer_name, device_type, service_type')
        .single();
      
      if (newBookingError) {
        console.error('Error creating booking:', newBookingError.message);
        return;
      }
      
      booking = newBooking;
      console.log('✅ Created test booking:', booking);
    }
    
    // Step 3: Register a repair completion
    console.log('\n3. Registering repair completion...');
    
    // Check if a repair completion already exists for this booking
    const { data: existingCompletion, error: completionCheckError } = await supabase
      .from('repair_completions')
      .select('id')
      .eq('booking_id', booking.id)
      .maybeSingle();
    
    if (completionCheckError) {
      console.error('Error checking for existing repair completion:', completionCheckError.message);
      return;
    }
    
    if (existingCompletion) {
      console.log('⚠️ Repair completion already exists for this booking');
      
      // Check if warranty was created
      const { data: warranty, error: warrantyError } = await supabase
        .from('warranties')
        .select('*')
        .eq('booking_id', booking.id)
        .maybeSingle();
      
      if (warrantyError) {
        console.error('Error checking for warranty:', warrantyError.message);
      } else if (warranty) {
        console.log('✅ Warranty exists:', warranty);
      } else {
        console.log('❌ No warranty found for this repair completion');
        
        // Try to manually create warranty
        console.log('Attempting to manually create warranty...');
        
        const { data: repairData } = await supabase
          .from('repair_completions')
          .select('*')
          .eq('booking_id', booking.id)
          .single();
        
        if (repairData) {
          const warrantyData = {
            booking_id: booking.id,
            repair_completion_id: repairData.id,
            technician_id: technician.id,
            warranty_code: `TTW-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-TEST`,
            issue_date: new Date().toISOString().slice(0, 10),
            expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            status: 'active',
            parts_covered: ['Screen', 'Battery'],
            notes: 'Test warranty'
          };
          
          const { data: newWarranty, error: newWarrantyError } = await supabase
            .from('warranties')
            .insert(warrantyData)
            .select('*')
            .single();
          
          if (newWarrantyError) {
            console.error('Error creating warranty manually:', newWarrantyError.message);
          } else {
            console.log('✅ Manually created warranty:', newWarranty);
          }
        }
      }
    } else {
      // Create a new repair completion
      const repairData = {
        booking_id: booking.id,
        technician_id: technician.id,
        completed_at: new Date().toISOString(),
        repair_notes: 'Test repair for warranty system',
        parts_used: JSON.stringify([
          {
            name: `${booking.device_brand} ${booking.device_model} Screen`,
            description: 'OEM replacement screen',
            cost: 120
          },
          {
            name: `${booking.device_brand} Battery`,
            description: 'OEM replacement battery',
            cost: 60
          }
        ]),
        repair_duration: 45 // minutes
      };
      
      const { data: repairCompletion, error: repairError } = await supabase
        .from('repair_completions')
        .insert(repairData)
        .select('*')
        .single();
      
      if (repairError) {
        console.error('Error registering repair completion:', repairError.message);
        
        // If error contains "violates foreign key constraint", update the bookings status first
        if (repairError.message.includes('violates foreign key constraint')) {
          console.log('Foreign key constraint violated. Updating booking status...');
          
          await supabase
            .from('bookings')
            .update({ status: 'confirmed', repair_status: 'pending' })
            .eq('id', booking.id);
          
          // Try again
          const { data: repairRetry, error: retryError } = await supabase
            .from('repair_completions')
            .insert(repairData)
            .select('*')
            .single();
          
          if (retryError) {
            console.error('Error registering repair completion (retry):', retryError.message);
            return;
          } else {
            console.log('✅ Repair completion registered (after booking update):', repairRetry);
          }
        } else {
          return;
        }
      } else {
        console.log('✅ Repair completion registered:', repairCompletion);
      }
      
      // Step 4: Verify warranty creation
      console.log('\n4. Checking for warranty creation...');
      
      // Wait a moment for trigger to run
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: warranty, error: warrantyError } = await supabase
        .from('warranties')
        .select('*')
        .eq('booking_id', booking.id)
        .maybeSingle();
      
      if (warrantyError) {
        console.error('Error checking for warranty:', warrantyError.message);
      } else if (warranty) {
        console.log('✅ Warranty created automatically:', warranty);
      } else {
        console.log('❌ Warranty was not created automatically');
        console.log('This could indicate that the create_warranty_on_repair_completion trigger is not functioning properly');
      }
    }
    
    console.log('\nWarranty system test setup completed!');
    console.log('Check the database to verify that the warranty was created properly.');
    console.log('If the warranty was not created, you may need to check your trigger implementation.');
    
  } catch (error) {
    console.error('Error setting up test data:', error.message);
  }
}

setupTestData(); 