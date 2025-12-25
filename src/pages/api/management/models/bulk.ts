import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/models/bulk');

interface BulkApiResponse {
  success: boolean;
  updated?: number;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BulkApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const supabase = getServiceSupabase();
  const { action, modelIds } = req.body;

  try {
    if (!action || !modelIds || !Array.isArray(modelIds) || modelIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Action and modelIds array are required'
      });
    }

    apiLogger.info('Bulk operation requested', { action, count: modelIds.length });

    switch (action) {
      case 'publish':
        return await bulkPublish(modelIds, supabase, res);
      case 'archive':
        return await bulkArchive(modelIds, supabase, res);
      case 'delete':
        return await bulkDelete(modelIds, supabase, res);
      case 'activate':
        return await bulkActivate(modelIds, supabase, res);
      case 'deactivate':
        return await bulkDeactivate(modelIds, supabase, res);
      default:
        return res.status(400).json({
          success: false,
          message: `Unknown action: ${action}`
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in bulk models API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process bulk operation'
    });
  }
}

async function bulkPublish(modelIds: number[], supabase: any, res: NextApiResponse<BulkApiResponse>) {
  try {
    const { error, count } = await supabase
      .from('device_models')
      .update({ status: 'published', is_active: true })
      .in('id', modelIds);

    if (error) {
      apiLogger.error('Error bulk publishing models', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to publish models',
        error: error.message
      });
    }

    apiLogger.info('Successfully bulk published models', { count });

    return res.status(200).json({
      success: true,
      updated: modelIds.length,
      message: `Successfully published ${modelIds.length} model(s)`
    });
  } catch (error) {
    apiLogger.error('Error in bulkPublish', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to publish models'
    });
  }
}

async function bulkArchive(modelIds: number[], supabase: any, res: NextApiResponse<BulkApiResponse>) {
  try {
    const { error } = await supabase
      .from('device_models')
      .update({ status: 'archived', is_active: false })
      .in('id', modelIds);

    if (error) {
      apiLogger.error('Error bulk archiving models', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to archive models',
        error: error.message
      });
    }

    apiLogger.info('Successfully bulk archived models', { count: modelIds.length });

    return res.status(200).json({
      success: true,
      updated: modelIds.length,
      message: `Successfully archived ${modelIds.length} model(s)`
    });
  } catch (error) {
    apiLogger.error('Error in bulkArchive', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to archive models'
    });
  }
}

async function bulkDelete(modelIds: number[], supabase: any, res: NextApiResponse<BulkApiResponse>) {
  try {
    // Check which models have pricing entries
    const { data: modelsWithPricing, error: checkError } = await supabase
      .from('dynamic_pricing')
      .select('model_id')
      .in('model_id', modelIds);

    if (checkError) {
      apiLogger.error('Error checking pricing entries', { error: checkError });
    }

    const modelsWithPricingIds = new Set(modelsWithPricing?.map((p: any) => p.model_id) || []);
    const canDelete = modelIds.filter(id => !modelsWithPricingIds.has(id));
    const mustArchive = modelIds.filter(id => modelsWithPricingIds.has(id));

    let deletedCount = 0;
    let archivedCount = 0;

    // Delete models without pricing
    if (canDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('device_models')
        .delete()
        .in('id', canDelete);

      if (deleteError) {
        apiLogger.error('Error deleting models', { error: deleteError });
      } else {
        deletedCount = canDelete.length;
      }
    }

    // Archive models with pricing
    if (mustArchive.length > 0) {
      const { error: archiveError } = await supabase
        .from('device_models')
        .update({ status: 'archived', is_active: false })
        .in('id', mustArchive);

      if (archiveError) {
        apiLogger.error('Error archiving models with pricing', { error: archiveError });
      } else {
        archivedCount = mustArchive.length;
      }
    }

    apiLogger.info('Successfully bulk deleted/archived models', { 
      deleted: deletedCount, 
      archived: archivedCount 
    });

    let message = '';
    if (deletedCount > 0 && archivedCount > 0) {
      message = `Deleted ${deletedCount} model(s) and archived ${archivedCount} model(s) with existing pricing`;
    } else if (deletedCount > 0) {
      message = `Successfully deleted ${deletedCount} model(s)`;
    } else if (archivedCount > 0) {
      message = `Archived ${archivedCount} model(s) (have existing pricing entries)`;
    }

    return res.status(200).json({
      success: true,
      updated: deletedCount + archivedCount,
      message
    });
  } catch (error) {
    apiLogger.error('Error in bulkDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete models'
    });
  }
}

async function bulkActivate(modelIds: number[], supabase: any, res: NextApiResponse<BulkApiResponse>) {
  try {
    const { error } = await supabase
      .from('device_models')
      .update({ is_active: true })
      .in('id', modelIds);

    if (error) {
      apiLogger.error('Error bulk activating models', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to activate models',
        error: error.message
      });
    }

    apiLogger.info('Successfully bulk activated models', { count: modelIds.length });

    return res.status(200).json({
      success: true,
      updated: modelIds.length,
      message: `Successfully activated ${modelIds.length} model(s)`
    });
  } catch (error) {
    apiLogger.error('Error in bulkActivate', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to activate models'
    });
  }
}

async function bulkDeactivate(modelIds: number[], supabase: any, res: NextApiResponse<BulkApiResponse>) {
  try {
    const { error } = await supabase
      .from('device_models')
      .update({ is_active: false })
      .in('id', modelIds);

    if (error) {
      apiLogger.error('Error bulk deactivating models', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate models',
        error: error.message
      });
    }

    apiLogger.info('Successfully bulk deactivated models', { count: modelIds.length });

    return res.status(200).json({
      success: true,
      updated: modelIds.length,
      message: `Successfully deactivated ${modelIds.length} model(s)`
    });
  } catch (error) {
    apiLogger.error('Error in bulkDeactivate', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate models'
    });
  }
}
