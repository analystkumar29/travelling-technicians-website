import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';
import { ConfirmationEmailData } from '../send-confirmation';

const moduleLogger = logger.createModuleLogger('bookings-create');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate reference number for bookings - format: TTR-XXXXXX-YYY
function generateReferenceNumber(): string {
  // Generate a random string of 6 digits for the first part
  const firstPart = Math.floor(100000 + Math.random() * 900000).toString();
  // Generate a random string of 3 digits for the second part
  const secondPart = Math.floor(100 + Math.random() * 900).toString();
  return `TTR-${firstPart}-${secondPart}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    moduleLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    moduleLogger.info('Received booking creation request');
    
    // Log the request body for debugging
    moduleLogger.debug('Request body received', req.body);
    
    const { 
      customerName, 
      customerEmail, 
      customerPhone,
      address,
      city,
      province,
      postalCode,
      deviceType,
      deviceBrand,
      deviceModel,
      serviceType,
      bookingDate,
      bookingTime,
      deviceIssue,
      notes,
      // We'll extract but ignore any client-provided reference
      bookingReference: clientProvidedReference 
    } = req.body;

    // If a client-provided reference was found, log it but don't use it
    if (clientProvidedReference) {
      moduleLogger.info('Client provided a booking reference which will be ignored', { 
        clientReference: clientProvidedReference 
      });
    }

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !address || !deviceType || 
        !serviceType || !bookingDate || !bookingTime) {
      moduleLogger.warn('Missing required booking fields', { 
        missingFields: !customerName ? 'name' : !customerEmail ? 'email' : !customerPhone ? 'phone' : 
                      !address ? 'address' : !deviceType ? 'deviceType' : !serviceType ? 'serviceType' : 
                      !bookingDate ? 'date' : 'time'
      });
      
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required booking information' 
      });
    }

    // Generate server-side reference number - always use this one, ignoring any client-provided reference
    const referenceNumber = generateReferenceNumber();

    // Log booking attempt
    moduleLogger.info('Processing booking with postal code:', { postalCode });
    moduleLogger.debug('Generated reference:', { reference: referenceNumber });
    
    // Map device type (for tablet, we may need to store as mobile for database compatibility)
    const dbDeviceType = deviceType === 'tablet' ? 'mobile' : deviceType;
    
    // Debug log for the prepared booking data
    moduleLogger.debug('Prepared booking data for insertion', {
      reference: referenceNumber,
      device_type: dbDeviceType,
      service_type: serviceType
    });

    // Create booking in Supabase
    moduleLogger.info('Inserting booking into database');
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([
        {
          reference_number: referenceNumber,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          address: address,
          city: city || '',
          province: province || '',
          postal_code: postalCode || '',
          device_type: dbDeviceType,
          device_brand: deviceBrand || '',
          device_model: deviceModel || '',
          service_type: serviceType,
          booking_date: bookingDate,
          booking_time: bookingTime,
          device_issue: deviceIssue || '',
          notes: notes || '',
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      moduleLogger.error('Database error creating booking', { 
        error: error.message, 
        reference: referenceNumber 
      });
      
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create booking',
        error: error.message
      });
    }

    // Format booking date for email
    const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    // Build the email data
    const emailData: ConfirmationEmailData = {
      to: customerEmail,
      name: customerName,
      bookingReference: referenceNumber, // Always use server-generated reference
      deviceType: `${deviceType}${deviceBrand ? ` - ${deviceBrand}` : ''}${deviceModel ? ` ${deviceModel}` : ''}`,
      service: serviceType,
      bookingDate: formattedDate,
      bookingTime: bookingTime,
      bookingAddress: address
    };

    // Debug log to verify email data is complete before sending
    moduleLogger.info('Sending confirmation email');
    
    // Send confirmation email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const emailResult = await emailResponse.json();
      
      if (emailResponse.ok) {
        moduleLogger.info('Confirmation email sent successfully', { 
          reference: referenceNumber,
          to: customerEmail
        });
        
        // Update booking with verification data
        if (emailResult.verifyUrl) {
          await supabase
            .from('bookings')
            .update({
              verification_link: emailResult.verifyUrl,
              reschedule_link: emailResult.rescheduleUrl
            })
            .eq('reference_number', referenceNumber);
        }
      } else {
        moduleLogger.warn('Failed to send confirmation email', { 
          reference: referenceNumber,
          emailError: emailResult.message
        });
      }
    } catch (emailError: any) {
      moduleLogger.error('Error during confirmation email', { 
        error: emailError.message,
        reference: referenceNumber
      });
      // Continue despite email error - don't fail the booking creation
    }

    // Return success with booking information
    moduleLogger.info('Booking created successfully', {
      reference: referenceNumber,
      id: booking.id,
      emailSent: true
    });
    
    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        referenceNumber,
        booking_reference: referenceNumber, // Include for backward compatibility
        customerName,
        customerEmail,
        bookingDate: formattedDate,
        bookingTime,
        deviceType,
        serviceType
      }
    });
  } catch (error: any) {
    moduleLogger.error('Unhandled error in booking creation', { 
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
      error: error.message
    });
  }
} 