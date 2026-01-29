/**
 * Admin API: Device Models Management
 * 
 * Handles CRUD operations for device models (e.g., iPhone 16, MacBook Pro M3)
 * Device models are linked to brands and device types
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { 
  DeviceModelRecord, 
  AdminApiResponse,
  CreateDeviceModelRequest,
  isValidUUID
} from '@/types/admin';

const apiLogger = logger.createModuleLogger('api/management/device-models');

type ApiResponse = AdminApiResponse<any>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
    apiLogger.error('Unexpected error in device models API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
}

/**
 * GET /api/management/device-models
 * 
 * Query params:
 * - brand_id (UUID, optional): Filter models by brand
 * - type_id (UUID, optional): Filter models by device type
 * - is_active (boolean, optional): Filter by active status
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { brand_id, type_id, is_active } = req.query;

    apiLogger.info('Fetching device models', { brand_id, type_id, is_active });

    let query = supabase
      .from('device_models')
      .select(`
        *,
        brands!brand_id(id, name, slug, logo_url, is_active),
        device_types!type_id(id, name, slug, icon_name, is_active)
      `);

    // Filter by brand if provided
    if (brand_id && isValidUUID(brand_id as string)) {
      query = query.eq('brand_id', brand_id);
    }

    // Filter by device type if provided
    if (type_id && isValidUUID(type_id as string)) {
      query = query.eq('type_id', type_id);
    }

    // Filter by active status if provided
    if (is_active !== undefined && is_active !== null) {
      const isActiveVal = typeof is_active === 'string' ? is_active === 'true' : Boolean(is_active);
      query = query.eq('is_active', isActiveVal);
    }

    const { data: models, error } = await query.order('name', { ascending: true });

    if (error) {
      apiLogger.error('Error fetching device models', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch device models',
        error: error.message
      });
    }

    apiLogger.info('Successfully fetched device models', { count: models?.length || 0 });

    return res.status(200).json({
      success: true,
      data: models || []
    } as any);
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch device models'
    });
  }
}

/**
 * POST /api/management/device-models
 * 
 * Body:
 * {
 *   name: string,              // e.g., "iPhone 16"
 *   display_name: string,      // e.g., "iPhone 16"
 *   brand_id: string,          // UUID of brand
 *   type_id: string,           // UUID of device type
 *   is_active?: boolean
 * }
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { name, brand_id, type_id, slug, release_year, image_url, is_active = true } = req.body as CreateDeviceModelRequest & { is_active?: boolean };

    // Validate required fields
    if (!name || !brand_id || !type_id) {
      return res.status(400).json({
        success: false,
        message: 'name, brand_id, and type_id are required'
      });
    }

    // Validate UUIDs
    if (!isValidUUID(brand_id) || !isValidUUID(type_id)) {
      return res.status(400).json({
        success: false,
        message: 'brand_id and type_id must be valid UUIDs'
      });
    }

    // Check if brand exists
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('id', brand_id)
      .single();

    if (brandError || !brand) {
      apiLogger.error('Brand not found', { brand_id });
      return res.status(400).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if device type exists
    const { data: deviceType, error: typeError } = await supabase
      .from('device_types')
      .select('id')
      .eq('id', type_id)
      .single();

    if (typeError || !deviceType) {
      apiLogger.error('Device type not found', { type_id });
      return res.status(400).json({
        success: false,
        message: 'Device type not found'
      });
    }

    apiLogger.info('Creating device model', { name, brand_id, type_id });

    const { data: model, error } = await supabase
      .from('device_models')
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        brand_id,
        type_id,
        release_year: release_year || null,
        image_url: image_url || null,
        is_active
      })
      .select(`
        *,
        brands!brand_id(id, name, slug, logo_url, is_active),
        device_types!type_id(id, name, slug, icon_name, is_active)
      `)
      .single();

    if (error) {
      apiLogger.error('Error creating device model', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create device model',
        error: error.message
      });
    }

    apiLogger.info('Successfully created device model', { id: model.id, name });

    return res.status(201).json({
      success: true,
      data: model,
      message: 'Device model created successfully'
    } as any);
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create device model'
    });
  }
}

/**
 * PUT /api/management/device-models?id={uuid}
 * 
 * Body: Partial update
 * {
 *   name?: string,
 *   display_name?: string,
 *   brand_id?: string,
 *   type_id?: string,
 *   is_active?: boolean
 * }
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;
    const { name, display_name, brand_id, type_id, is_active } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Device model ID is required'
      });
    }

    if (!isValidUUID(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device model ID format'
      });
    }

    // Validate UUIDs if provided
    if (brand_id && !isValidUUID(brand_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid brand_id format'
      });
    }

    if (type_id && !isValidUUID(type_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type_id format'
      });
    }

    // Check if brand exists (if updating)
    if (brand_id) {
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('id')
        .eq('id', brand_id)
        .single();

      if (brandError || !brand) {
        return res.status(400).json({
          success: false,
          message: 'Brand not found'
        });
      }
    }

    // Check if device type exists (if updating)
    if (type_id) {
      const { data: deviceType, error: typeError } = await supabase
        .from('device_types')
        .select('id')
        .eq('id', type_id)
        .single();

      if (typeError || !deviceType) {
        return res.status(400).json({
          success: false,
          message: 'Device type not found'
        });
      }
    }

    apiLogger.info('Updating device model', { id, name });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (brand_id !== undefined) updateData.brand_id = brand_id;
    if (type_id !== undefined) updateData.type_id = type_id;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: model, error } = await supabase
      .from('device_models')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        brands!brand_id(id, name, slug, logo_url, is_active),
        device_types!type_id(id, name, slug, icon_name, is_active)
      `)
      .single();

    if (error) {
      apiLogger.error('Error updating device model', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update device model',
        error: error.message
      });
    }

    apiLogger.info('Successfully updated device model', { id });

    return res.status(200).json({
      success: true,
      data: model,
      message: 'Device model updated successfully'
    } as any);
  } catch (error) {
    apiLogger.error('Error in handlePut', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update device model'
    });
  }
}

/**
 * DELETE /api/management/device-models?id={uuid}
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Device model ID is required'
      });
    }

    if (!isValidUUID(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device model ID format'
      });
    }

    apiLogger.info('Deleting device model', { id });

    // Check if there are pricing records using this model
    const { data: pricingCount } = await supabase
      .from('dynamic_pricing')
      .select('id', { count: 'exact', head: true })
      .eq('model_id', id);

    if (pricingCount && pricingCount.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete device model that has associated pricing records'
      });
    }

    const { error } = await supabase
      .from('device_models')
      .delete()
      .eq('id', id);

    if (error) {
      apiLogger.error('Error deleting device model', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete device model',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted device model', { id });

    return res.status(200).json({
      success: true,
      message: 'Device model deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete device model'
    });
  }
}
