import type { NextApiRequest, NextApiResponse } from 'next';

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
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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
    }: EmailData = req.body;

    // In a production environment, you would integrate with an email service like:
    // - SendGrid
    // - Mailchimp
    // - AWS SES
    // - Nodemailer (for custom SMTP)
    
    // For demo purposes, we'll simulate a successful email send
    // Replace this with actual email sending code in production

    console.log('Sending confirmation email to:', to);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return success response
    return res.status(200).json({ 
      success: true,
      message: 'Confirmation email sent successfully',
      sentTo: to,
    });
    
    // In production, implement real email sending with code like:
    /*
    // With SendGrid:
    const msg = {
      to,
      from: 'bookings@travelling-technicians.ca',
      subject: 'Your Booking Confirmation - The Travelling Technicians',
      text: `Hi ${name}, your booking has been confirmed for ${bookingDate} at ${bookingTime}...`,
      html: `<h1>Booking Confirmation</h1><p>Hi ${name},</p><p>Your booking has been confirmed!</p>...`,
    };
    await sgMail.send(msg);
    */
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to send confirmation email' 
    });
  }
} 