import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import { logger } from '@/utils/logger';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { buildAdminBookingNotificationEmail } from '@/lib/email-templates';
import { buildSlackBookingNotification } from '@/lib/slack-notifications';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const apiLogger = logger.createModuleLogger('send-admin-notification');

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
      bookingReference,
      customerName,
      customerEmail,
      customerPhone,
      deviceType,
      deviceBrand,
      deviceModel,
      serviceName,
      bookingDate,
      bookingTime,
      address,
      city,
      province,
      postalCode,
      quotedPrice,
      pricingTier,
      issueDescription,
    } = req.body;

    if (!bookingReference || !customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingReference, customerName, customerEmail',
      });
    }

    apiLogger.info('Preparing admin booking notification', {
      reference: bookingReference,
    });

    const baseUrl = getBaseUrl();
    const adminPanelUrl = `${baseUrl}/management/bookings`;

    // Fetch admin notification email from site_settings
    let adminEmail = 'info@travelling-technicians.ca';
    try {
      const supabase = getServiceSupabase();
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'admin_notification_email')
        .single();
      if (data?.value) {
        adminEmail = data.value;
      }
    } catch (settingsErr) {
      apiLogger.warn('Could not fetch admin_notification_email from site_settings, using default', {
        error: settingsErr instanceof Error ? settingsErr.message : 'Unknown error',
      });
    }

    let emailSent = false;
    let slackSent = false;

    // --- Send Email ---
    try {
      const htmlContent = buildAdminBookingNotificationEmail({
        bookingReference,
        customerName,
        customerEmail,
        customerPhone: customerPhone || 'Not provided',
        deviceType: deviceType || 'unknown',
        deviceBrand,
        deviceModel,
        serviceName: serviceName || 'Repair Service',
        bookingDate: bookingDate || 'TBD',
        bookingTime: bookingTime || 'TBD',
        address,
        city: city || 'Vancouver',
        province,
        postalCode,
        quotedPrice: quotedPrice ?? null,
        pricingTier: pricingTier || 'standard',
        issueDescription,
        adminPanelUrl,
      });

      if (!process.env.SENDGRID_API_KEY) {
        apiLogger.warn('SendGrid not configured — simulating admin notification email', {
          reference: bookingReference,
        });
        emailSent = true; // simulated
      } else {
        const msg: sgMail.MailDataRequired = {
          to: adminEmail,
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'bookings@travelling-technicians.ca',
            name: process.env.SENDGRID_FROM_NAME || 'The Travelling Technicians',
          },
          subject: `New Booking ${bookingReference} — ${customerName}`,
          text: `New booking received: ${bookingReference} from ${customerName} (${customerEmail}). Device: ${deviceType || 'unknown'}, Service: ${serviceName || 'unknown'}. View at ${adminPanelUrl}`,
          html: htmlContent,
          trackingSettings: {
            clickTracking: { enable: false, enableText: false },
            openTracking: { enable: false },
          },
        };

        await sgMail.send(msg);
        emailSent = true;

        apiLogger.info('Admin notification email sent', {
          reference: bookingReference,
          to: adminEmail,
        });
      }
    } catch (emailErr) {
      apiLogger.error('Failed to send admin notification email', {
        reference: bookingReference,
        error: emailErr instanceof Error ? emailErr.message : 'Unknown error',
      });
    }

    // --- Send Slack ---
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!slackWebhookUrl) {
        apiLogger.info('SLACK_WEBHOOK_URL not configured — skipping Slack notification', {
          reference: bookingReference,
        });
      } else {
        const slackPayload = buildSlackBookingNotification({
          bookingReference,
          customerName,
          customerPhone: customerPhone || 'Not provided',
          deviceType: deviceType || 'unknown',
          deviceBrand,
          deviceModel,
          serviceName: serviceName || 'Repair Service',
          bookingDate: bookingDate || 'TBD',
          bookingTime: bookingTime || 'TBD',
          address,
          city: city || 'Vancouver',
          province,
          postalCode,
          quotedPrice: quotedPrice ?? null,
          pricingTier: pricingTier || 'standard',
          issueDescription,
          adminPanelUrl,
        });

        const slackRes = await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload),
        });

        if (slackRes.ok) {
          slackSent = true;
          apiLogger.info('Slack notification sent', { reference: bookingReference });
        } else {
          const slackBody = await slackRes.text();
          apiLogger.error('Slack webhook returned non-OK', {
            reference: bookingReference,
            status: slackRes.status,
            body: slackBody,
          });
        }
      }
    } catch (slackErr) {
      apiLogger.error('Failed to send Slack notification', {
        reference: bookingReference,
        error: slackErr instanceof Error ? slackErr.message : 'Unknown error',
      });
    }

    return res.status(200).json({
      success: true,
      emailSent,
      slackSent,
    });
  } catch (error) {
    apiLogger.error('Unexpected error in admin notification handler', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to send admin notification',
    });
  }
}
