import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';

interface Model {
  id: number;
  name: string;
  display_name: string;
  brand_id: number;
  brand_name?: string;
  device_type: string;
  model_year?: number;
  is_active: boolean;
  is_featured?: boolean;
  sort_order: number;
  created_at: string;
  quality_score?: number;
  needs_review?: boolean;
  data_source?: string;
}

interface ApiResponse {
  success: boolean;
  models?: Model[];
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { deviceType, brand } = req.query;

    // Validate required parameters
    if (!deviceType || !brand) {
      return res.status(400).json({
        success: false,
        message: 'Both deviceType and brand parameters are required'
      });
    }

    // Validate device type
    const validDeviceTypes = ['mobile', 'laptop', 'tablet'];
    if (!validDeviceTypes.includes(deviceType as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device type. Must be one of: mobile, laptop, tablet'
      });
    }

    console.log('Fetching models for:', { deviceType, brand });

    const supabase = getServiceSupabase();

    // Step 1: Get device type ID
    const { data: deviceTypeData, error: deviceTypeError } = await supabase
      .from('device_types')
      .select('id')
      .eq('name', deviceType)
      .single();

    if (deviceTypeError || !deviceTypeData) {
      console.error('Device type not found:', deviceType, deviceTypeError);
      return res.status(404).json({
        success: false,
        message: `Device type not found: ${deviceType}`
      });
    }

    // Step 2: Get brand ID
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('id, name, display_name')
      .eq('device_type_id', deviceTypeData.id)
      .ilike('name', `%${brand}%`)
      .limit(1);

    if (brandError || !brandData || brandData.length === 0) {
      console.error('Brand not found:', brand, brandError);
      // Return empty array instead of error to allow fallback
      return res.status(200).json({
        success: true,
        models: []
      });
    }

    const selectedBrand = brandData[0];

    // Step 3: Get models for this brand
    const { data: models, error: modelsError } = await supabase
      .from('device_models')
      .select(`
        id,
        name,
        display_name,
        brand_id,
        model_year,
        is_active,
        is_featured,
        sort_order,
        created_at,
        quality_score,
        needs_review,
        data_source
      `)
      .eq('brand_id', selectedBrand.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (modelsError) {
      console.error('Models query error:', modelsError);
      throw modelsError;
    }

    // Transform and filter the data
    const transformedModels = (models || [])
      .filter(model => {
        // Filter by quality score and review status
        const qualityOk = !model.quality_score || model.quality_score >= 70;
        const reviewOk = !model.needs_review || model.needs_review === false;
        return qualityOk && reviewOk;
      })
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        display_name: model.display_name || model.name,
        brand_id: model.brand_id,
        brand_name: selectedBrand.name,
        device_type: deviceType as string,
        model_year: model.model_year,
        is_active: model.is_active,
        is_featured: model.is_featured || false,
        sort_order: model.sort_order || 0,
        created_at: model.created_at,
        quality_score: model.quality_score,
        needs_review: model.needs_review,
        data_source: model.data_source
      }));

    console.log(`Found ${transformedModels.length} models for ${brand} ${deviceType}`);

    return res.status(200).json({
      success: true,
      models: transformedModels
    });

  } catch (error) {
    console.error('API error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch device models'
    });
  }
}
