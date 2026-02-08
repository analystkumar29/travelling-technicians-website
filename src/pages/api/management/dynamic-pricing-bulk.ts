import { requireAdminAuth } from '@/middleware/adminAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/dynamic-pricing-bulk');

interface BulkEntry {
  service_id: string;
  model_id: string;
  pricing_tier: string;
  base_price: number;
  discounted_price?: number;
  existing_id?: string; // If updating existing entry
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

export default requireAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const requestId = `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  apiLogger.info(`[${requestId}] Bulk pricing request received`, { 
    method: req.method,
    bodyKeys: Object.keys(req.body || {}),
    entriesLength: req.body?.entries?.length,
    userAgent: req.headers['user-agent']?.substring(0, 100)
  });

  if (req.method !== 'POST') {
    apiLogger.warn(`[${requestId}] Method not allowed`, { method: req.method });
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { entries } = req.body;
    
    if (!Array.isArray(entries) || entries.length === 0) {
      apiLogger.error(`[${requestId}] Invalid entries provided`, { 
        entriesType: typeof entries,
        entriesIsArray: Array.isArray(entries),
        entriesLength: entries?.length,
        requestBody: req.body
      });
      return res.status(400).json({ success: false, error: 'No entries provided' });
    }

    apiLogger.info(`[${requestId}] Processing bulk pricing update`, { 
      count: entries.length,
      firstEntry: entries[0],
      entriesStructure: entries.map(e => ({
        hasServiceId: !!e.service_id,
        hasModelId: !!e.model_id,
        hasPricingTier: !!e.pricing_tier,
        hasBasePrice: typeof e.base_price !== 'undefined',
        hasExistingId: !!e.existing_id
      }))
    });

    const supabase = getServiceSupabase();
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const processedEntries: any[] = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const entryId = `${requestId}-entry-${i}`;
      
      apiLogger.debug(`[${entryId}] Processing entry ${i + 1}/${entries.length}`, entry);

      try {
        const { service_id, model_id, pricing_tier, base_price, discounted_price, existing_id } = entry;

        // Validate required fields
        if (!service_id || !model_id || !pricing_tier || typeof base_price !== 'number') {
          throw new Error(`Missing required fields. Got: service_id=${service_id}, model_id=${model_id}, pricing_tier=${pricing_tier}, base_price=${base_price} (type: ${typeof base_price})`);
        }

        if (base_price <= 0) {
          throw new Error(`Base price must be greater than 0, got: ${base_price}`);
        }

        const basePriceFloat = parseFloat(base_price.toString());

        if (isNaN(basePriceFloat)) {
          throw new Error(`Invalid base_price value: ${base_price}`);
        }

        // Prepare the data for upsert
        const pricingData = {
          service_id: service_id,
          model_id: model_id,
          pricing_tier: pricing_tier,
          base_price: basePriceFloat,
          discounted_price: discounted_price ? parseFloat(discounted_price.toString()) : null,
          is_active: true,
          updated_at: new Date().toISOString()
        };

        apiLogger.debug(`[${entryId}] Prepared pricing data`, pricingData);

        let result;
        
        if (existing_id) {
          // Update existing entry
          apiLogger.debug(`[${entryId}] Updating existing entry with ID: ${existing_id}`);
          
          result = await supabase
            .from('dynamic_pricing')
            .update(pricingData)
            .eq('id', existing_id)
            .select();
            
          apiLogger.debug(`[${entryId}] Update result`, { 
            error: result.error,
            data: result.data,
            count: result.count
          });
        } else {
          // Create new entry or upsert based on unique constraint
          apiLogger.debug(`[${entryId}] Creating new entry via upsert`);
          
          result = await supabase
            .from('dynamic_pricing')
            .upsert(pricingData, { 
              onConflict: 'model_id,service_id,pricing_tier',
              ignoreDuplicates: false 
            })
            .select();
            
          apiLogger.debug(`[${entryId}] Upsert result`, { 
            error: result.error,
            data: result.data,
            count: result.count
          });
        }

        if (result.error) {
          throw new Error(`Database operation failed: ${result.error.message} (Code: ${result.error.code}, Details: ${result.error.details})`);
        }

        if (!result.data || result.data.length === 0) {
          throw new Error('No data returned from database operation - operation may have failed silently');
        }

        successCount++;
        processedEntries.push({
          entry: pricingData,
          result: result.data[0],
          action: existing_id ? 'updated' : 'created'
        });
        
        apiLogger.info(`[${entryId}] Successfully processed pricing entry`, {
          service_id,
          model_id,
          pricing_tier,
          base_price: basePriceFloat,
          action: existing_id ? 'updated' : 'created',
          resultId: result.data[0]?.id
        });

      } catch (entryError) {
        errorCount++;
        const errorMessage = entryError instanceof Error ? entryError.message : 'Unknown error';
        errors.push(`Entry ${i + 1}: ${errorMessage}`);
        
        apiLogger.error(`[${entryId}] Failed to process pricing entry`, { 
          entry, 
          error: errorMessage,
          stack: entryError instanceof Error ? entryError.stack : undefined
        });
      }
    }

    const results = {
      total: entries.length,
      succeeded: successCount,
      failed: errorCount,
      errors
    };

    apiLogger.info(`[${requestId}] Bulk pricing update complete`, { 
      ...results,
      processedEntries: processedEntries.length > 0 ? processedEntries.slice(0, 3) : [] // Log first 3 for debugging
    });

    // Verify database state after operation
    if (successCount > 0) {
      try {
        const { data: verifyData, error: verifyError } = await supabase
          .from('dynamic_pricing')
          .select('id, service_id, model_id, pricing_tier, base_price, updated_at')
          .order('updated_at', { ascending: false })
          .limit(successCount);

        if (!verifyError && verifyData) {
          apiLogger.info(`[${requestId}] Database verification - recent entries`, {
            recentEntries: verifyData.map(d => ({
              id: d.id,
              service_id: d.service_id,
              model_id: d.model_id,
              pricing_tier: d.pricing_tier,
              base_price: d.base_price,
              updated_at: d.updated_at
            }))
          });
        }
      } catch (verifyErr) {
        apiLogger.warn(`[${requestId}] Could not verify database state`, { error: verifyErr });
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Bulk update complete: ${successCount} succeeded, ${errorCount} failed`,
      results
    });

  } catch (error) {
    apiLogger.error(`[${requestId}] Error in bulk pricing update`, { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to process bulk pricing update'
    });
  }
}) 