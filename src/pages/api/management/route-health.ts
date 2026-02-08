import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '@/middleware/adminAuth';
import { getServiceSupabase } from '@/utils/supabaseClient';

/* -------------------------------------------------------------------------- */
/*  GET: Fetch all health data                                                 */
/* -------------------------------------------------------------------------- */

async function handleGet(_req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServiceSupabase();

  try {
    const [
      routeCountsResult,
      dimensionsResult,
      statsResult,
      logsResult,
      triggersResult,
      integrityResult,
    ] = await Promise.all([
      // 1. Route counts by type (via DB function)
      supabase.rpc('get_route_counts_by_type'),

      // 2. Expected dimensions (via DB function)
      supabase.rpc('get_route_dimensions'),

      // 3. Route statistics (existing DB function)
      supabase.rpc('get_route_statistics'),

      // 4. Last 20 rebuild log entries
      supabase
        .from('route_generation_logs')
        .select('id, trigger_source, routes_generated, routes_skipped, duration_ms, error_message, start_time, end_time')
        .order('start_time', { ascending: false })
        .limit(20),

      // 5. Trigger status (via DB function)
      supabase.rpc('get_trigger_status'),

      // 6. Integrity checks (via DB function)
      supabase.rpc('get_route_integrity_checks'),
    ]);

    // Check for any critical errors
    if (routeCountsResult.error) throw new Error(`Route counts: ${routeCountsResult.error.message}`);
    if (statsResult.error) throw new Error(`Stats: ${statsResult.error.message}`);

    // Parse route counts
    const routeCounts = (routeCountsResult.data || []).map((r: Record<string, unknown>) => ({
      route_type: r.route_type as string,
      total: Number(r.total),
      active: Number(r.active),
    }));

    // Parse dimensions
    const dimensions = dimensionsResult.data || { cities: 0, models: 0, services: 0, neighborhoods: 0 };

    // Parse stats
    const stats = statsResult.data || {};

    // Parse logs
    const logs = (logsResult.data || []).map((row: Record<string, unknown>) => ({
      id: row.id,
      trigger_source: row.trigger_source || 'unknown',
      routes_generated: row.routes_generated || 0,
      routes_skipped: row.routes_skipped || 0,
      duration_ms: row.duration_ms || 0,
      error_message: row.error_message || null,
      start_time: row.start_time,
      end_time: row.end_time,
    }));

    // Parse triggers
    const triggers = (triggersResult.data || []).map((row: Record<string, unknown>) => ({
      name: row.name as string,
      table: row.table as string,
      enabled: row.enabled as boolean,
      type: categorizeTrigger(row.name as string),
    }));

    // Parse integrity checks
    const integrity = integrityResult.data || {
      null_payloads: 0,
      orphaned_routes: 0,
      missing_city_pages: 0,
      missing_neighborhoods: 0,
    };
    const integrityChecks = [
      {
        label: 'Null Payloads',
        status: integrity.null_payloads === 0 ? 'ok' : 'error',
        count: integrity.null_payloads,
        message: integrity.null_payloads === 0
          ? 'All routes have valid payloads'
          : `${integrity.null_payloads} routes with null payloads`,
      },
      {
        label: 'Orphaned Routes',
        status: integrity.orphaned_routes === 0 ? 'ok' : 'warning',
        count: integrity.orphaned_routes,
        message: integrity.orphaned_routes === 0
          ? 'No routes reference inactive models'
          : `${integrity.orphaned_routes} active routes reference inactive models`,
      },
      {
        label: 'Missing City Pages',
        status: integrity.missing_city_pages === 0 ? 'ok' : 'error',
        count: integrity.missing_city_pages,
        message: integrity.missing_city_pages === 0
          ? 'All active cities have landing pages'
          : `${integrity.missing_city_pages} cities missing landing pages`,
      },
      {
        label: 'Missing Neighborhoods',
        status: integrity.missing_neighborhoods === 0 ? 'ok' : 'warning',
        count: integrity.missing_neighborhoods,
        message: integrity.missing_neighborhoods === 0
          ? 'All active neighborhoods have routes'
          : `${integrity.missing_neighborhoods} neighborhoods missing routes`,
      },
    ];

    // Compute expected route counts
    // model-service-page uses the view count (services are paired with compatible device types, not all models)
    const expectedCounts: Record<string, number> = {
      'model-service-page': dimensions.model_service_expected ?? (dimensions.cities * dimensions.services * dimensions.models),
      'city-model-page': dimensions.cities * dimensions.models,
      'city-service-page': dimensions.cities * dimensions.services,
      'city-page': dimensions.cities,
      'neighborhood-page': dimensions.neighborhoods,
    };

    // Error count from recent logs
    const recentErrors = logs.filter((l) => l.error_message).length;

    return res.status(200).json({
      success: true,
      routeCounts,
      dimensions,
      stats,
      logs,
      triggers,
      integrityChecks,
      expectedCounts,
      recentErrors,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch route health data';
    console.error('Route health GET error:', err);
    return res.status(500).json({ success: false, message });
  }
}

/* -------------------------------------------------------------------------- */
/*  POST: Manual rebuild actions                                               */
/* -------------------------------------------------------------------------- */

interface ActionDef {
  rpcName: string;
  rpcArgs?: Record<string, unknown>;
  label: string;
}

const ALLOWED_ACTIONS: Record<string, ActionDef> = {
  rebuild_all: {
    rpcName: 'rebuild_all_routes',
    label: 'Full Route Rebuild',
  },
  refresh_model_service: {
    rpcName: 'refresh_dynamic_routes_logic',
    rpcArgs: { raw_source: 'manual' },
    label: 'Model-Service Routes Refresh',
  },
  rebuild_city_pages: {
    rpcName: 'generate_city_landing_routes',
    label: 'City Landing Pages Rebuild',
  },
  rebuild_city_service: {
    rpcName: 'generate_city_service_routes',
    label: 'City-Service Routes Rebuild',
  },
  rebuild_neighborhoods: {
    rpcName: 'generate_neighborhood_routes',
    label: 'Neighborhood Routes Rebuild',
  },
  refresh_sitemap: {
    rpcName: 'refresh_sitemap_cache',
    label: 'Sitemap Cache Refresh',
  },
};

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.body || {};

  if (!action || !ALLOWED_ACTIONS[action]) {
    return res.status(400).json({
      success: false,
      message: `Invalid action. Allowed: ${Object.keys(ALLOWED_ACTIONS).join(', ')}`,
    });
  }

  const { rpcName, rpcArgs, label } = ALLOWED_ACTIONS[action];
  const supabase = getServiceSupabase();
  const start = Date.now();

  try {
    const { error } = await supabase.rpc(rpcName as string, rpcArgs);
    const duration_ms = Date.now() - start;

    if (error) {
      return res.status(500).json({
        success: false,
        action,
        message: `${label} failed: ${error.message}`,
        duration_ms,
      });
    }

    return res.status(200).json({
      success: true,
      action,
      message: `${label} completed successfully`,
      duration_ms,
    });
  } catch (err: unknown) {
    const duration_ms = Date.now() - start;
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Route health action ${action} error:`, err);
    return res.status(500).json({
      success: false,
      action,
      message: `${label} failed: ${message}`,
      duration_ms,
    });
  }
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function categorizeTrigger(name: string): string {
  if (name.includes('route') || name.includes('refresh')) return 'Route rebuild';
  if (name.includes('pricing') || name.includes('sync')) return 'Status sync';
  if (name.includes('warranty') || name.includes('set_warranty')) return 'Warranty';
  if (name.includes('booking') || name.includes('status')) return 'Booking';
  if (name.includes('updated_at') || name.includes('timestamp')) return 'Timestamp';
  if (name.includes('slug')) return 'Slug generation';
  return 'Other';
}

/* -------------------------------------------------------------------------- */
/*  Handler                                                                    */
/* -------------------------------------------------------------------------- */

export default requireAdminAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, message: 'Method not allowed' });
});
