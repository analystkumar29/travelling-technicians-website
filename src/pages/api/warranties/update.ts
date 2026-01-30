import { requireAdminAuth } from '@/middleware/adminAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('warranties/update');

export default requireAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { id, ...updateData } = req.body;

    apiLogger.info('Updating warranty', { id, updateFields: Object.keys(updateData) });

    if (!id) {
      apiLogger.warn('Missing warranty ID');
      return res.status(400).json({ 
        success: false, 
        message: 'Warranty ID is required'
      });
    }

    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
    // Update the warranty
    const { data, error } = await supabase
      .from('warranties')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      apiLogger.error('Error updating warranty', {
        id,
        error: error.message,
        code: error.code
      });
      
      return res.status(500).json({
        success: false,
        message: 'Database error',
        details: error.message
      });
    }
    
    if (!data || data.length === 0) {
      apiLogger.warn('Warranty not found', { id });
      return res.status(404).json({ 
        success: false,
        message: 'Warranty not found'
      });
    }
    
    apiLogger.info('Warranty updated successfully', { id });
    
    return res.status(200).json({
      success: true,
      message: 'Warranty updated successfully',
      warranty: data[0]
    });
  } catch (error) {
    apiLogger.error('Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) 