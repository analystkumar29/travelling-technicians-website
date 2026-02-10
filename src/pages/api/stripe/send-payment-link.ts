/**
 * Send a payment link via email and return WhatsApp URL.
 *
 * Auth: Technician JWT OR Admin JWT
 * Input: { booking_id, send_email?: boolean, amount? }
 * Returns: { url, whatsapp_url }
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { getBaseUrl } from '@/lib/stripe';
import { calculateTax } from '@/lib/tax-calculator';
import { verifyAdminToken } from '@/middleware/adminAuth';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('stripe/send-payment-link');

function verifyTechOrAdmin(req: NextApiRequest): boolean {
  const adminAuth = verifyAdminToken(req);
  if (adminAuth.isAuthenticated) return true;
  try {
    const { verifyTechnicianToken } = require('@/middleware/technicianAuth');
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return false;
    const token = authHeader.substring(7);
    return !!verifyTechnicianToken(token);
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyTechOrAdmin(req)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { booking_id, send_email = true, amount } = req.body;

  if (!booking_id) {
    return res.status(400).json({ error: 'booking_id is required' });
  }

  try {
    const baseUrl = getBaseUrl();

    // Create payment link (calls internal endpoint)
    const createRes = await fetch(`${baseUrl}/api/stripe/create-payment-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization || '',
      },
      body: JSON.stringify({ booking_id, amount }),
    });

    const createData = await createRes.json();
    if (!createRes.ok) {
      return res.status(createRes.status).json(createData);
    }

    const paymentUrl = createData.url;
    const supabase = getServiceSupabase();

    // Fetch booking for email and WhatsApp
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        customer_email, customer_name, customer_phone, booking_ref,
        quoted_price, final_price, province,
        device_models:model_id (name, brands:brand_id (name)),
        services:service_id (name, display_name)
      `)
      .eq('id', booking_id)
      .single();

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const price = amount || booking.final_price || booking.quoted_price || 0;
    const tax = calculateTax(parseFloat(String(price)), booking.province || 'BC');
    const deviceModels = booking.device_models as any;
    const services = booking.services as any;
    const serviceName = services?.display_name || services?.name || 'Repair Service';
    const modelName = deviceModels?.name || 'your device';

    // Send email if requested
    if (send_email && booking.customer_email) {
      try {
        await fetch(`${baseUrl}/api/send-payment-link-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: booking.customer_email,
            name: booking.customer_name,
            bookingReference: booking.booking_ref,
            serviceName,
            deviceName: `${deviceModels?.brands?.name || ''} ${modelName}`.trim(),
            paymentUrl,
            subtotal: tax.subtotal,
            gst: tax.gstAmount,
            pst: tax.pstAmount,
            total: tax.total,
          }),
        });
        apiLogger.info('Payment link email sent', { bookingRef: booking.booking_ref });
      } catch (e) {
        apiLogger.error('Payment link email failed (non-blocking)', { error: String(e) });
      }
    }

    // Build WhatsApp URL
    const whatsappMessage = encodeURIComponent(
      `Hi ${booking.customer_name},\n\nYour ${serviceName} for ${modelName} is complete! ` +
        `Total: $${tax.total.toFixed(2)} CAD.\n\n` +
        `Pay securely here: ${paymentUrl}\n\n` +
        `Ref: ${booking.booking_ref}\n— The Travelling Technicians`
    );
    const phone = booking.customer_phone?.replace(/\D/g, '') || '';
    const whatsappUrl = phone ? `https://wa.me/${phone.startsWith('1') ? phone : `1${phone}`}?text=${whatsappMessage}` : null;

    return res.status(200).json({
      url: paymentUrl,
      whatsapp_url: whatsappUrl,
      booking_ref: booking.booking_ref,
      total: tax.total,
      email_sent: send_email,
    });
  } catch (err) {
    apiLogger.error('Error sending payment link', { error: String(err) });
    return res.status(500).json({ error: 'Failed to send payment link' });
  }
}
