import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('bookings/update');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    apiLogger.info('Update booking request received', { 
      body: req.body,
      userAgent: req.headers['user-agent']
    });
    
    // Log environment check
    apiLogger.info('Environment check', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    });
    
    const { id, reference, status, notes, appointmentDate, appointmentTime, ...otherUpdates } = req.body;

    // Handle different update types
    let updateData: any = {};
    let whereClause: any = {};

    // Determine what we're updating and how to identify the booking
    if (id) {
      // Update by ID (admin management style)
      whereClause = { id };
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (appointmentDate) updateData.booking_date = appointmentDate;
      if (appointmentTime) updateData.booking_time = appointmentTime;
      // Include any other fields that might be passed
      Object.assign(updateData, otherUpdates);
    } else if (reference) {
      // Update by reference (reschedule style)
      whereClause = { 
        booking_ref: reference 
      };
      
      apiLogger.info('Looking up booking by booking_ref', { reference });
      
      if (appointmentDate) updateData.booking_date = appointmentDate;
      if (appointmentTime) updateData.booking_time = appointmentTime;
      if (notes !== undefined) updateData.notes = notes;
      if (status) updateData.status = status;
    } else {
      apiLogger.warn('Missing booking identifier');
      return res.status(400).json({ 
        success: false, 
        message: 'Either booking ID or reference number is required' 
      });
    }

    if (Object.keys(updateData).length === 0) {
      apiLogger.warn('No update data provided');
      return res.status(400).json({ 
        success: false, 
        message: 'No update data provided' 
      });
    }

    // Get Supabase client with service role
    apiLogger.info('Getting Supabase service client');
    const supabase = getServiceSupabase();

    apiLogger.info('Attempting to update booking', { whereClause, updateData });

    // Update the booking in the database using booking_ref
    apiLogger.info('Executing database update query with booking_ref');
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .match(whereClause)
      .select();

    if (error) {
      apiLogger.error('Error updating booking', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        whereClause,
        updateData,
        reference
      });
      
      // Return user-friendly error message
      const errorMessage = error.message?.includes('foreign key') 
        ? 'Invalid booking data. Please contact support.'
        : error.message?.includes('constraint') 
          ? 'Invalid booking update. Please check your data.'
          : 'Unable to update booking. Please try again or contact support.';
      
      return res.status(500).json({
        success: false,
        message: errorMessage,
        reference
      });
    }

    if (!data || data.length === 0) {
      apiLogger.warn('Booking not found', { whereClause, reference });
      return res.status(404).json({
        success: false,
        message: 'Booking not found. Please check your reference number.',
        reference
      });
    }

    const updatedBooking = data[0];

    // If status was changed to 'completed', create a repair completion record
    // The DB trigger trg_auto_create_warranty will auto-create a warranty
    if (status === 'completed') {
      apiLogger.info('Booking marked as completed, creating repair completion record');

      try {
        // Use assigned technician from the booking, or find an active one
        let technicianId = updatedBooking.technician_id;

        if (!technicianId) {
          const { data: technicians } = await supabase
            .from('technicians')
            .select('id, full_name')
            .eq('is_active', true)
            .limit(1);

          if (technicians && technicians.length > 0) {
            technicianId = technicians[0].id;
          } else {
            apiLogger.warn('No active technicians found, skipping repair completion');
          }
        }

        if (technicianId) {
          const { data: repairCompletion, error: repairError } = await supabase
            .from('repair_completions')
            .insert({
              booking_id: updatedBooking.id,
              technician_id: technicianId,
              completed_at: new Date().toISOString(),
              repair_notes: `Repair completed via admin management`,
              repair_duration: 60
            })
            .select()
            .single();

          if (repairError) {
            apiLogger.error('Failed to create repair completion', { error: repairError });
          } else {
            apiLogger.info('Repair completion created, warranty auto-generated', {
              repairCompletionId: repairCompletion.id,
              bookingId: updatedBooking.id
            });
          }
        }
      } catch (repairCompletionError) {
        apiLogger.error('Error in repair completion process', {
          error: repairCompletionError instanceof Error ? repairCompletionError.message : 'Unknown error'
        });
      }
    }

    apiLogger.info('Successfully updated booking', { 
      id: updatedBooking.id, 
      reference: updatedBooking.booking_ref,
      updatedFields: Object.keys(updateData)
    });

    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    apiLogger.error('Unexpected error updating booking', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 