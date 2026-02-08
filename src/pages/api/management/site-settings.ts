/**
 * Admin API: Site Settings Management
 *
 * Handles CRUD operations for site_settings rows.
 * Each setting is a key/value pair with an optional description.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '@/middleware/adminAuth';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/site-settings');

export default requireAdminAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = getServiceSupabase();

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, supabase);
      case 'PUT':
        return await handlePut(req, res, supabase);
      case 'POST':
        return await handlePost(req, res, supabase);
      case 'DELETE':
        return await handleDelete(req, res, supabase);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in site-settings API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
});

/**
 * GET /api/management/site-settings
 *
 * Returns all site_settings rows ordered by key.
 */
async function handleGet(
  _req: NextApiRequest,
  res: NextApiResponse,
  supabase: any
) {
  try {
    apiLogger.info('Fetching site settings');

    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('id, key, value, description, created_at')
      .order('key', { ascending: true });

    if (error) {
      apiLogger.error('Error fetching site settings', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch site settings',
        error: error.message
      });
    }

    apiLogger.info('Successfully fetched site settings', {
      count: settings?.length || 0
    });

    return res.status(200).json({
      success: true,
      settings: settings || []
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch site settings'
    });
  }
}

/**
 * PUT /api/management/site-settings
 *
 * Upsert a setting by key.
 * Body: { key: string, value: string }
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any
) {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'key and value are required'
      });
    }

    apiLogger.info('Updating site setting', { key });

    const { data: setting, error } = await supabase
      .from('site_settings')
      .update({ value: String(value) })
      .eq('key', key)
      .select('id, key, value, description, created_at')
      .single();

    if (error) {
      apiLogger.error('Error updating site setting', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update site setting',
        error: error.message
      });
    }

    apiLogger.info('Successfully updated site setting', { key });

    return res.status(200).json({
      success: true,
      data: setting,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePut', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update site setting'
    });
  }
}

/**
 * POST /api/management/site-settings
 *
 * Create a new setting.
 * Body: { key: string, value: string, description?: string }
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any
) {
  try {
    const { key, value, description } = req.body;

    if (!key || value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'key and value are required'
      });
    }

    apiLogger.info('Creating site setting', { key });

    const insertData: { key: string; value: string; description?: string } = {
      key,
      value: String(value)
    };
    if (description) {
      insertData.description = description;
    }

    const { data: setting, error } = await supabase
      .from('site_settings')
      .insert(insertData)
      .select('id, key, value, description, created_at')
      .single();

    if (error) {
      apiLogger.error('Error creating site setting', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create site setting',
        error: error.message
      });
    }

    apiLogger.info('Successfully created site setting', { key });

    return res.status(201).json({
      success: true,
      data: setting,
      message: 'Setting created successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create site setting'
    });
  }
}

/**
 * DELETE /api/management/site-settings?key=xxx
 */
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any
) {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'key query parameter is required'
      });
    }

    apiLogger.info('Deleting site setting', { key });

    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('key', key as string);

    if (error) {
      apiLogger.error('Error deleting site setting', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete site setting',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted site setting', { key });

    return res.status(200).json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete site setting'
    });
  }
}
