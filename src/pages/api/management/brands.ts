import { requireAdminAuth } from '@/middleware/adminAuth';
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

export default requireAdminAuth(async function handler(
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
})

/**
 * GET /api/management/brands
 * 
 * Query params:
 * - is_active (boolean, optional): Filter by active status
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { is_active } = req.query;

    apiLogger.info('Fetching brands', { is_active });

    let query = supabase
      .from('brands')
      .select('*');

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
      brands: brands || []
    });
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
 *   name: string,           // e.g., "Apple"
 *   slug: string,           // e.g., "apple"
 *   logo_url?: string,      // URL to brand logo
 *   is_active?: boolean
 * }
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { name, slug, logo_url, is_active = true } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'name and slug are required'
      });
    }

    apiLogger.info('Creating brand', { name, slug });

    const { data: brand, error } = await supabase
      .from('brands')
      .insert({
        name,
        slug,
        logo_url: logo_url || null,
        is_active
      })
      .select('*')
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
 *   slug?: string,
 *   logo_url?: string,
 *   is_active?: boolean
 * }
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;
    const { name, slug, logo_url, is_active } = req.body;

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

    apiLogger.info('Updating brand', { id, name });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: brand, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .select('*')
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
