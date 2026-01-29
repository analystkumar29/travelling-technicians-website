import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';

// Intelligent sorting functions for device models
function extractModelNumber(modelName: string): number {
  // For iPhone: Extract main number (15, 14, 13, etc.)
  const iPhoneMatch = modelName.match(/iPhone\s+(\d+)/i);
  if (iPhoneMatch) {
    return parseInt(iPhoneMatch[1]);
  }
  
  // For Galaxy S series: Extract S number (S23, S22, S21, etc.)
  const galaxySMatch = modelName.match(/Galaxy\s+S(\d+)/i);
  if (galaxySMatch) {
    // Add 1000 to S series to prioritize over A series
    return 1000 + parseInt(galaxySMatch[1]);
  }
  
  // For Galaxy Note: Extract Note number
  const galaxyNoteMatch = modelName.match(/Galaxy\s+Note\s+(\d+)/i);
  if (galaxyNoteMatch) {
    // Add 1000 to Note series to prioritize over A series
    return 1000 + parseInt(galaxyNoteMatch[1]);
  }
  
  // For Galaxy A series: Extract A number (A53, A01, etc.)
  const galaxyAMatch = modelName.match(/Galaxy\s+A(\d+)/i);
  if (galaxyAMatch) {
    return parseInt(galaxyAMatch[1]);
  }
  
  // For iPhone with letters (XS, XR, etc.) - assign approximate values
  if (modelName.includes('iPhone X') && !modelName.includes('XS') && !modelName.includes('XR')) {
    return 10; // iPhone X = ~iPhone 10
  }
  if (modelName.includes('iPhone XS')) {
    return 10.5; // iPhone XS = ~iPhone 10.5
  }
  if (modelName.includes('iPhone XR')) {
    return 10.3; // iPhone XR = ~iPhone 10.3
  }
  
  // For Pixel phones
  const pixelMatch = modelName.match(/Pixel\s+(\d+)/i);
  if (pixelMatch) {
    return parseInt(pixelMatch[1]);
  }
  
  // For OnePlus
  const onePlusMatch = modelName.match(/OnePlus\s+(\d+)/i);
  if (onePlusMatch) {
    return parseInt(onePlusMatch[1]);
  }
  
  // For iPad
  const iPadMatch = modelName.match(/iPad\s+(\d+)/i);
  if (iPadMatch) {
    return parseInt(iPadMatch[1]);
  }
  
  // For MacBook
  const macBookMatch = modelName.match(/MacBook.*(\d{4})/i); // Year like 2023, 2022
  if (macBookMatch) {
    return parseInt(macBookMatch[1]);
  }
  
  return 0; // Unknown models get lowest priority
}

function getVariantPriority(modelName: string): number {
  const name = modelName.toLowerCase();
  if (name.includes('pro max')) return 5;
  if (name.includes('ultra')) return 5;
  if (name.includes('pro')) return 4;
  if (name.includes('plus')) return 3;
  if (name.includes('max') && !name.includes('pro max')) return 3;
  if (name.includes('mini')) return 1;
  return 2; // base model
}

function deduplicateModels(models: Model[]): Model[] {
  const seen = new Map<string, Model>();
  
  models.forEach(model => {
    // Create a normalized key for comparison (lowercase, trimmed, standardized spacing)
    const normalizedKey = model.name.toLowerCase().trim().replace(/\s+/g, ' ');
    
    if (!seen.has(normalizedKey)) {
      // First occurrence - keep it
      seen.set(normalizedKey, model);
    } else {
      // Duplicate found - prefer by lower ID (first added)
      const existing = seen.get(normalizedKey)!;
      
      // Preference logic:
      // 1. Proper capitalization (has uppercase letters)
      // 2. Lower ID (likely added first/manually)
      
      const shouldReplace = (
        // Prefer proper capitalization
        (/[A-Z]/.test(model.name) && !/[A-Z]/.test(existing.name)) ||
        
        // If same capitalization, prefer lower ID
        (/[A-Z]/.test(model.name) === /[A-Z]/.test(existing.name) &&
         model.id < existing.id)
      );
      
      if (shouldReplace) {
        seen.set(normalizedKey, model);
      }
    }
  });
  
  return Array.from(seen.values());
}

function smartSortModels(models: Model[]): Model[] {
  return models.sort((a, b) => {
    const aNumber = extractModelNumber(a.name);
    const bNumber = extractModelNumber(b.name);

    // First, sort by model number (descending - newest first)
    if (aNumber !== bNumber) {
      return bNumber - aNumber;
    }

    // If same model number, sort by variant priority (Pro Max first)
    const aVariant = getVariantPriority(a.name);
    const bVariant = getVariantPriority(b.name);

    if (aVariant !== bVariant) {
      return bVariant - aVariant;
    }

    // If same priority, sort alphabetically
    return a.name.localeCompare(b.name);
  });
}

interface Model {
  id: string;
  name: string;
  brand_id: string;
  brand_name?: string;
  device_type: string;
  release_year?: number;
  image_url?: string;
  is_active: boolean;
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

    // Step 1: Get device type ID (case-insensitive search)
    const { data: deviceTypeData, error: deviceTypeError } = await supabase
      .from('device_types')
      .select('id')
      .ilike('name', deviceType as string)
      .single();

    if (deviceTypeError || !deviceTypeData) {
      console.error('Device type not found:', deviceType, deviceTypeError);
      return res.status(404).json({
        success: false,
        message: `Device type not found: ${deviceType}`
      });
    }

    // Step 2: Get brand ID (removed invalid device_type_id filter)
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('id, name')
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

    // Step 3: Get models for this brand (updated to match actual schema columns)
    const { data: models, error: modelsError } = await supabase
      .from('device_models')
      .select(`
        id,
        name,
        brand_id,
        release_year,
        image_url,
        is_active,
        created_at
      `)
      .eq('brand_id', selectedBrand.id)
      .eq('type_id', deviceTypeData.id)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (modelsError) {
      console.error('Models query error:', modelsError);
      throw modelsError;
    }

    // Transform the data
    const transformedModels = (models || []).map((model: any) => ({
      id: model.id,
      name: model.name,
      brand_id: model.brand_id,
      brand_name: selectedBrand.name,
      device_type: deviceType as string,
      release_year: model.release_year,
      image_url: model.image_url,
      is_active: model.is_active,
      created_at: model.created_at
    }));

    // Apply deduplication to remove duplicate model names
    const deduplicatedModels = deduplicateModels(transformedModels);
    
    // Apply intelligent sorting (latest models first)
    const sortedModels = smartSortModels(deduplicatedModels);

    console.log(`Found ${transformedModels.length} models, deduplicated to ${deduplicatedModels.length}, final sorted: ${sortedModels.length} for ${brand} ${deviceType}`);

    return res.status(200).json({
      success: true,
      models: sortedModels
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
