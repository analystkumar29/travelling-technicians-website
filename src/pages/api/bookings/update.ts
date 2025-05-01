import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Update booking request received:', req.body);
    
    const {
      reference,
      appointmentDate,
      appointmentTime,
      notes,
    } = req.body;

    // Validate required fields
    if (!reference || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Supabase client with service role
    const supabase = getServiceSupabase();

    console.log('Attempting to update booking:', reference);

    // Update the booking in the database
    const { data, error } = await supabase
      .from('bookings')
      .update({
        booking_date: appointmentDate,
        booking_time: appointmentTime,
        notes: notes || '',
      })
      .eq('reference_number', reference)
      .select();

    if (error) {
      console.error('Error updating booking:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No booking found with reference:', reference);
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    console.log('Successfully updated booking:', reference);

    return res.status(200).json({
      success: true,
      booking: data[0],
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update booking' 
    });
  }
} 