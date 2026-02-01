import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create a module logger
const emailLogger = logger.createModuleLogger('send-confirmation');

// Ensure required environment variables are set
const VERIFICATION_SECRET = process.env.BOOKING_VERIFICATION_SECRET;

if (!VERIFICATION_SECRET) {
  throw new Error('BOOKING_VERIFICATION_SECRET environment variable is required for secure token generation');
}

// Type assertion to help TypeScript understand the variable is defined
const SECRET: string = VERIFICATION_SECRET;

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
  // Use date-based token to match verification logic
  const today = new Date().toISOString().split('T')[0];
  const data = `${email.toLowerCase()}:${bookingReference}:${today}`;
  
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

  // 🔍 COMPREHENSIVE ENVIRONMENT LOGGING
  emailLogger.info('🌍 EMAIL API - Environment Variables Check', {
    nodeEnv: process.env.NODE_ENV,
    hasSendGridKey: !!process.env.SENDGRID_API_KEY,
    sendGridKeyPrefix: process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.substring(0, 3) + '...' : 'MISSING',
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    supabaseUrlPrefix: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 20) + '...' : 'MISSING',
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    hasAdminSecret: !!process.env.ADMIN_JWT_SECRET,
    hasBookingSecret: !!process.env.BOOKING_VERIFICATION_SECRET,
    sendGridFromEmail: process.env.SENDGRID_FROM_EMAIL || 'NOT_SET',
    sendGridTemplateId: process.env.SENDGRID_TEMPLATE_ID || 'NOT_SET',
    totalEnvVars: Object.keys(process.env).length,
    timestamp: new Date().toISOString()
  });

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

    emailLogger.info('📧 EMAIL API - Request Data Received', {
      hasTo: !!to,
      hasName: !!name,
      hasBookingDate: !!bookingDate,
      hasBookingTime: !!bookingTime,
      deviceType,
      service,
      reference: bookingReference,
      requestMethod: req.method,
      userAgent: req.headers['user-agent']?.substring(0, 50) || 'unknown'
    });

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
    
    const verificationUrl = `${baseUrl}/verify-booking?token=${verificationToken}&reference=${bookingReference}`;
    const rescheduleUrl = `${baseUrl}/reschedule-booking?token=${verificationToken}&reference=${bookingReference}`;

    // 🔍 DETAILED SENDGRID CONFIGURATION CHECK
    const sendGridConfigured = !!process.env.SENDGRID_API_KEY;
    emailLogger.info('🔧 EMAIL API - SendGrid Configuration Check', {
      configured: sendGridConfigured,
      apiKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
      apiKeyStart: process.env.SENDGRID_API_KEY?.substring(0, 6) || 'MISSING',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'DEFAULT',
      templateId: process.env.SENDGRID_TEMPLATE_ID || 'DEFAULT',
      verificationUrl,
      rescheduleUrl
    });

    if (!sendGridConfigured) {
      emailLogger.warn('❌ EMAIL API - SendGrid NOT configured - simulating email send', {
        reason: 'SENDGRID_API_KEY missing',
        wouldSendTo: to.substring(0, 3) + '***',
        reference: bookingReference
      });
      
      // Log what would be sent
      emailLogger.debug('📧 EMAIL API - Simulation Details', {
        verificationUrl,
        rescheduleUrl,
        to: to.substring(0, 3) + '***',
        subject: 'Your Booking Confirmation - The Travelling Technicians',
        formattedDevice: formatDeviceInfo(deviceType, brand, model)
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
        debug: {
          reason: 'SENDGRID_API_KEY_MISSING',
          envVarsCount: Object.keys(process.env).length,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 🚀 SENDGRID IS CONFIGURED - PROCEEDING WITH REAL EMAIL
    emailLogger.info('✅ EMAIL API - SendGrid CONFIGURED - sending real email', {
      apiKeyPrefix: process.env.SENDGRID_API_KEY!.substring(0, 6) + '...',
      to: to.substring(0, 3) + '***',
      reference: bookingReference
    });

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
        subject: 'Booking Confirmation - The Travelling Technicians',
        isRescheduled: false,
        name,
        bookingReference,
        deviceType: formattedDeviceInfo,
        brand,
        model,
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