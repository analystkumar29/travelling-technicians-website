import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '@/middleware/adminAuth';
import { executeRepairCompletion } from '@/lib/repair-completion';

/**
 * API handler for completing repairs (admin endpoint)
 * POST - Register a completed repair and auto-create warranty via DB trigger
 * Protected by admin auth
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { body } = req;

    const requiredFields = ['booking_id', 'technician_id'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missingFields,
      });
    }

    const result = await executeRepairCompletion({
      booking_id: body.booking_id,
      technician_id: body.technician_id,
      repair_notes: body.repair_notes,
      parts_used: body.parts_used,
      repair_duration: body.repair_duration,
      customer_signature_url: body.customer_signature_url,
      additional_services: body.additional_services,
      final_price: body.final_price,
      completed_at: body.completed_at,
    });

    if (!result.success) {
      return res.status(result.statusCode || 500).json({ error: result.error });
    }

    return res.status(201).json({
      success: true,
      repair_completion: result.repair_completion,
      warranty: result.warranty,
      booking_ref: result.booking_ref,
      technician_name: result.technician_name,
    });
  } catch (error) {
    console.error('Error in repair completion API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdminAuth(handler);
