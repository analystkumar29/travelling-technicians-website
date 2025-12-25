import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/models');

interface Model {
  id?: number;
  name: string;
  display_name?: string;
  brand_id: number;
  brand?: {
    id: number;
    name: string;
    display_name: string;
    device_type_id: number;
  };
  model_year?: number;
  screen_size?: string;
  color_options?: string[];
  storage_options?: string[];
  is_active: boolean;
  is_featured: boolean;
  status?: 'draft' | 'published' | 'archived';
  sort_order: number;
}

interface ApiResponse {
  success: boolean;
  models?: Model[];
  model?: Model;
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
      case 'PATCH':
        return await handleUpdate(req, res, supabase);
      case 'DELETE':
        return await handleDelete(req, res, supabase);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in models API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    apiLogger.info('Fetching models');

    const { data: models, error } = await supabase
      .from('device_models')
      .select(`
        *,
        brands!inner(
          id,
          name,
          display_name,
          device_type_id,
          device_types!inner(
            id,
            name,
            display_name
          )
        )
      `)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      apiLogger.error('Error fetching models', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch models',
        error: error.message
      });
    }

    // Transform the data to include brand information
    const transformedModels = (models || []).map((model: any) => ({
      ...model,
      brand: {
        id: model.brands.id,
        name: model.brands.name,
        display_name: model.brands.display_name,
        device_type_id: model.brands.device_type_id,
        device_type: model.brands.device_types?.display_name || model.brands.device_types?.name
      }
    }));

    apiLogger.info('Successfully fetched models', { count: transformedModels.length });

    return res.status(200).json({
      success: true,
      models: transformedModels
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch models'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { 
      name, 
      display_name, 
      brand_id, 
      model_year, 
      screen_size, 
      color_options, 
      storage_options, 
      is_active, 
      is_featured,
      status,
      sort_order 
    } = req.body;

    // Validate required fields
    if (!name || !brand_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and brand_id are required'
      });
    }

    apiLogger.info('Creating model', { name, display_name, brand_id });

    const { data: model, error } = await supabase
      .from('device_models')
      .insert({
        name,
        display_name: display_name || null,
        brand_id,
        model_year: model_year || null,
        screen_size: screen_size || null,
        color_options: color_options || null,
        storage_options: storage_options || null,
        is_active: is_active !== undefined ? is_active : true,
        is_featured: is_featured !== undefined ? is_featured : false,
        status: status || 'draft', // New models default to draft
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      apiLogger.error('Error creating model', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create model',
        error: error.message
      });
    }

    apiLogger.info('Successfully created model', { id: model.id });

    return res.status(201).json({
      success: true,
      model,
      message: 'Model created successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create model'
    });
  }
}

async function handleUpdate(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { id } = req.query;
    const { 
      name, 
      display_name, 
      brand_id, 
      model_year, 
      screen_size, 
      color_options, 
      storage_options, 
      is_active, 
      is_featured,
      status,
      sort_order 
    } = req.body;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Model ID is required'
      });
    }

    apiLogger.info('Updating model', { id });

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (brand_id !== undefined) updateData.brand_id = brand_id;
    if (model_year !== undefined) updateData.model_year = model_year;
    if (screen_size !== undefined) updateData.screen_size = screen_size;
    if (color_options !== undefined) updateData.color_options = color_options;
    if (storage_options !== undefined) updateData.storage_options = storage_options;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (status !== undefined) updateData.status = status;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    const { data: model, error } = await supabase
      .from('device_models')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      apiLogger.error('Error updating model', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update model',
        error: error.message
      });
    }

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    apiLogger.info('Successfully updated model', { id });

    return res.status(200).json({
      success: true,
      model,
      message: 'Model updated successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleUpdate', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update model'
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { id } = req.query;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Model ID is required'
      });
    }

    apiLogger.info('Deleting model', { id });

    // Check if model has associated pricing entries
    const { data: pricingCount, error: countError } = await supabase
      .from('dynamic_pricing')
      .select('id', { count: 'exact', head: true })
      .eq('model_id', id);

    if (countError) {
      apiLogger.error('Error checking pricing entries', { error: countError });
    }

    // Soft delete by archiving instead of hard delete if it has pricing
    if (pricingCount && pricingCount.length > 0) {
      apiLogger.info('Model has pricing entries, archiving instead of deleting', { id });
      
      const { error: updateError } = await supabase
        .from('device_models')
        .update({ status: 'archived', is_active: false })
        .eq('id', id);

      if (updateError) {
        apiLogger.error('Error archiving model', { error: updateError });
        return res.status(500).json({
          success: false,
          message: 'Failed to archive model',
          error: updateError.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Model archived successfully (has existing pricing entries)'
      });
    }

    // Hard delete if no pricing entries
    const { error } = await supabase
      .from('device_models')
      .delete()
      .eq('id', id);

    if (error) {
      apiLogger.error('Error deleting model', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete model',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted model', { id });

    return res.status(200).json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete model'
    });
  }
}
