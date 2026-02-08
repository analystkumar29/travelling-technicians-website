import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireAdminAuth } from '@/middleware/adminAuth';
import logger from '@/utils/logger';

/**
 * API handler for completing repairs
 * POST - Register a completed repair and auto-create warranty via DB trigger
 * Protected by admin auth
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    const { body } = req;
    const supabase = getServiceSupabase();

    // Validate required fields
    const requiredFields = ['booking_id', 'technician_id'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missingFields
      });
    }

    // Verify booking exists and is in-progress (ready for completion)
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status, booking_ref, customer_name, technician_id')
      .eq('id', body.booking_id)
      .single();

    if (bookingError) {
      logger.error('Error fetching booking:', bookingError);
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (bookingData.status === 'completed') {
      return res.status(400).json({ error: 'This booking has already been marked as completed' });
    }

    // Verify technician exists
    const { data: technicianData, error: technicianError } = await supabase
      .from('technicians')
      .select('id, full_name')
      .eq('id', body.technician_id)
      .single();

    if (technicianError) {
      logger.error('Error fetching technician:', technicianError);
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Parse parts_used and additional_services if strings
    let partsUsed = body.parts_used || [];
    let additionalServices = body.additional_services || [];

    if (partsUsed && !Array.isArray(partsUsed)) {
      try {
        partsUsed = JSON.parse(partsUsed);
      } catch {
        return res.status(400).json({ error: 'Invalid parts_used format. Must be JSON array.' });
      }
    }

    if (additionalServices && !Array.isArray(additionalServices)) {
      try {
        additionalServices = JSON.parse(additionalServices);
      } catch {
        return res.status(400).json({ error: 'Invalid additional_services format. Must be JSON array.' });
      }
    }

    // Insert repair completion record
    // The DB trigger trg_auto_create_warranty will auto-create a warranty
    const repairData = {
      booking_id: body.booking_id,
      technician_id: body.technician_id,
      completed_at: body.completed_at || new Date().toISOString(),
      repair_notes: body.repair_notes || null,
      parts_used: partsUsed,
      repair_duration: body.repair_duration ? parseInt(body.repair_duration.toString()) : null,
      customer_signature_url: body.customer_signature_url || null,
      additional_services: additionalServices
    };

    const { data: completionData, error: completionError } = await supabase
      .from('repair_completions')
      .insert([repairData])
      .select()
      .single();

    if (completionError) {
      logger.error('Error creating repair completion:', completionError);
      return res.status(500).json({ error: 'Failed to register repair completion' });
    }

    // Determine final price: use provided final_price, fallback to quoted_price
    const finalPrice = body.final_price != null ? parseFloat(body.final_price) : null;

    // Update booking status to completed + set final_price if provided
    const bookingUpdate: Record<string, unknown> = { status: 'completed' };
    if (finalPrice != null) {
      bookingUpdate.final_price = finalPrice;
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update(bookingUpdate)
      .eq('id', body.booking_id);

    if (updateError) {
      logger.error('Error updating booking status:', updateError);
      // Don't fail — the completion record is created
    }

    // Increment total_bookings_completed on the technician
    const { error: techUpdateError } = await supabase.rpc('increment_field', {
      row_id: body.technician_id,
      table_name: 'technicians',
      field_name: 'total_bookings_completed',
    }).maybeSingle();

    // Fallback: if RPC doesn't exist, do a manual increment
    if (techUpdateError) {
      logger.warn('RPC increment_field failed, using manual increment', { error: techUpdateError.message });
      const { data: techData } = await supabase
        .from('technicians')
        .select('total_bookings_completed')
        .eq('id', body.technician_id)
        .single();

      if (techData) {
        await supabase
          .from('technicians')
          .update({ total_bookings_completed: (techData.total_bookings_completed || 0) + 1 })
          .eq('id', body.technician_id);
      }
    }

    // Fetch the auto-created warranty
    const { data: warrantyData } = await supabase
      .from('warranties')
      .select('id, warranty_number, start_date, end_date, duration_days, status')
      .eq('booking_id', body.booking_id)
      .single();

    // Send warranty notification email (non-blocking)
    if (warrantyData) {
      try {
        const { data: bookingDetails } = await supabase
          .from('bookings')
          .select(`
            customer_email, customer_name, booking_ref,
            device_models:model_id (name),
            services:service_id (name, display_name)
          `)
          .eq('id', body.booking_id)
          .single();

        if (bookingDetails?.customer_email) {
          const deviceModels = bookingDetails.device_models as any;
          const services = bookingDetails.services as any;

          const baseUrl = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
            ? 'https://www.travelling-technicians.ca'
            : process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : 'http://localhost:3000';

          await fetch(`${baseUrl}/api/send-warranty-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: bookingDetails.customer_email,
              name: bookingDetails.customer_name || 'Customer',
              warrantyNumber: warrantyData.warranty_number,
              bookingReference: bookingDetails.booking_ref,
              deviceName: deviceModels?.name || 'Your Device',
              serviceName: services?.display_name || services?.name || 'Repair Service',
              technicianName: technicianData.full_name,
              startDate: warrantyData.start_date,
              endDate: warrantyData.end_date,
              durationDays: warrantyData.duration_days
            }),
          });
          logger.info('Warranty notification email sent', { warranty: warrantyData.warranty_number });
        }
      } catch (e) {
        logger.error('Warranty email preparation failed (non-blocking)', { error: String(e) });
      }
    }

    return res.status(201).json({
      success: true,
      repair_completion: completionData,
      warranty: warrantyData || null,
      booking_ref: bookingData.booking_ref,
      technician_name: technicianData.full_name
    });
  } catch (error) {
    console.error('Error in repair completion API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdminAuth(handler);
