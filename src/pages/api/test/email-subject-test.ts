import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'testEmail is required' 
      });
    }

    console.log('🧪 Testing email subject with:', {
      to: testEmail,
      templateId: process.env.SENDGRID_TEMPLATE_ID,
      hasApiKey: !!process.env.SENDGRID_API_KEY
    });

    // Create test email message
    const msg: sgMail.MailDataRequired = {
      to: testEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
        name: 'The Travelling Technicians',
      },
      subject: 'THIS SHOULD BE IGNORED BY SENDGRID',
      templateId: process.env.SENDGRID_TEMPLATE_ID || 'd-c9dbac568573432bb15f79c92c4fd4b5',
      dynamicTemplateData: {
        subject: '🧪 SUBJECT TEST - The Travelling Technicians',
        name: 'Test User',
        bookingReference: 'TEST-123456',
        deviceType: 'iPhone 15 Pro',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        service: 'Screen Replacement',
        bookingDate: 'Monday, January 27, 2025',
        bookingTime: 'Morning (9AM - 12PM)',
        address: '123 Test Street, Vancouver, BC V6B 1A1',
        verificationUrl: 'https://travelling-technicians.ca/verify-booking?test=1',
        rescheduleUrl: 'https://travelling-technicians.ca/reschedule-booking?test=1',
        year: new Date().getFullYear(),
      },
    };

    // Send test email
    await sgMail.send(msg);
    
    return res.status(200).json({ 
      success: true,
      message: 'Test email sent! Check your inbox for subject line.',
      sentTo: testEmail,
      expectedSubject: '🧪 SUBJECT TEST - The Travelling Technicians',
      note: 'If subject shows as "(no subject)", the SendGrid template needs {{{subject}}} in the Subject field'
    });
    
  } catch (error: any) {
    console.error('❌ Test email failed:', error);
    
    return res.status(500).json({ 
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
} 