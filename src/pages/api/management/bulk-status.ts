import { requireAdminAuth } from '@/middleware/adminAuth';
/**
 * Admin API: Bulk Dynamic Pricing Status Update
 * 
 * POST /api/management/bulk-status
 * Update is_active status for multiple pricing records at once
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { AdminApiResponse, isValidUUID } from '@/types/admin';

const apiLogger = logger.createModuleLogger('api/management/bulk-status');

type ApiResponse<T = any> = AdminApiResponse<T>;

export default requireAdminAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const supabase = getServiceSupabase();

  try {
    switch (req.method) {
      case 'POST':
        return await handlePost(req, res, supabase);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in bulk status API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
});

/**
 * POST /api/management/bulk-status
 * Bulk update is_active for multiple pricing records
 * 
 * Request body:
 * {
 *   ids: string[],           // Array of pricing record IDs
 *   is_active: boolean       // New status value
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   updated: number,         // Number of records updated
 *   message: string,
 *   failed?: Array<{ id: string, error: string }>  // Failed IDs if any
 * }
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { ids, is_active } = req.body;

    // Validate request body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ids must be a non-empty array of pricing record IDs'
      });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_active must be a boolean'
      });
    }

    // Validate all IDs
    const invalidIds = ids.filter(id => !isValidUUID(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format for: ${invalidIds.join(', ')}`
      });
    }

    // Limit bulk operations to 100 records for performance
    if (ids.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update more than 100 records at once. Please split into smaller batches.'
      });
    }

    apiLogger.info('Bulk updating pricing status', { 
      count: ids.length, 
      is_active,
      ids: ids.slice(0, 5) // Log first 5 IDs for debugging
    });

    // Update all records at once
    const { error } = await supabase
      .from('dynamic_pricing')
      .update({ is_active })
      .in('id', ids);

    if (error) {
      apiLogger.error('Error bulk updating pricing status', { error, ids });
      return res.status(500).json({
        success: false,
        message: 'Failed to update pricing records',
        error: error.message
      });
    }

    // Verify the update by fetching the count
    const { count: updatedCount, error: countError } = await supabase
      .from('dynamic_pricing')
      .select('*', { count: 'exact', head: true })
      .in('id', ids)
      .eq('is_active', is_active);

    if (countError) {
      apiLogger.warn('Could not verify update count', { countError });
      // Still report success since the update succeeded
      return res.status(200).json({
        success: true,
        updated: ids.length,
        message: `Successfully updated ${ids.length} pricing record(s) to ${is_active ? 'active' : 'inactive'}`
      } as any);
    }

    apiLogger.info('Successfully bulk updated pricing status', { 
      updated: updatedCount || ids.length,
      is_active 
    });

    return res.status(200).json({
      success: true,
      updated: updatedCount || ids.length,
      message: `Successfully updated ${updatedCount || ids.length} pricing record(s) to ${is_active ? 'active' : 'inactive'}`
    } as any);
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update pricing records'
    });
  }
}
