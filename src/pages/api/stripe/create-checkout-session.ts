/**
 * Create a Stripe Checkout Session for upfront payment during booking.
 * Creates the booking in DB with status 'pending-payment', then redirects to Stripe.
 *
 * Auth: None (public — same as /api/bookings/create)
 * Input: Full CreateBookingRequest + paymentMode: 'upfront'
 * Returns: { sessionId, url, booking_ref }
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getStripe, getOrCreateStripeCustomer, getBaseUrl } from '@/lib/stripe';
import { calculateTax, toStripeCents } from '@/lib/tax-calculator';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('stripe/create-checkout-session');

function generateReferenceNumber(): string {
  const prefix = 'TTR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  // Validate required fields
  const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'address', 'postalCode', 'appointmentDate', 'appointmentTime'];
  const missing = requiredFields.filter(f => !data[f]);
  if (missing.length > 0) {
    return res.status(400).json({ error: 'Missing required fields', fields: missing });
  }

  const supabase = getServiceSupabase();

  try {
    const referenceNumber = generateReferenceNumber();
    const price = data.quoted_price;

    if (!price || parseFloat(String(price)) <= 0) {
      return res.status(400).json({ error: 'Valid quoted_price required for upfront payment' });
    }

    const subtotal = parseFloat(String(price));
    const province = data.province || 'BC';
    const tax = calculateTax(subtotal, province);

    // Look up model and service IDs (same logic as bookings/create.ts)
    let modelId = null;
    const deviceModel = data.deviceModel || data.device_model;
    const deviceBrand = data.deviceBrand || data.device_brand;
    if (deviceModel && deviceBrand) {
      const { data: modelData } = await supabase
        .from('device_models')
        .select('id')
        .ilike('name', deviceModel)
        .limit(1)
        .single();
      modelId = modelData?.id || null;
    }

    let serviceId = null;
    const serviceType = data.serviceType || data.service_type;
    if (serviceType) {
      const serviceSlug = Array.isArray(serviceType) ? serviceType[0] : serviceType;
      const { data: serviceData } = await supabase
        .from('services')
        .select('id, name, display_name')
        .or(`slug.ilike.%${serviceSlug}%,name.ilike.%${serviceSlug.replace(/-/g, ' ')}%`)
        .limit(1)
        .single();
      serviceId = serviceData?.id || null;
    }

    // Look up location
    let locationId = null;
    const city = data.city || 'Vancouver';
    if (city) {
      const { data: loc } = await supabase
        .from('service_locations')
        .select('id')
        .ilike('city_name', `%${city}%`)
        .limit(1)
        .single();
      locationId = loc?.id || null;
    }

    // Build scheduled_at
    const appointmentDate = data.appointmentDate;
    const appointmentTime = data.appointmentTime || '12:00';
    let scheduledAt = null;
    if (appointmentDate) {
      const [h, m] = appointmentTime.split(':').map(Number);
      const [y, mo, d] = appointmentDate.split('-').map(Number);
      scheduledAt = new Date(Date.UTC(y, mo - 1, d, h, m || 0)).toISOString();
    }

    // Create booking with pending-payment status
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_ref: referenceNumber,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        customer_address: data.address,
        city,
        province,
        model_id: modelId,
        service_id: serviceId,
        location_id: locationId,
        booking_date: appointmentDate,
        booking_time: appointmentTime,
        scheduled_at: scheduledAt,
        issue_description: data.issueDescription || null,
        quoted_price: subtotal,
        pricing_tier: data.pricingTier || 'standard',
        status: 'pending-payment',
        payment_status: 'pending',
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      apiLogger.error('Failed to create booking for checkout', { error: bookingError });
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(
      data.customerEmail,
      data.customerName,
      data.customerPhone
    );

    // Build line item description
    const brandDisplay = deviceBrand === 'other' ? (data.customBrand || '') : (deviceBrand || '');
    const modelDisplay = deviceModel || '';
    const serviceSlugForDisplay = Array.isArray(serviceType) ? serviceType[0] : (serviceType || 'Repair');
    const serviceDisplay = serviceSlugForDisplay.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    const lineDescription = `${serviceDisplay}${brandDisplay ? ` — ${brandDisplay}` : ''}${modelDisplay ? ` ${modelDisplay}` : ''}`;

    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      currency: 'cad',
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: { name: lineDescription },
            unit_amount: toStripeCents(tax.subtotal),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            product_data: { name: 'GST (5%)' },
            unit_amount: toStripeCents(tax.gstAmount),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            product_data: { name: 'BC PST (7%)' },
            unit_amount: toStripeCents(tax.pstAmount),
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        booking_ref: referenceNumber,
        source: 'upfront-checkout',
      },
      success_url: `${baseUrl}/booking-confirmation?reference=${referenceNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book-online?cancelled=true`,
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
    });

    // Store session ID on booking
    await supabase
      .from('bookings')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', booking.id);

    // Record T&C acceptance (non-blocking)
    try {
      const { data: legalDoc } = await supabase
        .from('legal_documents')
        .select('id, version')
        .eq('document_type', 'terms-conditions')
        .eq('is_current', true)
        .single();

      if (legalDoc) {
        const ipAddress = (
          req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
          req.socket.remoteAddress ||
          null
        );
        await supabase.from('terms_acceptances').insert({
          booking_id: booking.id,
          document_id: legalDoc.id,
          document_version: legalDoc.version || data.termsVersion || '2026-02-06-v1',
          customer_email: data.customerEmail,
          customer_name: data.customerName,
          ip_address: ipAddress,
          user_agent: req.headers['user-agent'] || null,
        });
      }
    } catch (e) {
      apiLogger.error('T&C recording failed (non-blocking)', { error: String(e) });
    }

    // Upsert customer profile (non-blocking)
    try {
      const phone = data.customerPhone;
      if (phone) {
        const today = new Date().toISOString().split('T')[0];
        const { data: existingProfile } = await supabase
          .from('customer_profiles')
          .select('id, total_bookings, total_spent')
          .eq('phone', phone)
          .maybeSingle();

        if (existingProfile) {
          await supabase
            .from('customer_profiles')
            .update({
              email: data.customerEmail,
              full_name: data.customerName,
              total_bookings: (existingProfile.total_bookings || 0) + 1,
              total_spent: parseFloat(String(existingProfile.total_spent || 0)) + subtotal,
              last_booking_date: today,
              stripe_customer_id: stripeCustomerId,
            })
            .eq('id', existingProfile.id);
        } else {
          await supabase.from('customer_profiles').insert({
            phone,
            email: data.customerEmail,
            full_name: data.customerName,
            total_bookings: 1,
            total_spent: subtotal,
            first_booking_date: today,
            last_booking_date: today,
            stripe_customer_id: stripeCustomerId,
          });
        }
      }
    } catch (e) {
      apiLogger.error('Customer profile upsert failed (non-blocking)', { error: String(e) });
    }

    apiLogger.info('Checkout session created', {
      bookingRef: referenceNumber,
      sessionId: session.id,
      total: tax.total,
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      booking_ref: referenceNumber,
      total: tax.total,
    });
  } catch (err) {
    apiLogger.error('Error creating checkout session', { error: String(err) });
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
