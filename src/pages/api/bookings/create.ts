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
    
    // Map to the new proper bookings table schema
    const dbFieldsOnly = {
      reference_number: referenceNumber,
      status: 'pending',
      
      // Customer information
      customer_name: finalBookingData.customer_name,
      customer_email: finalBookingData.customer_email,
      customer_phone: finalBookingData.customer_phone,
      
      // Device information  
      device_type: finalBookingData.device_type,
      device_brand: finalBookingData.device_brand || finalBookingData.brand,
      device_model: finalBookingData.device_model || finalBookingData.model,
      
      // Service information
      service_type: finalBookingData.service_type,
      pricing_tier: req.body.pricingTier || 'standard',
      issue_description: finalBookingData.issue_description,
      
      // Appointment information
      booking_date: finalBookingData.booking_date,
      booking_time: finalBookingData.booking_time,
      
      // Location information
      address: finalBookingData.address,
      city: finalBookingData.city,
      province: finalBookingData.province,
      postal_code: finalBookingData.postal_code
    };
    
    // Log what we're about to insert
    apiLogger.info('Prepared booking data for insertion', {
      reference: referenceNumber,
      customer_email: normalizedBookingData.customerEmail?.substring(0, 3) + '***',
      device_type: dbFieldsOnly.device_type,
      service_type: dbFieldsOnly.service_type
    });

    // Use real database implementation
    apiLogger.info('Using real database implementation');
    
    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
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
      province: normalizedBookingData.province
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