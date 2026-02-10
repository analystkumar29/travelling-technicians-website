/**
 * Send payment receipt email to customer
 * Follows same pattern as send-payment-link-email.ts
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import { logger } from '@/utils/logger';
import { buildPaymentReceiptEmail } from '@/lib/email-templates';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const emailLogger = logger.createModuleLogger('send-payment-receipt-email');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      to,
      name,
      bookingReference,
      subtotal,
      gst,
      pst,
      total,
      paymentMethod,
    } = req.body;

    if (!to || !bookingReference) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment receipt email data',
      });
    }

    emailLogger.info('Preparing payment receipt email', {
      reference: bookingReference,
      to: to.substring(0, 3) + '***',
    });

    const htmlContent = buildPaymentReceiptEmail({
      name: name || 'Customer',
      bookingReference,
      subtotal: subtotal || 0,
      gst: gst || 0,
      pst: pst || 0,
      total: total || 0,
      paymentMethod: paymentMethod || 'Stripe',
    });

    if (!process.env.SENDGRID_API_KEY) {
      emailLogger.warn('SendGrid not configured — simulating payment receipt email', {
        reference: bookingReference,
      });
      return res.status(200).json({
        success: true,
        message: 'Payment receipt email simulated (SendGrid not configured)',
        sentTo: to,
      });
    }

    const msg: sgMail.MailDataRequired = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
        name: process.env.SENDGRID_FROM_NAME || 'The Travelling Technicians',
      },
      subject: `Payment Received — ${bookingReference}`,
      text: `Hi ${name || 'Customer'}, we've received your payment of $${(total || 0).toFixed(2)} CAD for booking ${bookingReference}. An invoice will be emailed after your repair is complete.`,
      html: htmlContent,
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false },
      },
    };

    await sgMail.send(msg);

    emailLogger.info('Payment receipt email sent', {
      reference: bookingReference,
      to: to.substring(0, 3) + '***',
    });

    return res.status(200).json({
      success: true,
      message: 'Payment receipt email sent successfully',
      sentTo: to,
    });
  } catch (error: any) {
    emailLogger.error('Failed to send payment receipt email', {
      error: error.message || 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to send payment receipt email',
    });
  }
}
