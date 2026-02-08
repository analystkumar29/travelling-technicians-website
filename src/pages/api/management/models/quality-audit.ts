import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireAdminAuth } from '@/middleware/adminAuth';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/models/quality-audit');

// Contamination patterns to detect
const CONTAMINATION_PATTERNS = [
  // Technical codes
  /QV\d+/i,
  /\bV\d+\b/i,
  /CE\d+/i,
  /\bT\d+\b/i,
  
  // Quality indicators that shouldn't be in model names
  /\b(Premium|Standard|Economy|Compatible|Assembly|Aftermarket|OEM|Original)\b/i,
  
  // Part descriptors
  /\b(LCD|OLED|Screen|Display|Battery|Assembly|Replacement)\b/i,
  
  // Google part numbers
  /35[GH]00\d{3}/,
  
  // Just numbers or single letters
  /^\d+$/,
  /^[A-Z]$/i,
  
  // Year in parentheses
  /\(\d{4}\)/,
  
  // Version indicators
  /\(Version\s*\d+\)/i,
  
  // Frame indicators
  /\((With|Without)\s*Frame\)/i,
  
  // IC Transfer
  /IC\s*Transfer/i
];

interface ContaminatedModel {
  id: number;
  name: string;
  brand_name: string;
  device_type: string;
  quality_score: number;
  data_source: string;
  contamination_reasons: string[];
}

interface ApiResponse {
  success: boolean;
  contaminated_models?: ContaminatedModel[];
  stats?: {
    total_models: number;
    contaminated_count: number;
    clean_count: number;
    contamination_rate: string;
  };
  message?: string;
  error?: string;
}

function detectContamination(modelName: string): string[] {
  const reasons: string[] = [];
  
  CONTAMINATION_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(modelName)) {
      const patternName = [
        'Technical code (QV#)',
        'Version code (V#)',
        'CE code',
        'T code',
        'Quality indicator',
        'Part descriptor',
        'Google part number',
        'Just numbers',
        'Single letter',
        'Year in parentheses',
        'Version indicator',
        'Frame indicator',
        'IC Transfer'
      ][index] || 'Unknown pattern';
      
      reasons.push(patternName);
    }
  });
  
  return reasons;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const supabase = getServiceSupabase();

  try {
    // Fetch all active models
    const { data: models, error: modelsError } = await supabase
      .from('device_models')
      .select(`
        id,
        name,
        quality_score,
        data_source,
        needs_review,
        brands (
          name,
          device_types (
            name
          )
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (modelsError) {
      apiLogger.error('Error fetching models', { error: modelsError });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch models',
        error: modelsError.message
      });
    }

    const contaminatedModels: ContaminatedModel[] = [];
    let totalModels = 0;

    // Analyze each model
    (models || []).forEach((model: any) => {
      totalModels++;
      
      const contaminationReasons = detectContamination(model.name);
      
      if (contaminationReasons.length > 0) {
        contaminatedModels.push({
          id: model.id,
          name: model.name,
          brand_name: model.brands?.name || 'Unknown',
          device_type: model.brands?.device_types?.name || 'Unknown',
          quality_score: model.quality_score || 100,
          data_source: model.data_source || 'unknown',
          contamination_reasons: contaminationReasons
        });
      }
    });

    // If POST request, update the quality scores
    if (req.method === 'POST') {
      const { auto_update = false, threshold = 50 } = req.body;
      
      if (auto_update && contaminatedModels.length > 0) {
        const modelIdsToUpdate = contaminatedModels.map(m => m.id);
        
        const { error: updateError } = await supabase
          .from('device_models')
          .update({ 
            quality_score: threshold,
            needs_review: true,
            data_source: 'scraped'
          })
          .in('id', modelIdsToUpdate);

        if (updateError) {
          apiLogger.error('Error updating quality scores', { error: updateError });
          return res.status(500).json({
            success: false,
            message: 'Failed to update quality scores',
            error: updateError.message
          });
        }

        apiLogger.info('Updated quality scores for contaminated models', { count: modelIdsToUpdate.length });
      }
    }

    const stats = {
      total_models: totalModels,
      contaminated_count: contaminatedModels.length,
      clean_count: totalModels - contaminatedModels.length,
      contamination_rate: `${((contaminatedModels.length / totalModels) * 100).toFixed(1)}%`
    };

    apiLogger.info('Quality audit completed', stats);

    return res.status(200).json({
      success: true,
      contaminated_models: contaminatedModels,
      stats,
      message: req.method === 'POST' ? 'Quality audit completed and scores updated' : 'Quality audit completed'
    });

  } catch (error) {
    apiLogger.error('Unexpected error in quality audit', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to perform quality audit'
    });
  }
}

export default requireAdminAuth(handler);
