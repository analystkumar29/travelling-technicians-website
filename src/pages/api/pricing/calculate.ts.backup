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

    // Try to get pricing from database first
    apiLogger.info('Attempting to get dynamic pricing from database');
    const dynamicCalculation = await getDynamicPriceCalculation(
      supabase,
      deviceType as string,
      brand as string,
      model as string,
      service as string,
      tier as string,
      postalCode as string
    );

    if (dynamicCalculation) {
      apiLogger.info('Using dynamic pricing from database', { 
        basePrice: dynamicCalculation.pricing.base_price,
        finalPrice: dynamicCalculation.pricing.final_price 
      });
      return res.status(200).json({
        success: true,
        calculation: dynamicCalculation
      });
    }

    // Fallback to static calculation if no database entry found
    apiLogger.info('No dynamic pricing found, using static calculation fallback');
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

  } catch (error) {
    apiLogger.error('Unexpected error in pricing calculation API', { error });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to calculate pricing'
    });
  }
}

// Get dynamic pricing from database
async function getDynamicPriceCalculation(
  supabase: any,
  deviceType: string,
  brand: string,
  model: string,
  service: string,
  tier: string,
  postalCode?: string
): Promise<PriceCalculation | null> {
  try {
    // Map form service IDs to backend service names
    const serviceNameMapping: Record<string, string> = {
      // Mobile services
      'screen-replacement': 'screen_replacement',
      'battery-replacement': 'battery_replacement', 
      'charging-port': 'charging_port_repair',
      'speaker-mic': 'speaker_microphone_repair',
      'camera-repair': 'camera_repair',
      'water-damage': 'water_damage_diagnostics',
      'other-mobile': 'other_repair',
      
      // Laptop services
      'keyboard-repair': 'keyboard_repair',
      'trackpad-repair': 'trackpad_repair',
      'ram-upgrade': 'ram_upgrade',
      'storage-upgrade': 'storage_upgrade',
      'software-trouble': 'software_troubleshooting',
      'virus-removal': 'virus_removal',
      'cooling-repair': 'cooling_repair',
      'power-jack': 'power_jack_repair',
      'other-laptop': 'other_repair',
      
      // Tablet services
      'speaker-repair': 'speaker_repair',
      'button-repair': 'button_repair',
      'software-issue': 'software_troubleshooting',
      'other-tablet': 'other_repair'
    };

    // Map service IDs to display names
    const serviceDisplayNames: Record<string, string> = {
      'screen-replacement': 'Screen Replacement',
      'battery-replacement': 'Battery Replacement',
      'charging-port': 'Charging Port Repair',
      'speaker-mic': 'Speaker/Microphone Repair',
      'camera-repair': 'Camera Repair',
      'water-damage': 'Water Damage Diagnostics',
      'keyboard-repair': 'Keyboard Repair/Replacement',
      'trackpad-repair': 'Trackpad Repair',
      'ram-upgrade': 'RAM Upgrade',
      'storage-upgrade': 'Storage (HDD/SSD) Upgrade',
      'software-trouble': 'Software Troubleshooting',
      'virus-removal': 'Virus Removal',
      'cooling-repair': 'Cooling System Repair',
      'power-jack': 'Power Jack Repair',
      'speaker-repair': 'Speaker Repair',
      'button-repair': 'Button Repair',
      'software-issue': 'Software Issue',
      'other-mobile': 'Other Mobile Repair',
      'other-laptop': 'Other Laptop Repair',
      'other-tablet': 'Other Tablet Repair'
    };

    const backendServiceName = serviceNameMapping[service] || service;
    const serviceDisplayName = serviceDisplayNames[service] || service;

    // Map frontend tier names to database tier names (as shown in management API)
    const tierNameMapping: Record<string, string> = {
      'economy': 'Economy Repair',
      'standard': 'Standard Repair', 
      'premium': 'Premium Service',
      'express': 'Same Day Service'
    };

    const backendTierName = tierNameMapping[tier] || tier;

    apiLogger.info('Querying dynamic pricing database', { 
      deviceType, brand, model, service, tier,
      mappedService: serviceDisplayName,
      mappedTier: backendTierName
    });

    // Use simpler query approach like the working management API
    const { data: pricingData, error } = await supabase
      .from('dynamic_pricing')
      .select(`
        id,
        base_price,
        discounted_price,
        cost_price,
        is_active,
        services!inner(
          id,
          name,
          display_name,
          estimated_duration_minutes,
          warranty_period_days,
          is_doorstep_eligible
        ),
        device_models!inner(
          id,
          name,
          display_name,
          brands!inner(
            id,
            name,
            display_name,
            device_types!inner(
              id,
              name,
              display_name
            )
          )
        ),
        pricing_tiers!inner(
          id,
          name,
          display_name,
          price_multiplier,
          estimated_delivery_hours,
          includes_features
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Filter results in JavaScript (like the working management API)
    const filteredData = pricingData?.filter((entry: any) => {
      const serviceMatch = entry.services?.display_name === serviceDisplayName;
      const tierMatch = entry.pricing_tiers?.display_name === backendTierName;
      const modelMatch = entry.device_models?.name === model;
      const brandMatch = entry.device_models?.brands?.name === brand;
      const deviceTypeMatch = entry.device_models?.brands?.device_types?.name === deviceType;
      
      // Debug logging
      if (entry.device_models?.name === 'iPhone 16' || entry.device_models?.name === 'iPhone 15 Plus') {
        apiLogger.info('Debug filtering', {
          model: entry.device_models?.name,
          service: entry.services?.display_name,
          tier: entry.pricing_tiers?.display_name,
          brand: entry.device_models?.brands?.name,
          deviceType: entry.device_models?.brands?.device_types?.name,
          matches: { serviceMatch, tierMatch, modelMatch, brandMatch, deviceTypeMatch },
          target: { serviceDisplayName, backendTierName, model, brand, deviceType }
        });
      }
      
      return serviceMatch && tierMatch && modelMatch && brandMatch && deviceTypeMatch;
    }) || [];

    // Sort by discounted price (lowest first) and take the first one
    const sortedData = filteredData.sort((a: any, b: any) => {
      const priceA = a.discounted_price || a.base_price;
      const priceB = b.discounted_price || b.base_price;
      return priceA - priceB;
    });

    const finalData = sortedData.length > 0 ? [sortedData[0]] : null;

    if (error) {
      apiLogger.warn('Database query error', { error: error.message, deviceType, brand, model, service, tier });
      return null;
    }

    if (!finalData || finalData.length === 0) {
      apiLogger.warn('No matching dynamic pricing found after filtering', { 
        totalEntries: pricingData?.length || 0,
        filteredEntries: filteredData.length,
        deviceType, brand, model, service, tier,
        mappedService: serviceDisplayName,
        mappedTier: backendTierName
      });
      return null;
    }

    // Get the best (lowest price) result
    const pricing = finalData[0];

    apiLogger.info('Found dynamic pricing in database', { 
      id: pricing.id,
      basePrice: pricing.base_price,
      discountedPrice: pricing.discounted_price,
      totalMatches: filteredData.length,
      selectedEntry: `${pricing.device_models?.name} + ${pricing.services?.display_name} + ${pricing.pricing_tiers?.name}`
    });

    // Use admin-set pricing (discounted price takes precedence over base price)
    const adminSetPrice = pricing.discounted_price || pricing.base_price;
    let finalPrice = adminSetPrice;

    // Apply location adjustments on top of admin-set prices
    const locationResult = await getLocationAdjustment(supabase, postalCode || '');
    if (locationResult.adjustment > 0) {
      const locationAdjustmentAmount = adminSetPrice * (locationResult.adjustment / 100);
      finalPrice = Math.round((adminSetPrice + locationAdjustmentAmount) * 100) / 100;
    }

    // Calculate savings if there's a discounted price
    const savings = pricing.discounted_price 
      ? pricing.base_price - pricing.discounted_price 
      : undefined;

    // Build the price calculation response using admin data
    const calculation: PriceCalculation = {
      service: {
        id: pricing.services.id,
        name: pricing.services.name,
        display_name: pricing.services.display_name || serviceDisplayName,
        estimated_duration_minutes: pricing.services.estimated_duration_minutes || 45,
        warranty_period_days: pricing.services.warranty_period_days || (tier === 'premium' ? 180 : 90),
        is_doorstep_eligible: pricing.services.is_doorstep_eligible ?? true
      },
      device: {
        type: deviceType,
        brand: pricing.device_models.brands.display_name || brand,
        model: pricing.device_models.display_name || model
      },
      pricing: {
        base_price: pricing.base_price,
        discounted_price: pricing.discounted_price || undefined,
        final_price: finalPrice,
        tier_multiplier: 1.0, // Already applied in admin pricing
        location_adjustment: locationResult.adjustment,
        savings: savings
      },
      tier: {
        name: pricing.pricing_tiers.name,
        display_name: pricing.pricing_tiers.display_name,
        estimated_delivery_hours: pricing.pricing_tiers.estimated_delivery_hours,
        includes_features: pricing.pricing_tiers.includes_features || []
      },
      location: locationResult.info || undefined
    };

    return calculation;

  } catch (error) {
    apiLogger.error('Error querying dynamic pricing database', { error, deviceType, brand, model, service, tier });
    return null;
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
  // Map form service IDs to backend service names
  const serviceNameMapping: Record<string, string> = {
    // Mobile services
    'screen-replacement': 'screen_replacement',
    'battery-replacement': 'battery_replacement', 
    'charging-port': 'charging_port_repair',
    'speaker-mic': 'speaker_microphone_repair',
    'camera-repair': 'camera_repair',
    'water-damage': 'water_damage_diagnostics',
    'other-mobile': 'other_repair',
    
    // Laptop services
    'keyboard-repair': 'keyboard_repair',
    'trackpad-repair': 'trackpad_repair',
    'ram-upgrade': 'ram_upgrade',
    'storage-upgrade': 'storage_upgrade',
    'software-trouble': 'software_troubleshooting',
    'virus-removal': 'virus_removal',
    'cooling-repair': 'cooling_repair',
    'power-jack': 'power_jack_repair',
    'other-laptop': 'other_repair',
    
    // Tablet services (can reuse charging-port since they map to same backend service)
    'speaker-repair': 'speaker_repair',
    'button-repair': 'button_repair',
    'software-issue': 'software_troubleshooting',
    'other-tablet': 'other_repair'
  };

  // Map service IDs to display names
  const serviceDisplayNames: Record<string, string> = {
    'screen-replacement': 'Screen Replacement',
    'battery-replacement': 'Battery Replacement',
    'charging-port': 'Charging Port Repair',
    'speaker-mic': 'Speaker/Microphone Repair',
    'camera-repair': 'Camera Repair',
    'water-damage': 'Water Damage Diagnostics',
    'keyboard-repair': 'Keyboard Repair/Replacement',
    'trackpad-repair': 'Trackpad Repair',
    'ram-upgrade': 'RAM Upgrade',
    'storage-upgrade': 'Storage (HDD/SSD) Upgrade',
    'software-trouble': 'Software Troubleshooting',
    'virus-removal': 'Virus Removal',
    'cooling-repair': 'Cooling System Repair',
    'power-jack': 'Power Jack Repair',
    'speaker-repair': 'Speaker Repair',
    'button-repair': 'Button Repair',
    'software-issue': 'Software Issue',
    'other-mobile': 'Other Mobile Repair',
    'other-laptop': 'Other Laptop Repair',
    'other-tablet': 'Other Tablet Repair'
  };

  // Convert service ID to backend service name
  const backendServiceName = serviceNameMapping[service] || service;

  // Static pricing based on device type and service
  const basePrices: Record<string, Record<string, number>> = {
    mobile: {
      screen_replacement: 149,
      battery_replacement: 89,
      charging_port_repair: 109,
      speaker_microphone_repair: 99,
      camera_repair: 119,
      water_damage_diagnostics: 129,
      other_repair: 99
    },
    laptop: {
      screen_replacement: 249,
      battery_replacement: 139,
      keyboard_repair: 159,
      trackpad_repair: 139,
      ram_upgrade: 119,
      storage_upgrade: 179,
      software_troubleshooting: 99,
      virus_removal: 129,
      cooling_repair: 159,
      power_jack_repair: 149,
      other_repair: 129
    },
    tablet: {
      screen_replacement: 189,
      battery_replacement: 119,
      charging_port_repair: 109,
      speaker_repair: 99,
      button_repair: 89,
      software_troubleshooting: 99,
      other_repair: 109
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

  const basePrice = basePrices[deviceType.toLowerCase()]?.[backendServiceName] || 99;
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
      name: backendServiceName,
      display_name: serviceDisplayNames[service] || service.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      estimated_duration_minutes: 45,
      warranty_period_days: tier === 'premium' ? 180 : 90,
      is_doorstep_eligible: !service.includes('other') && !service.includes('water-damage')
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