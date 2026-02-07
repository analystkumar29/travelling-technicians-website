import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const lookupLogger = logger.createModuleLogger('warranties/lookup');

// Simple in-memory rate limiting: 5 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count++;
  if (entry.count > 5) {
    return true;
  }
  return false;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60_000);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Rate limiting
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress || 'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again in a minute.'
    });
  }

  try {
    const { warranty_number, booking_ref, email } = req.body;

    // Must provide email + one of warranty_number or booking_ref
    if (!email || (!warranty_number && !booking_ref)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email and either a warranty number or booking reference.'
      });
    }

    const supabase = getServiceSupabase();

    if (warranty_number) {
      // Lookup by warranty number
      const { data, error } = await supabase
        .from('warranties')
        .select(`
          warranty_number, start_date, end_date, duration_days, status,
          bookings:booking_id (
            id, booking_ref, customer_email,
            device_models:model_id (name),
            services:service_id (name, display_name),
            repair_completions (completed_at)
          )
        `)
        .eq('warranty_number', warranty_number.trim())
        .single();

      if (error || !data) {
        lookupLogger.info('Warranty lookup failed', {
          mode: 'warranty_number',
          found: false
        });
        return res.status(404).json({
          success: false,
          message: 'No warranty found. Please check your warranty number and email address.'
        });
      }

      // Verify email match (case-insensitive) — generic 404 if mismatch
      const booking = data.bookings as any;
      if (!booking || booking.customer_email?.toLowerCase() !== email.trim().toLowerCase()) {
        lookupLogger.info('Warranty lookup email mismatch', { mode: 'warranty_number' });
        return res.status(404).json({
          success: false,
          message: 'No warranty found. Please check your warranty number and email address.'
        });
      }

      return res.status(200).json({
        success: true,
        warranty: formatWarrantyResponse(data),
        booking: formatBookingResponse(booking)
      });
    }

    // Lookup by booking reference
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id, booking_ref, customer_email,
        device_models:model_id (name),
        services:service_id (name, display_name),
        repair_completions (completed_at)
      `)
      .eq('booking_ref', booking_ref.trim())
      .single();

    if (bookingError || !bookingData) {
      lookupLogger.info('Booking ref lookup failed', { mode: 'booking_ref' });
      return res.status(404).json({
        success: false,
        message: 'No warranty found. Please check your booking reference and email address.'
      });
    }

    // Verify email match
    if (bookingData.customer_email?.toLowerCase() !== email.trim().toLowerCase()) {
      lookupLogger.info('Booking ref lookup email mismatch', { mode: 'booking_ref' });
      return res.status(404).json({
        success: false,
        message: 'No warranty found. Please check your booking reference and email address.'
      });
    }

    // Fetch warranty for this booking
    const { data: warrantyData, error: warrantyError } = await supabase
      .from('warranties')
      .select('warranty_number, start_date, end_date, duration_days, status')
      .eq('booking_id', bookingData.id)
      .single();

    if (warrantyError || !warrantyData) {
      lookupLogger.info('No warranty for booking', { mode: 'booking_ref' });
      return res.status(404).json({
        success: false,
        message: 'No warranty found for this booking. A warranty is created when your repair is completed.'
      });
    }

    return res.status(200).json({
      success: true,
      warranty: formatWarrantyResponse(warrantyData),
      booking: formatBookingResponse(bookingData)
    });

  } catch (error) {
    lookupLogger.error('Warranty lookup error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
}

function formatWarrantyResponse(warranty: any) {
  const now = new Date();
  const endDate = new Date(warranty.end_date);
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    warranty_number: warranty.warranty_number,
    start_date: warranty.start_date,
    end_date: warranty.end_date,
    duration_days: warranty.duration_days,
    status: warranty.status,
    days_remaining: daysRemaining
  };
}

function formatBookingResponse(booking: any) {
  const deviceModels = booking.device_models as any;
  const services = booking.services as any;
  const repairCompletions = booking.repair_completions as any[];

  return {
    booking_ref: booking.booking_ref,
    device_name: deviceModels?.name || 'N/A',
    service_name: services?.display_name || services?.name || 'N/A',
    completed_at: repairCompletions?.[0]?.completed_at || null
  };
}
