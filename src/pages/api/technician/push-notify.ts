/**
 * Broadcast push notification to all subscribed technicians
 * POST — no auth (internal endpoint, same pattern as send-admin-notification.ts)
 *
 * Payload: { title, body, tag?, url? }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const pushLogger = logger.createModuleLogger('push-notify');

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = 'mailto:info@travelling-technicians.ca';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    pushLogger.warn('VAPID keys not configured — skipping push notifications');
    return res.status(200).json({ sent: 0, skipped: true });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { title, body, tag, url } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }

  const supabase = getServiceSupabase();

  // Load all technicians with active push subscriptions
  const { data: technicians, error } = await supabase
    .from('technicians')
    .select('id, push_subscription')
    .not('push_subscription', 'is', null)
    .eq('is_active', true);

  if (error) {
    pushLogger.error('Failed to fetch technician subscriptions', { error: error.message });
    return res.status(500).json({ error: 'Database error' });
  }

  if (!technicians || technicians.length === 0) {
    return res.status(200).json({ sent: 0 });
  }

  const payload = JSON.stringify({ title, body, tag: tag || 'new-job', url: url || '/technician/available-jobs' });

  const results = await Promise.allSettled(
    technicians.map(async (tech) => {
      try {
        await webpush.sendNotification(tech.push_subscription as any, payload);
        return { id: tech.id, status: 'sent' };
      } catch (err: any) {
        // 410 Gone or 404 = subscription expired, clean it up
        if (err.statusCode === 410 || err.statusCode === 404) {
          pushLogger.info('Cleaning up expired subscription', { technicianId: tech.id });
          await supabase
            .from('technicians')
            .update({ push_subscription: null })
            .eq('id', tech.id);
          return { id: tech.id, status: 'expired' };
        }
        pushLogger.error('Push failed for technician', { technicianId: tech.id, error: err.message });
        return { id: tech.id, status: 'failed' };
      }
    })
  );

  const sent = results.filter(
    (r) => r.status === 'fulfilled' && (r.value as any).status === 'sent'
  ).length;

  pushLogger.info('Push broadcast complete', { total: technicians.length, sent });

  return res.status(200).json({ sent, total: technicians.length });
}
