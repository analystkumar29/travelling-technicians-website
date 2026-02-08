import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { denormalizeBookingData } from '@/services/transformers/bookingTransformer';
import { logger } from '@/utils/logger';
import { sendBookingConfirmationEmail } from '@/services/emailService';

// Create module logger
const apiLogger = logger.createModuleLogger('bookings/create');

// Define the structure for the data being inserted into the DB
interface FinalDbBookingData {
  reference_number: string;
  status: string;
  device_type?: string;
  device_brand?: string;
  device_model?: string;
  brand?: string; // Alias for device_brand for triggers/legacy
  model?: string; // Alias for device_model for triggers/legacy
  service_type?: string;
  booking_date?: string;
  booking_time?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  issue_description?: string;
  // Add any other fields that are part of your 'bookings' table schema
  // and are set in finalBookingData or dbFieldsOnly
}

// Function to generate a reference number
function generateReferenceNumber(): string {
  const prefix = 'TTR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log the booking creation request
  apiLogger.info('Received booking creation request');

  // Only allow POST requests
  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Log that we received a booking creation request
    apiLogger.info('Received booking creation request');
    
    // Extract booking data from request body
    const bookingData = req.body;
    
    // Log the request body (omitting sensitive fields)
    apiLogger.debug('Request body received', {
      ...bookingData,
      customerEmail: bookingData.customerEmail ? '[REDACTED]' : undefined,
      customer_email: bookingData.customer_email ? '[REDACTED]' : undefined,
    });
    
    // Validate required fields - check for field name variations
    const hasDeviceType = !!(bookingData.deviceType || bookingData.device_type);
    const hasServiceType = !!(bookingData.serviceType || bookingData.service_type);
    const hasCustomerName = !!(bookingData.customerName || bookingData.customer_name);
    const hasCustomerEmail = !!(bookingData.customerEmail || bookingData.customer_email);
    const hasCustomerPhone = !!(bookingData.customerPhone || bookingData.customer_phone);
    const hasAddress = !!(bookingData.address);
    const hasPostalCode = !!(bookingData.postalCode || bookingData.postal_code);
    
    // Check for any variation of appointment/booking date/time fields
    const hasAppointmentDate = !!(
      bookingData.appointmentDate || 
      bookingData.bookingDate || 
      bookingData.booking_date
    );
    
    const hasAppointmentTime = !!(
      bookingData.appointmentTime || 
      bookingData.bookingTime || 
      bookingData.booking_time
    );
    
    // Collect all missing fields
    const missingFields = [];
    
    if (!hasDeviceType) missingFields.push('deviceType');
    if (!hasServiceType) missingFields.push('serviceType');
    if (!hasCustomerName) missingFields.push('customerName');
    if (!hasCustomerEmail) missingFields.push('customerEmail');
    if (!hasCustomerPhone) missingFields.push('customerPhone');
    if (!hasAddress) missingFields.push('address');
    if (!hasPostalCode) missingFields.push('postalCode');
    if (!hasAppointmentDate) missingFields.push('appointmentDate');
    if (!hasAppointmentTime) missingFields.push('appointmentTime');
    
    if (missingFields.length > 0) {
      apiLogger.warn('Missing required fields', { missingFields });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }
    
    // Verify the postal code is serviceable
    // This would call a service to check if we service this postal code
    apiLogger.info('Processing booking with postal code:', { 
      postalCode: bookingData.postalCode || bookingData.postal_code 
    });
    
    // Generate a reference number for the booking
    const referenceNumber = generateReferenceNumber();
    apiLogger.debug('Generated reference:', { reference: referenceNumber });
    
    // Normalize booking data - handle all naming conventions
    const normalizedBookingData = {
      deviceType: bookingData.deviceType || bookingData.device_type,
      deviceBrand: bookingData.deviceBrand || bookingData.device_brand || bookingData.brand,
      deviceModel: bookingData.deviceModel || bookingData.device_model || bookingData.model,
      serviceType: bookingData.serviceType || bookingData.service_type,
      issueDescription: bookingData.issueDescription || bookingData.issue_description || bookingData.message,
      appointmentDate: 
        bookingData.appointmentDate || 
        bookingData.bookingDate || 
        bookingData.booking_date,
      appointmentTime: 
        bookingData.appointmentTime || 
        bookingData.bookingTime || 
        bookingData.booking_time,
      customerName: bookingData.customerName || bookingData.customer_name,
      customerEmail: bookingData.customerEmail || bookingData.customer_email,
      customerPhone: bookingData.customerPhone || bookingData.customer_phone,
      address: bookingData.address,
      postalCode: bookingData.postalCode || bookingData.postal_code,
      city: bookingData.city || 'Vancouver',
      province: bookingData.province || 'BC'
    };
    
    // For Development: Log all fields in the normalized data
    if (process.env.NODE_ENV !== 'production') {
      apiLogger.debug('Normalized data:', {
        ...normalizedBookingData,
        customerEmail: '[REDACTED]',
        customerPhone: '[REDACTED]'
      });
    }
    
    // Transform the booking data to the format expected by the database
    const dbBookingData = denormalizeBookingData(normalizedBookingData);
    
    // Add the reference number and default status
    const finalBookingData = {
      ...dbBookingData,
      reference_number: referenceNumber,
      status: 'pending',
    } as FinalDbBookingData; // Cast to the new interface
    
    // Get Supabase client for lookups
    const supabase = getServiceSupabase();
    
    // Look up device model UUID
    let modelId = null;
    if (normalizedBookingData.deviceModel && normalizedBookingData.deviceBrand) {
      const { data: modelData } = await supabase
        .from('device_models')
        .select('id')
        .ilike('name', normalizedBookingData.deviceModel)
        .limit(1)
        .single();
      
      modelId = modelData?.id || null;
      
      if (!modelId) {
        apiLogger.warn('Device model not found in database', {
          model: normalizedBookingData.deviceModel,
          brand: normalizedBookingData.deviceBrand
        });
      }
    }
    
    // Look up service UUID
    let serviceId = null;
    if (normalizedBookingData.serviceType) {
      // Handle both array and string service types
      const serviceSlug = Array.isArray(normalizedBookingData.serviceType)
        ? normalizedBookingData.serviceType[0]
        : normalizedBookingData.serviceType;
      
      const { data: serviceData } = await supabase
        .from('services')
        .select('id')
        .or(`slug.ilike.%${serviceSlug}%,name.ilike.%${serviceSlug.replace(/-/g, ' ')}%`)
        .limit(1)
        .single();
      
      serviceId = serviceData?.id || null;
      
      if (!serviceId) {
        apiLogger.warn('Service not found in database', {
          service: serviceSlug
        });
      }
    }
    
    // Look up location UUID based on city and postal code
    let locationId = null;
    let locationNotes = '';
    
    if (normalizedBookingData.city || normalizedBookingData.postalCode) {
      // Try to find location by city name first
      if (normalizedBookingData.city) {
        const { data: cityLocation } = await supabase
          .from('service_locations')
          .select('id, city_name')
          .ilike('city_name', `%${normalizedBookingData.city}%`)
          .limit(1)
          .single();
        
        if (cityLocation?.id) {
          locationId = cityLocation.id;
          apiLogger.info('Found location by city name', {
            city: normalizedBookingData.city,
            locationId: locationId,
            locationCity: cityLocation.city_name
          });
        }
      }
      
      // If no location found by city, try postal code prefix
      if (!locationId && normalizedBookingData.postalCode) {
        const postalPrefix = normalizedBookingData.postalCode.substring(0, 3).toUpperCase();
        
        // Try to find location by postal code prefix
        try {
          const { data: postalLocation } = await supabase
            .from('service_locations')
            .select('id, city_name')
            .contains('postal_code_prefixes', [postalPrefix])
            .limit(1)
            .single();
          
          if (postalLocation?.id) {
            locationId = postalLocation.id;
            apiLogger.info('Found location by postal code prefix', {
              postalCode: normalizedBookingData.postalCode,
              prefix: postalPrefix,
              locationId: locationId,
              locationCity: postalLocation.city_name
            });
          } else {
            apiLogger.info('No location found for postal code prefix', {
              postalCode: normalizedBookingData.postalCode,
              prefix: postalPrefix
            });
          }
        } catch (error) {
          // This might fail if postal_code_prefixes column doesn't exist yet
          // That's okay - we'll fall back to city-based lookup
          apiLogger.info('Postal code prefix lookup failed (column may not exist)', {
            postalCode: normalizedBookingData.postalCode,
            prefix: postalPrefix,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // If still no location, use default Vancouver location
      if (!locationId) {
        const { data: defaultLocation } = await supabase
          .from('service_locations')
          .select('id, city_name')
          .ilike('city_name', 'Vancouver')
          .limit(1)
          .single();
        
        if (defaultLocation?.id) {
          locationId = defaultLocation.id;
          locationNotes = `Location Pending: Could not map ${normalizedBookingData.city || 'unknown city'} (${normalizedBookingData.postalCode || 'no postal code'}) to exact service location. Assigned to Vancouver as default.`;
          apiLogger.warn('Using default Vancouver location', {
            requestedCity: normalizedBookingData.city,
            requestedPostalCode: normalizedBookingData.postalCode,
            defaultLocationId: locationId
          });
        }
      }
    }
    
    if (!locationId) {
      locationNotes = `Location Pending: No location information provided. Manual verification required.`;
      apiLogger.warn('No location information provided for booking');
    }
    
    // Map to the actual bookings table schema
    const dbFieldsOnly = {
      booking_ref: referenceNumber,
      
      // Customer information
      customer_name: finalBookingData.customer_name,
      customer_email: finalBookingData.customer_email,
      customer_phone: finalBookingData.customer_phone,
      customer_address: finalBookingData.address,
      
      // Location details - save city and province separately
      city: normalizedBookingData.city || 'Vancouver',
      province: normalizedBookingData.province || 'BC',
      
      // Device and service - UUID references
      model_id: modelId,
      service_id: serviceId,
      location_id: locationId,
      
      // Appointment information
      // Store the booking date separately
      booking_date: finalBookingData.booking_date || null,
      
      // Store the original time slot for display purposes
      booking_time: finalBookingData.booking_time || null,
      
      // Convert date + time slot to ISO timestamp for scheduled_at
      // New time slots: "8:00", "10:00", "12:00", "14:00", "16:00", "18:00" (2-hour windows)
      scheduled_at: finalBookingData.booking_date ? (() => {
        const timeSlot = finalBookingData.booking_time || '12:00'; // Default to noon
        const [hoursStr, minutesStr] = timeSlot.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

        // Build UTC timestamp from date + time to avoid timezone shift
        const [year, month, day] = finalBookingData.booking_date.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0)).toISOString();
      })() : null,
      
      // Issue description from the form
      issue_description: normalizedBookingData.issueDescription || null,
      
      // Pricing information - save quoted price from form if provided
      quoted_price: bookingData.quoted_price ?? null,

      // Pricing tier selection (standard or premium)
      pricing_tier: bookingData.pricingTier || bookingData.pricing_tier || 'standard',

      // Location notes if location lookup had issues
      notes: locationNotes || null,
    };
    
    // Log what we're about to insert
    apiLogger.info('Prepared booking data for insertion', {
      reference: referenceNumber,
      customer_email: normalizedBookingData.customerEmail?.substring(0, 3) + '***',
      device_type: normalizedBookingData.deviceType,
      service_type: normalizedBookingData.serviceType,
      model_id: modelId,
      service_id: serviceId
    });

    // Insert the booking into the database
    apiLogger.info('Inserting booking into database');
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(dbFieldsOnly)
      .select()
      .single();
    
    if (error) {
      apiLogger.error('Database error during booking creation', {
        error: error.message,
        code: error.code,
        details: error.details
      });
      
      return res.status(500).json({
        success: false,
        message: 'Error creating booking',
        error: error.message,
        code: error.code,
      });
    }
    
    // Log the successful booking creation
    apiLogger.info('Booking created successfully', {
      reference: referenceNumber,
      id: booking.id
    });
    
    // Record T&C acceptance (non-blocking — log errors but don't fail the booking)
    try {
      const termsVersion = bookingData.termsVersion || '2026-02-06-v1';

      // Look up the current legal document for terms-conditions
      const { data: legalDoc } = await supabase
        .from('legal_documents')
        .select('id, version')
        .eq('document_type', 'terms-conditions')
        .eq('is_current', true)
        .single();

      if (legalDoc) {
        const ipAddress = (
          req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim()
          || req.socket.remoteAddress
          || null
        );
        const userAgent = req.headers['user-agent'] || null;

        await supabase
          .from('terms_acceptances')
          .insert({
            booking_id: booking.id,
            document_id: legalDoc.id,
            document_version: legalDoc.version || termsVersion,
            customer_email: normalizedBookingData.customerEmail,
            customer_name: normalizedBookingData.customerName,
            ip_address: ipAddress,
            user_agent: userAgent,
          });

        apiLogger.info('T&C acceptance recorded', {
          reference: referenceNumber,
          document_version: legalDoc.version || termsVersion,
        });
      } else {
        apiLogger.warn('No current legal document found for terms-conditions', {
          reference: referenceNumber,
        });
      }
    } catch (termsError) {
      apiLogger.error('Failed to record T&C acceptance (non-blocking)', {
        reference: referenceNumber,
        error: termsError instanceof Error ? termsError.message : 'Unknown error',
      });
    }

    // Upsert customer profile (non-blocking — log errors but don't fail the booking)
    try {
      const customerPhone = normalizedBookingData.customerPhone;
      if (customerPhone) {
        const today = new Date().toISOString().split('T')[0];
        const quotedPrice = bookingData.quoted_price ? parseFloat(bookingData.quoted_price) : 0;

        // Try to get existing profile first
        const { data: existingProfile } = await supabase
          .from('customer_profiles')
          .select('id, total_bookings, total_spent')
          .eq('phone', customerPhone)
          .maybeSingle();

        if (existingProfile) {
          // Update existing profile
          await supabase
            .from('customer_profiles')
            .update({
              email: normalizedBookingData.customerEmail,
              full_name: normalizedBookingData.customerName,
              total_bookings: (existingProfile.total_bookings || 0) + 1,
              total_spent: parseFloat(String(existingProfile.total_spent || 0)) + quotedPrice,
              last_booking_date: today,
            })
            .eq('id', existingProfile.id);
        } else {
          // Insert new profile
          await supabase
            .from('customer_profiles')
            .insert({
              phone: customerPhone,
              email: normalizedBookingData.customerEmail,
              full_name: normalizedBookingData.customerName,
              total_bookings: 1,
              total_spent: quotedPrice,
              first_booking_date: today,
              last_booking_date: today,
            });
        }

        // Link customer profile to the booking
        const { data: profileData } = await supabase
          .from('customer_profiles')
          .select('id')
          .eq('phone', customerPhone)
          .single();

        if (profileData) {
          await supabase
            .from('bookings')
            .update({ customer_profile_id: profileData.id })
            .eq('id', booking.id);
        }

        apiLogger.info('Customer profile upserted', {
          reference: referenceNumber,
          phone: customerPhone.substring(0, 3) + '***',
        });
      }
    } catch (profileError) {
      apiLogger.error('Failed to upsert customer profile (non-blocking)', {
        reference: referenceNumber,
        error: profileError instanceof Error ? profileError.message : 'Unknown error',
      });
    }

    // 🔍 DETAILED EMAIL CONFIRMATION PROCESS
    const emailData = {
      to: normalizedBookingData.customerEmail,
      name: normalizedBookingData.customerName,
      referenceNumber,
      appointmentDate: normalizedBookingData.appointmentDate,
      appointmentTime: normalizedBookingData.appointmentTime,
      service: normalizedBookingData.serviceType,
      deviceType: normalizedBookingData.deviceType,
      deviceBrand: normalizedBookingData.deviceBrand,
      deviceModel: normalizedBookingData.deviceModel,
      address: normalizedBookingData.address,
      city: normalizedBookingData.city,
      postalCode: normalizedBookingData.postalCode,
      province: normalizedBookingData.province,
      quotedPrice: bookingData.quoted_price != null ? parseFloat(bookingData.quoted_price) : undefined,
      pricingTier: bookingData.pricingTier || bookingData.pricing_tier || 'standard',
    };

    apiLogger.info('📧 BOOKING API - Starting email confirmation process', {
      reference: referenceNumber,
      bookingId: booking.id,
      customerEmail: normalizedBookingData.customerEmail?.substring(0, 3) + '***',
      hasEmailService: true,
      emailDataKeys: Object.keys(emailData),
      timestamp: new Date().toISOString()
    });

    try {
      const emailResult = await sendBookingConfirmationEmail(emailData);
      
      apiLogger.info('✅ BOOKING API - Email confirmation process completed', { 
        reference: referenceNumber,
        emailResult,
        success: true
      });
    } catch (emailError) {
      // Log the error but don't fail the request
      apiLogger.error('❌ BOOKING API - Email confirmation failed', {
        reference: referenceNumber,
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined,
        bookingStillCreated: true
      });
    }
    
    // Send admin notification (awaited to prevent Vercel from killing the fetch on function teardown)
    try {
      const adminBaseUrl = (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production')
        ? 'https://www.travelling-technicians.ca'
        : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

      await fetch(`${adminBaseUrl}/api/send-admin-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference: referenceNumber,
          customerName: normalizedBookingData.customerName,
          customerEmail: normalizedBookingData.customerEmail,
          customerPhone: normalizedBookingData.customerPhone,
          deviceType: normalizedBookingData.deviceType,
          deviceBrand: normalizedBookingData.deviceBrand,
          deviceModel: normalizedBookingData.deviceModel,
          serviceName: normalizedBookingData.serviceType,
          bookingDate: normalizedBookingData.appointmentDate,
          bookingTime: normalizedBookingData.appointmentTime,
          address: normalizedBookingData.address,
          city: normalizedBookingData.city,
          province: normalizedBookingData.province,
          postalCode: normalizedBookingData.postalCode,
          quotedPrice: bookingData.quoted_price ?? null,
          pricingTier: bookingData.pricingTier || bookingData.pricing_tier || 'standard',
          issueDescription: normalizedBookingData.issueDescription,
        }),
      });
      apiLogger.info('Admin notification sent', { reference: referenceNumber });
    } catch (e) {
      apiLogger.error('Admin notification failed (non-blocking)', { error: String(e) });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      message: 'Booking created successfully',
      reference: referenceNumber,
      booking
    });
  } catch (error) {
    // Log any uncaught errors
    apiLogger.error('Uncaught error in booking creation', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Return error response
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 