import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/models/bulk-operations');

interface BulkOperationRequest {
  operation: 'deactivate' | 'activate' | 'mark-for-review' | 'update-quality-score';
  model_ids: number[];
  quality_score?: number;
}

interface ApiResponse {
  success: boolean;
  updated_count?: number;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const supabase = getServiceSupabase();

  try {
    const { operation, model_ids, quality_score }: BulkOperationRequest = req.body;

    // Validate required fields
    if (!operation || !model_ids || !Array.isArray(model_ids) || model_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Operation and model_ids array are required'
      });
    }

    // Validate model_ids are numbers
    if (!model_ids.every(id => typeof id === 'number')) {
      return res.status(400).json({
        success: false,
        message: 'All model_ids must be numbers'
      });
    }

    apiLogger.info('Performing bulk operation', { operation, count: model_ids.length });

    let updateData: any = {};
    let queryBuilder = supabase.from('device_models');

    switch (operation) {
      case 'deactivate':
        updateData = { is_active: false };
        break;
      
      case 'activate':
        updateData = { is_active: true };
        break;
      
      case 'mark-for-review':
        updateData = { needs_review: true };
        break;
      
      case 'update-quality-score':
        if (quality_score === undefined || quality_score < 0 || quality_score > 100) {
          return res.status(400).json({
            success: false,
            message: 'quality_score must be between 0 and 100 for update-quality-score operation'
          });
        }
        updateData = { quality_score };
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation. Must be one of: deactivate, activate, mark-for-review, update-quality-score'
        });
    }

    // Perform bulk update
    const { data, error } = await queryBuilder
      .update(updateData)
      .in('id', model_ids)
      .select();

    if (error) {
      apiLogger.error('Error performing bulk operation', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to perform bulk operation',
        error: error.message
      });
    }

    const updatedCount = data?.length || 0;
    apiLogger.info('Bulk operation completed', { operation, updatedCount });

    return res.status(200).json({
      success: true,
      updated_count: updatedCount,
      message: `Successfully ${operation}d ${updatedCount} models`
    });

  } catch (error) {
    apiLogger.error('Unexpected error in bulk operations', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to perform bulk operation'
    });
  }
}
