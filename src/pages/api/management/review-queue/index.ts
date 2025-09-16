import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/review-queue');

interface ReviewItem {
  id: number;
  table_name: string;
  record_id: number;
  review_type: string;
  priority: string;
  status: string;
  assigned_to?: string;
  created_at: string;
  deadline?: string;
  record_name?: string;
  quality_score?: number;
  review_data?: any;
}

interface ApiResponse {
  success: boolean;
  items?: ReviewItem[];
  stats?: any;
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
    apiLogger.error('Unexpected error in review queue API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { status, priority, type, assigned } = req.query;

    apiLogger.info('Fetching review queue items');

    // Use the pending_review_items view for efficient querying
    let query = supabase.from('pending_review_items').select('*');

    // Apply filters if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }
    if (type && type !== 'all') {
      query = query.eq('review_type', type);
    }
    if (assigned === 'unassigned') {
      query = query.is('assigned_to', null);
    } else if (assigned === 'assigned') {
      query = query.not('assigned_to', 'is', null);
    }

    const { data: items, error } = await query.order('created_at', { ascending: false });

    if (error) {
      apiLogger.error('Error fetching review queue', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch review queue',
        error: error.message
      });
    }

    apiLogger.info('Successfully fetched review queue', { count: items?.length || 0 });

    return res.status(200).json({
      success: true,
      items: items || []
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch review queue'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { 
      table_name, 
      record_id, 
      review_type, 
      priority = 'normal',
      assigned_to,
      review_notes,
      review_data,
      deadline 
    } = req.body;

    // Validate required fields
    if (!table_name || !record_id || !review_type) {
      return res.status(400).json({
        success: false,
        message: 'table_name, record_id, and review_type are required'
      });
    }

    apiLogger.info('Creating review queue item', { table_name, record_id, review_type });

    // Check if item already exists in queue
    const { data: existing, error: existingError } = await supabase
      .from('review_queue')
      .select('id')
      .eq('table_name', table_name)
      .eq('record_id', record_id)
      .eq('review_type', review_type)
      .in('status', ['pending', 'in_review'])
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      apiLogger.error('Error checking existing review item', { error: existingError });
      return res.status(500).json({
        success: false,
        message: 'Failed to check existing review items',
        error: existingError.message
      });
    }

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Review item already exists for this record and type'
      });
    }

    // Create new review item
    const { data: newItem, error: insertError } = await supabase
      .from('review_queue')
      .insert({
        table_name,
        record_id,
        review_type,
        priority,
        assigned_to: assigned_to || null,
        created_by: 'system', // TODO: Get from session
        review_notes,
        review_data,
        deadline: deadline ? new Date(deadline).toISOString() : null
      })
      .select()
      .single();

    if (insertError) {
      apiLogger.error('Error creating review item', { error: insertError });
      return res.status(500).json({
        success: false,
        message: 'Failed to create review item',
        error: insertError.message
      });
    }

    apiLogger.info('Successfully created review item', { id: newItem.id });

    return res.status(201).json({
      success: true,
      message: 'Review item created successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create review item'
    });
  }
}
