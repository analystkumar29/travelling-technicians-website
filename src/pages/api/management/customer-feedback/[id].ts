import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/customer-feedback/[id]');

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
      message: 'Invalid feedback ID'
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
    apiLogger.error('Unexpected error in customer feedback item API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any, id: number) {
  try {
    apiLogger.info('Fetching customer feedback item', { id });

    const { data: item, error } = await supabase
      .from('customer_feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Customer feedback not found'
        });
      }

      apiLogger.error('Error fetching customer feedback item', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch customer feedback',
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
      message: 'Failed to fetch customer feedback'
    });
  }
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any, id: number) {
  try {
    const { action, review_notes, action_taken } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }

    apiLogger.info('Updating customer feedback', { id, action });

    let updateData: any = {
      reviewed_by: 'admin', // TODO: Get from session
      reviewed_at: new Date().toISOString(),
      review_notes,
      updated_at: new Date().toISOString()
    };

    switch (action) {
      case 'confirm':
        updateData.status = 'confirmed';
        break;
      case 'reject':
        updateData.status = 'rejected';
        break;
      case 'resolve':
        updateData.status = 'resolved';
        updateData.action_taken = action_taken;
        break;
      case 'start_review':
        updateData.status = 'reviewing';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const { data: updatedItem, error } = await supabase
      .from('customer_feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      apiLogger.error('Error updating customer feedback', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update customer feedback',
        error: error.message
      });
    }

    // If feedback is confirmed and relates to a specific record, 
    // we might want to flag that record for review
    if (action === 'confirm' && updatedItem.subject_table && updatedItem.subject_record_id) {
      try {
        // Check if this subject already has a review queue entry
        const { data: existingReview } = await supabase
          .from('review_queue')
          .select('id')
          .eq('table_name', updatedItem.subject_table)
          .eq('record_id', updatedItem.subject_record_id)
          .eq('review_type', 'customer_feedback')
          .in('status', ['pending', 'in_review'])
          .maybeSingle();

        if (!existingReview) {
          await supabase
            .from('review_queue')
            .insert({
              table_name: updatedItem.subject_table,
              record_id: updatedItem.subject_record_id,
              review_type: 'customer_feedback',
              priority: updatedItem.severity_reported === 'critical' ? 'critical' : 
                       updatedItem.severity_reported === 'high' ? 'high' : 'normal',
              created_by: 'system',
              review_notes: `Confirmed customer feedback: ${updatedItem.feedback_type}`,
              review_data: {
                feedback_id: updatedItem.id,
                customer_email: updatedItem.customer_email,
                reported_issue: updatedItem.reported_issue
              }
            });
        }
      } catch (reviewError) {
        // Don't fail the main request if review queue creation fails
        apiLogger.warn('Failed to create review queue entry for confirmed feedback', { error: reviewError });
      }
    }

    apiLogger.info('Successfully updated customer feedback', { id, action });

    return res.status(200).json({
      success: true,
      item: updatedItem,
      message: `Feedback ${action}ed successfully`
    });
  } catch (error) {
    apiLogger.error('Error in handlePatch', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update customer feedback'
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any, id: number) {
  try {
    apiLogger.info('Deleting customer feedback', { id });

    const { error } = await supabase
      .from('customer_feedback')
      .delete()
      .eq('id', id);

    if (error) {
      apiLogger.error('Error deleting customer feedback', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete customer feedback',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted customer feedback', { id });

    return res.status(200).json({
      success: true,
      message: 'Customer feedback deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete customer feedback'
    });
  }
}
