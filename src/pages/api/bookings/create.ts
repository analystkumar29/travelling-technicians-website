import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { denormalizeBookingData } from '@/services/transformers/bookingTransformer';
import { formatServiceType, formatTimeSlot, getDeviceTypeDisplay } from '@/utils/formatters';

// Create module logger
const apiLogger = logger.createModuleLogger('bookings/create');

// Function to generate a reference number
function generateReferenceNumber(): string {
  const prefix = 'TTR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// Function to send confirmation email
async function sendConfirmationEmail(bookingData: any, referenceNumber: string) {
  try {
    // Format date for email
    const formattedDate = bookingData.booking_date 
      ? (() => {
          try {
            return new Date(bookingData.booking_date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            });
          } catch (e) {
            apiLogger.error('Error formatting date:', e);
            return bookingData.booking_date;
          }
        })()
      : bookingData.booking_date;

    // Format device display name
    const deviceDisplay = getDeviceTypeDisplay(
      bookingData.device_type,
      bookingData.device_brand,
      bookingData.device_model
    );

    // Format service type
    const serviceDisplay = formatServiceType(bookingData.service_type);

    // Format time slot
    const timeDisplay = formatTimeSlot(bookingData.booking_time);

    // Call send confirmation endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}/api/send-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: bookingData.customer_email,
        name: bookingData.customer_name,
        bookingReference: referenceNumber,
        deviceType: bookingData.device_type,
        brand: bookingData.device_brand,
        model: bookingData.device_model,
        service: serviceDisplay,
        bookingDate: formattedDate,
        bookingTime: timeDisplay,
        address: bookingData.address,
      }),
    });

    const emailResult = await response.json();
    
    if (!response.ok) {
      throw new Error(emailResult.message || 'Failed to send confirmation email');
    }
    
    apiLogger.info('Confirmation email sent successfully', {
      reference: referenceNumber,
      to: bookingData.customer_email
    });
    
    return emailResult;
  } catch (error) {
    apiLogger.error('Error sending confirmation email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      reference: referenceNumber
    });
    
    // We don't throw here - don't fail the booking creation if email fails
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error sending confirmation email'
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  apiLogger.info('Received booking creation request');
  
  try {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      apiLogger.error('Missing Supabase configuration');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error',
        details: 'Missing Supabase configuration'
      });
    }

    // Extract data from request body
    const requestBody = req.body;
    apiLogger.debug('Request body received', { ...requestBody, customerEmail: '[REDACTED]' });

    // Validate required fields
    const requiredFields = [
      'deviceType', 
      'serviceType', 
      'customerName', 
      'customerEmail', 
      'customerPhone',
      'address',
      'postalCode'
    ];
    
    // Check for either appointmentDate/Time or bookingDate/Time
    const hasAppointmentDate = !!requestBody.appointmentDate || !!requestBody.bookingDate;
    const hasAppointmentTime = !!requestBody.appointmentTime || !!requestBody.bookingTime;
    
    if (!hasAppointmentDate || !hasAppointmentTime) {
      const missingFields = [];
      if (!hasAppointmentDate) missingFields.push('appointmentDate/bookingDate');
      if (!hasAppointmentTime) missingFields.push('appointmentTime/bookingTime');
      
      apiLogger.warn('Missing appointment date/time fields', { missingFields });
      return res.status(400).json({
        success: false,
        message: 'Missing required appointment information',
        details: { missingFields }
      });
    }
    
    const missingFields = requiredFields.filter(field => !requestBody[field]);
    
    if (missingFields.length > 0) {
      apiLogger.warn('Missing required fields', { missingFields });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields',
        details: { missingFields }
      });
    }

    apiLogger.info(`Processing booking with postal code: ${requestBody.postalCode}`);

    // Generate a reference number
    const referenceNumber = generateReferenceNumber();
    apiLogger.debug(`Generated reference: ${referenceNumber}`);

    // Use our transformer to normalize data
    const bookingRequest = {
      deviceType: requestBody.deviceType,
      deviceBrand: requestBody.brand || requestBody.deviceBrand,
      deviceModel: requestBody.model || requestBody.deviceModel,
      serviceType: requestBody.serviceType,
      issueDescription: requestBody.message || requestBody.issueDescription,
      appointmentDate: requestBody.appointmentDate || requestBody.bookingDate,
      appointmentTime: requestBody.appointmentTime || requestBody.bookingTime,
      customerName: requestBody.customerName,
      customerEmail: requestBody.customerEmail,
      customerPhone: requestBody.customerPhone,
      address: requestBody.address,
      postalCode: requestBody.postalCode
    };

    // Prepare booking data with our transformer
    const denormalizedData = denormalizeBookingData(bookingRequest);
    
    // Prepare data for database insertion
    const bookingData = {
      reference_number: referenceNumber,
      device_type: requestBody.deviceType === 'tablet' ? 'mobile' : requestBody.deviceType,
      device_brand: bookingRequest.deviceBrand || null,
      device_model: bookingRequest.deviceModel || null,
      service_type: bookingRequest.serviceType,
      booking_date: bookingRequest.appointmentDate,
      booking_time: bookingRequest.appointmentTime,
      customer_name: bookingRequest.customerName,
      customer_email: bookingRequest.customerEmail,
      customer_phone: bookingRequest.customerPhone,
      address: bookingRequest.address,
      postal_code: bookingRequest.postalCode,
      issue_description: bookingRequest.issueDescription || null,
      status: 'pending'
    };

    apiLogger.debug('Prepared booking data for insertion', {
      reference: referenceNumber,
      device_type: bookingData.device_type,
      service_type: bookingData.service_type
    });

    // Get Supabase client with service role
    const supabase = getServiceSupabase();

    // Insert booking into database
    apiLogger.info('Inserting booking into database');
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    // Handle database errors
    if (error) {
      apiLogger.error('Database error during booking creation', {
        error: error.message,
        code: error.code,
        details: error.details
      });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        details: error.message
      });
    }

    // Send confirmation email
    apiLogger.info('Sending confirmation email');
    const emailResult = await sendConfirmationEmail(bookingData, referenceNumber);

    // Return success response
    apiLogger.info('Booking created successfully', {
      reference: data.reference_number,
      id: data.id,
      emailSent: emailResult.success
    });
    
    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: data,
      booking_reference: referenceNumber,
      email: {
        sent: emailResult.success,
        message: emailResult.message
      }
    });

  } catch (error) {
    // Handle unexpected errors
    apiLogger.error('Unexpected error during booking creation', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      details: errorMessage
    });
  }
} 