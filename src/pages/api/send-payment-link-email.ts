/**
 * Send payment link email to customer
 * Follows same pattern as send-warranty-notification.ts
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import { logger } from '@/utils/logger';
import { buildPaymentLinkEmail } from '@/lib/email-templates';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const emailLogger = logger.createModuleLogger('send-payment-link-email');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      to,
      name,
      bookingReference,
      serviceName,
      deviceName,
      paymentUrl,
      subtotal,
      gst,
      pst,
      total,
    } = req.body;

    if (!to || !bookingReference || !paymentUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment link email data',
      });
    }

    emailLogger.info('Preparing payment link email', {
      reference: bookingReference,
      to: to.substring(0, 3) + '***',
    });

    const htmlContent = buildPaymentLinkEmail({
      name: name || 'Customer',
      bookingReference,
      serviceName: serviceName || 'Repair Service',
      deviceName: deviceName || 'Your Device',
      paymentUrl,
      subtotal: subtotal || 0,
      gst: gst || 0,
      pst: pst || 0,
      total: total || 0,
    });

    if (!process.env.SENDGRID_API_KEY) {
      emailLogger.warn('SendGrid not configured — simulating payment link email', {
        reference: bookingReference,
      });
      return res.status(200).json({
        success: true,
        message: 'Payment link email simulated (SendGrid not configured)',
        sentTo: to,
      });
    }

    const msg: sgMail.MailDataRequired = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
        name: process.env.SENDGRID_FROM_NAME || 'The Travelling Technicians',
      },
      subject: `Complete Your Payment — ${bookingReference}`,
      text: `Hi ${name || 'Customer'}, your repair is complete! Pay $${(total || 0).toFixed(2)} CAD securely here: ${paymentUrl}. Ref: ${bookingReference}`,
      html: htmlContent,
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false },
      },
    };

    await sgMail.send(msg);

    emailLogger.info('Payment link email sent', {
      reference: bookingReference,
      to: to.substring(0, 3) + '***',
    });

    return res.status(200).json({
      success: true,
      message: 'Payment link email sent successfully',
      sentTo: to,
    });
  } catch (error: any) {
    emailLogger.error('Failed to send payment link email', {
      error: error.message || 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to send payment link email',
    });
  }
}
