import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import { logger } from '@/utils/logger';
import crypto from 'crypto';
import { buildRescheduleConfirmationEmail } from '@/lib/email-templates';

// Initialize SendGrid with proper configuration
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create a module logger
const emailLogger = logger.createModuleLogger('send-reschedule-confirmation');

// Ensure required environment variables are set
const VERIFICATION_SECRET = process.env.BOOKING_VERIFICATION_SECRET;

if (!VERIFICATION_SECRET) {
  throw new Error('BOOKING_VERIFICATION_SECRET environment variable is required');
}

// Type assertion to help TypeScript understand the variable is defined
const SECRET: string = VERIFICATION_SECRET;

// Generate verification token for secure links
function generateVerificationToken(email: string, reference: string): string {
  // Use date-based token to match verification logic
  const today = new Date().toISOString().split('T')[0];
  const data = `${email.toLowerCase()}:${reference}:${today}`;

  return crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('hex');
}

// Email data interface
interface RescheduleEmailData {
  to: string;
  name: string;
  bookingReference: string;
  deviceType: string;
  brand?: string;
  model?: string;
  service: string;
  oldDate: string;
  oldTime: string;
  bookingDate: string;
  bookingTime: string;
  address?: string;
  notes?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Extract data from request
    const {
      to,
      name,
      bookingReference,
      deviceType,
      brand,
      model,
      service,
      oldDate,
      oldTime,
      bookingDate,
      bookingTime,
      address,
      notes,
    }: RescheduleEmailData = req.body;

    // Validate essential data
    if (!to || !name || !bookingReference || !bookingDate || !bookingTime) {
      emailLogger.warn('Missing required data for reschedule confirmation email', {
        missing: !to ? 'email' : !name ? 'name' : !bookingReference ? 'reference' : !bookingDate ? 'date' : 'time'
      });

      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Generate verification token for secure links
    const token = generateVerificationToken(to, bookingReference);

    // 🔧 ROBUST URL GENERATION - Fix for production domain issue
    function getBaseUrl(): string {
      // In production, always use the custom domain
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
        return 'https://www.travelling-technicians.ca';
      }

      // Try multiple environment variables in order of preference
      const possibleUrls = [
        process.env.NEXT_PUBLIC_FRONTEND_URL,
        process.env.NEXT_PUBLIC_WEBSITE_URL,
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

    const verifyUrl = `${baseUrl}/verify-booking?token=${token}&reference=${bookingReference}`;
    const rescheduleUrl = `${baseUrl}/reschedule-booking?token=${token}&reference=${bookingReference}`;

    emailLogger.info('Preparing reschedule confirmation email', {
      reference: bookingReference,
      to: to.substring(0, 3) + '***', // Log partial email for privacy
      verifyUrl,
      rescheduleUrl
    });

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      emailLogger.warn('SendGrid API key not configured - simulating email send');

      // Log what would be sent
      emailLogger.debug('Email simulation data', {
        to: to.substring(0, 3) + '***', // Log partial email for privacy
        subject: 'Your Booking Reschedule Confirmation - The Travelling Technicians',
        oldDate,
        oldTime,
        newDate: bookingDate,
        newTime: bookingTime,
        verifyUrl,
        rescheduleUrl
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return success for development
      return res.status(200).json({
        success: true,
        message: 'Reschedule confirmation email sending simulated (SendGrid API key not configured)',
        sentTo: to,
        verifyUrl,
        rescheduleUrl
      });
    }

    // Build inline HTML email
    const htmlContent = buildRescheduleConfirmationEmail({
      name,
      bookingReference,
      deviceType,
      brand,
      model,
      service,
      oldDate,
      oldTime,
      bookingDate,
      bookingTime,
      address,
      verificationUrl: verifyUrl,
      rescheduleUrl,
    });

    // Create email message with SendGrid
    const msg: sgMail.MailDataRequired = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
        name: process.env.SENDGRID_FROM_NAME || 'The Travelling Technicians',
      },
      subject: 'Your Booking Has Been Rescheduled',
      text: `Hi ${name}, your booking (${bookingReference}) has been rescheduled from ${oldDate} at ${oldTime} to ${bookingDate} at ${bookingTime}. View your booking: ${verifyUrl}`,
      html: htmlContent,
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false },
      },
    };

    // Send email via SendGrid
    try {
      await sgMail.send(msg);

      emailLogger.info('Reschedule confirmation email sent successfully', {
        reference: bookingReference,
        to: to.substring(0, 3) + '***' // Log partial email for privacy
      });

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Reschedule confirmation email sent successfully',
        sentTo: to,
        verifyUrl,
        rescheduleUrl
      });
    } catch (sendGridError: any) {
      // Log full error details
      emailLogger.error('SendGrid Email Send Error:', {
        error: sendGridError.message,
        code: sendGridError.code,
        status: sendGridError.status,
        reference: bookingReference,
        errorType: sendGridError.name,
        stack: sendGridError.stack
      });

      if (sendGridError.response) {
        emailLogger.error('SendGrid Response Error Body:', {
          status: sendGridError.response.status,
          body: sendGridError.response.body,
          headers: sendGridError.response.headers
        });
      }

      // Return appropriate error message without exposing SendGrid details
      const isNetworkError = sendGridError.code === 'CERT_HAS_EXPIRED' ||
                              sendGridError.message?.includes('certificate') ||
                              sendGridError.message?.includes('ECONNREFUSED') ||
                              sendGridError.message?.includes('ERR_');

      return res.status(500).json({
        success: false,
        message: isNetworkError
          ? 'Email service temporarily unavailable. Please try again in a few moments.'
          : 'Failed to send reschedule confirmation. Please contact support.',
        reference: bookingReference
      });
    }

  } catch (error: any) {
    emailLogger.error('Error sending reschedule confirmation email:', {
      error: error.message || 'Unknown error'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to send reschedule confirmation email',
      error: error.message
    });
  }
}
