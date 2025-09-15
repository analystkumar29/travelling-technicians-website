import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { withCache, generateCacheKey, CACHE_CONFIG } from '@/utils/apiCache';

// Create module logger
const apiLogger = logger.createModuleLogger('api/devices/brands');

interface Brand {
  id: number;
  name: string;
  device_type: string;
  logo_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  brands?: Brand[];
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  // Set Cache-Control headers for 1 hour
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
  res.setHeader('Vary', 'Accept-Encoding');

  try {
    const { deviceType } = req.query;

    // Validate required parameters
    if (!deviceType) {
      apiLogger.warn('Missing deviceType parameter');
      return res.status(400).json({
        success: false,
        message: 'deviceType parameter is required'
      });
    }

    // Validate device type
    const validDeviceTypes = ['mobile', 'laptop', 'tablet'];
    if (!validDeviceTypes.includes(deviceType as string)) {
      apiLogger.warn('Invalid device type', { deviceType });
      return res.status(400).json({
        success: false,
        message: 'Invalid device type. Must be one of: mobile, laptop, tablet'
      });
    }

    apiLogger.info('Fetching brands', { deviceType });

    // Generate cache key
    const cacheKey = generateCacheKey('brands', { deviceType }, {
      prefix: CACHE_CONFIG.DEVICES_BRANDS.keyPrefix,
      normalize: true
    });

    // Use cached data if available
    const brands = await withCache(
      cacheKey,
      async () => {
        return await fetchBrandsFromDatabase(deviceType as string);
      },
      'DEVICES_BRANDS'
    );

    return res.status(200).json({
      success: true,
      brands
    });

  } catch (error) {
    apiLogger.error('Unexpected error in brands API', { error });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch device brands'
    });
  }
}

// Database fetching logic
async function fetchBrandsFromDatabase(deviceType: string): Promise<Brand[]> {
  const supabase = getServiceSupabase();

  // First, check if the dynamic brands table exists
  const { data: tablesExist, error: tableCheckError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'brands');

  if (tableCheckError || !tablesExist || tablesExist.length === 0) {
    // Tables don't exist yet, return fallback static data
    apiLogger.info('Dynamic brands table not found, using fallback static data');
    const staticBrands = getStaticBrands(deviceType);
    
    return staticBrands.map((name, index) => ({
      id: index + 1,
      name,
      device_type: deviceType,
      is_active: true,
      sort_order: index,
      created_at: new Date().toISOString()
    }));
  }

  // Try to fetch from dynamic tables
  try {
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select(`
        id,
        name,
        display_name,
        logo_url,
        website_url,
        is_active,
        sort_order,
        created_at,
        updated_at,
        device_types!inner(
          id,
          name,
          display_name
        )
      `)
      .eq('device_types.name', deviceType)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (brandsError) {
      throw brandsError;
    }

    apiLogger.info('Successfully fetched brands from database', { 
      count: brands?.length || 0,
      deviceType 
    });

    // Transform the data to match the Brand interface
    const transformedBrands: Brand[] = (brands || []).map(brand => ({
      id: brand.id,
      name: brand.display_name || brand.name,
      device_type: brand.device_types[0]?.name || deviceType,
      logo_url: brand.logo_url,
      is_active: brand.is_active,
      sort_order: brand.sort_order,
      created_at: brand.created_at
    }));

    return transformedBrands;

  } catch (dbError) {
    // Database query failed, use fallback static data
    apiLogger.warn('Database query failed, using fallback static data', { error: dbError });
    
    const staticBrands = getStaticBrands(deviceType);
    
    return staticBrands.map((name, index) => ({
      id: index + 1,
      name,
      device_type: deviceType,
      is_active: true,
      sort_order: index,
      created_at: new Date().toISOString()
    }));
  }
}

// Fallback static data for brands
function getStaticBrands(deviceType: string): string[] {
  const deviceBrands: Record<string, string[]> = {
    mobile: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Other'],
    laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Other'],
    tablet: ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Other']
  };

  const normalizedDeviceType = deviceType.toLowerCase();
  return deviceBrands[normalizedDeviceType] || [];
} 