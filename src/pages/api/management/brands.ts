/**
 * Admin API: Brands Management
 * 
 * Handles CRUD operations for device brands.
 * Brands are linked to device types (Mobile, Laptop, Tablet, etc.)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { 
  BrandRecord, 
  AdminApiResponse,
  CreateBrandRequest,
  isValidUUID,
  assertValidUUID
} from '@/types/admin';

const apiLogger = logger.createModuleLogger('api/management/brands');

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
    apiLogger.error('Unexpected error in brands API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
}

/**
 * GET /api/management/brands
 * 
 * Query params:
 * - device_type_id (UUID, optional): Filter brands by device type
 * - is_active (boolean, optional): Filter by active status
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { device_type_id, is_active } = req.query;

    apiLogger.info('Fetching brands', { device_type_id, is_active });

    let query = supabase
      .from('brands')
      .select(`
        *,
        device_types!device_type_id(id, name, display_name)
      `);

    // Filter by device type if provided
    if (device_type_id && isValidUUID(device_type_id as string)) {
      query = query.eq('device_type_id', device_type_id);
    }

    // Filter by active status if provided
    if (is_active !== undefined && is_active !== null) {
      const isActiveVal = typeof is_active === 'string' ? is_active === 'true' : Boolean(is_active);
      query = query.eq('is_active', isActiveVal);
    }

    const { data: brands, error } = await query.order('name', { ascending: true });

    if (error) {
      apiLogger.error('Error fetching brands', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch brands',
        error: error.message
      });
    }

    apiLogger.info('Successfully fetched brands', { count: brands?.length || 0 });

    return res.status(200).json({
      success: true,
      data: brands || []
    } as any);
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch brands'
    });
  }
}

/**
 * POST /api/management/brands
 * 
 * Body:
 * {
 *   name: string,              // e.g., "Apple"
 *   display_name: string,      // e.g., "Apple"
 *   device_type_id: string,    // UUID of device type
 *   is_active?: boolean
 * }
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { name, display_name, device_type_id, is_active = true } = req.body as CreateBrandRequest & { is_active?: boolean };

    // Validate required fields
    if (!name || !display_name || !device_type_id) {
      return res.status(400).json({
        success: false,
        message: 'name, display_name, and device_type_id are required'
      });
    }

    // Validate device_type_id is a valid UUID
    if (!isValidUUID(device_type_id)) {
      return res.status(400).json({
        success: false,
        message: 'device_type_id must be a valid UUID'
      });
    }

    // Check if device type exists
    const { data: deviceType, error: typeError } = await supabase
      .from('device_types')
      .select('id')
      .eq('id', device_type_id)
      .single();

    if (typeError || !deviceType) {
      apiLogger.error('Device type not found', { device_type_id });
      return res.status(400).json({
        success: false,
        message: 'Device type not found'
      });
    }

    apiLogger.info('Creating brand', { name, device_type_id });

    const { data: brand, error } = await supabase
      .from('brands')
      .insert({
        name,
        display_name,
        device_type_id,
        is_active
      })
      .select(`
        *,
        device_types!device_type_id(id, name, display_name)
      `)
      .single();

    if (error) {
      apiLogger.error('Error creating brand', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create brand',
        error: error.message
      });
    }

    apiLogger.info('Successfully created brand', { id: brand.id, name });

    return res.status(201).json({
      success: true,
      data: brand,
      message: 'Brand created successfully'
    } as any);
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create brand'
    });
  }
}

/**
 * PUT /api/management/brands?id={uuid}
 * 
 * Body: Partial update
 * {
 *   name?: string,
 *   display_name?: string,
 *   device_type_id?: string,
 *   is_active?: boolean
 * }
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;
    const { name, display_name, device_type_id, is_active } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Brand ID is required'
      });
    }

    if (!isValidUUID(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid brand ID format'
      });
    }

    // If updating device_type_id, validate it exists
    if (device_type_id && !isValidUUID(device_type_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device_type_id format'
      });
    }

    if (device_type_id) {
      const { data: deviceType, error: typeError } = await supabase
        .from('device_types')
        .select('id')
        .eq('id', device_type_id)
        .single();

      if (typeError || !deviceType) {
        return res.status(400).json({
          success: false,
          message: 'Device type not found'
        });
      }
    }

    apiLogger.info('Updating brand', { id, name });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (device_type_id !== undefined) updateData.device_type_id = device_type_id;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: brand, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        device_types!device_type_id(id, name, display_name)
      `)
      .single();

    if (error) {
      apiLogger.error('Error updating brand', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update brand',
        error: error.message
      });
    }

    apiLogger.info('Successfully updated brand', { id });

    return res.status(200).json({
      success: true,
      data: brand,
      message: 'Brand updated successfully'
    } as any);
  } catch (error) {
    apiLogger.error('Error in handlePut', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update brand'
    });
  }
}

/**
 * DELETE /api/management/brands?id={uuid}
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Brand ID is required'
      });
    }

    if (!isValidUUID(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid brand ID format'
      });
    }

    apiLogger.info('Deleting brand', { id });

    // Check if there are models using this brand
    const { data: modelsCount } = await supabase
      .from('device_models')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', id);

    if (modelsCount && modelsCount.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete brand that has associated device models'
      });
    }

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      apiLogger.error('Error deleting brand', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete brand',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted brand', { id });

    return res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete brand'
    });
  }
}
