import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import { logger } from '@/utils/logger';
import { buildWarrantyNotificationEmail } from '@/lib/email-templates';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const emailLogger = logger.createModuleLogger('send-warranty-notification');

interface WarrantyNotificationData {
  to: string;
  name: string;
  warrantyNumber: string;
  bookingReference: string;
  deviceName: string;
  serviceName: string;
  technicianName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reviewUrl?: string;
}

function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return 'https://www.travelling-technicians.ca';
  }
  const possibleUrls = [
    process.env.NEXT_PUBLIC_WEBSITE_URL,
    process.env.NEXT_PUBLIC_FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'http://localhost:3000'
  ];
  return possibleUrls.find(url => url && !url.includes('url6811')) || 'http://localhost:3000';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      to,
      name,
      warrantyNumber,
      bookingReference,
      deviceName,
      serviceName,
      technicianName,
      startDate,
      endDate,
      durationDays,
      reviewUrl,
    }: WarrantyNotificationData = req.body;

    if (!to || !warrantyNumber || !bookingReference) {
      return res.status(400).json({
        success: false,
        message: 'Missing required warranty notification data'
      });
    }

    emailLogger.info('Preparing warranty notification email', {
      reference: bookingReference,
      warranty: warrantyNumber,
      to: to.substring(0, 3) + '***'
    });

    const baseUrl = getBaseUrl();
    const checkWarrantyUrl = `${baseUrl}/check-warranty`;

    const htmlContent = buildWarrantyNotificationEmail({
      name: name || 'Customer',
      warrantyNumber,
      bookingReference,
      deviceName: deviceName || 'Your Device',
      serviceName: serviceName || 'Repair Service',
      technicianName: technicianName || 'Our Technician',
      startDate,
      endDate,
      durationDays,
      checkWarrantyUrl,
      reviewUrl,
    });

    if (!process.env.SENDGRID_API_KEY) {
      emailLogger.warn('SendGrid not configured — simulating warranty email', {
        warranty: warrantyNumber,
        reference: bookingReference
      });

      return res.status(200).json({
        success: true,
        message: 'Warranty email simulated (SendGrid not configured)',
        sentTo: to
      });
    }

    const msg: sgMail.MailDataRequired = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
        name: process.env.SENDGRID_FROM_NAME || 'The Travelling Technicians',
      },
      subject: 'Your Repair Warranty — The Travelling Technicians',
      text: `Hi ${name || 'Customer'}, your repair is complete! Your warranty code is ${warrantyNumber}, valid until ${endDate}. Check your warranty status at ${checkWarrantyUrl}`,
      html: htmlContent,
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false },
      },
    };

    await sgMail.send(msg);

    emailLogger.info('Warranty notification email sent', {
      warranty: warrantyNumber,
      reference: bookingReference,
      to: to.substring(0, 3) + '***'
    });

    return res.status(200).json({
      success: true,
      message: 'Warranty notification email sent successfully',
      sentTo: to
    });

  } catch (error: any) {
    emailLogger.error('Failed to send warranty notification email', {
      error: error.message || 'Unknown error'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to send warranty notification email'
    });
  }
}
