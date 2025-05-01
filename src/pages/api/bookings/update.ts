import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
      throw error;
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    return res.status(200).json({
      success: true,
      booking: data[0],
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update booking' 
    });
  }
} 