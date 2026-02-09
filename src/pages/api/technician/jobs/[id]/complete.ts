import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireTechnicianAuth } from '@/middleware/technicianAuth';
import { executeRepairCompletion } from '@/lib/repair-completion';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { technicianId } = (req as any).technician;
    const { id } = req.query;
    const supabase = getServiceSupabase();

    // Verify booking belongs to this technician
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

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'This booking has already been completed' });
    }

    if (!['assigned', 'in-progress'].includes(booking.status)) {
      return res.status(400).json({ error: `Cannot complete repair: booking is ${booking.status}` });
    }

    const result = await executeRepairCompletion({
      booking_id: id as string,
      technician_id: technicianId,
      repair_notes: req.body.repair_notes,
      parts_used: req.body.parts_used,
      repair_duration: req.body.repair_duration,
      final_price: req.body.final_price,
    });

    if (!result.success) {
      return res.status(result.statusCode || 500).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      repair_completion: result.repair_completion,
      warranty: result.warranty,
      booking_ref: result.booking_ref,
    });
  } catch (error) {
    console.error('Error in technician complete repair:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireTechnicianAuth(handler);
