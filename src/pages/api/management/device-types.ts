import { requireAdminAuth } from '@/middleware/adminAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { isValidUUID } from '@/types/admin';

const apiLogger = logger.createModuleLogger('api/management/device-types');

interface DeviceType {
  id?: string;
  name: string;
  slug: string;
  icon_name?: string;
  is_active: boolean;
}

interface ApiResponse {
  success: boolean;
  deviceTypes?: DeviceType[];
  deviceType?: DeviceType;
  message?: string;
  error?: string;
}

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
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in device-types API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
})

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    apiLogger.info('Fetching device types');

    const { data: deviceTypes, error } = await supabase
      .from('device_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      apiLogger.error('Error fetching device types', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch device types',
        error: error.message
      });
    }

    apiLogger.info('Successfully fetched device types', { count: deviceTypes?.length || 0 });

    return res.status(200).json({
      success: true,
      deviceTypes: deviceTypes || []
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch device types'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { name, slug, icon_name, is_active } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    apiLogger.info('Creating device type', { name, slug });

    const { data: deviceType, error } = await supabase
      .from('device_types')
      .insert({
        name,
        slug,
        icon_name: icon_name || null,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) {
      apiLogger.error('Error creating device type', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create device type',
        error: error.message
      });
    }

    apiLogger.info('Successfully created device type', { id: deviceType.id });

    return res.status(201).json({
      success: true,
      deviceType,
      message: 'Device type created successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create device type'
    });
  }
}

/**
 * PUT /api/management/device-types?id={uuid}
 *
 * Body: Partial update
 * {
 *   name?: string,
 *   slug?: string,
 *   icon_name?: string,
 *   is_active?: boolean
 * }
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { id } = req.query;
    const { name, slug, icon_name, is_active } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Device type ID is required'
      });
    }

    if (!isValidUUID(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device type ID format'
      });
    }

    apiLogger.info('Updating device type', { id, name });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (icon_name !== undefined) updateData.icon_name = icon_name;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: deviceType, error } = await supabase
      .from('device_types')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      apiLogger.error('Error updating device type', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update device type',
        error: error.message
      });
    }

    apiLogger.info('Successfully updated device type', { id });

    return res.status(200).json({
      success: true,
      deviceType,
      message: 'Device type updated successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePut', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update device type'
    });
  }
}

/**
 * DELETE /api/management/device-types?id={uuid}
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Device type ID is required'
      });
    }

    if (!isValidUUID(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device type ID format'
      });
    }

    apiLogger.info('Deleting device type', { id });

    // Check if there are device models using this type
    const { data: modelsCount } = await supabase
      .from('device_models')
      .select('id', { count: 'exact', head: true })
      .eq('type_id', id);

    if (modelsCount && modelsCount.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete device type that has associated device models'
      });
    }

    const { error } = await supabase
      .from('device_types')
      .delete()
      .eq('id', id);

    if (error) {
      apiLogger.error('Error deleting device type', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete device type',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted device type', { id });

    return res.status(200).json({
      success: true,
      message: 'Device type deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete device type'
    });
  }
}
