import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { generateReviewToken } from '@/lib/review-token';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('bookings/reference/[reference]');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;

    apiLogger.info('Finding booking by reference', { reference });

    if (!reference || Array.isArray(reference)) {
      apiLogger.warn('Invalid reference format', { reference });
      return res.status(400).json({ 
        success: false, 
        message: 'Valid reference number is required'
      });
    }

    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
    // Fetch booking by reference number with full details including technician info
    const { data: bookingData, error } = await supabase
      .from('bookings')
      .select(`
        *,
        technicians:technician_id (
          id,
          full_name,
          whatsapp_number,
          phone,
          email,
          current_status
        ),
        services:service_id (
          id,
          name,
          display_name,
          description
        ),
        device_models:model_id (
          id,
          name,
          display_name,
          brands!inner (
            id,
            name,
            display_name
          )
        ),
        service_locations:location_id (
          id,
          city_name,
          local_phone
        )
      `)
      .eq('booking_ref', reference)
      .single();
    
    if (error) {
      apiLogger.error('Error finding booking', {
        reference,
        error: error.message,
        code: error.code,
        details: error
      });
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          message: 'Booking not found'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Database error',
        details: error.message,
        error: error
      });
    }
    
    if (!bookingData) {
      apiLogger.warn('Booking not found', { reference });
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Transform the data for cleaner response - remove final_price to avoid confusion
    const booking = {
      ...bookingData,
      // Remove final_price to avoid confusion with quoted_price
      final_price: undefined,
      technician: bookingData.technicians ? {
        assigned: true,
        name: bookingData.technicians.full_name,
        whatsapp: bookingData.technicians.whatsapp_number,
        phone: bookingData.technicians.phone,
        email: bookingData.technicians.email,
        status: bookingData.technicians.current_status
      } : {
        assigned: false,
        message: 'Your technician will be assigned soon. We\'ll notify you when assigned.',
        next_steps: 'Our team will contact you to confirm technician assignment.'
      },
      service: bookingData.services ? {
        name: bookingData.services.display_name || bookingData.services.name,
        description: bookingData.services.description
      } : null,
      device: bookingData.device_models ? {
        model: bookingData.device_models.display_name || bookingData.device_models.name,
        brand: bookingData.device_models.brands?.display_name || bookingData.device_models.brands?.name || 'Unknown'
      } : null,
      location: bookingData.service_locations ? {
        city: bookingData.service_locations.city_name,
        local_phone: bookingData.service_locations.local_phone
      } : null
    };
    
    // Remove the nested objects to avoid duplication
    delete booking.technicians;
    delete booking.services;
    delete booking.device_models;
    delete booking.service_locations;
    // Ensure final_price is not included in response
    delete booking.final_price;

    // Fetch warranty data and generate review URL for completed bookings
    if (bookingData.status === 'completed') {
      const { data: warrantyData } = await supabase
        .from('warranties')
        .select('warranty_number, start_date, end_date, duration_days, status')
        .eq('booking_id', bookingData.id)
        .single();
      if (warrantyData) {
        booking.warranty = warrantyData;
      }

      // Generate review URL
      if (bookingData.customer_email) {
        try {
          const baseUrl = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
            ? 'https://www.travelling-technicians.ca'
            : process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : 'http://localhost:3000';
          const reviewToken = generateReviewToken(bookingData.booking_ref, bookingData.customer_email);
          booking.reviewUrl = `${baseUrl}/leave-review?token=${reviewToken}&ref=${encodeURIComponent(bookingData.booking_ref)}`;
        } catch {
          // Non-critical — review link won't appear
        }
      }
    }

    apiLogger.info('Found booking successfully', { 
      reference, 
      id: booking.id,
      customerName: booking.customer_name
    });
    
    // Return the transformed booking data
    return res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    apiLogger.error('Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 