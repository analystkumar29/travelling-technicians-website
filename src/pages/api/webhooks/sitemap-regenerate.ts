/**
 * Sitemap Regeneration Webhook
 * Triggered by Supabase database changes to regenerate sitemap
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';

const webhookLogger = logger.createModuleLogger('webhooks/sitemap-regenerate');

interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: Record<string, any>;
  old_record?: Record<string, any>;
  schema: string;
}

interface SitemapRegenerateResponse {
  success: boolean;
  message: string;
  triggered: boolean;
  cacheCleared: boolean;
  timestamp: string;
  tables?: string[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SitemapRegenerateResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      triggered: false,
      cacheCleared: false,
      timestamp: new Date().toISOString(),
      error: 'Only POST requests are allowed'
    });
  }

  try {
    const payload = req.body as SupabaseWebhookPayload;
    const { type, table, record, old_record, schema } = payload;

    webhookLogger.info('Sitemap regeneration webhook triggered', {
      type,
      table,
      schema,
      recordId: record?.id,
      oldRecordId: old_record?.id
    });

    // Tables that should trigger sitemap regeneration
    const sitemapRelevantTables = [
      'service_locations',
      'services',
      'mobileactive_products',
      'dynamic_pricing',
      'technicians',
      'testimonials',
      'blog_posts'
    ];

    // Check if the table change is relevant for sitemap
    const isRelevantTable = sitemapRelevantTables.includes(table);
    
    if (!isRelevantTable) {
      webhookLogger.info('Table not relevant for sitemap regeneration', { table });
      return res.status(200).json({
        success: true,
        message: `Table ${table} not relevant for sitemap regeneration`,
        triggered: false,
        cacheCleared: false,
        timestamp: new Date().toISOString(),
        tables: [table]
      });
    }

    webhookLogger.info('Triggering sitemap regeneration for table', { table, type });

    // Invalidate sitemap cache by calling the cache invalidation endpoint
    let cacheCleared = false;
    try {
      // Call internal cache invalidation endpoint
      const cacheResponse = await fetch('http://localhost:3000/api/cache/invalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'dev-key'}`
        },
        body: JSON.stringify({
          pattern: 'sitemap',
          cacheType: 'sitemap'
        })
      });

      if (cacheResponse.ok) {
        cacheCleared = true;
        webhookLogger.info('Sitemap cache cleared successfully');
      } else {
        webhookLogger.warn('Failed to clear sitemap cache', {
          status: cacheResponse.status
        });
      }
    } catch (cacheError) {
      webhookLogger.error('Error clearing sitemap cache', { error: cacheError });
    }

    // Log the regeneration trigger for monitoring
    webhookLogger.info('Sitemap regeneration triggered', {
      table,
      type,
      recordId: record?.id,
      cacheCleared,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `Sitemap regeneration triggered for ${table} ${type}`,
      triggered: true,
      cacheCleared,
      timestamp: new Date().toISOString(),
      tables: [table]
    });

  } catch (error) {
    webhookLogger.error('Sitemap regeneration webhook failed', { error });

    return res.status(500).json({
      success: false,
      message: 'Sitemap regeneration webhook failed',
      triggered: false,
      cacheCleared: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to validate webhook signature (for production)
function validateWebhookSignature(req: NextApiRequest): boolean {
  // In production, validate Supabase webhook signature
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  
  if (!secret || !signature) {
    webhookLogger.warn('Missing webhook signature or secret');
    return process.env.NODE_ENV !== 'production'; // Allow in development
  }
  
  // Implement proper signature validation in production
  // This is a placeholder - actual implementation depends on Supabase webhook setup
  return true;
}