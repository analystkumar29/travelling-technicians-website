import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/admin/brands');

interface Brand {
  id?: number;
  name: string;
  display_name: string;
  device_type_id: number;
  device_type?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  sort_order: number;
}

interface ApiResponse {
  success: boolean;
  brands?: Brand[];
  brand?: Brand;
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
    apiLogger.error('Unexpected error in brands API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    apiLogger.info('Fetching brands');

    const { data: brands, error } = await supabase
      .from('brands')
      .select(`
        *,
        device_types!inner(
          id,
          name,
          display_name
        )
      `)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      apiLogger.error('Error fetching brands', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch brands',
        error: error.message
      });
    }

    // Transform the data to include device_type name
    const transformedBrands = (brands || []).map((brand: any) => ({
      ...brand,
      device_type: brand.device_types?.display_name || brand.device_types?.name
    }));

    apiLogger.info('Successfully fetched brands', { count: transformedBrands.length });

    return res.status(200).json({
      success: true,
      brands: transformedBrands
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch brands'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { name, display_name, device_type_id, logo_url, website_url, is_active, sort_order } = req.body;

    // Validate required fields
    if (!name || !display_name || !device_type_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, display_name, and device_type_id are required'
      });
    }

    apiLogger.info('Creating brand', { name, display_name, device_type_id });

    const { data: brand, error } = await supabase
      .from('brands')
      .insert({
        name,
        display_name,
        device_type_id,
        logo_url: logo_url || null,
        website_url: website_url || null,
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      apiLogger.error('Error creating brand', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create brand',
        error: error.message
      });
    }

    apiLogger.info('Successfully created brand', { id: brand.id });

    return res.status(201).json({
      success: true,
      brand,
      message: 'Brand created successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create brand'
    });
  }
} 