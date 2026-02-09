import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireTechnicianAuth } from '@/middleware/technicianAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { technicianId } = (req as any).technician;
    const { id } = req.query;
    const supabase = getServiceSupabase();

    // Verify booking belongs to this technician and is in the right status
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status, technician_id')
      .eq('id', id as string)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.technician_id !== technicianId) {
      return res.status(403).json({ error: 'This job is not assigned to you' });
    }

    if (booking.status !== 'assigned') {
      return res.status(400).json({ error: `Cannot start repair: booking is ${booking.status}` });
    }

    // Update to in-progress
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'in-progress', updated_at: new Date().toISOString() })
      .eq('id', id as string);

    if (updateError) {
      console.error('Error starting repair:', updateError);
      return res.status(500).json({ error: 'Failed to start repair' });
    }

    return res.status(200).json({ success: true, message: 'Repair started' });
  } catch (error) {
    console.error('Error in start repair:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireTechnicianAuth(handler);
