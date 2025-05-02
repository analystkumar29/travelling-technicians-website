import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import { logger } from '@/utils/logger';

// Configure SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const moduleLogger = logger.createModuleLogger('email');

// Environment variables
const VERIFICATION_SECRET = process.env.BOOKING_VERIFICATION_SECRET || 'default-secret-change-this';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

export interface ConfirmationEmailData {
  to: string;
  name: string;
  bookingReference: string;
  deviceType: string;
  service: string;
  bookingDate: string;
  bookingTime: string;
  bookingAddress?: string;
}

export function generateVerificationToken(email: string, reference: string): string {
  const data = `${email.toLowerCase()}:${reference}:${new Date().toISOString().split('T')[0]}`;
  return crypto
    .createHmac('sha256', VERIFICATION_SECRET)
    .update(data)
    .digest('hex');
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
    const data = req.body as ConfirmationEmailData;
    
    // Additional debug logging to see what's coming in
    moduleLogger.info('Received confirmation email request', {
      hasTo: !!data.to,
      hasName: !!data.name,
      hasReference: !!data.bookingReference,
      hasDeviceType: !!data.deviceType,
      hasService: !!data.service,
      hasDate: !!data.bookingDate,
      hasTime: !!data.bookingTime,
      reference: data.bookingReference || 'MISSING',
      rawBody: JSON.stringify(req.body)
    });
    
    // Verify we have all required data
    if (!data.to || !data.name || !data.bookingReference || !data.deviceType || 
        !data.service || !data.bookingDate || !data.bookingTime) {
      moduleLogger.warn('Missing required email data', { 
        missing: !data.to ? 'email' : 
                !data.name ? 'name' : 
                !data.bookingReference ? 'reference' : 
                !data.deviceType ? 'deviceType' : 
                !data.service ? 'service' : 
                !data.bookingDate ? 'date' : 'time',
        receivedData: JSON.stringify(data)
      });
      return res.status(400).json({ success: false, message: 'Missing required email data' });
    }

    // Generate verification token
    const token = generateVerificationToken(data.to, data.bookingReference);
    
    // Create verify URL
    const verifyUrl = `${FRONTEND_URL}/verify-booking?token=${token}&reference=${data.bookingReference}`;
    
    // Create reschedule URL
    const rescheduleUrl = `${FRONTEND_URL}/reschedule-booking?token=${token}&reference=${data.bookingReference}`;
    
    // Log email details for debugging
    moduleLogger.info('Sending confirmation email', { 
      to: data.to,
      reference: data.bookingReference,
      verifyUrl: verifyUrl,
      rescheduleUrl: rescheduleUrl
    });

    // If SendGrid is not configured, simulate email send
    if (!process.env.SENDGRID_API_KEY) {
      moduleLogger.warn('SendGrid API key not configured, simulating email send', {
        to: data.to,
        subject: 'Your Booking Confirmation - The Travelling Technicians',
        verifyUrl,
        rescheduleUrl,
        data
      });
      
      return res.status(200).json({
        success: true,
        message: 'Email simulated (no API key)',
        verifyUrl,
        rescheduleUrl
      });
    }
    
    const msg: sgMail.MailDataRequired = {
      to: data.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@thetravellingtechnicians.ca',
        name: 'The Travelling Technicians'
      },
      subject: 'Your Booking Confirmation - The Travelling Technicians',
      templateId: process.env.SENDGRID_TEMPLATE_ID,
      dynamicTemplateData: {
        name: data.name,
        bookingReference: data.bookingReference,
        deviceType: data.deviceType,
        service: data.service,
        bookingDate: data.bookingDate,
        bookingTime: data.bookingTime,
        bookingAddress: data.bookingAddress || 'Your provided address',
        verifyUrl: verifyUrl,
        rescheduleUrl: rescheduleUrl
      },
      content: [
        {
          type: 'text/html',
          value: '<p>Your booking has been confirmed.</p>'
        }
      ]
    };

    // Send email
    await sgMail.send(msg);
    moduleLogger.info('Confirmation email sent successfully', { to: data.to, reference: data.bookingReference });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Confirmation email sent successfully',
      verifyUrl,
      rescheduleUrl
    });
  } catch (error: any) {
    moduleLogger.error('Error sending confirmation email', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: 'Error sending confirmation email', error: error.message });
  }
} 