import { requireAdminAuth } from '@/middleware/adminAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/customer-feedback');

interface CustomerFeedback {
  id: number;
  source_type: string;
  source_reference?: string;
  customer_email?: string;
  feedback_type: string;
  subject_table?: string;
  subject_record_id?: number;
  reported_issue: string;
  suggested_correction?: string;
  severity_reported: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  action_taken?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  feedback?: CustomerFeedback[];
  item?: CustomerFeedback;
  message?: string;
  error?: string;
}

export default requireAdminAuth(async function handler(
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
    apiLogger.error('Unexpected error in customer feedback API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
})

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { status, type, severity, source, sort_by = 'created_at' } = req.query;

    apiLogger.info('Fetching customer feedback');

    let query = supabase.from('customer_feedback').select('*');

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (type && type !== 'all') {
      query = query.eq('feedback_type', type);
    }
    if (severity && severity !== 'all') {
      query = query.eq('severity_reported', severity);
    }
    if (source && source !== 'all') {
      query = query.eq('source_type', source);
    }

    // Apply sorting
    const sortOrder = sort_by === 'severity' ? 
      { ascending: false } : // High severity first
      { ascending: false };   // Most recent first

    const { data: feedback, error } = await query.order(sort_by as string, sortOrder);

    if (error) {
      apiLogger.error('Error fetching customer feedback', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch customer feedback',
        error: error.message
      });
    }

    apiLogger.info('Successfully fetched customer feedback', { count: feedback?.length || 0 });

    return res.status(200).json({
      success: true,
      feedback: feedback || []
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer feedback'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const {
      source_type,
      source_reference,
      customer_email,
      feedback_type,
      subject_table,
      subject_record_id,
      reported_issue,
      suggested_correction,
      severity_reported = 'medium'
    } = req.body;

    // Validate required fields
    if (!source_type || !feedback_type || !reported_issue) {
      return res.status(400).json({
        success: false,
        message: 'source_type, feedback_type, and reported_issue are required'
      });
    }

    // Validate enums
    if (!['booking_form', 'support_ticket', 'survey', 'api'].includes(source_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid source_type'
      });
    }

    if (!['model_incorrect', 'pricing_issue', 'service_unavailable'].includes(feedback_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback_type'
      });
    }

    if (!['low', 'medium', 'high', 'critical'].includes(severity_reported)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity_reported'
      });
    }

    apiLogger.info('Creating customer feedback', { feedback_type, severity_reported });

    const { data: newFeedback, error } = await supabase
      .from('customer_feedback')
      .insert({
        source_type,
        source_reference,
        customer_email,
        feedback_type,
        subject_table,
        subject_record_id,
        reported_issue,
        suggested_correction,
        severity_reported,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      apiLogger.error('Error creating customer feedback', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create customer feedback',
        error: error.message
      });
    }

    // If this is a high or critical issue, automatically create a review queue entry
    if (['high', 'critical'].includes(severity_reported)) {
      try {
        await supabase
          .from('review_queue')
          .insert({
            table_name: subject_table || 'customer_feedback',
            record_id: subject_record_id || newFeedback.id,
            review_type: 'customer_feedback',
            priority: severity_reported === 'critical' ? 'critical' : 'high',
            created_by: 'system',
            review_notes: `Customer feedback: ${feedback_type}`,
            review_data: {
              feedback_id: newFeedback.id,
              customer_email,
              reported_issue: reported_issue.substring(0, 100) + '...'
            }
          });
      } catch (reviewError) {
        // Don't fail the main request if review queue creation fails
        apiLogger.warn('Failed to create review queue entry for customer feedback', { error: reviewError });
      }
    }

    apiLogger.info('Successfully created customer feedback', { id: newFeedback.id });

    return res.status(201).json({
      success: true,
      item: newFeedback,
      message: 'Customer feedback submitted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to submit customer feedback'
    });
  }
}
