import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PricingCalculation {
  success: boolean;
  data?: {
    base_price: number;
    final_price: number;
    promotional_price?: number;
    is_promotional: boolean;
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
      location_adjustment?: number;
      final_calculation: string;
    };
  };
  error?: string;
  fallback_used?: boolean;
  debug_info?: any;
}

// Service ID mapping (form kebab-case → database snake_case)
const SERVICE_ID_MAPPING: Record<string, string> = {
  'screen-replacement': 'screen_replacement',
  'battery-replacement': 'battery_replacement',
  'charging-port-repair': 'charging_port_repair',
  'speaker-repair': 'speaker_repair',
  'camera-repair': 'camera_repair',
  'water-damage': 'water_damage_diagnostics',
  'keyboard-repair': 'keyboard_repair',
  'trackpad-repair': 'trackpad_repair',
  'ram-upgrade': 'ram_upgrade',
  'storage-upgrade': 'storage_upgrade',
  'software-troubleshooting': 'software_troubleshooting',
  'virus-removal': 'virus_removal',
  'cooling-repair': 'cooling_system_repair',
  'power-jack-repair': 'power_jack_repair',
  'button-repair': 'button_repair',
  'software-issue': 'software_issue',
  'other-repair': 'other_repair'
};

// Service display names for user-friendly presentation
const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  'screen_replacement': 'Screen Replacement',
  'battery_replacement': 'Battery Replacement', 
  'charging_port_repair': 'Charging Port Repair',
  'speaker_repair': 'Speaker/Microphone Repair',
  'camera_repair': 'Camera Repair',
  'water_damage_diagnostics': 'Water Damage Diagnostics',
  'keyboard_repair': 'Keyboard Repair/Replacement',
  'trackpad_repair': 'Trackpad Repair',
  'ram_upgrade': 'RAM Upgrade',
  'storage_upgrade': 'Storage (HDD/SSD) Upgrade',
  'software_troubleshooting': 'Software Troubleshooting',
  'virus_removal': 'Virus Removal',
  'cooling_system_repair': 'Cooling System Repair',
  'power_jack_repair': 'Power Jack Repair',
  'button_repair': 'Button Repair',
  'software_issue': 'Software Issue',
  'other_repair': 'Other Repair'
};

// Tier configuration
const TIER_CONFIG = {
  economy: { multiplier: 0.85, warranty: 1, turnaround: 72 },
  standard: { multiplier: 1.0, warranty: 3, turnaround: 48 },
  premium: { multiplier: 1.25, warranty: 6, turnaround: 24 },
  express: { multiplier: 1.5, warranty: 6, turnaround: 12 }
};

// Fallback pricing structure
const FALLBACK_PRICING = {
  mobile: {
    screen_replacement: 149,
    battery_replacement: 89,
    charging_port_repair: 109,
    speaker_repair: 99,
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
    cooling_system_repair: 159,
    power_jack_repair: 149,
    other_repair: 129
  },
  tablet: {
    screen_replacement: 189,
    battery_replacement: 119,
    charging_port_repair: 109,
    speaker_repair: 99,
    button_repair: 89,
    software_issue: 99,
    other_repair: 109
  }
};

async function findDynamicPricing(deviceType: string, brand: string, model: string, service: string, tier: string): Promise<any> {
  try {
    console.log(`[DEBUG] Searching for pricing: ${deviceType}/${brand}/${model}/${service}/${tier}`);
    
    // SIMPLE QUERY PATTERN (like working management API)
    const { data: allPricing, error: pricingError } = await supabase
      .from('dynamic_pricing')
      .select('*')
      .order('created_at', { ascending: false });

    if (pricingError) {
      console.error('[ERROR] Database query failed:', pricingError);
      return null;
    }

    if (!allPricing || allPricing.length === 0) {
      console.log('[WARN] No pricing data found in database');
      return null;
    }

    console.log(`[DEBUG] Retrieved ${allPricing.length} pricing entries from database`);

    // Get lookup tables for JavaScript post-processing
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

    // Create lookup maps
    const deviceTypeMap = new Map(deviceTypes?.map(dt => [dt.id, dt]) || []);
    const brandMap = new Map(brands?.map(b => [b.id, b]) || []);
    const modelMap = new Map(deviceModels?.map(m => [m.id, m]) || []);
    const serviceMap = new Map(services?.map(s => [s.id, s]) || []);
    const categoryMap = new Map(serviceCategories?.map(c => [c.id, c]) || []);
    const tierMap = new Map(pricingTiers?.map(t => [t.id, t]) || []);

    // JavaScript post-processing to find matching entry
    const matchingEntry = allPricing.find(entry => {
      const model_info = modelMap.get(entry.model_id);
      const brand_info = brandMap.get(model_info?.brand_id);
      const device_type_info = deviceTypeMap.get(brand_info?.device_type_id);
      const service_info = serviceMap.get(entry.service_id);
      const category_info = categoryMap.get(service_info?.category_id);
      const tier_info = tierMap.get(entry.pricing_tier_id);

      const deviceTypeMatch = device_type_info?.name?.toLowerCase() === deviceType.toLowerCase();
      const brandMatch = brand_info?.name?.toLowerCase() === brand.toLowerCase();
      const modelMatch = model_info?.name?.toLowerCase().includes(model.toLowerCase()) || 
                        model.toLowerCase().includes(model_info?.name?.toLowerCase() || '');
      const serviceMatch = service_info?.name === SERVICE_ID_MAPPING[service] || service_info?.name === service;
      const tierMatch = tier_info?.name?.toLowerCase() === tier.toLowerCase();

      console.log(`[DEBUG] Checking entry ${entry.id}:`, {
        deviceTypeMatch: `${device_type_info?.name} === ${deviceType} = ${deviceTypeMatch}`,
        brandMatch: `${brand_info?.name} === ${brand} = ${brandMatch}`,
        modelMatch: `${model_info?.name} ~= ${model} = ${modelMatch}`,
        serviceMatch: `${service_info?.name} === ${SERVICE_ID_MAPPING[service]} = ${serviceMatch}`,
        tierMatch: `${tier_info?.name} === ${tier} = ${tierMatch}`
      });

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

      console.log(`[SUCCESS] Found matching entry:`, {
        id: enhancedEntry.id,
        base_price: enhancedEntry.base_price,
        promotional_price: enhancedEntry.promotional_price,
        device: `${device_type_info?.name}/${brand_info?.name}/${model_info?.name}`,
        service: service_info?.name,
        tier: tier_info?.name
      });

      return enhancedEntry;
    }

    console.log('[WARN] No matching entry found in database');
    return null;

  } catch (error) {
    console.error('[ERROR] Database search failed:', error);
    return null;
  }
}

function calculateFallbackPricing(deviceType: string, brand: string, service: string, tier: string) {
  const serviceKey = SERVICE_ID_MAPPING[service] || service;
  
  // Type-safe fallback pricing lookup
  const devicePricing = FALLBACK_PRICING[deviceType as keyof typeof FALLBACK_PRICING];
  const basePrice = devicePricing && typeof devicePricing === 'object' && serviceKey in devicePricing 
    ? (devicePricing as any)[serviceKey] 
    : 149;
  
  // Brand multipliers
  const brandMultipliers: Record<string, number> = {
    apple: 1.2,
    samsung: 1.1,
    google: 1.0,
    oneplus: 0.95,
    xiaomi: 0.9,
    dell: 1.05,
    hp: 1.0,
    lenovo: 0.95,
    asus: 1.0
  };

  const brandMultiplier = brandMultipliers[brand.toLowerCase()] || 0.9;
  const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.standard;
  
  const adjustedPrice = basePrice * brandMultiplier * tierConfig.multiplier;
  
  return {
    base_price: basePrice,
    final_price: Math.round(adjustedPrice * 100) / 100,
    tier_multiplier: tierConfig.multiplier,
    brand_multiplier: brandMultiplier,
    warranty_months: tierConfig.warranty,
    turnaround_hours: tierConfig.turnaround
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<PricingCalculation>) {
  const { deviceType, brand, model, service, tier = 'standard', postalCode } = req.query;

  // Validation
  if (!deviceType || !brand || !model || !service) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: deviceType, brand, model, service'
    });
  }

  console.log(`[INFO] Pricing request: ${deviceType}/${brand}/${model}/${service}/${tier}`);

  try {
    // Try to find dynamic pricing in database
    const dynamicPricing = await findDynamicPricing(
      deviceType as string,
      brand as string, 
      model as string,
      service as string,
      tier as string
    );

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
          matched_tier: dynamicPricing.tier?.name
        }
      });
    } else {
      // Use fallback pricing
      console.log(`[WARN] No dynamic pricing found, using fallback for: ${deviceType}/${brand}/${model}/${service}/${tier}`);
      
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
          fallback_calculation: fallbackPricing
        }
      });
    }

  } catch (error) {
    console.error('[ERROR] Pricing calculation failed:', error);
    
    // Emergency fallback
    const emergencyPricing = calculateFallbackPricing(
      deviceType as string,
      brand as string, 
      service as string,
      tier as string
    );

    return res.status(200).json({
      success: true,
      data: {
        base_price: emergencyPricing.base_price,
        final_price: emergencyPricing.final_price,
        is_promotional: false,
        tier: tier as string,
        warranty_months: emergencyPricing.warranty_months,
        turnaround_hours: emergencyPricing.turnaround_hours,
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
          base_price: emergencyPricing.base_price,
          tier_multiplier: emergencyPricing.tier_multiplier,
          final_calculation: `Emergency: $${emergencyPricing.base_price} × ${emergencyPricing.tier_multiplier} = $${emergencyPricing.final_price}`
        }
      },
      fallback_used: true,
      error: `Database error: ${error}`,
      debug_info: {
        source: 'emergency_fallback',
        error: String(error)
      }
    });
  }
} 