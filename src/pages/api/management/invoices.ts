/**
 * Admin API for listing invoices
 * GET — list all invoices with booking joins
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '@/middleware/adminAuth';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/invoices');

export default requireAdminAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getServiceSupabase();

  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        bookings:booking_id (booking_ref, status)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      apiLogger.error('Error fetching invoices', { error });
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, invoices: invoices || [] });
  } catch (err) {
    apiLogger.error('Unexpected error', { error: String(err) });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
