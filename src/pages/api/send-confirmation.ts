import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

// Set up SendGrid API key if available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create a module logger
const emailLogger = logger.createModuleLogger('send-confirmation');

// Email data interface
interface EmailData {
  to: string;
  name: string;
  bookingDate: string;
  bookingTime: string;
  deviceType: string;
  brand?: string;
  model?: string;
  service: string;
  address?: string;
  bookingReference: string;
}

// Generate a secure token for email verification
function generateVerificationToken(email: string, bookingReference: string): string {
  // In production, you would use a database to store these tokens
  // For simplicity, we're creating a hash based on email + reference + secret
  const secretKey = process.env.SENDGRID_API_KEY?.substring(0, 8) || 'defaultSecret';
  return crypto
    .createHmac('sha256', secretKey)
    .update(`${email}-${bookingReference}-${Date.now()}`)
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
      to,
      name,
      bookingDate,
      bookingTime,
      deviceType,
      brand,
      model,
      service,
      address,
      bookingReference = `TTR-${Date.now().toString().substring(6)}`,
    }: EmailData = req.body;

    // Validate essential data
    if (!to || !name || !bookingDate || !bookingTime) {
      emailLogger.warn('Missing required data for confirmation email', {
        missing: !to ? 'email' : !name ? 'name' : !bookingDate ? 'date' : 'time'
      });
      
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    emailLogger.info('Preparing confirmation email', { 
      reference: bookingReference,
      to: to.substring(0, 3) + '***' // Log partial email for privacy
    });

    // Create verification token
    const verificationToken = generateVerificationToken(to, bookingReference);
    
    // Construct verification URL
    const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-booking?token=${verificationToken}`;
    const rescheduleUrl = `${baseUrl}/reschedule-booking?reference=${bookingReference}&token=${verificationToken}`;

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      emailLogger.warn('SendGrid API key not configured - simulating email send');
      
      // Log what would be sent
      emailLogger.debug('Email simulation data', {
        verificationUrl,
        rescheduleUrl,
        to: to.substring(0, 3) + '***', // Log partial email for privacy
        subject: 'Your Booking Confirmation - The Travelling Technicians',
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return success for development
      return res.status(200).json({ 
        success: true,
        message: 'Email sending simulated (SendGrid API key not configured)',
        sentTo: to,
        verificationToken,
        verificationUrl,
      });
    }

    // Format device information
    const formattedDeviceInfo = formatDeviceInfo(deviceType, brand, model);

    // Create email message with SendGrid
    const msg: sgMail.MailDataRequired = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
        name: process.env.SENDGRID_FROM_NAME || 'The Travelling Technicians',
      },
      subject: 'Your Repair Booking Confirmation',
      content: [
        {
          type: 'text/html',
          value: '<p>Your booking has been confirmed. If you cannot view this email properly, please check your booking reference: ${bookingReference}</p>'
        }
      ],
      templateId: process.env.SENDGRID_TEMPLATE_ID || 'd-c9dbac568573432bb15f79c92c4fd4b5',
      dynamicTemplateData: {
        isRescheduled: false,
        name,
        bookingReference,
        deviceType: formattedDeviceInfo,
        service,
        bookingDate,
        bookingTime,
        address,
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
        to: to.substring(0, 3) + '***' // Log partial email for privacy
      });
      
      // Return success response
      return res.status(200).json({ 
        success: true,
        message: 'Confirmation email sent successfully',
        sentTo: to,
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