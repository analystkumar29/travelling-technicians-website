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
    apiLogger.info('Update booking request received', { body: req.body });
    
    const { id, reference, status, notes, appointmentDate, appointmentTime, ...otherUpdates } = req.body;

    // Handle different update types
    let updateData: any = {};
    let whereClause: any = {};

    // Determine what we're updating and how to identify the booking
    if (id) {
      // Update by ID (admin dashboard style)
      whereClause = { id };
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (appointmentDate) updateData.booking_date = appointmentDate;
      if (appointmentTime) updateData.booking_time = appointmentTime;
      // Include any other fields that might be passed
      Object.assign(updateData, otherUpdates);
    } else if (reference) {
      // Update by reference (reschedule style)
      whereClause = { reference_number: reference };
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
    const supabase = getServiceSupabase();

    apiLogger.info('Attempting to update booking', { whereClause, updateData });

    // Update the booking in the database
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .match(whereClause)
      .select();

    if (error) {
      apiLogger.error('Error updating booking', {
        error: error.message,
        code: error.code,
        whereClause,
        updateData
      });
      
      return res.status(500).json({
        success: false,
        message: 'Database error',
        details: error.message
      });
    }

    if (!data || data.length === 0) {
      apiLogger.warn('Booking not found', { whereClause });
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const updatedBooking = data[0];

    // If status was changed to 'completed', create a repair completion record
    // This will trigger automatic warranty creation
    if (status === 'completed') {
      apiLogger.info('Booking marked as completed, creating repair completion record');
      
      try {
        // First, ensure we have a technician (get the first available one)
        const { data: technicians, error: techError } = await supabase
          .from('technicians')
          .select('id, full_name')
          .eq('is_active', true)
          .limit(1);

        let technician;

        if (techError || !technicians || technicians.length === 0) {
          apiLogger.warn('No active technicians found, creating default technician');
          
          // Create a default technician if none exists
          const { data: newTechnician, error: createTechError } = await supabase
            .from('technicians')
            .upsert({
              full_name: 'The Travelling Technicians',
              email: 'admin@thetravellingtechnicians.com',
              phone: '604-000-0000',
              specializations: ['mobile', 'laptop'],
              active_service_areas: ['V5K', 'V5L', 'V5M'],
              is_active: true,
              hourly_rate: 85.00,
              max_daily_bookings: 10
            }, { onConflict: 'email' })
            .select('id, full_name')
            .single();

          if (createTechError) {
            apiLogger.error('Failed to create default technician', { error: createTechError });
            throw new Error('Could not create technician for repair completion');
          }

          technician = newTechnician;
        } else {
          technician = technicians[0];
        }
        
        // Create repair completion record
        const repairCompletionData = {
          booking_id: updatedBooking.id,
          technician_id: technician.id,
          completed_at: new Date().toISOString(),
          repair_notes: `Repair completed via admin dashboard by ${technician.full_name}`,
          parts_used: JSON.stringify([
            {
              name: `${updatedBooking.device_brand} ${updatedBooking.device_model} Repair`,
              description: `${updatedBooking.service_type} service`,
              cost: 100 // Default cost, can be updated later
            }
          ]),
          repair_duration: 60 // Default 1 hour, can be updated later
        };

        const { data: repairCompletion, error: repairError } = await supabase
          .from('repair_completions')
          .insert(repairCompletionData)
          .select()
          .single();

        if (repairError) {
          apiLogger.error('Failed to create repair completion', { error: repairError });
          // Don't fail the whole request, just log the error
          apiLogger.warn('Booking updated but repair completion failed - warranty may not be created');
        } else {
          apiLogger.info('Repair completion created successfully', { 
            repairCompletionId: repairCompletion.id,
            bookingId: updatedBooking.id,
            technicianId: technician.id
          });
        }

      } catch (repairCompletionError) {
        apiLogger.error('Error in repair completion process', { 
          error: repairCompletionError instanceof Error ? repairCompletionError.message : 'Unknown error'
        });
        // Don't fail the whole request, just log the error
      }
    }

    apiLogger.info('Successfully updated booking', { 
      id: updatedBooking.id, 
      reference: updatedBooking.reference_number,
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