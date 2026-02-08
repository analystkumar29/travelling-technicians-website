import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { verifyReviewToken } from '@/lib/review-token';
import { logger } from '@/utils/logger';

const reviewLogger = logger.createModuleLogger('reviews/submit');

// Rate limiting: 3 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count++;
  return entry.count > 3;
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
    const { token, booking_ref, overall_rating, review_text, technician_rating, service_rating } = req.body;

    // Validate required fields
    if (!token || !booking_ref) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review link. Please use the link from your warranty email.'
      });
    }

    if (!overall_rating || overall_rating < 1 || overall_rating > 5 || !Number.isInteger(overall_rating)) {
      return res.status(400).json({
        success: false,
        message: 'Please select an overall rating between 1 and 5.'
      });
    }

    if (!review_text || typeof review_text !== 'string' || !review_text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please write a review.'
      });
    }

    if (review_text.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Review text must be 2000 characters or fewer.'
      });
    }

    // Validate optional ratings
    if (technician_rating !== undefined && technician_rating !== null) {
      if (technician_rating < 1 || technician_rating > 5 || !Number.isInteger(technician_rating)) {
        return res.status(400).json({
          success: false,
          message: 'Technician rating must be between 1 and 5.'
        });
      }
    }

    if (service_rating !== undefined && service_rating !== null) {
      if (service_rating < 1 || service_rating > 5 || !Number.isInteger(service_rating)) {
        return res.status(400).json({
          success: false,
          message: 'Service rating must be between 1 and 5.'
        });
      }
    }

    const supabase = getServiceSupabase();

    // Look up booking by ref — must be completed
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id, booking_ref, customer_name, customer_email, status, technician_id,
        device_models:model_id (name),
        services:service_id (name, display_name),
        service_locations:location_id (city_name)
      `)
      .eq('booking_ref', booking_ref.trim())
      .single();

    if (bookingError || !booking) {
      reviewLogger.info('Review submission: booking not found', { booking_ref });
      return res.status(404).json({
        success: false,
        message: 'Booking not found. Please check your review link.'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed repairs.'
      });
    }

    // Verify token
    if (!verifyReviewToken(token, booking.booking_ref, booking.customer_email)) {
      reviewLogger.info('Review submission: invalid token', { booking_ref });
      return res.status(401).json({
        success: false,
        message: 'Invalid review link. Please use the link from your warranty email.'
      });
    }

    // Check for existing review
    const { data: existingReview } = await supabase
      .from('testimonials')
      .select('id')
      .eq('booking_id', booking.id)
      .maybeSingle();

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this repair. Thank you!'
      });
    }

    // Format customer name as first name + last initial for privacy
    const nameParts = (booking.customer_name || 'Customer').trim().split(/\s+/);
    const displayName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : nameParts[0];

    const deviceModels = booking.device_models as any;
    const services = booking.services as any;
    const serviceLocations = booking.service_locations as any;

    // Insert testimonial as pending
    const { data: testimonial, error: insertError } = await supabase
      .from('testimonials')
      .insert({
        customer_name: displayName,
        city: serviceLocations?.city_name || null,
        device_model: deviceModels?.name || null,
        service: services?.display_name || services?.name || null,
        rating: overall_rating,
        technician_rating: technician_rating || null,
        service_rating: service_rating || null,
        review: review_text.trim(),
        status: 'pending',
        source: 'website',
        verified: true,
        is_featured: false,
        featured_order: 0,
        booking_id: booking.id,
        technician_id: booking.technician_id || null,
        customer_email: booking.customer_email,
      })
      .select('id')
      .single();

    if (insertError) {
      reviewLogger.error('Review insertion failed', { error: insertError.message });
      return res.status(500).json({
        success: false,
        message: 'Failed to submit review. Please try again.'
      });
    }

    reviewLogger.info('Review submitted successfully', {
      testimonial_id: testimonial.id,
      booking_ref,
      rating: overall_rating
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for your review! It will appear on our site after approval.'
    });
  } catch (error) {
    reviewLogger.error('Review submission error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
}
