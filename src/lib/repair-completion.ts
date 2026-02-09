/**
 * Shared repair completion business logic
 * Used by both admin (repairs/complete.ts) and technician (technician/jobs/[id]/complete) endpoints
 */

import { getServiceSupabase } from '@/utils/supabaseClient';
import { generateReviewToken } from '@/lib/review-token';
import logger from '@/utils/logger';

export interface RepairCompletionInput {
  booking_id: string;
  technician_id: string;
  repair_notes?: string;
  parts_used?: any[];
  repair_duration?: number;
  customer_signature_url?: string;
  additional_services?: any[];
  final_price?: number;
  completed_at?: string;
}

export interface RepairCompletionResult {
  success: boolean;
  repair_completion: any;
  warranty: any;
  booking_ref: string;
  technician_name: string;
  error?: string;
  statusCode?: number;
}

export async function executeRepairCompletion(input: RepairCompletionInput): Promise<RepairCompletionResult> {
  const supabase = getServiceSupabase();

  // Verify booking exists
  const { data: bookingData, error: bookingError } = await supabase
    .from('bookings')
    .select('id, status, booking_ref, customer_name, technician_id, quoted_price')
    .eq('id', input.booking_id)
    .single();

  if (bookingError) {
    logger.error('Error fetching booking:', bookingError);
    return { success: false, repair_completion: null, warranty: null, booking_ref: '', technician_name: '', error: 'Booking not found', statusCode: 404 };
  }

  if (bookingData.status === 'completed') {
    return { success: false, repair_completion: null, warranty: null, booking_ref: '', technician_name: '', error: 'This booking has already been marked as completed', statusCode: 400 };
  }

  // Verify technician exists
  const { data: technicianData, error: technicianError } = await supabase
    .from('technicians')
    .select('id, full_name')
    .eq('id', input.technician_id)
    .single();

  if (technicianError) {
    logger.error('Error fetching technician:', technicianError);
    return { success: false, repair_completion: null, warranty: null, booking_ref: '', technician_name: '', error: 'Technician not found', statusCode: 404 };
  }

  // Parse parts_used and additional_services
  let partsUsed = input.parts_used || [];
  let additionalServices = input.additional_services || [];

  if (partsUsed && !Array.isArray(partsUsed)) {
    try { partsUsed = JSON.parse(partsUsed as any); } catch {
      return { success: false, repair_completion: null, warranty: null, booking_ref: '', technician_name: '', error: 'Invalid parts_used format', statusCode: 400 };
    }
  }

  if (additionalServices && !Array.isArray(additionalServices)) {
    try { additionalServices = JSON.parse(additionalServices as any); } catch {
      return { success: false, repair_completion: null, warranty: null, booking_ref: '', technician_name: '', error: 'Invalid additional_services format', statusCode: 400 };
    }
  }

  // Check for existing completion (idempotency)
  const { data: existingCompletion } = await supabase
    .from('repair_completions')
    .select('*')
    .eq('booking_id', input.booking_id)
    .maybeSingle();

  let completionData = existingCompletion;

  if (!existingCompletion) {
    const repairData = {
      booking_id: input.booking_id,
      technician_id: input.technician_id,
      completed_at: input.completed_at || new Date().toISOString(),
      repair_notes: input.repair_notes || null,
      parts_used: partsUsed,
      repair_duration: input.repair_duration ? parseInt(input.repair_duration.toString()) : null,
      customer_signature_url: input.customer_signature_url || null,
      additional_services: additionalServices,
    };

    const { data: newCompletion, error: completionError } = await supabase
      .from('repair_completions')
      .insert([repairData])
      .select()
      .single();

    if (completionError) {
      logger.error('Error creating repair completion:', completionError);
      return { success: false, repair_completion: null, warranty: null, booking_ref: '', technician_name: '', error: 'Failed to register repair completion', statusCode: 500 };
    }

    completionData = newCompletion;
  }

  // Determine final price
  const finalPrice = input.final_price != null
    ? parseFloat(String(input.final_price))
    : bookingData.quoted_price != null
      ? parseFloat(String(bookingData.quoted_price))
      : null;

  // Update booking status
  const bookingUpdate: Record<string, unknown> = { status: 'completed' };
  if (finalPrice != null) {
    bookingUpdate.final_price = finalPrice;
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update(bookingUpdate)
    .eq('id', input.booking_id);

  if (updateError) {
    logger.error('Error updating booking status:', updateError);
  }

  // Increment total_bookings_completed
  if (!existingCompletion) {
    const { error: techUpdateError } = await supabase.rpc('increment_field', {
      row_id: input.technician_id,
      table_name: 'technicians',
      field_name: 'total_bookings_completed',
    }).maybeSingle();

    if (techUpdateError) {
      logger.warn('RPC increment_field failed, using manual increment', { error: techUpdateError.message });
      const { data: techData } = await supabase
        .from('technicians')
        .select('total_bookings_completed')
        .eq('id', input.technician_id)
        .single();

      if (techData) {
        await supabase
          .from('technicians')
          .update({ total_bookings_completed: (techData.total_bookings_completed || 0) + 1 })
          .eq('id', input.technician_id);
      }
    }
  }

  // Fetch auto-created warranty
  const { data: warrantyData } = await supabase
    .from('warranties')
    .select('id, warranty_number, start_date, end_date, duration_days, status')
    .eq('booking_id', input.booking_id)
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
        .eq('id', input.booking_id)
        .single();

      if (bookingDetails?.customer_email) {
        const deviceModels = bookingDetails.device_models as any;
        const services = bookingDetails.services as any;

        const baseUrl = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
          ? 'https://www.travelling-technicians.ca'
          : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        let reviewUrl: string | undefined;
        try {
          const reviewToken = generateReviewToken(bookingDetails.booking_ref, bookingDetails.customer_email);
          reviewUrl = `${baseUrl}/leave-review?token=${reviewToken}&ref=${encodeURIComponent(bookingDetails.booking_ref)}`;
        } catch (e) {
          logger.warn('Failed to generate review token (non-blocking)', { error: String(e) });
        }

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
            durationDays: warrantyData.duration_days,
            reviewUrl,
          }),
        });
        logger.info('Warranty notification email sent', { warranty: warrantyData.warranty_number });
      }
    } catch (e) {
      logger.error('Warranty email preparation failed (non-blocking)', { error: String(e) });
    }
  }

  return {
    success: true,
    repair_completion: completionData,
    warranty: warrantyData || null,
    booking_ref: bookingData.booking_ref,
    technician_name: technicianData.full_name,
  };
}
