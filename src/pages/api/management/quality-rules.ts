import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/quality-rules');

interface QualityRule {
  id: number;
  rule_name: string;
  rule_type: string;
  description: string;
  pattern_regex: string;
  pattern_flags: string;
  field_targets: string[];
  score_impact: number;
  severity: string;
  is_blocking: boolean;
  priority: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  rules?: QualityRule[];
  rule?: QualityRule;
  updated_count?: number;
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
      case 'PUT':
        return await handlePut(req, res, supabase);
      case 'DELETE':
        return await handleDelete(req, res, supabase);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in quality rules API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { active_only, category, rule_type } = req.query;

    apiLogger.info('Fetching quality rules');

    let query = supabase.from('quality_rules').select('*');

    // Apply filters
    if (active_only === 'true') {
      query = query.eq('is_active', true);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (rule_type && rule_type !== 'all') {
      query = query.eq('rule_type', rule_type);
    }

    const { data: rules, error } = await query.order('priority', { ascending: false });

    if (error) {
      apiLogger.error('Error fetching quality rules', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch quality rules',
        error: error.message
      });
    }

    apiLogger.info('Successfully fetched quality rules', { count: rules?.length || 0 });

    return res.status(200).json({
      success: true,
      rules: rules || []
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quality rules'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const {
      rule_name,
      rule_type,
      description,
      pattern_regex,
      pattern_flags,
      field_targets,
      score_impact,
      severity,
      is_blocking,
      priority,
      category
    } = req.body;

    // Validate required fields
    if (!rule_name || !rule_type || !pattern_regex || score_impact === undefined) {
      return res.status(400).json({
        success: false,
        message: 'rule_name, rule_type, pattern_regex, and score_impact are required'
      });
    }

    // Validate rule_type
    if (!['contamination', 'validation', 'enhancement'].includes(rule_type)) {
      return res.status(400).json({
        success: false,
        message: 'rule_type must be one of: contamination, validation, enhancement'
      });
    }

    // Validate severity
    if (severity && !['low', 'medium', 'high', 'critical'].includes(severity)) {
      return res.status(400).json({
        success: false,
        message: 'severity must be one of: low, medium, high, critical'
      });
    }

    // Test regex pattern
    try {
      new RegExp(pattern_regex, pattern_flags || '');
    } catch (regexError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid regex pattern',
        error: regexError instanceof Error ? regexError.message : 'Unknown regex error'
      });
    }

    apiLogger.info('Creating quality rule', { rule_name, rule_type });

    const { data: newRule, error } = await supabase
      .from('quality_rules')
      .insert({
        rule_name,
        rule_type,
        description,
        pattern_regex,
        pattern_flags: pattern_flags || '',
        field_targets: field_targets || ['name', 'display_name'],
        score_impact,
        severity: severity || 'medium',
        is_blocking: is_blocking || false,
        priority: priority || 0,
        category: category || rule_type,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      apiLogger.error('Error creating quality rule', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create quality rule',
        error: error.message
      });
    }

    apiLogger.info('Successfully created quality rule', { id: newRule.id });

    return res.status(201).json({
      success: true,
      rule: newRule,
      message: 'Quality rule created successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create quality rule'
    });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Rule ID is required'
      });
    }

    // Test regex pattern if provided
    if (updateData.pattern_regex) {
      try {
        new RegExp(updateData.pattern_regex, updateData.pattern_flags || '');
      } catch (regexError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid regex pattern',
          error: regexError instanceof Error ? regexError.message : 'Unknown regex error'
        });
      }
    }

    apiLogger.info('Updating quality rule', { id });

    const { data: updatedRule, error } = await supabase
      .from('quality_rules')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      apiLogger.error('Error updating quality rule', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update quality rule',
        error: error.message
      });
    }

    apiLogger.info('Successfully updated quality rule', { id });

    return res.status(200).json({
      success: true,
      rule: updatedRule,
      message: 'Quality rule updated successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePut', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update quality rule'
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse>, supabase: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Rule ID is required'
      });
    }

    apiLogger.info('Deleting quality rule', { id });

    const { error } = await supabase
      .from('quality_rules')
      .delete()
      .eq('id', id);

    if (error) {
      apiLogger.error('Error deleting quality rule', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete quality rule',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted quality rule', { id });

    return res.status(200).json({
      success: true,
      message: 'Quality rule deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete quality rule'
    });
  }
}
