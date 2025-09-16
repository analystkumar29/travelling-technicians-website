import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/review-queue/bulk');

interface BulkRequest {
  action: 'approve' | 'reject' | 'assign' | 'escalate';
  item_ids: number[];
  assigned_to?: string;
  notes?: string;
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
    const { action, item_ids, assigned_to, notes }: BulkRequest = req.body;

    // Validate required fields
    if (!action || !item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Action and item_ids array are required'
      });
    }

    // Validate item_ids are numbers
    if (!item_ids.every(id => typeof id === 'number')) {
      return res.status(400).json({
        success: false,
        message: 'All item_ids must be numbers'
      });
    }

    // Validate specific action requirements
    if (action === 'assign' && !assigned_to) {
      return res.status(400).json({
        success: false,
        message: 'assigned_to is required for assign action'
      });
    }

    apiLogger.info('Performing bulk review action', { action, count: item_ids.length });

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
          message: 'Invalid action. Must be one of: approve, reject, assign, escalate'
        });
    }

    // Perform bulk update
    const { data, error } = await supabase
      .from('review_queue')
      .update(updateData)
      .in('id', item_ids)
      .select();

    if (error) {
      apiLogger.error('Error performing bulk review action', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to perform bulk action',
        error: error.message
      });
    }

    const updatedCount = data?.length || 0;

    // If approving items, apply review decisions
    if (action === 'approve' && data) {
      await Promise.all(data.map(item => applyReviewDecision(supabase, item)));
    }

    apiLogger.info('Bulk review action completed', { action, updatedCount });

    return res.status(200).json({
      success: true,
      updated_count: updatedCount,
      message: `Successfully ${recordAction} ${updatedCount} review items`
    });

  } catch (error) {
    apiLogger.error('Unexpected error in bulk review action', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to perform bulk action'
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
