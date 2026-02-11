import { requireAdminAuth } from '@/middleware/adminAuth';
/**
 * Admin API: Dynamic Pricing Management
 * Aligned with ACTUAL DATABASE SCHEMA
 * 
 * Manages dynamic_pricing records with:
 * - pricing_tier as TEXT field ('standard' | 'premium')
 * - No pricing_tiers table (doesn't exist)
 * - Uses compare_at_price (not discounted_price)
 * - Includes part_quality, part_warranty_months, includes_installation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { 
  DynamicPricingRecord, 
  AdminApiResponse,
  isValidUUID
} from '@/types/admin';

const apiLogger = logger.createModuleLogger('api/management/dynamic-pricing');

type ApiResponse<T = any> = AdminApiResponse<T>;

export default requireAdminAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const supabase = getServiceSupabase();

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, supabase);
      case 'POST':
        return await handlePost(req, res, supabase);
      case 'PUT':
        return await handlePut(req, res, supabase);
      case 'DELETE':
        return await handleDelete(req, res, supabase);
      case 'PATCH':
        return await handlePatch(req, res, supabase);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in dynamic pricing API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
})

/**
 * GET /api/management/dynamic-pricing
 * Query params: model_id, service_id, pricing_tier
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { model_id, service_id, pricing_tier } = req.query;

    apiLogger.info('Fetching dynamic pricing entries', { model_id, service_id, pricing_tier });

    // Fetch pricing records
    let query = supabase
      .from('dynamic_pricing')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (model_id && typeof model_id === 'string') {
      query = query.eq('model_id', model_id);
    }
    if (service_id && typeof service_id === 'string') {
      query = query.eq('service_id', service_id);
    }
    if (pricing_tier && typeof pricing_tier === 'string' && 
        (pricing_tier === 'standard' || pricing_tier === 'premium')) {
      query = query.eq('pricing_tier', pricing_tier);
    }

    const { data: pricing, error } = await query;

    if (error) {
      apiLogger.error('Error fetching dynamic pricing', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch dynamic pricing',
        error: error.message
      });
    }

    // Fetch related data separately (no JOINs with non-existent fields)
    const { data: services } = await supabase
      .from('services')
      .select('id, name, display_name, slug, device_type_id');

    const { data: deviceModels } = await supabase
      .from('device_models')
      .select('id, name, slug, brand_id, type_id');

    const { data: brands } = await supabase
      .from('brands')
      .select('id, name, slug, logo_url');

    const { data: deviceTypes } = await supabase
      .from('device_types')
      .select('id, name, slug, icon_name');

    // Create lookup maps for efficient data joining
    const servicesMap = new Map((services || []).map((s: any) => [s.id, s]));
    const modelsMap = new Map((deviceModels || []).map((m: any) => [m.id, m]));
    const brandsMap = new Map((brands || []).map((b: any) => [b.id, b]));
    const deviceTypesMap = new Map((deviceTypes || []).map((dt: any) => [dt.id, dt]));

    // Fetch wholesale costs from MSX — parallel batches for speed
    const cheapestByTier = new Map<string, { wholesale_price: number; part_name: string }>();
    const partsCountCache = new Map<string, number>();

    // Get all model IDs that have model_number_mapping entries
    const { data: mappedModels } = await supabase
      .from('model_number_mapping')
      .select('device_model_id');
    const mappedModelIds = new Set((mappedModels || []).map((m: any) => m.device_model_id));

    // Service slug → MSX category mapping (laptop + mobile)
    const serviceSlugToCategory: Record<string, string> = {
      'battery-replacement-laptop': 'battery',
      'screen-replacement-laptop': 'screen',
      'battery-replacement-mobile': 'battery',
      'screen-replacement-mobile': 'screen',
    };

    // Collect unique model+category combos
    const uniqueCombos = new Map<string, { model_id: string; category: string }>();
    for (const entry of (pricing || [])) {
      const model: any = modelsMap.get(entry.model_id);
      const service: any = servicesMap.get(entry.service_id);
      if (!model || !service) continue;
      if (!mappedModelIds.has(entry.model_id)) continue;
      const msxCategory = serviceSlugToCategory[service.slug];
      if (!msxCategory) continue;
      const partsKey = `${entry.model_id}:${msxCategory}`;
      if (!uniqueCombos.has(partsKey)) {
        uniqueCombos.set(partsKey, { model_id: entry.model_id, category: msxCategory });
      }
    }

    // Fetch all combos in parallel batches of 20
    const BATCH_SIZE = 20;
    const comboEntries = Array.from(uniqueCombos.entries());
    for (let i = 0; i < comboEntries.length; i += BATCH_SIZE) {
      const batch = comboEntries.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async ([partsKey, { model_id, category }]) => {
        const { data: partsData } = await supabase.rpc('get_all_wholesale_parts', {
          p_device_model_id: model_id,
          p_service_category: category,
        });
        const parts = (partsData || []).map((p: any) => ({
          price: parseFloat(p.wholesale_price),
          name: p.part_name,
          quality_tier: p.quality_tier,
        }));
        partsCountCache.set(partsKey, parts.length);
        // Compute cheapest per quality tier
        for (const part of parts) {
          const tierKey = part.quality_tier === 'oem' ? 'oem' : 'standard';
          const cacheKey = `${model_id}:${category}:${tierKey}`;
          const existing = cheapestByTier.get(cacheKey);
          if (!existing || part.price < existing.wholesale_price) {
            cheapestByTier.set(cacheKey, {
              wholesale_price: part.price,
              part_name: part.name,
            });
          }
        }
      }));
    }

    // Transform the data to include related information
    const transformedPricing = (pricing || []).map((entry: any) => {
      const service: any = servicesMap.get(entry.service_id);
      const model: any = modelsMap.get(entry.model_id);
      const brand: any = model ? brandsMap.get(model.brand_id) : null;
      const deviceType: any = model ? deviceTypesMap.get(model.type_id) : null;

      // Look up wholesale cost
      let wholesale_cost = null;
      let wholesale_part_name = null;
      let parts_count = 0;
      if (service && model && mappedModelIds.has(entry.model_id)) {
        const msxCategory = serviceSlugToCategory[service.slug];
        if (msxCategory) {
          const msxQuality = entry.pricing_tier === 'premium' ? 'oem' : 'standard';
          const cacheKey = `${entry.model_id}:${msxCategory}:${msxQuality}`;
          const ws = cheapestByTier.get(cacheKey);
          if (ws) {
            wholesale_cost = ws.wholesale_price;
            wholesale_part_name = ws.part_name;
          }
          const partsKey = `${entry.model_id}:${msxCategory}`;
          parts_count = partsCountCache.get(partsKey) || 0;
        }
      }

      return {
        id: entry.id,
        service_id: entry.service_id,
        model_id: entry.model_id,
        pricing_tier: entry.pricing_tier,
        base_price: entry.base_price,
        compare_at_price: entry.compare_at_price,
        part_quality: entry.part_quality,
        part_warranty_months: entry.part_warranty_months,
        includes_installation: entry.includes_installation,
        is_active: entry.is_active,
        created_at: entry.created_at,
        // Human-readable names for display
        service_name: service?.display_name || service?.name,
        model_name: model?.name,
        brand_name: brand?.name,
        tier_name: entry.pricing_tier === 'premium' ? 'Premium' : 'Standard',
        device_type: deviceType?.name,
        // Wholesale cost from MSX catalog
        wholesale_cost,
        wholesale_part_name,
        // Part count for expand UI (full parts fetched on demand)
        parts_count,
      };
    });

    apiLogger.info('Successfully fetched dynamic pricing', { count: transformedPricing.length });

    return res.status(200).json({
      success: true,
      pricing: transformedPricing
    } as any);
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dynamic pricing'
    });
  }
}

/**
 * POST /api/management/dynamic-pricing
 * Create new pricing entry
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { 
      service_id, 
      model_id, 
      pricing_tier, 
      base_price, 
      compare_at_price,
      part_quality,
      part_warranty_months,
      includes_installation,
      is_active 
    } = req.body;

    // Validate required fields
    if (!service_id || !model_id || !pricing_tier || !base_price) {
      return res.status(400).json({
        success: false,
        message: 'service_id, model_id, pricing_tier, and base_price are required'
      });
    }

    // Validate pricing_tier
    if (pricing_tier !== 'standard' && pricing_tier !== 'premium') {
      return res.status(400).json({
        success: false,
        message: 'pricing_tier must be either "standard" or "premium"'
      });
    }

    apiLogger.info('Creating dynamic pricing entry', { service_id, model_id, pricing_tier, base_price });

    const { data: entry, error } = await supabase
      .from('dynamic_pricing')
      .insert({
        service_id,
        model_id,
        pricing_tier,
        base_price,
        compare_at_price: compare_at_price || null,
        part_quality: part_quality || null,
        part_warranty_months: part_warranty_months !== undefined ? part_warranty_months : 3,
        includes_installation: includes_installation !== undefined ? includes_installation : true,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) {
      apiLogger.error('Error creating dynamic pricing entry', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create dynamic pricing entry',
        error: error.message
      });
    }

    apiLogger.info('Successfully created dynamic pricing entry', { id: entry.id });

    return res.status(201).json({
      success: true,
      entry,
      message: 'Dynamic pricing entry created successfully'
    } as any);
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create dynamic pricing entry'
    });
  }
}

/**
 * PUT /api/management/dynamic-pricing?id={uuid}
 * Update existing pricing entry
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;
    const { 
      service_id, 
      model_id, 
      pricing_tier, 
      base_price, 
      compare_at_price,
      part_quality,
      part_warranty_months,
      includes_installation,
      is_active 
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required for updates'
      });
    }

    if (!isValidUUID(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    // Validate pricing_tier if provided
    if (pricing_tier && pricing_tier !== 'standard' && pricing_tier !== 'premium') {
      return res.status(400).json({
        success: false,
        message: 'pricing_tier must be either "standard" or "premium"'
      });
    }

    apiLogger.info('Updating dynamic pricing entry', { id, base_price });

    const updateData: any = {};
    if (service_id !== undefined) updateData.service_id = service_id;
    if (model_id !== undefined) updateData.model_id = model_id;
    if (pricing_tier !== undefined) updateData.pricing_tier = pricing_tier;
    if (base_price !== undefined) updateData.base_price = base_price;
    if (compare_at_price !== undefined) updateData.compare_at_price = compare_at_price;
    if (part_quality !== undefined) updateData.part_quality = part_quality;
    if (part_warranty_months !== undefined) updateData.part_warranty_months = part_warranty_months;
    if (includes_installation !== undefined) updateData.includes_installation = includes_installation;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: entry, error } = await supabase
      .from('dynamic_pricing')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      apiLogger.error('Error updating dynamic pricing entry', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update dynamic pricing entry',
        error: error.message
      });
    }

    apiLogger.info('Successfully updated dynamic pricing entry', { id: entry.id });

    return res.status(200).json({
      success: true,
      entry,
      message: 'Dynamic pricing entry updated successfully'
    } as any);
  } catch (error) {
    apiLogger.error('Error in handlePut', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update dynamic pricing entry'
    });
  }
}

/**
 * DELETE /api/management/dynamic-pricing?id={uuid}
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required for deletion'
      });
    }

    if (!isValidUUID(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    apiLogger.info('Deleting dynamic pricing entry', { id });

    const { error } = await supabase
      .from('dynamic_pricing')
      .delete()
      .eq('id', id);

    if (error) {
      apiLogger.error('Error deleting dynamic pricing entry', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete dynamic pricing entry',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted dynamic pricing entry', { id });

    return res.status(200).json({
      success: true,
      message: 'Dynamic pricing entry deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete dynamic pricing entry'
    });
  }
}

/**
 * PATCH /api/management/dynamic-pricing
 * Quick updates for any field (base_price, is_active, etc.)
 */
async function handlePatch(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { id, ...updateFields } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing id' 
      });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Validate is_active if provided
    if (updateFields.is_active !== undefined && typeof updateFields.is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_active must be a boolean'
      });
    }

    apiLogger.info('Updating pricing entry', { id, updateFields });
    
    const { data: entry, error } = await supabase
      .from('dynamic_pricing')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      apiLogger.error('Failed to update pricing entry', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Pricing entry updated successfully',
      entry
    } as any);
  } catch (error) {
    apiLogger.error('Error in handlePatch', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update pricing entry'
    });
  }
}
