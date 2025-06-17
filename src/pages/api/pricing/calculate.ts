import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('api/pricing/calculate');

interface PriceCalculation {
  service: {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    estimated_duration_minutes?: number;
    warranty_period_days: number;
    is_doorstep_eligible: boolean;
  };
  device: {
    type: string;
    brand: string;
    model: string;
  };
  pricing: {
    base_price: number;
    discounted_price?: number;
    final_price: number;
    tier_multiplier: number;
    location_adjustment: number;
    savings?: number;
  };
  tier: {
    name: string;
    display_name: string;
    estimated_delivery_hours?: number;
    includes_features: string[];
  };
  location?: {
    name: string;
    adjustment_percentage: number;
  };
}

interface ApiResponse {
  success: boolean;
  calculation?: PriceCalculation;
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
    const { 
      deviceType, 
      brand, 
      model, 
      service, 
      tier = 'standard',
      postalCode 
    } = req.query;

    // Validate required parameters
    if (!deviceType || !brand || !model || !service) {
      apiLogger.warn('Missing required parameters', { deviceType, brand, model, service });
      return res.status(400).json({
        success: false,
        message: 'Required parameters: deviceType, brand, model, service'
      });
    }

    apiLogger.info('Calculating price', { 
      deviceType, brand, model, service, tier, postalCode 
    });

    // Get Supabase client
    const supabase = getServiceSupabase();

    // For now, use static calculation since dynamic pricing tables may not exist yet
    apiLogger.info('Using static price calculation');
    const staticCalculation = getStaticPriceCalculation(
      deviceType as string,
      brand as string,
      model as string,
      service as string,
      tier as string,
      postalCode as string
    );
    
    return res.status(200).json({
      success: true,
      calculation: staticCalculation
    });

    // TODO: Enable database pricing once tables are created
    // For now, all pricing uses static calculation

  } catch (error) {
    apiLogger.error('Unexpected error in pricing calculation API', { error });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to calculate pricing'
    });
  }
}

// Get location-based pricing adjustment
async function getLocationAdjustment(supabase: any, postalCode: string) {
  try {
    const postalPrefix = postalCode.substring(0, 3).toUpperCase();
    
    const { data: locationData, error } = await supabase
      .from('service_locations')
      .select('name, price_adjustment_percentage')
      .contains('postal_code_prefixes', [postalPrefix])
      .eq('is_active', true)
      .single();

    if (error || !locationData) {
      return { adjustment: 0, info: null };
    }

    return {
      adjustment: parseFloat(locationData.price_adjustment_percentage) || 0,
      info: {
        name: locationData.name,
        adjustment_percentage: parseFloat(locationData.price_adjustment_percentage) || 0
      }
    };
  } catch (error) {
    return { adjustment: 0, info: null };
  }
}

// Fallback static price calculation
function getStaticPriceCalculation(
  deviceType: string,
  brand: string,
  model: string,
  service: string,
  tier: string,
  postalCode?: string
): PriceCalculation {
  // Static pricing based on device type and service
  const basePrices: Record<string, Record<string, number>> = {
    mobile: {
      screen_replacement: 149,
      battery_replacement: 89,
      charging_port_repair: 109,
      speaker_microphone_repair: 99,
      camera_repair: 119,
      water_damage_diagnostics: 129
    },
    laptop: {
      screen_replacement: 249,
      battery_replacement: 139,
      keyboard_repair: 159,
      ram_upgrade: 119,
      storage_upgrade: 179,
      software_troubleshooting: 99
    },
    tablet: {
      screen_replacement: 189,
      battery_replacement: 119
    }
  };

  // Tier multipliers
  const tierMultipliers: Record<string, number> = {
    economy: 0.85,
    standard: 1.0,
    premium: 1.25,
    same_day: 1.5
  };

  // Brand adjustments
  const brandMultipliers: Record<string, number> = {
    apple: 1.2,
    samsung: 1.1,
    google: 1.0,
    oneplus: 0.95,
    xiaomi: 0.9,
    dell: 1.05,
    hp: 1.0,
    lenovo: 0.95,
    asus: 1.0,
    other: 0.9
  };

  const basePrice = basePrices[deviceType.toLowerCase()]?.[service] || 99;
  const tierMultiplier = tierMultipliers[tier] || 1.0;
  const brandMultiplier = brandMultipliers[brand.toLowerCase()] || 1.0;

  let workingPrice = basePrice * brandMultiplier * tierMultiplier;
  
  // Location adjustment (simplified)
  let locationAdjustment = 0;
  let locationInfo = null;
  
  if (postalCode) {
    const postalPrefix = postalCode.substring(0, 3).toUpperCase();
    // Vancouver downtown premium
    if (['V6B', 'V6C', 'V6E', 'V6G', 'V6Z'].includes(postalPrefix)) {
      locationAdjustment = 5;
      locationInfo = { name: 'Downtown Vancouver', adjustment_percentage: 5 };
    }
    // Richmond/airport area
    else if (['V6X', 'V7B'].includes(postalPrefix)) {
      locationAdjustment = 3;
      locationInfo = { name: 'Richmond', adjustment_percentage: 3 };
    }
  }

  const locationAdjustmentAmount = workingPrice * (locationAdjustment / 100);
  const finalPrice = Math.round((workingPrice + locationAdjustmentAmount) * 100) / 100;

  // Get tier info
  const tierInfo = {
    standard: {
      display_name: 'Standard Repair',
      estimated_delivery_hours: 48,
      includes_features: ['3-Month Warranty', 'Quality Parts', 'Professional Service', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics']
    },
    premium: {
      display_name: 'Premium Service',
      estimated_delivery_hours: 24,
      includes_features: ['6-Month Warranty', 'Premium Parts', 'Priority Service', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics', 'Express Handling', 'Quality Assurance Check']
    }
  };

  const selectedTier = tierInfo[tier as keyof typeof tierInfo] || tierInfo.standard;

  return {
    service: {
      id: 1,
      name: service,
      display_name: service.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      estimated_duration_minutes: 45,
      warranty_period_days: tier === 'premium' ? 180 : 90,
      is_doorstep_eligible: true
    },
    device: {
      type: deviceType,
      brand: brand.charAt(0).toUpperCase() + brand.slice(1),
      model: model
    },
    pricing: {
      base_price: basePrice,
      final_price: finalPrice,
      tier_multiplier: tierMultiplier,
      location_adjustment: locationAdjustment
    },
    tier: {
      name: tier,
      display_name: selectedTier.display_name,
      estimated_delivery_hours: selectedTier.estimated_delivery_hours,
      includes_features: selectedTier.includes_features
    },
    location: locationInfo || undefined
  };
} 