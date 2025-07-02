import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/pricing-coverage');

interface PricingCoverage {
  device_type: string;
  brand_name: string;
  model_name: string;
  service_name: string;
  tier_name: string;
  is_missing: boolean;
  existing_price?: number;
  fallback_price?: number;
  service_id: number;
  model_id: number;
  pricing_tier_id: number;
  existing_id?: number;
}

interface ApiResponse {
  success: boolean;
  coverage?: PricingCoverage[];
  summary?: {
    total_combinations: number;
    existing_entries: number;
    missing_entries: number;
    coverage_percentage: number;
  };
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    apiLogger.info('Analyzing pricing coverage...');

    const supabase = getServiceSupabase();

    // Step 1: Fetch all existing data to build the complete matrix
    const [
      { data: deviceTypes },
      { data: brands },
      { data: deviceModels },
      { data: services },
      { data: pricingTiers },
      { data: existingPricing }
    ] = await Promise.all([
      supabase.from('device_types').select('*'),
      supabase.from('brands').select('*'),
      supabase.from('device_models').select('*'),
      supabase.from('services').select('*'),
      supabase.from('pricing_tiers').select('*'),
      supabase.from('dynamic_pricing').select('*').order('id', { ascending: true }).limit(2000)
    ]);

    if (!deviceTypes || !brands || !deviceModels || !services || !pricingTiers || !existingPricing) {
      throw new Error('Failed to fetch required data');
    }

    // Step 2: Create lookup maps for efficient data joining
    const servicesMap = new Map(services?.map((s: any) => [s.id, s]) || []);
    const modelsMap = new Map(deviceModels?.map((m: any) => [m.id, m]) || []);
    const brandsMap = new Map(brands?.map((b: any) => [b.id, b]) || []);
    const deviceTypesMap = new Map(deviceTypes?.map((dt: any) => [dt.id, dt]) || []);
    const tiersMap = new Map(pricingTiers?.map((t: any) => [t.id, t]) || []);

    // Step 3: Create a set of existing pricing combinations for fast lookup
    const existingCombinations = new Map();
    existingPricing.forEach((pricing: any) => {
      const service = servicesMap.get(pricing.service_id);
      const model = modelsMap.get(pricing.model_id);
      const brand = model ? brandsMap.get((model as any).brand_id) : null;
      const deviceType = brand ? deviceTypesMap.get((brand as any).device_type_id) : null;
      const tier = tiersMap.get(pricing.pricing_tier_id);

      if (service && model && brand && deviceType && tier) {
        const key = `${(deviceType as any).name}-${(brand as any).name}-${(model as any).name}-${(service as any).name}-${(tier as any).name}`.toLowerCase();
        existingCombinations.set(key, pricing);
        
        // Debug logging for the specific combination we're tracking
        if (pricing.service_id === 1 && pricing.model_id === 3 && pricing.pricing_tier_id === 1) {
          apiLogger.info('Found existing pricing entry for iPhone 15 Plus screen replacement economy', {
            pricingId: pricing.id,
            key,
            deviceType: (deviceType as any).name,
            brand: (brand as any).name,
            model: (model as any).name,
            service: (service as any).name,
            tier: (tier as any).name,
            basePrice: pricing.base_price
          });
        }
      }
    });

    // Step 4: Generate the complete matrix of possible combinations
    const coverage: PricingCoverage[] = [];
    let totalCombinations = 0;

    // Group models by brand and device type for efficient processing
    const modelsByBrand = new Map();
    deviceModels.forEach((model: any) => {
      const brandId = (model as any).brand_id;
      if (!modelsByBrand.has(brandId)) {
        modelsByBrand.set(brandId, []);
      }
      modelsByBrand.get(brandId).push(model);
    });

    // Generate all possible combinations
    brands.forEach((brand: any) => {
      const deviceType = deviceTypesMap.get((brand as any).device_type_id);
      const models = modelsByBrand.get(brand.id) || [];

      models.forEach((model: any) => {
        services.forEach((service: any) => {
          // Only include services that are relevant to this device type
          const serviceDeviceType = deviceTypesMap.get((service as any).device_type_id);
          if (serviceDeviceType && (serviceDeviceType as any).name === (deviceType as any).name) {
            pricingTiers.forEach((tier: any) => {
              totalCombinations++;

              const combinationKey = `${(deviceType as any).name}-${(brand as any).name}-${(model as any).name}-${(service as any).name}-${(tier as any).name}`.toLowerCase();
              const existingEntry = existingCombinations.get(combinationKey);
              const isMissing = !existingEntry;

              // Debug logging for the specific combination we're tracking
              if (service.id === 1 && model.id === 3 && tier.id === 1) {
                apiLogger.info('Checking iPhone 15 Plus screen replacement economy combination', {
                  combinationKey,
                  existingEntry: !!existingEntry,
                  isMissing,
                  deviceType: (deviceType as any).name,
                  brand: (brand as any).name,
                  model: (model as any).name,
                  service: (service as any).name,
                  tier: (tier as any).name,
                  serviceId: service.id,
                  modelId: model.id,
                  tierId: tier.id,
                  existingCombinationsSize: existingCombinations.size
                });
              }

              coverage.push({
                device_type: (deviceType as any).name,
                brand_name: (brand as any).name,
                model_name: (model as any).name,
                service_name: (service as any).name,
                tier_name: (tier as any).name,
                is_missing: isMissing,
                existing_price: existingEntry ? existingEntry.base_price : undefined,
                fallback_price: isMissing ? calculateFallbackPrice((deviceType as any).name, (service as any).name, (tier as any).name) : undefined,
                service_id: service.id,
                model_id: model.id,
                pricing_tier_id: tier.id,
                existing_id: existingEntry ? existingEntry.id : undefined
              });
            });
          }
        });
      });
    });

    // Step 5: Calculate summary statistics
    const existingEntries = coverage.filter(c => !c.is_missing).length;
    const missingEntries = coverage.filter(c => c.is_missing).length;
    const coveragePercentage = totalCombinations > 0 ? ((existingEntries / totalCombinations) * 100) : 0;

    const summary = {
      total_combinations: totalCombinations,
      existing_entries: existingEntries,
      missing_entries: missingEntries,
      coverage_percentage: Math.round(coveragePercentage * 100) / 100
    };

    apiLogger.info('Pricing coverage analysis complete', { summary });

    return res.status(200).json({
      success: true,
      coverage,
      summary
    });

  } catch (error) {
    apiLogger.error('Error analyzing pricing coverage', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze pricing coverage'
    });
  }
}

// Helper function to calculate fallback pricing (same logic as customer API)
function calculateFallbackPrice(deviceType: string, serviceName: string, tierName: string): number {
  // Base pricing by device type and service
  const basePricing: { [key: string]: { [key: string]: number } } = {
    mobile: {
      'Screen Replacement': 149,
      'screen_replacement': 149,
      'Battery Replacement': 89,
      'battery_replacement': 89,
      'Charging Port Repair': 109,
      'charging_port_repair': 109,
      'Speaker/Microphone Repair': 99,
      'speaker_repair': 99,
      'Camera Repair': 119,
      'camera_repair': 119,
      'Water Damage Diagnostics': 129,
      'water_damage_repair': 129,
      'Other Repairs': 99
    },
    laptop: {
      'Screen Replacement': 249,
      'screen_replacement': 249,
      'Battery Replacement': 139,
      'battery_replacement': 139,
      'Keyboard Repair/Replacement': 159,
      'keyboard_repair': 159,
      'Trackpad Repair': 139,
      'trackpad_repair': 139,
      'RAM Upgrade': 119,
      'ram_upgrade': 119,
      'Storage (HDD/SSD) Upgrade': 179,
      'storage_upgrade': 179,
      'Software Troubleshooting': 99,
      'software_troubleshooting': 99,
      'Virus Removal': 129,
      'virus_removal': 129,
      'Cooling System Repair': 159,
      'cooling_system_repair': 159,
      'Power Jack Repair': 149,
      'power_jack_repair': 149,
      'Other Repairs': 129
    },
    tablet: {
      'Screen Replacement': 189,
      'screen_replacement': 189,
      'Battery Replacement': 119,
      'battery_replacement': 119,
      'Charging Port Repair': 109,
      'charging_port_repair': 109,
      'Speaker Repair': 99,
      'speaker_repair': 99,
      'Button Repair': 89,
      'button_repair': 89,
      'Software Issue': 99,
      'software_troubleshooting': 99,
      'Other Repairs': 109
    }
  };

  // Get base price
  const devicePricing = basePricing[deviceType.toLowerCase()] || basePricing.mobile;
  const basePrice = devicePricing[serviceName] || devicePricing['Other Repairs'] || 99;

  // Apply tier multipliers
  const tierMultipliers: { [key: string]: number } = {
    'economy': 0.85,
    'standard': 1.0,
    'premium': 1.25,
    'same_day': 1.4,
    'express': 1.5
  };

  const multiplier = tierMultipliers[tierName.toLowerCase()] || 1.0;
  return Math.round(basePrice * multiplier);
} 