import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/review-queue/[id]');

interface ApiResponse {
  success: boolean;
  item?: any;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const supabase = getServiceSupabase();
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid review item ID'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, supabase, parseInt(id));
      case 'PATCH':
        return await handlePatch(req, res, supabase, parseInt(id));
      case 'DELETE':
        return await handleDelete(req, res, supabase, parseInt(id));
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in review queue item API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any, id: number) {
  try {
    apiLogger.info('Fetching review item', { id });

    const { data: item, error } = await supabase
      .from('review_queue')
      .select(`
        *,
        device_models:device_models!review_queue_record_id_fkey(name, quality_score),
        brands:brands!review_queue_record_id_fkey(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Review item not found'
        });
      }

      apiLogger.error('Error fetching review item', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch review item',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch review item'
    });
  }
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any, id: number) {
  try {
    const { action, notes, assigned_to } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }

    apiLogger.info('Updating review item', { id, action });

    let updateData: any = {};
    let recordAction: string = '';

    switch (action) {
      case 'approve':
        updateData = {
          status: 'approved',
          resolved_at: new Date().toISOString(),
          resolved_by: 'admin', // TODO: Get from session
          resolution_notes: notes
        };
        recordAction = 'approved';
        break;

      case 'reject':
        updateData = {
          status: 'rejected',
          resolved_at: new Date().toISOString(),
          resolved_by: 'admin', // TODO: Get from session
          resolution_notes: notes
        };
        recordAction = 'rejected';
        break;

      case 'assign':
        if (!assigned_to) {
          return res.status(400).json({
            success: false,
            message: 'assigned_to is required for assign action'
          });
        }
        updateData = {
          assigned_to,
          assigned_at: new Date().toISOString(),
          status: 'in_review'
        };
        recordAction = 'assigned';
        break;

      case 'escalate':
        updateData = {
          status: 'escalated',
          escalation_level: supabase.sql`escalation_level + 1`
        };
        recordAction = 'escalated';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    // Update the review item
    const { data: updatedItem, error } = await supabase
      .from('review_queue')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      apiLogger.error('Error updating review item', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update review item',
        error: error.message
      });
    }

    // If approved, apply the review decision to the original record
    if (action === 'approve' && updatedItem) {
      await applyReviewDecision(supabase, updatedItem);
    }

    apiLogger.info('Successfully updated review item', { id, action });

    return res.status(200).json({
      success: true,
      item: updatedItem,
      message: `Review item ${recordAction} successfully`
    });
  } catch (error) {
    apiLogger.error('Error in handlePatch', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update review item'
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any, id: number) {
  try {
    apiLogger.info('Deleting review item', { id });

    const { error } = await supabase
      .from('review_queue')
      .delete()
      .eq('id', id);

    if (error) {
      apiLogger.error('Error deleting review item', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete review item',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted review item', { id });

    return res.status(200).json({
      success: true,
      message: 'Review item deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review item'
    });
  }
}

async function applyReviewDecision(supabase: any, reviewItem: any) {
  try {
    apiLogger.info('Applying review decision', { 
      table: reviewItem.table_name, 
      recordId: reviewItem.record_id,
      type: reviewItem.review_type 
    });

    if (reviewItem.table_name === 'device_models' && reviewItem.review_type === 'quality_check') {
      // Update the model to mark it as reviewed and approved
      await supabase
        .from('device_models')
        .update({
          needs_review: false,
          quality_score: Math.max(80, reviewItem.review_data?.suggested_quality_score || 80),
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewItem.resolved_by
        })
        .eq('id', reviewItem.record_id);

      // Update data lineage
      await supabase
        .from('data_lineage')
        .upsert({
          table_name: 'device_models',
          record_id: reviewItem.record_id,
          validation_status: 'validated',
          validated_by: reviewItem.resolved_by,
          validated_at: new Date().toISOString()
        }, {
          onConflict: 'table_name,record_id'
        });
    }

    apiLogger.info('Successfully applied review decision');
  } catch (error) {
    apiLogger.error('Error applying review decision', { error });
    // Don't throw error here to avoid breaking the main flow
  }
}
