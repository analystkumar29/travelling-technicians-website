import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/admin/models');

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
    const transformedModels = (models || []).map(model => ({
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