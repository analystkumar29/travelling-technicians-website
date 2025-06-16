import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('api/devices/models');

interface Model {
  id: number;
  name: string;
  brand_id: number;
  brand_name?: string;
  device_type: string;
  model_year?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
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
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { deviceType, brand } = req.query;

    // Validate required parameters
    if (!deviceType || !brand) {
      apiLogger.warn('Missing required parameters', { deviceType, brand });
      return res.status(400).json({
        success: false,
        message: 'Both deviceType and brand parameters are required'
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

    apiLogger.info('Fetching models', { deviceType, brand });

    // Get Supabase client
    const supabase = getServiceSupabase();

    // First, check if the dynamic tables exist
    const { data: tablesExist, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['brands', 'models']);

    if (tableCheckError || !tablesExist || tablesExist.length === 0) {
      // Tables don't exist yet, return fallback static data
      apiLogger.info('Dynamic tables not found, using fallback static data');
      const staticModels = getStaticModels(deviceType as string, brand as string);
      
      return res.status(200).json({
        success: true,
        models: staticModels.map((name, index) => ({
          id: index + 1,
          name,
          brand_id: 1,
          brand_name: brand as string,
          device_type: deviceType as string,
          is_active: true,
          sort_order: index,
          created_at: new Date().toISOString()
        }))
      });
    }

    // Try to fetch from dynamic tables
    try {
      // Join brands and models tables to get models for specific brand and device type
      const { data: models, error: modelsError } = await supabase
        .from('models')
        .select(`
          id,
          name,
          brand_id,
          model_year,
          is_active,
          sort_order,
          created_at,
          brands!inner(
            name,
            device_type
          )
        `)
        .eq('brands.device_type', deviceType)
        .eq('brands.name', brand)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (modelsError) {
        throw modelsError;
      }

      // Transform the data to match our interface
      const transformedModels = (models || []).map((model: any) => ({
        id: model.id,
        name: model.name,
        brand_id: model.brand_id,
        brand_name: model.brands?.name,
        device_type: model.brands?.device_type,
        model_year: model.model_year,
        is_active: model.is_active,
        sort_order: model.sort_order,
        created_at: model.created_at
      }));

      apiLogger.info('Successfully fetched models from database', { 
        count: transformedModels.length,
        deviceType,
        brand 
      });

      return res.status(200).json({
        success: true,
        models: transformedModels
      });

    } catch (dbError) {
      // Database query failed, use fallback static data
      apiLogger.warn('Database query failed, using fallback static data', { error: dbError });
      
      const staticModels = getStaticModels(deviceType as string, brand as string);
      
      return res.status(200).json({
        success: true,
        models: staticModels.map((name, index) => ({
          id: index + 1,
          name,
          brand_id: 1,
          brand_name: brand as string,
          device_type: deviceType as string,
          is_active: true,
          sort_order: index,
          created_at: new Date().toISOString()
        }))
      });
    }

  } catch (error) {
    apiLogger.error('Unexpected error in models API', { error });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch device models'
    });
  }
}

// Fallback static data (same as before, but as a function)
function getStaticModels(deviceType: string, brand: string): string[] {
  const deviceModels: Record<string, Record<string, string[]>> = {
    mobile: {
      apple: [
        'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
        'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
        'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 Mini',
        'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 Mini',
        'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
        'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
        'iPhone 8 Plus', 'iPhone 8', 'iPhone 7 Plus', 'iPhone 7',
        'iPhone SE (3rd Gen)', 'iPhone SE (2nd Gen)', 'iPhone SE'
      ],
      samsung: [
        'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
        'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
        'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy S21 FE',
        'Galaxy S20 Ultra', 'Galaxy S20+', 'Galaxy S20', 'Galaxy S20 FE',
        'Galaxy Note 20 Ultra', 'Galaxy Note 20',
        'Galaxy Note 10+', 'Galaxy Note 10',
        'Galaxy Z Fold 5', 'Galaxy Z Fold 4', 'Galaxy Z Fold 3',
        'Galaxy Z Flip 5', 'Galaxy Z Flip 4', 'Galaxy Z Flip 3',
        'Galaxy A54', 'Galaxy A53', 'Galaxy A52', 'Galaxy A51',
        'Galaxy A34', 'Galaxy A33', 'Galaxy A32',
        'Galaxy A24', 'Galaxy A23', 'Galaxy A22'
      ],
      google: [
        'Pixel 8 Pro', 'Pixel 8', 
        'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
        'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a',
        'Pixel 5', 'Pixel 5a',
        'Pixel 4 XL', 'Pixel 4', 'Pixel 4a',
        'Pixel 3 XL', 'Pixel 3', 'Pixel 3a'
      ],
      oneplus: [
        'OnePlus 11', 'OnePlus 10 Pro', 'OnePlus 10T',
        'OnePlus 9 Pro', 'OnePlus 9', 'OnePlus 9R',
        'OnePlus 8 Pro', 'OnePlus 8', 'OnePlus 8T',
        'OnePlus 7 Pro', 'OnePlus 7', 'OnePlus 7T',
        'OnePlus Nord 3', 'OnePlus Nord 2', 'OnePlus Nord'
      ],
      xiaomi: [
        'Xiaomi 13 Pro', 'Xiaomi 13', 'Xiaomi 12 Pro', 'Xiaomi 12',
        'Xiaomi 11 Ultra', 'Xiaomi 11', 'Xiaomi 11T Pro', 'Xiaomi 11T',
        'Redmi Note 12 Pro+', 'Redmi Note 12 Pro', 'Redmi Note 12',
        'Redmi Note 11 Pro+', 'Redmi Note 11 Pro', 'Redmi Note 11',
        'POCO F5 Pro', 'POCO F5', 'POCO F4', 'POCO F3'
      ]
    },
    laptop: {
      apple: [
        'MacBook Pro 16" (M3 Pro/Max)', 'MacBook Pro 14" (M3 Pro/Max)', 'MacBook Pro 13" (M3)',
        'MacBook Pro 16" (M2 Pro/Max)', 'MacBook Pro 14" (M2 Pro/Max)', 'MacBook Pro 13" (M2)',
        'MacBook Pro 16" (M1 Pro/Max)', 'MacBook Pro 14" (M1 Pro/Max)', 'MacBook Pro 13" (M1)',
        'MacBook Pro 16" (2019)', 'MacBook Pro 15" (2019)', 'MacBook Pro 13" (2020)',
        'MacBook Air 15" (M3)', 'MacBook Air 13" (M3)',
        'MacBook Air 13" (M2)', 'MacBook Air 13" (M1)',
        'MacBook Air 13" (2020)', 'MacBook Air 13" (2019)'
      ],
      dell: [
        'XPS 17 (2023)', 'XPS 15 (2023)', 'XPS 13 (2023)', 'XPS 13 Plus (2023)',
        'XPS 17 (2022)', 'XPS 15 (2022)', 'XPS 13 (2022)', 'XPS 13 Plus (2022)',
        'Inspiron 16 Plus', 'Inspiron 16', 'Inspiron 15', 'Inspiron 14',
        'Latitude 9430', 'Latitude 7430', 'Latitude 5430', 'Latitude 3430',
        'Precision 7780', 'Precision 5680', 'Precision 3480'
      ],
      hp: [
        'Spectre x360 16', 'Spectre x360 14', 'Spectre x360 13',
        'Envy x360 15', 'Envy x360 14', 'Envy x360 13',
        'EliteBook 1040', 'EliteBook 840', 'EliteBook 640',
        'Pavilion 15', 'Pavilion 14', 'Pavilion x360',
        'Omen 17', 'Omen 16', 'Omen 15',
        'ZBook Fury 17', 'ZBook Fury 16', 'ZBook Power'
      ],
      lenovo: [
        'ThinkPad X1 Carbon Gen 11', 'ThinkPad X1 Yoga Gen 8', 'ThinkPad X1 Nano Gen 3',
        'ThinkPad T14s Gen 4', 'ThinkPad T14 Gen 4', 'ThinkPad T16 Gen 2',
        'ThinkPad P1 Gen 6', 'ThinkPad P16 Gen 1', 'ThinkPad P15 Gen 2',
        'Yoga 9i Gen 8', 'Yoga 7i Gen 8', 'Yoga 6 Gen 8',
        'IdeaPad Slim 7', 'IdeaPad Slim 5', 'IdeaPad Flex 5',
        'Legion 7 Gen 8', 'Legion 5 Pro Gen 8', 'Legion 5 Gen 8'
      ],
      asus: [
        'ZenBook Pro 16X', 'ZenBook Pro 14', 'ZenBook 14X',
        'ROG Zephyrus G16', 'ROG Zephyrus G14', 'ROG Strix Scar 17',
        'ROG Flow X16', 'ROG Flow X13', 'ROG Flow Z13',
        'TUF Gaming A17', 'TUF Gaming A15', 'TUF Gaming F15',
        'VivoBook Pro 16X', 'VivoBook Pro 15', 'VivoBook S15',
        'ExpertBook B9', 'ExpertBook B7', 'ExpertBook B5'
      ]
    },
    tablet: {
      apple: [
        'iPad Pro 12.9" (M2)', 'iPad Pro 11" (M2)',
        'iPad Air (5th Gen)', 'iPad Air (4th Gen)',
        'iPad (10th Gen)', 'iPad (9th Gen)',
        'iPad Mini (6th Gen)', 'iPad Mini (5th Gen)'
      ],
      samsung: [
        'Galaxy Tab S9 Ultra', 'Galaxy Tab S9+', 'Galaxy Tab S9',
        'Galaxy Tab S8 Ultra', 'Galaxy Tab S8+', 'Galaxy Tab S8',
        'Galaxy Tab S7+', 'Galaxy Tab S7',
        'Galaxy Tab A9+', 'Galaxy Tab A9', 'Galaxy Tab A8', 'Galaxy Tab A7'
      ],
      microsoft: [
        'Surface Pro 9', 'Surface Pro 8', 'Surface Pro 7+', 'Surface Pro 7',
        'Surface Pro X', 'Surface Go 3', 'Surface Go 2'
      ],
      lenovo: [
        'Tab P12 Pro', 'Tab P11 Pro Gen 2', 'Tab P11 Pro',
        'Tab P11 (2nd Gen)', 'Tab P11',
        'Tab M10 Plus Gen 3', 'Tab M10 FHD Plus',
        'Yoga Tab 13', 'Yoga Tab 11'
      ]
    }
  };

  try {
    const normalizedDeviceType = deviceType.toLowerCase();
    const normalizedBrand = brand.toLowerCase();
    
    const deviceTypeModels = deviceModels[normalizedDeviceType];
    if (!deviceTypeModels) {
      return [];
    }
    
    const brandModels = deviceTypeModels[normalizedBrand];
    if (!brandModels) {
      return [];
    }
    
    return brandModels;
  } catch (error) {
    console.error('Error getting static models:', error);
    return [];
  }
} 