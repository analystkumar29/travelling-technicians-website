import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/device-types');

interface DeviceType {
  id?: number;
  name: string;
  display_name: string;
  is_active: boolean;
  sort_order: number;
}

interface ApiResponse {
  success: boolean;
  deviceTypes?: DeviceType[];
  deviceType?: DeviceType;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const supabase = getServiceSupabase();

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, supabase);
      case 'POST':
        return await handlePost(req, res, supabase);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in device-types API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    apiLogger.info('Fetching device types');

    const { data: deviceTypes, error } = await supabase
      .from('device_types')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      apiLogger.error('Error fetching device types', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch device types',
        error: error.message
      });
    }

    apiLogger.info('Successfully fetched device types', { count: deviceTypes?.length || 0 });

    return res.status(200).json({
      success: true,
      deviceTypes: deviceTypes || []
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch device types'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { name, display_name, is_active, sort_order } = req.body;

    // Validate required fields
    if (!name || !display_name) {
      return res.status(400).json({
        success: false,
        message: 'Name and display_name are required'
      });
    }

    apiLogger.info('Creating device type', { name, display_name });

    const { data: deviceType, error } = await supabase
      .from('device_types')
      .insert({
        name,
        display_name,
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      apiLogger.error('Error creating device type', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create device type',
        error: error.message
      });
    }

    apiLogger.info('Successfully created device type', { id: deviceType.id });

    return res.status(201).json({
      success: true,
      deviceType,
      message: 'Device type created successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create device type'
    });
  }
} 