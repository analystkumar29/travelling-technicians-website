/**
 * Admin API: Pricing Matrix Retrieval
 * 
 * Gets pricing data formatted as a matrix for display
 * Filters by device_type, brand, and models
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/pricing-matrix');

interface PricingMatrixResponse {
  success: boolean;
  models?: Array<{
    id: string;
    name: string;
  }>;
  services?: Array<{
    id: string;
    name: string;
    display_name: string;
  }>;
  matrix?: Array<Array<{
    standard: number | null;
    premium: number | null;
    service_id: string;
    model_id: string;
  }>>;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PricingMatrixResponse>
) {
  const supabase = getServiceSupabase();

  try {
    if (req.method === 'GET') {
      return await handleGetMatrix(req, res, supabase);
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error) {
    apiLogger.error('Unexpected error in pricing matrix API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGetMatrix(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any
) {
  try {
    const { device_type_id, brand_id, model_ids, service_ids } = req.query;

    apiLogger.info('Fetching pricing matrix', {
      device_type_id,
      brand_id,
      model_ids,
      service_ids
    });

    // Build query for models
    let modelsQuery = supabase
      .from('device_models')
      .select('id, name, slug, brand_id, type_id');

    if (device_type_id && typeof device_type_id === 'string') {
      modelsQuery = modelsQuery.eq('type_id', device_type_id);
    }

    if (brand_id && typeof brand_id === 'string') {
      modelsQuery = modelsQuery.eq('brand_id', brand_id);
    }

    // If specific model_ids are provided, filter to those
    if (model_ids && typeof model_ids === 'string') {
      const ids = model_ids.split(',').filter(id => id.trim());
      if (ids.length > 0) {
        modelsQuery = modelsQuery.in('id', ids);
      }
    }

    const { data: models, error: modelsError } = await modelsQuery.order('name', { ascending: true });

    if (modelsError) {
      apiLogger.error('Error fetching models', { modelsError });
      return res.status(500).json({
        success: false,
        error: modelsError.message
      });
    }

    // Build query for services
    let servicesQuery = supabase
      .from('services')
      .select('id, name, display_name, device_type_id');

    if (device_type_id && typeof device_type_id === 'string') {
      servicesQuery = servicesQuery.eq('device_type_id', device_type_id);
    }

    // If specific service_ids are provided, filter to those
    if (service_ids && typeof service_ids === 'string') {
      const ids = service_ids.split(',').filter(id => id.trim());
      if (ids.length > 0) {
        servicesQuery = servicesQuery.in('id', ids);
      }
    }

    const { data: services, error: servicesError } = await servicesQuery.order('name', { ascending: true });

    if (servicesError) {
      apiLogger.error('Error fetching services', { servicesError });
      return res.status(500).json({
        success: false,
        error: servicesError.message
      });
    }

    // Fetch all pricing for these models and services
    if (!models || models.length === 0 || !services || services.length === 0) {
      return res.status(200).json({
        success: true,
        models: models || [],
        services: services || [],
        matrix: []
      });
    }

    const modelIds = (models || []).map((m: any) => m.id);
    const serviceIds = (services || []).map((s: any) => s.id);

    const { data: pricing, error: pricingError } = await supabase
      .from('dynamic_pricing')
      .select('model_id, service_id, pricing_tier, base_price')
      .in('model_id', modelIds)
      .in('service_id', serviceIds);

    if (pricingError) {
      apiLogger.error('Error fetching pricing', { pricingError });
      return res.status(500).json({
        success: false,
        error: pricingError.message
      });
    }

    // Build matrix: rows = services, columns = models, cells = {standard, premium}
    const matrix = (services || []).map((service: any) => {
      return (models || []).map((model: any) => {
        const standardEntry = (pricing || []).find(
          (p: any) => p.model_id === model.id && 
               p.service_id === service.id && 
               p.pricing_tier === 'standard'
        );

        const premiumEntry = (pricing || []).find(
          (p: any) => p.model_id === model.id && 
               p.service_id === service.id && 
               p.pricing_tier === 'premium'
        );

        return {
          standard: standardEntry?.base_price || null,
          premium: premiumEntry?.base_price || null,
          service_id: service.id,
          model_id: model.id
        };
      });
    });

    apiLogger.info('Successfully fetched pricing matrix', {
      models: models.length,
      services: services.length
    });

    return res.status(200).json({
      success: true,
      models,
      services,
      matrix
    });
  } catch (error) {
    apiLogger.error('Error in handleGetMatrix', { error });
    return res.status(500).json({
      success: false,
      error: String(error)
    });
  }
}
