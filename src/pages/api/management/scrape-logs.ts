/**
 * Admin API for scrape run history
 * GET — return recent scrape logs (last 10)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '@/middleware/adminAuth';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/scrape-logs');

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
    const { data: logs, error } = await supabase
      .from('scrape_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);

    if (error) {
      apiLogger.error('Error fetching scrape logs', { error });
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, logs: logs || [] });
  } catch (err) {
    apiLogger.error('Unexpected error', { error: String(err) });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
