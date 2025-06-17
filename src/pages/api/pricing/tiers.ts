import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('api/pricing/tiers');

interface PricingTier {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  price_multiplier: number;
  estimated_delivery_hours?: number;
  includes_features: string[];
  is_active: boolean;
  sort_order: number;
}

interface ApiResponse {
  success: boolean;
  tiers?: PricingTier[];
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    apiLogger.info('Fetching pricing tiers');

    // Get Supabase client
    const supabase = getServiceSupabase();

    // Use static pricing tiers for now
    apiLogger.info('Using static pricing tiers');
    const staticTiers = getStaticPricingTiers();
    
    return res.status(200).json({
      success: true,
      tiers: staticTiers
    });

    // TODO: Enable database tiers once tables are created
    // For now, all tiers use static data

  } catch (error) {
    apiLogger.error('Unexpected error in pricing tiers API', { error });
    
    // Fallback to static data on error
    try {
      const staticTiers = getStaticPricingTiers();
      
      return res.status(200).json({
        success: true,
        tiers: staticTiers
      });
    } catch (fallbackError) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch pricing tiers'
      });
    }
  }
}

// Fallback static data for pricing tiers
function getStaticPricingTiers(): PricingTier[] {
  return [
    {
      id: 1,
      name: 'standard',
      display_name: 'Standard Repair',
      description: 'Quality repair with standard timeframe and full warranty',
      price_multiplier: 1.0,
      estimated_delivery_hours: 24,
      includes_features: [
        '1-Year Warranty',
        'Quality Parts',
        'Professional Service',
        'Free Pickup & Delivery (Doorstep)',
        'Free Diagnostics'
      ],
      is_active: true,
      sort_order: 1
    },
    {
      id: 2,
      name: 'premium',
      display_name: 'Premium Service',
      description: 'Priority service with premium parts and expedited handling',
      price_multiplier: 1.25,
      estimated_delivery_hours: 12,
      includes_features: [
        '1-Year Warranty',
        'Premium Parts',
        'Priority Service',
        'Free Pickup & Delivery (Doorstep)',
        'Free Diagnostics',
        'Express Handling',
        'Quality Assurance Check'
      ],
      is_active: true,
      sort_order: 2
    },
    {
      id: 3,
      name: 'same_day',
      display_name: 'Same Day Service',
      description: 'Urgent repair completed within hours with premium service',
      price_multiplier: 1.5,
      estimated_delivery_hours: 4,
      includes_features: [
        '1-Year Warranty',
        'Premium Parts',
        'Same Day Completion',
        'Free Pickup & Delivery (Doorstep)',
        'Free Diagnostics',
        'Priority Technician Assignment',
        'Rush Service Fee Included',
        'Quality Assurance Check'
      ],
      is_active: true,
      sort_order: 3
    },
    {
      id: 4,
      name: 'economy',
      display_name: 'Economy Repair',
      description: 'Budget-friendly repair with quality parts and standard warranty',
      price_multiplier: 0.85,
      estimated_delivery_hours: 48,
      includes_features: [
        '6-Month Warranty',
        'Quality Parts',
        'Professional Service',
        'Free Pickup & Delivery (Doorstep)',
        'Free Diagnostics'
      ],
      is_active: true,
      sort_order: 4
    }
  ];
} 