/**
 * Manual invoice generation endpoint.
 * Auth: Admin JWT or Technician JWT
 * Input: { booking_id }
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { generateInvoice } from '@/lib/invoice-generator';
import { verifyAdminToken } from '@/middleware/adminAuth';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('stripe/create-invoice');

function verifyTechOrAdmin(req: NextApiRequest): boolean {
  const adminAuth = verifyAdminToken(req);
  if (adminAuth.isAuthenticated) return true;
  try {
    const { verifyTechnicianToken } = require('@/middleware/technicianAuth');
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return false;
    const token = authHeader.substring(7);
    return !!verifyTechnicianToken(token);
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyTechOrAdmin(req)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { booking_id } = req.body;
  if (!booking_id) {
    return res.status(400).json({ error: 'booking_id is required' });
  }

  try {
    const result = await generateInvoice(booking_id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    apiLogger.info('Invoice created via API', {
      booking_id,
      invoiceId: result.stripe_invoice_id,
    });

    return res.status(200).json({
      success: true,
      invoice_id: result.invoice_id,
      invoice_url: result.invoice_url,
      invoice_pdf: result.invoice_pdf,
      invoice_number: result.invoice_number,
    });
  } catch (err) {
    apiLogger.error('Error creating invoice', { error: String(err) });
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
}
