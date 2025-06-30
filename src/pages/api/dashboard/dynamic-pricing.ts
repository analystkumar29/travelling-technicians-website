import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/dashboard/dynamic-pricing');

interface DynamicPricing {
  id?: number;
  service_id: number;
  model_id: number;
  pricing_tier_id: number;
  base_price: number;
  discounted_price?: number;
  cost_price?: number;
  is_active: boolean;
  service_name?: string;
  model_name?: string;
  tier_name?: string;
  brand_name?: string;
  device_type?: string;
}

interface ApiResponse {
  success: boolean;
  pricing?: DynamicPricing[];
  entry?: DynamicPricing;
  message?: string;
  error?: string;
}

export default async function handler(
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
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    apiLogger.info('Fetching dynamic pricing entries');

    const { model_id, service_id, tier_id } = req.query;

    let query = supabase
      .from('dynamic_pricing')
      .select(`
        *,
        services!inner(
          id,
          name,
          display_name
        ),
        device_models!inner(
          id,
          name,
          display_name,
          brands!inner(
            id,
            name,
            display_name,
            device_types!inner(
              id,
              name,
              display_name
            )
          )
        ),
        pricing_tiers!inner(
          id,
          name,
          display_name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (model_id) {
      query = query.eq('model_id', model_id);
    }
    if (service_id) {
      query = query.eq('service_id', service_id);
    }
    if (tier_id) {
      query = query.eq('pricing_tier_id', tier_id);
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

    // Transform the data to include related information
    const transformedPricing = (pricing || []).map((entry: any) => ({
      id: entry.id,
      service_id: entry.service_id,
      model_id: entry.model_id,
      pricing_tier_id: entry.pricing_tier_id,
      base_price: entry.base_price,
      discounted_price: entry.discounted_price,
      cost_price: entry.cost_price,
      is_active: entry.is_active,
      service_name: entry.services?.display_name || entry.services?.name,
      model_name: entry.device_models?.display_name || entry.device_models?.name,
      brand_name: entry.device_models?.brands?.display_name || entry.device_models?.brands?.name,
      tier_name: entry.pricing_tiers?.display_name || entry.pricing_tiers?.name,
      device_type: entry.device_models?.brands?.device_types?.name,
      created_at: entry.created_at,
      updated_at: entry.updated_at
    }));

    apiLogger.info('Successfully fetched dynamic pricing', { count: transformedPricing.length });

    return res.status(200).json({
      success: true,
      pricing: transformedPricing
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dynamic pricing'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { service_id, model_id, pricing_tier_id, base_price, discounted_price, cost_price, is_active } = req.body;

    // Validate required fields
    if (!service_id || !model_id || !pricing_tier_id || !base_price) {
      return res.status(400).json({
        success: false,
        message: 'service_id, model_id, pricing_tier_id, and base_price are required'
      });
    }

    apiLogger.info('Creating dynamic pricing entry', { service_id, model_id, pricing_tier_id, base_price });

    const { data: entry, error } = await supabase
      .from('dynamic_pricing')
      .insert({
        service_id,
        model_id,
        pricing_tier_id,
        base_price,
        discounted_price: discounted_price || null,
        cost_price: cost_price || null,
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
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create dynamic pricing entry'
    });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { id } = req.query;
    const { service_id, model_id, pricing_tier_id, base_price, discounted_price, cost_price, is_active } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required for updates'
      });
    }

    apiLogger.info('Updating dynamic pricing entry', { id, base_price });

    const updateData: any = {};
    if (service_id !== undefined) updateData.service_id = service_id;
    if (model_id !== undefined) updateData.model_id = model_id;
    if (pricing_tier_id !== undefined) updateData.pricing_tier_id = pricing_tier_id;
    if (base_price !== undefined) updateData.base_price = base_price;
    if (discounted_price !== undefined) updateData.discounted_price = discounted_price;
    if (cost_price !== undefined) updateData.cost_price = cost_price;
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
    });
  } catch (error) {
    apiLogger.error('Error in handlePut', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update dynamic pricing entry'
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required for deletion'
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