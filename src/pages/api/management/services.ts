import { requireAdminAuth } from '@/middleware/adminAuth';
/**
 * Admin API: Services Management
 * 
 * Handles CRUD operations for repair services.
 * Services are linked to device types (Mobile, Laptop, Tablet, etc.)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { 
  AdminApiResponse,
  isValidUUID
} from '@/types/admin';

const apiLogger = logger.createModuleLogger('api/management/services');

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
    apiLogger.error('Unexpected error in services API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
})

/**
 * GET /api/management/services
 * 
 * Query params:
 * - device_type_id (string, optional): Filter by device type UUID
 * - is_active (boolean, optional): Filter by active status
 * - categories (boolean, optional): If true, returns service categories instead of services
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { device_type_id, is_active, categories } = req.query;

    // If categories=true, return service categories
    if (categories === 'true') {
      apiLogger.info('Fetching service categories');
      
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('id, name, slug, is_active')
        .order('name', { ascending: true });

      if (categoriesError) {
        apiLogger.error('Error fetching service categories', { error: categoriesError });
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch service categories',
          error: categoriesError.message
        });
      }

      return res.status(200).json({
        success: true,
        categories: categoriesData || []
      });
    }

    apiLogger.info('Fetching services', { device_type_id, is_active });

    // Fetch services with joins to device_types and service_categories
    let query = supabase
      .from('services')
      .select(`
        id,
        name,
        slug,
        display_name,
        description,
        device_type_id,
        category_id,
        is_active,
        is_doorstep_eligible,
        requires_diagnostics,
        estimated_duration_minutes,
        created_at,
        device_types (
          id,
          name,
          slug
        ),
        service_categories (
          id,
          name,
          slug
        )
      `);

    // Filter by device type if provided
    if (device_type_id) {
      query = query.eq('device_type_id', device_type_id);
    }

    // Filter by active status if provided
    if (is_active !== undefined && is_active !== null) {
      const isActiveVal = typeof is_active === 'string' ? is_active === 'true' : Boolean(is_active);
      query = query.eq('is_active', isActiveVal);
    }

    const { data: services, error } = await query.order('name', { ascending: true });

    if (error) {
      apiLogger.error('Error fetching services', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch services',
        error: error.message
      });
    }

    apiLogger.info('Successfully fetched services', { count: services?.length || 0 });

    return res.status(200).json({
      success: true,
      services: services || []
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
}

/**
 * POST /api/management/services
 * 
 * Body:
 * {
 *   name: string,                    // Required: Internal name
 *   slug: string,                    // Required: URL slug
 *   display_name?: string,           // Optional: Display name for UI
 *   description?: string,            // Optional: Service description
 *   device_type_id: string,          // Required: UUID of device type
 *   category_id?: string,            // Optional: UUID of service category
 *   is_active?: boolean,             // Optional: Default true
 *   is_doorstep_eligible?: boolean,  // Optional: Default true
 *   requires_diagnostics?: boolean,  // Optional: Default false
 *   estimated_duration_minutes?: number // Optional: Default 45
 * }
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { 
      name, 
      slug, 
      display_name, 
      description, 
      device_type_id, 
      category_id,
      is_active = true,
      is_doorstep_eligible = true,
      requires_diagnostics = false,
      estimated_duration_minutes = 45
    } = req.body;

    // Validate required fields
    if (!name || !slug || !device_type_id) {
      return res.status(400).json({
        success: false,
        message: 'name, slug, and device_type_id are required'
      });
    }

    // Validate UUIDs if provided
    if (device_type_id && !isValidUUID(device_type_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device_type_id format'
      });
    }

    if (category_id && !isValidUUID(category_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category_id format'
      });
    }

    apiLogger.info('Creating service', { name, device_type_id });

    const serviceData = {
      name,
      slug,
      display_name: display_name || name,
      description: description || null,
      device_type_id,
      category_id: category_id || null,
      is_active,
      is_doorstep_eligible,
      requires_diagnostics,
      estimated_duration_minutes
    };

    const { data: service, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select(`
        id,
        name,
        slug,
        display_name,
        description,
        device_type_id,
        category_id,
        is_active,
        is_doorstep_eligible,
        requires_diagnostics,
        estimated_duration_minutes,
        created_at,
        device_types (
          id,
          name,
          slug
        ),
        service_categories (
          id,
          name,
          slug
        )
      `)
      .single();

    if (error) {
      apiLogger.error('Error creating service', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create service',
        error: error.message
      });
    }

    apiLogger.info('Successfully created service', { id: service.id, name });

    return res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully'
    } as any);
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create service'
    });
  }
}

/**
 * PUT /api/management/services?id={uuid}
 * 
 * Body: Partial update
 * {
 *   name?: string,                    // Optional: Internal name
 *   slug?: string,                    // Optional: URL slug
 *   display_name?: string,            // Optional: Display name for UI
 *   description?: string,             // Optional: Service description
 *   device_type_id?: string,          // Optional: UUID of device type
 *   category_id?: string,             // Optional: UUID of service category
 *   is_active?: boolean,              // Optional: Active status
 *   is_doorstep_eligible?: boolean,   // Optional: Doorstep eligibility
 *   requires_diagnostics?: boolean,   // Optional: Diagnostics requirement
 *   estimated_duration_minutes?: number // Optional: Estimated duration
 * }
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;
    const { 
      name, 
      slug, 
      display_name, 
      description, 
      device_type_id, 
      category_id,
      is_active,
      is_doorstep_eligible,
      requires_diagnostics,
      estimated_duration_minutes
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    if (!isValidUUID(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
    }

    // Validate UUIDs if provided
    if (device_type_id && !isValidUUID(device_type_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device_type_id format'
      });
    }

    if (category_id && !isValidUUID(category_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category_id format'
      });
    }

    apiLogger.info('Updating service', { id });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (description !== undefined) updateData.description = description;
    if (device_type_id !== undefined) updateData.device_type_id = device_type_id;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_doorstep_eligible !== undefined) updateData.is_doorstep_eligible = is_doorstep_eligible;
    if (requires_diagnostics !== undefined) updateData.requires_diagnostics = requires_diagnostics;
    if (estimated_duration_minutes !== undefined) updateData.estimated_duration_minutes = estimated_duration_minutes;

    const { data: service, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        name,
        slug,
        display_name,
        description,
        device_type_id,
        category_id,
        is_active,
        is_doorstep_eligible,
        requires_diagnostics,
        estimated_duration_minutes,
        created_at,
        device_types (
          id,
          name,
          slug
        ),
        service_categories (
          id,
          name,
          slug
        )
      `)
      .single();

    if (error) {
      apiLogger.error('Error updating service', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update service',
        error: error.message
      });
    }

    apiLogger.info('Successfully updated service', { id });

    return res.status(200).json({
      success: true,
      data: service,
      message: 'Service updated successfully'
    } as any);
  } catch (error) {
    apiLogger.error('Error in handlePut', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
}

/**
 * DELETE /api/management/services?id={uuid}
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    if (!isValidUUID(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
    }

    apiLogger.info('Deleting service', { id });

    // Check if there is pricing using this service
    const { data: pricingCount } = await supabase
      .from('dynamic_pricing')
      .select('id', { count: 'exact', head: true })
      .eq('service_id', id);

    if (pricingCount && pricingCount.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete service that has associated pricing entries'
      });
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      apiLogger.error('Error deleting service', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete service',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted service', { id });

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
}
