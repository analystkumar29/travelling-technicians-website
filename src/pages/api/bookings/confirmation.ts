import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create a module logger
const emailLogger = logger.createModuleLogger('bookings-confirmation');

// Ensure required environment variables are set
const VERIFICATION_SECRET = process.env.BOOKING_VERIFICATION_SECRET;

if (!VERIFICATION_SECRET) {
  throw new Error('BOOKING_VERIFICATION_SECRET environment variable is required for secure token generation');
}

// Type assertion to help TypeScript understand the variable is defined
const SECRET: string = VERIFICATION_SECRET;

// Generate a secure token for email verification
function generateVerificationToken(email: string, bookingReference: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const data = `${email.toLowerCase()}:${bookingReference}:${timestamp}`;
  
  return crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('hex');
}

/**
 * Format device information for email display
 */
function formatDeviceInfo(deviceType: string, brand?: string, model?: string): string {
  // Convert device type to proper display format
  const displayType = deviceType === 'mobile' ? 'Mobile Phone' : 
                      deviceType === 'laptop' ? 'Laptop' : 'Tablet';
  
  // Only add the dash and brand/model if they exist
  if ((brand && brand !== 'other') || model) {
    const displayBrand = (brand && brand !== 'other') ? brand : '';
    const displayModel = model || '';
    // Only add a space between brand and model if both exist
    const separator = (displayBrand && displayModel) ? ' ' : '';
    
    // Create the full device string without trailing dashes or spaces
    const deviceString = `${displayType} - ${displayBrand}${separator}${displayModel}`;
    
    // Return the trimmed string
    return deviceString.replace(/\s+-\s*$/, '').trim();
  }
  
  // Just return the device type without dash if no brand/model
  return displayType;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Extract data from request
    const {
      bookingReference,
      customerName,
      customerEmail,
      deviceType,
      deviceBrand,
      deviceModel,
      serviceType,
      appointmentDate,
      appointmentTime,
      address,
      city,
      province,
      postalCode,
    } = req.body;

    // Validate essential data
    if (!customerEmail || !customerName || !appointmentDate || !appointmentTime) {
      emailLogger.warn('Missing required data for confirmation email', {
        missing: !customerEmail ? 'email' : !customerName ? 'name' : !appointmentDate ? 'date' : 'time',
        reference: bookingReference
      });
      
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    emailLogger.info('Preparing confirmation email', { 
      reference: bookingReference,
      to: customerEmail.substring(0, 3) + '***' // Log partial email for privacy
    });

    // Create verification token
    const verificationToken = generateVerificationToken(customerEmail, bookingReference);
    
    // 🔧 ROBUST URL GENERATION - Fix for production domain issue
    function getBaseUrl(): string {
      // In production, always use the custom domain
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
        return 'https://www.travelling-technicians.ca';
      }
      
      // Try multiple environment variables in order of preference
      const possibleUrls = [
        process.env.NEXT_PUBLIC_WEBSITE_URL,
        process.env.NEXT_PUBLIC_FRONTEND_URL,
        process.env.NEXT_PUBLIC_SITE_URL,
        // If on Vercel but not production (preview/deployment)
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        // Fallback for local development
        'http://localhost:3000'
      ];
      
      // Find the first valid URL
      const validUrl = possibleUrls.find(url => url && !url.includes('url6811'));
      return validUrl || 'http://localhost:3000';
    }
    
    const baseUrl = getBaseUrl();
    emailLogger.info('🔗 URL Generation Debug', {
      baseUrl,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
      nextPublicWebsiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL,
      nextPublicFrontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL,
      nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL
    });
    
    const verificationUrl = `${baseUrl}/verify-booking?token=${verificationToken}`;
    const rescheduleUrl = `${baseUrl}/reschedule-booking?reference=${bookingReference}&token=${verificationToken}`;

    // Format full address
    const fullAddress = address ? 
      `${address}, ${city || 'Vancouver'}, ${province || 'BC'} ${postalCode || ''}` : 
      'To be serviced at your doorstep';

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      emailLogger.warn('SendGrid API key not configured - simulating email send');
      
      // Log what would be sent
      emailLogger.debug('Email simulation data', {
        verificationUrl,
        rescheduleUrl,
        to: customerEmail.substring(0, 3) + '***', // Log partial email for privacy
        subject: 'Your Booking Confirmation - The Travelling Technicians',
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return success for development
      return res.status(200).json({ 
        success: true,
        message: 'Email sending simulated (SendGrid API key not configured)',
        sentTo: customerEmail,
        verificationToken,
        verificationUrl,
      });
    }

    // Format device information
    const formattedDeviceInfo = formatDeviceInfo(deviceType, deviceBrand, deviceModel);

    // Create email message with SendGrid
    const msg: sgMail.MailDataRequired = {
      to: customerEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
        name: process.env.SENDGRID_FROM_NAME || 'The Travelling Technicians',
      },
      subject: 'Your Repair Booking Confirmation',
      content: [
        {
          type: 'text/html',
          value: `<p>Your booking has been confirmed. If you cannot view this email properly, please check your booking reference: ${bookingReference}</p>`
        }
      ],
      templateId: process.env.SENDGRID_TEMPLATE_ID || 'd-c9dbac568573432bb15f79c92c4fd4b5',
      dynamicTemplateData: {
        subject: 'Booking Confirmation - The Travelling Technicians',
        isRescheduled: false,
        name: customerName,
        bookingReference,
        deviceType: formattedDeviceInfo,
        service: serviceType,
        bookingDate: appointmentDate,
        bookingTime: appointmentTime,
        address: fullAddress,
        verificationUrl,
        rescheduleUrl,
        year: new Date().getFullYear(),
      },
    };

    // Send email via SendGrid
    try {
      await sgMail.send(msg);
      
      emailLogger.info('Confirmation email sent successfully', {
        reference: bookingReference,
        to: customerEmail.substring(0, 3) + '***' // Log partial email for privacy
      });
      
      // Return success response
      return res.status(200).json({ 
        success: true,
        message: 'Confirmation email sent successfully',
        sentTo: customerEmail,
      });
    } catch (sendGridError: any) {
      emailLogger.error('SendGrid Error:', {
        error: sendGridError.message,
        reference: bookingReference
      });
      
      if (sendGridError.response) {
        emailLogger.error('SendGrid Error Body:', sendGridError.response.body);
      }
      
      return res.status(500).json({ 
        success: false,
        message: 'Failed to send email via SendGrid',
        error: sendGridError.message
      });
    }
    
  } catch (error: any) {
    emailLogger.error('Error sending confirmation email:', {
      error: error.message || 'Unknown error'
    });
    
    return res.status(500).json({ 
      success: false,
      message: 'Failed to send confirmation email',
      error: error.message
    });
  }
} 