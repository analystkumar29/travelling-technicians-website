import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import { logger } from '@/utils/logger';
import crypto from 'crypto';

// Set up SendGrid API key if available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create a module logger
const emailLogger = logger.createModuleLogger('send-reschedule-confirmation');

// Environment variables
const VERIFICATION_SECRET = process.env.BOOKING_VERIFICATION_SECRET || 'default-secret-change-this';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

// Generate verification token for secure links
function generateVerificationToken(email: string, reference: string): string {
  const data = `${email.toLowerCase()}:${reference}:${new Date().toISOString().split('T')[0]}`;
  return crypto
    .createHmac('sha256', VERIFICATION_SECRET)
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
    
    // Create verify and reschedule URLs
    const verifyUrl = `${FRONTEND_URL}/verify-booking?token=${token}&reference=${bookingReference}`;
    const rescheduleUrl = `${FRONTEND_URL}/reschedule-booking?token=${token}&reference=${bookingReference}`;

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

    // Create email message with SendGrid
    const msg: sgMail.MailDataRequired = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
        name: process.env.SENDGRID_FROM_NAME || 'The Travelling Technicians',
      },
      subject: 'Your Booking Has Been Rescheduled',
      content: [
        {
          type: 'text/html',
          value: '<p>Your booking has been rescheduled. If you cannot view this email properly, please check your booking reference: ${bookingReference}</p>'
        }
      ],
      templateId: process.env.SENDGRID_RESCHEDULE_TEMPLATE_ID || 'd-c9dbac568573432bb15f79c92c4fd4b5', // Use the same template ID for now
      dynamicTemplateData: {
        isRescheduled: true,
        name,
        bookingReference,
        deviceType: deviceType === 'mobile' ? 'Mobile Phone' : deviceType === 'laptop' ? 'Laptop' : 'Tablet',
        brand,
        model,
        service,
        oldDate,
        oldTime,
        bookingDate,
        bookingTime,
        address,
        notes,
        verifyUrl,
        rescheduleUrl,
        year: new Date().getFullYear(),
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