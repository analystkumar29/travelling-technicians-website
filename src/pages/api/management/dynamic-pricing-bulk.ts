import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/dynamic-pricing-bulk');

interface BulkEntry {
  service_id: number;
  model_id: number;
  pricing_tier_id: number;
  base_price: number;
  discounted_price?: number;
  cost_price?: number;
  existing_id?: number; // If updating existing entry
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  results?: {
    total: number;
    succeeded: number;
    failed: number;
    errors: string[];
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { entries } = req.body;
    
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, error: 'No entries provided' });
    }

    apiLogger.info('Processing bulk pricing update', { count: entries.length });

    const supabase = getServiceSupabase();
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        const { service_id, model_id, pricing_tier_id, base_price, discounted_price, cost_price, existing_id } = entry;

        // Validate required fields
        if (!service_id || !model_id || !pricing_tier_id || typeof base_price !== 'number') {
          throw new Error('Missing required fields: service_id, model_id, pricing_tier_id, base_price');
        }

        if (base_price <= 0) {
          throw new Error('Base price must be greater than 0');
        }

        // Prepare the data for upsert
        const pricingData = {
          service_id,
          model_id,
          pricing_tier_id,
          base_price,
          discounted_price: discounted_price || null,
          cost_price: cost_price || null,
          is_active: true,
          updated_at: new Date().toISOString()
        };

        let result;
        
        if (existing_id) {
          // Update existing entry
          result = await supabase
            .from('dynamic_pricing')
            .update(pricingData)
            .eq('id', existing_id)
            .select();
        } else {
          // Create new entry or upsert based on unique constraint
          result = await supabase
            .from('dynamic_pricing')
            .upsert(pricingData, { 
              onConflict: 'service_id,model_id,pricing_tier_id',
              ignoreDuplicates: false 
            })
            .select();
        }

        if (result.error) {
          throw new Error(result.error.message);
        }

        successCount++;
        apiLogger.debug('Successfully processed pricing entry', { 
          service_id, 
          model_id, 
          pricing_tier_id, 
          base_price 
        });

      } catch (entryError) {
        errorCount++;
        const errorMessage = entryError instanceof Error ? entryError.message : 'Unknown error';
        errors.push(`Entry ${errorCount}: ${errorMessage}`);
        apiLogger.error('Failed to process pricing entry', { 
          entry, 
          error: errorMessage 
        });
      }
    }

    const results = {
      total: entries.length,
      succeeded: successCount,
      failed: errorCount,
      errors
    };

    apiLogger.info('Bulk pricing update complete', results);

    return res.status(200).json({ 
      success: true, 
      message: `Bulk update complete: ${successCount} succeeded, ${errorCount} failed`,
      results
    });

  } catch (error) {
    apiLogger.error('Error in bulk pricing update', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to process bulk pricing update'
    });
  }
} 