import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Initialize SendGrid with API key from environment variables
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

type EmailData = {
  to: string;
  name: string;
  bookingDate: string;
  bookingTime: string;
  deviceType: string;
  brand: string;
  model: string;
  service: string;
  address: string;
  bookingReference?: string;
  oldDate?: string;
  oldTime?: string;
};

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
      bookingReference = `TT${Date.now().toString().substring(6)}`,
      oldDate,
      oldTime,
    }: EmailData = req.body;

    // Validate essential data
    if (!to || !name || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Create verification token
    const verificationToken = generateVerificationToken(to, bookingReference);
    
    // Construct verification URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const rescheduleUrl = `${baseUrl}/reschedule-booking?reference=${bookingReference}&token=${verificationToken}`;

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured - simulating email send');
      
      // Log what would be sent
      console.log({
        rescheduleUrl,
        to,
        subject: 'Your Booking Reschedule Confirmation - The Travelling Technicians',
        oldDate,
        oldTime,
        newDate: bookingDate,
        newTime: bookingTime,
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return success for development
      return res.status(200).json({ 
        success: true,
        message: 'Email sending simulated (SendGrid API key not configured)',
        sentTo: to,
        verificationToken,
      });
    }

    // Create email message with SendGrid
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
        name: process.env.SENDGRID_FROM_NAME || 'The Travelling Technicians',
      },
      subject: 'Your Repair Booking Has Been Rescheduled',
      // No text property - only use templateId
      templateId: process.env.SENDGRID_TEMPLATE_ID,
      dynamicTemplateData: {
        isRescheduled: true,  // This flag indicates it's a rescheduled booking
        name,
        bookingReference,
        deviceType: deviceType === 'mobile' ? 'Mobile Phone' : deviceType === 'laptop' ? 'Laptop' : deviceType,
        brand,
        model,
        service,
        oldDate,
        oldTime,
        bookingDate,
        bookingTime,
        address,
        rescheduleUrl,
        year: new Date().getFullYear()
      },
    };

    // Send email via SendGrid
    try {
      await sgMail.send(msg);
      
      // Return success response
      return res.status(200).json({ 
        success: true,
        message: 'Reschedule confirmation email sent successfully',
        sentTo: to,
      });
    } catch (sendGridError: any) {
      console.error('SendGrid Error:', sendGridError);
      if (sendGridError.response) {
        console.error('SendGrid Error Body:', sendGridError.response.body);
      }
      
      return res.status(500).json({ 
        success: false,
        message: 'Failed to send email via SendGrid',
        error: sendGridError.message
      });
    }
    
  } catch (error: any) {
    console.error('Error sending reschedule confirmation email:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to send reschedule confirmation email',
      error: error.message
    });
  }
} 