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

    apiLogger.info('Successfully updated booking', { 
      id: data[0].id, 
      reference: data[0].reference_number,
      updatedFields: Object.keys(updateData)
    });

    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking: data[0],
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