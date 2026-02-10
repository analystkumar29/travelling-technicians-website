/**
 * Admin API for MobileSentrix parts catalog
 * GET — list parts with filters, search, pagination
 * GET ?stats=true — aggregate counts for dashboard cards
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '@/middleware/adminAuth';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/parts-catalog');

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
    // Stats mode
    if (req.query.stats === 'true') {
      const [totalRes, inStockRes, outStockRes, avgPriceRes, lastSyncRes] = await Promise.all([
        supabase.from('msx_parts_catalog').select('*', { count: 'exact', head: true }),
        supabase.from('msx_parts_catalog').select('*', { count: 'exact', head: true }).eq('is_in_stock', true),
        supabase.from('msx_parts_catalog').select('*', { count: 'exact', head: true }).eq('is_in_stock', false),
        supabase.from('msx_parts_catalog').select('wholesale_price').not('wholesale_price', 'is', null),
        supabase.from('msx_parts_catalog').select('last_synced_at').order('last_synced_at', { ascending: false }).limit(1),
      ]);

      // Calculate average price
      let avgPrice = 0;
      if (avgPriceRes.data && avgPriceRes.data.length > 0) {
        const sum = avgPriceRes.data.reduce((acc: number, r: { wholesale_price: number }) => acc + Number(r.wholesale_price), 0);
        avgPrice = sum / avgPriceRes.data.length;
      }

      const lastSynced = lastSyncRes.data?.[0]?.last_synced_at || null;

      return res.status(200).json({
        success: true,
        stats: {
          total: totalRes.count || 0,
          inStock: inStockRes.count || 0,
          outOfStock: outStockRes.count || 0,
          avgPrice: Math.round(avgPrice * 100) / 100,
          lastSynced,
        },
      });
    }

    // List mode with filters
    const {
      search,
      device_line,
      category,
      quality,
      stock,
      page: pageParam,
      limit: limitParam,
    } = req.query;

    const page = Math.max(1, parseInt(pageParam as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitParam as string, 10) || 50));
    const offset = (page - 1) * limit;

    let query = supabase
      .from('msx_parts_catalog')
      .select('*', { count: 'exact' });

    // Apply filters
    if (device_line && device_line !== 'all') {
      query = query.eq('device_line', device_line);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (quality && quality !== 'all') {
      query = query.eq('quality_tier', quality);
    }
    if (stock === 'in_stock') {
      query = query.eq('is_in_stock', true);
    } else if (stock === 'out_of_stock') {
      query = query.eq('is_in_stock', false);
    }

    // Search by SKU, name, or model
    if (search) {
      const searchStr = search as string;
      query = query.or(
        `sku.ilike.%${searchStr}%,name.ilike.%${searchStr}%,model_compatibility.ilike.%${searchStr}%`
      );
    }

    // Order and paginate
    query = query
      .order('device_line', { ascending: true })
      .order('category', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: parts, error, count } = await query;

    if (error) {
      apiLogger.error('Error fetching parts', { error });
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      parts: parts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    apiLogger.error('Unexpected error', { error: String(err) });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
