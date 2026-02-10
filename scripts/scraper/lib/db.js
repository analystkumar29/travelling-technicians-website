/**
 * Supabase operations for msx_parts_catalog and scrape_logs
 */

const { createClient } = require('@supabase/supabase-js');
const { logger } = require('./logger');

let supabase = null;

/**
 * Initialize Supabase client (service role for RLS bypass)
 */
function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Check your .env.local file.'
    );
  }

  supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return supabase;
}

/**
 * Create a scrape log entry (status: running)
 */
async function createScrapeLog() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('scrape_logs')
    .insert({ status: 'running' })
    .select()
    .single();

  if (error) {
    logger.error('Failed to create scrape log:', error.message);
    return null;
  }
  return data;
}

/**
 * Update a scrape log entry
 */
async function updateScrapeLog(id, updates) {
  const sb = getSupabase();
  const { error } = await sb.from('scrape_logs').update(updates).eq('id', id);

  if (error) {
    logger.error('Failed to update scrape log:', error.message);
  }
}

/**
 * Upsert products into msx_parts_catalog (dedup on SKU)
 */
async function upsertProducts(products) {
  if (!products.length) {
    logger.warn('No products to upsert');
    return { upserted: 0, errors: [] };
  }

  const sb = getSupabase();
  const errors = [];
  let upserted = 0;

  // Batch upsert in chunks of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE).map((p) => ({
      sku: p.sku,
      name: p.name,
      brand: p.brand || 'Apple',
      device_line: p.device_line,
      model_compatibility: p.model_compatibility,
      category: p.category,
      quality_tier: p.quality_tier || 'standard',
      wholesale_price: p.wholesale_price,
      is_in_stock: p.is_in_stock || false,
      warranty_info: p.warranty_info || null,
      source_url: p.source_url || null,
      last_synced_at: new Date().toISOString(),
    }));

    const { data, error } = await sb
      .from('msx_parts_catalog')
      .upsert(batch, { onConflict: 'sku', ignoreDuplicates: false })
      .select('id');

    if (error) {
      logger.error(`Batch upsert error (items ${i}-${i + batch.length}):`, error.message);
      errors.push({ batch: i, error: error.message });
    } else {
      upserted += data?.length || batch.length;
    }

    logger.progress(
      Math.min(i + BATCH_SIZE, products.length),
      products.length,
      'upserting products'
    );
  }

  logger.success(`Upserted ${upserted} products (${errors.length} errors)`);
  return { upserted, errors };
}

/**
 * Get current catalog stats
 */
async function getCatalogStats() {
  const sb = getSupabase();

  const { count: total } = await sb
    .from('msx_parts_catalog')
    .select('*', { count: 'exact', head: true });

  const { count: inStock } = await sb
    .from('msx_parts_catalog')
    .select('*', { count: 'exact', head: true })
    .eq('is_in_stock', true);

  return { total: total || 0, inStock: inStock || 0 };
}

module.exports = {
  getSupabase,
  createScrapeLog,
  updateScrapeLog,
  upsertProducts,
  getCatalogStats,
};
