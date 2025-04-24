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
    const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-booking?token=${verificationToken}`;
    const rescheduleUrl = `${baseUrl}/reschedule-booking?reference=${bookingReference}&token=${verificationToken}`;

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured - simulating email send');
      
      // Log what would be sent
      console.log({
        verificationUrl,
        rescheduleUrl,
        to,
        subject: 'Your Booking Confirmation - The Travelling Technicians',
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return success for development
      return res.status(200).json({ 
        success: true,
        message: 'Email sending simulated (SendGrid API key not configured)',
        sentTo: to,
        verificationToken,
        verificationUrl,
      });
    }

    // Create email message with SendGrid
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
        name: process.env.SENDGRID_FROM_NAME || 'The Travelling Technicians',
      },
      subject: 'Your Repair Booking Confirmation',
      text: `Hi ${name}, your booking has been confirmed for ${bookingDate} at ${bookingTime}. Please verify your booking at: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Booking Confirmation</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #e5e7eb;">
            <p>Hi ${name},</p>
            <p>Your booking with The Travelling Technicians has been confirmed:</p>
            
            <div style="background-color: #f9fafb; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <p><strong>Booking Reference:</strong> ${bookingReference}</p>
              <p><strong>Device:</strong> ${deviceType} - ${brand} ${model}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Date/Time:</strong> ${bookingDate} at ${bookingTime}</p>
              <p><strong>Address:</strong> ${address}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; display: inline-block; font-weight: bold;">Verify Booking</a>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${rescheduleUrl}" style="background-color: #f59e0b; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; display: inline-block; font-weight: bold;">Reschedule Booking</a>
            </div>
            
            <p>Our technician will arrive at your location during the scheduled time window.</p>
            <p>If you need to make any changes, click the reschedule button above or call us at (604) 123-4567.</p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© ${new Date().getFullYear()} The Travelling Technicians. All rights reserved.</p>
            <p>Lower Mainland, British Columbia, Canada</p>
          </div>
        </div>
      `,
    };

    // Send email via SendGrid
    try {
      await sgMail.send(msg);
      
      // Return success response
      return res.status(200).json({ 
        success: true,
        message: 'Confirmation email sent successfully',
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
    console.error('Error sending confirmation email:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to send confirmation email',
      error: error.message
    });
  }
} 