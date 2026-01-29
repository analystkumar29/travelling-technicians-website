import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/models');

interface Model {
  id?: string;
  name: string;
  slug: string;
  brand_id: string;
  type_id: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  device_type?: {
    id: string;
    name: string;
    slug: string;
  };
  release_year?: number;
  image_url?: string;
  is_active: boolean;
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
        brands(
          id,
          name,
          slug
        ),
        device_types(
          id,
          name,
          slug
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      apiLogger.error('Error fetching models', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch models',
        error: error.message
      });
    }

    // Transform the data to include brand and device_type information
    const transformedModels = (models || []).map((model: any) => ({
      ...model,
      brand: model.brands ? {
        id: model.brands.id,
        name: model.brands.name,
        slug: model.brands.slug
      } : null,
      device_type: model.device_types ? {
        id: model.device_types.id,
        name: model.device_types.name,
        slug: model.device_types.slug
      } : null
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
      slug, 
      brand_id, 
      type_id,
      release_year, 
      image_url, 
      is_active
    } = req.body;

    // Validate required fields
    if (!name || !slug || !brand_id || !type_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, slug, brand_id, and type_id are required'
      });
    }

    apiLogger.info('Creating model', { name, slug, brand_id, type_id });

    const { data: model, error } = await supabase
      .from('device_models')
      .insert({
        name,
        slug,
        brand_id,
        type_id,
        release_year: release_year || null,
        image_url: image_url || null,
        is_active: is_active !== undefined ? is_active : true
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
