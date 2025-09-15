import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import { withCache, generateCacheKey, CACHE_CONFIG } from '@/utils/apiCache';

const apiLogger = logger.createModuleLogger('api/pricing/calculate-fixed');

interface PricingCalculation {
  success: boolean;
  data?: {
    base_price: number;
    final_price: number;
    promotional_price?: number;
    is_promotional?: boolean;
    tier: string;
    warranty_months: number;
    turnaround_hours: number;
    device_info: {
      type: string;
      brand: string;
      model: string;
    };
    service_info: {
      name: string;
      display_name: string;
      doorstep_available: boolean;
    };
    pricing_breakdown: {
      base_price: number;
      tier_multiplier: number;
      final_calculation: string;
    };
  };
  fallback_used?: boolean;
  debug_info?: any;
  error?: string;
  cache_info?: {
    hit: boolean;
    ttl?: number;
    generated_at?: string;
  };
}

// Service name mappings
const SERVICE_ID_MAPPING: Record<string, string> = {
  'screen_replacement': 'screen_replacement',
  'battery_replacement': 'battery_replacement',
  'charging_port_repair': 'charging_port_repair',
  'speaker_repair': 'speaker_repair',
  'camera_repair': 'camera_repair',
  'water_damage': 'water_damage_diagnostics',
  'keyboard_repair': 'keyboard_repair',
  'trackpad_repair': 'trackpad_repair',
  'ram_upgrade': 'ram_upgrade',
  'storage_upgrade': 'storage_upgrade',
  'software_troubleshooting': 'software_troubleshooting',
  'virus_removal': 'virus_removal',
  'cooling_repair': 'cooling_system_repair',
  'power_jack_repair': 'power_jack_repair'
};

// Service display names
const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  'screen_replacement': 'Screen Replacement',
  'battery_replacement': 'Battery Replacement',
  'charging_port_repair': 'Charging Port Repair',
  'speaker_repair': 'Speaker/Mic Repair',
  'camera_repair': 'Camera Repair',
  'water_damage_diagnostics': 'Water Damage Diagnostics',
  'keyboard_repair': 'Keyboard Repair/Replacement',
  'trackpad_repair': 'Trackpad Repair',
  'ram_upgrade': 'RAM Upgrade',
  'storage_upgrade': 'HDD/SSD Replacement/Upgrade',
  'software_troubleshooting': 'Software Troubleshooting',
  'virus_removal': 'Virus Removal',
  'cooling_system_repair': 'Cooling System Repair',
  'power_jack_repair': 'Power Jack Repair'
};

// Tier configuration
const TIER_CONFIG = {
  economy: { multiplier: 0.8, warranty: 3, turnaround: 72 },
  standard: { multiplier: 1.0, warranty: 6, turnaround: 48 },
  premium: { multiplier: 1.25, warranty: 12, turnaround: 24 },
  express: { multiplier: 1.5, warranty: 6, turnaround: 12 }
};

// Generate cache key for pricing request (using apiCache utility)
function generatePricingCacheKey(deviceType: string, brand: string, model: string, service: string, tier: string): string {
  return generateCacheKey('pricing', { deviceType, brand, model, service, tier }, {
    prefix: CACHE_CONFIG.PRICING_CALCULATE.keyPrefix,
    normalize: true
  });
}

// Enhanced database search with caching
async function findDynamicPricing(deviceType: string, brand: string, model: string, service: string, tier: string): Promise<any> {
  const cacheKey = generatePricingCacheKey(deviceType, brand, model, service, tier);
  
  // Use cache wrapper for automatic caching
  return withCache(
    cacheKey,
    async () => {
      apiLogger.info('Pricing cache miss, querying database', { cacheKey });
      return performDatabaseSearch(deviceType, brand, model, service, tier);
    },
    'PRICING_CALCULATE'
  );
}

// Extracted database search logic
async function performDatabaseSearch(deviceType: string, brand: string, model: string, service: string, tier: string): Promise<any> {
  try {
    const supabase = getServiceSupabase();
    
    // SIMPLE QUERY PATTERN (like working management API)
    const { data: allPricing, error: pricingError } = await supabase
      .from('dynamic_pricing')
      .select('*')
      .order('created_at', { ascending: false });

    if (pricingError) {
      apiLogger.error('Database query failed', { error: pricingError });
      return null;
    }

    if (!allPricing || allPricing.length === 0) {
      apiLogger.warn('No pricing data found in database');
      return null;
    }

    apiLogger.debug(`Retrieved ${allPricing.length} pricing entries from database`);

    // Get lookup tables for JavaScript post-processing with parallel requests
    const [
      { data: deviceTypes },
      { data: brands },  
      { data: deviceModels },
      { data: services },
      { data: serviceCategories },
      { data: pricingTiers }
    ] = await Promise.all([
      supabase.from('device_types').select('*'),
      supabase.from('brands').select('*'),
      supabase.from('device_models').select('*'),
      supabase.from('services').select('*'),
      supabase.from('service_categories').select('*'),
      supabase.from('pricing_tiers').select('*')
    ]);

    // Create lookup maps for efficient searching
    const deviceTypeMap = new Map(deviceTypes?.map(dt => [dt.id, dt]) || []);
    const brandMap = new Map(brands?.map(b => [b.id, b]) || []);
    const modelMap = new Map(deviceModels?.map(m => [m.id, m]) || []);
    const serviceMap = new Map(services?.map(s => [s.id, s]) || []);
    const categoryMap = new Map(serviceCategories?.map(c => [c.id, c]) || []);
    const tierMap = new Map(pricingTiers?.map(t => [t.id, t]) || []);

    // JavaScript post-processing for complex matching
    const matchingEntry = allPricing.find(entry => {
      const model_info = modelMap.get(entry.model_id);
      const brand_info = brandMap.get(model_info?.brand_id);
      const device_type_info = deviceTypeMap.get(brand_info?.device_type_id);
      const service_info = serviceMap.get(entry.service_id);
      const tier_info = tierMap.get(entry.pricing_tier_id);

      const deviceTypeMatch = device_type_info?.name?.toLowerCase() === deviceType.toLowerCase();
      const brandMatch = brand_info?.name?.toLowerCase() === brand.toLowerCase();
      const modelMatch = model_info?.name?.toLowerCase().includes(model.toLowerCase()) || 
                        model.toLowerCase().includes(model_info?.name?.toLowerCase() || '');
      const serviceMatch = service_info?.name === SERVICE_ID_MAPPING[service] || service_info?.name === service;
      const tierMatch = tier_info?.name?.toLowerCase() === tier.toLowerCase();

      return deviceTypeMatch && brandMatch && modelMatch && serviceMatch && tierMatch;
    });

    if (matchingEntry) {
      // Enhance with related data
      const model_info = modelMap.get(matchingEntry.model_id);
      const brand_info = brandMap.get(model_info?.brand_id);
      const device_type_info = deviceTypeMap.get(brand_info?.device_type_id);
      const service_info = serviceMap.get(matchingEntry.service_id);
      const tier_info = tierMap.get(matchingEntry.pricing_tier_id);

      const enhancedEntry = {
        ...matchingEntry,
        device_type: device_type_info,
        brand: brand_info,
        model: model_info,
        service: service_info,
        tier: tier_info
      };

      apiLogger.info('Database pricing found', {
        id: enhancedEntry.id,
        base_price: enhancedEntry.base_price
      });

      return enhancedEntry;
    }

    apiLogger.warn('No matching entry found in database');
    return null;

  } catch (error) {
    apiLogger.error('Database search failed', { error });
    return null;
  }
}

// Calculate fallback pricing with caching
function calculateFallbackPricing(deviceType: string, brand: string, service: string, tier: string) {
  const cacheKey = `fallback_${deviceType}_${brand}_${service}_${tier}`.toLowerCase();
  
  // Base pricing matrix
  const BASE_PRICES: Record<string, Record<string, number>> = {
    mobile: {
      screen_replacement: 150,
      battery_replacement: 80,
      charging_port_repair: 90,
      speaker_repair: 70,
      camera_repair: 120,
      water_damage: 100
    },
    laptop: {
      screen_replacement: 300,
      battery_replacement: 120,
      keyboard_repair: 100,
      trackpad_repair: 80,
      ram_upgrade: 150,
      storage_upgrade: 200,
      software_troubleshooting: 80,
      virus_removal: 60,
      cooling_repair: 150,
      power_jack_repair: 140
    },
    tablet: {
      screen_replacement: 200,
      battery_replacement: 100,
      charging_port_repair: 85
    }
  };

  // Brand multipliers
  const BRAND_MULTIPLIERS: Record<string, number> = {
    apple: 1.4,
    samsung: 1.2,
    google: 1.1,
    oneplus: 1.1,
    huawei: 1.0,
    xiaomi: 0.9,
    dell: 1.1,
    hp: 1.0,
    lenovo: 1.0,
    asus: 1.1,
    acer: 0.9
  };

  const basePrice = BASE_PRICES[deviceType]?.[service] || 100;
  const brandMultiplier = BRAND_MULTIPLIERS[brand.toLowerCase()] || 1.0;
  const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.standard;
  
  const finalPrice = Math.round(basePrice * brandMultiplier * tierConfig.multiplier);

  const result = {
    base_price: basePrice,
    brand_multiplier: brandMultiplier,
    tier_multiplier: tierConfig.multiplier,
    final_price: finalPrice,
    warranty_months: tierConfig.warranty,
    turnaround_hours: tierConfig.turnaround
  };

  // Cache fallback calculations for 1 hour
  // pricingCache.set(cacheKey, result, 60 * 60 * 1000);

  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<PricingCalculation>) {
  const startTime = Date.now();
  const { deviceType, brand, model, service, tier = 'standard', postalCode } = req.query;

  // Set Cache-Control headers for 30 minutes
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
  res.setHeader('Vary', 'Accept-Encoding');

  // Validation
  if (!deviceType || !brand || !model || !service) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: deviceType, brand, model, service'
    });
  }

  apiLogger.info('Pricing request received', { 
    deviceType, brand, model, service, tier, postalCode 
  });

  try {
    // Try to find dynamic pricing in database (with caching)
    const dynamicPricing = await findDynamicPricing(
      deviceType as string,
      brand as string, 
      model as string,
      service as string,
      tier as string
    );

    const responseTime = Date.now() - startTime;

    if (dynamicPricing) {
      // Use database pricing
      const finalPrice = dynamicPricing.promotional_price && dynamicPricing.is_promotional 
        ? dynamicPricing.promotional_price 
        : dynamicPricing.base_price;

      const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.standard;

      return res.status(200).json({
        success: true,
        data: {
          base_price: dynamicPricing.base_price,
          final_price: finalPrice,
          promotional_price: dynamicPricing.promotional_price,
          is_promotional: dynamicPricing.is_promotional || false,
          tier: tier as string,
          warranty_months: tierConfig.warranty,
          turnaround_hours: tierConfig.turnaround,
          device_info: {
            type: dynamicPricing.device_type?.name || deviceType as string,
            brand: dynamicPricing.brand?.name || brand as string,
            model: dynamicPricing.model?.name || model as string
          },
          service_info: {
            name: dynamicPricing.service?.name || service as string,
            display_name: SERVICE_DISPLAY_NAMES[dynamicPricing.service?.name || service as string] || service as string,
            doorstep_available: dynamicPricing.service?.doorstep_available || true
          },
          pricing_breakdown: {
            base_price: dynamicPricing.base_price,
            tier_multiplier: tierConfig.multiplier,
            final_calculation: `Database: $${dynamicPricing.base_price} ${dynamicPricing.is_promotional ? `→ $${dynamicPricing.promotional_price} (promotional)` : ''}`
          }
        },
        debug_info: {
          source: 'database',
          entry_id: dynamicPricing.id,
          matched_device: `${dynamicPricing.device_type?.name}/${dynamicPricing.brand?.name}/${dynamicPricing.model?.name}`,
          matched_service: dynamicPricing.service?.name,
          matched_tier: dynamicPricing.tier?.name,
          response_time_ms: responseTime
        }
      });
    } else {
      // Use fallback pricing (also cached)
      apiLogger.warn('No dynamic pricing found, using cached fallback', { 
        deviceType, brand, model, service, tier 
      });
      
      const fallbackPricing = calculateFallbackPricing(
        deviceType as string,
        brand as string,
        service as string, 
        tier as string
      );

      return res.status(200).json({
        success: true,
        data: {
          base_price: fallbackPricing.base_price,
          final_price: fallbackPricing.final_price,
          is_promotional: false,
          tier: tier as string,
          warranty_months: fallbackPricing.warranty_months,
          turnaround_hours: fallbackPricing.turnaround_hours,
          device_info: {
            type: deviceType as string,
            brand: brand as string,
            model: model as string
          },
          service_info: {
            name: SERVICE_ID_MAPPING[service as string] || service as string,
            display_name: SERVICE_DISPLAY_NAMES[SERVICE_ID_MAPPING[service as string] || service as string] || service as string,
            doorstep_available: true
          },
          pricing_breakdown: {
            base_price: fallbackPricing.base_price,
            tier_multiplier: fallbackPricing.tier_multiplier,
            final_calculation: `Fallback: $${fallbackPricing.base_price} × ${fallbackPricing.brand_multiplier} × ${fallbackPricing.tier_multiplier} = $${fallbackPricing.final_price}`
          }
        },
        fallback_used: true,
        debug_info: {
          source: 'fallback',
          reason: 'No database match found',
          fallback_calculation: fallbackPricing,
          response_time_ms: responseTime
        },
        // cache_info: {
        //   hit: false,
        //   ttl: 60 * 60 * 1000,
        //   generated_at: new Date().toISOString()
        // }
      });
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    apiLogger.error('Pricing calculation failed', { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      deviceType, brand, model, service, tier,
      response_time_ms: responseTime
    });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate pricing',
      debug_info: {
        response_time_ms: responseTime
      }
    });
  }
} 