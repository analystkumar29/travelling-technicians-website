/**
 * Admin API: Bulk Pricing Management
 * 
 * Handles bulk pricing operations:
 * - Set pricing for multiple models at once
 * - Copy pricing between models
 * - Get pricing matrix for a device type/brand
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/bulk-pricing');

interface BulkPricingRequest {
  device_type_id?: string;
  brand_id?: string;
  model_ids: string[];
  service_ids: string[];
  pricing: {
    standard: number;
    premium: number;
  };
}

interface BulkPricingResponse {
  success: boolean;
  updated?: number;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BulkPricingResponse>
) {
  const supabase = getServiceSupabase();

  try {
    switch (req.method) {
      case 'POST':
        return await handleBulkUpdate(req, res, supabase);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in bulk pricing API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleBulkUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any
) {
  try {
    const { model_ids, service_ids, pricing } = req.body as BulkPricingRequest;

    // Validation
    if (!model_ids || model_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'model_ids is required and must not be empty'
      });
    }

    if (!service_ids || service_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'service_ids is required and must not be empty'
      });
    }

    if (!pricing || pricing.standard === undefined || pricing.premium === undefined) {
      return res.status(400).json({
        success: false,
        message: 'pricing with standard and premium prices is required'
      });
    }

    apiLogger.info('Bulk pricing update requested', {
      models: model_ids.length,
      services: service_ids.length,
      pricing
    });

    let totalUpdated = 0;

    // For each combination of model and service, we need to update/create both standard and premium tiers
    for (const model_id of model_ids) {
      for (const service_id of service_ids) {
        // Update or create STANDARD tier
        const { error: standardError } = await supabase
          .from('dynamic_pricing')
          .upsert(
            {
              model_id,
              service_id,
              pricing_tier: 'standard',
              base_price: pricing.standard,
              is_active: true
            },
            {
              onConflict: 'model_id,service_id,pricing_tier'
            }
          );

        if (standardError) {
          apiLogger.error('Error updating standard pricing', { standardError, model_id, service_id });
          return res.status(500).json({
            success: false,
            message: `Failed to update standard pricing for model ${model_id}`,
            error: standardError.message
          });
        }

        totalUpdated++;

        // Update or create PREMIUM tier
        const { error: premiumError } = await supabase
          .from('dynamic_pricing')
          .upsert(
            {
              model_id,
              service_id,
              pricing_tier: 'premium',
              base_price: pricing.premium,
              is_active: true
            },
            {
              onConflict: 'model_id,service_id,pricing_tier'
            }
          );

        if (premiumError) {
          apiLogger.error('Error updating premium pricing', { premiumError, model_id, service_id });
          return res.status(500).json({
            success: false,
            message: `Failed to update premium pricing for model ${model_id}`,
            error: premiumError.message
          });
        }

        totalUpdated++;
      }
    }

    apiLogger.info('Successfully updated bulk pricing', { totalUpdated });

    return res.status(200).json({
      success: true,
      updated: totalUpdated,
      message: `Updated pricing for ${model_ids.length} model(s) across ${service_ids.length} service(s)`
    });
  } catch (error) {
    apiLogger.error('Error in handleBulkUpdate', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update bulk pricing',
      error: String(error)
    });
  }
}
