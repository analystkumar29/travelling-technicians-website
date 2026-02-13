/**
 * Data Service for Travelling Technicians
 * 
 * Centralized service to fetch pricing, services, and testimonials from Supabase
 * with built‑in caching and fallback to static data.
 * 
 * Safety Mechanism: All functions return the exact same shape as current hardcoded data.
 * If database queries fail, they return the existing static values.
 */

import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const dataLogger = logger.createModuleLogger('data-service');

// Current hardcoded pricing data (from src/pages/index.tsx)
const STATIC_PRICING_DATA = {
  mobile: { range: '$79-$189', common: '$129', time: '30-45 min' },
  laptop: { range: '$99-$249', common: '$169', time: '45-90 min' },
  tablet: { range: '$89-$199', common: '$149', time: '30-60 min' }
};

// Current hardcoded popular services (from src/pages/index.tsx)
const STATIC_SERVICES = [
  { name: 'Screen Repair', price: 'From $89', icon: '📱' },
  { name: 'Battery Replace', price: 'From $79', icon: '🔋' },
  { name: 'Laptop Repair', price: 'From $99', icon: '💻' },
  { name: 'Charging Issues', price: 'From $69', icon: '⚡' }
];

// Current hardcoded testimonials (from src/pages/index.tsx)
const STATIC_TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah J.',
    location: 'Vancouver',
    rating: 5,
    comment: 'Excellent service! The technician came to my home and fixed my iPhone screen quickly. Very professional and convenient.',
    device: 'iPhone 13 Pro'
  },
  {
    id: 2,
    name: 'Michael C.',
    location: 'Burnaby',
    rating: 5,
    comment: 'Had my MacBook battery replaced at home. Professional service and saved me a trip to the mall. Highly recommend!',
    device: 'MacBook Pro 2019'
  },
  {
    id: 3,
    name: 'Jason T.',
    location: 'Richmond',
    rating: 4,
    comment: 'Great doorstep service for my Samsung. The price was fair and the repair was done perfectly.',
    device: 'Samsung Galaxy S22'
  },
  {
    id: 4,
    name: 'Anna W.',
    location: 'North Vancouver',
    rating: 5,
    comment: 'Amazing convenience! The technician was punctual and fixed my laptop keyboard issue in under an hour.',
    device: 'Dell XPS 13'
  }
];

// Hardcoded services data (from src/pages/services/*.tsx)
// Only include currently active services to prevent inactive services from leaking via fallback
const STATIC_LAPTOP_SERVICES = [
  {
    id: 1,
    name: 'Screen Replacement',
    description: 'Fix cracked, damaged, or non-responsive laptop screens with our convenient doorstep service. We replace screens for all major laptop brands including Apple, Dell, HP, Lenovo, and more.',
    icon: 'laptop',
    doorstep: true,
    limited: false,
    price: 'From $149',
    popular: true
  },
  {
    id: 2,
    name: 'Battery Replacement',
    description: 'Extend your laptop\'s battery life with a fresh replacement. Our technicians replace batteries for all major laptop brands right at your location.',
    icon: 'battery-full',
    doorstep: true,
    limited: false,
    price: 'From $99',
    popular: true
  }
];

const STATIC_MOBILE_SERVICES = [
  {
    id: 1,
    name: 'Screen Replacement',
    description: 'Don\'t live with a cracked or broken screen. Our technicians come to your location with high-quality replacement screens for all major brands including Apple, Samsung, Google, and more. Most screen replacements can be completed in 30-60 minutes right at your doorstep.',
    icon: 'mobile-alt',
    doorstep: true,
    limited: false,
    price: 'From $129',
    popular: true
  },
  {
    id: 2,
    name: 'Battery Replacement',
    description: 'Is your phone not holding a charge like it used to? Our mobile battery replacement service brings new life to your device. We use premium-quality batteries and can complete most replacements in under an hour at your chosen location.',
    icon: 'battery-full',
    doorstep: true,
    limited: false,
    price: 'From $79',
    popular: true
  }
];

const STATIC_TABLET_SERVICES = [
  {
    id: 1,
    name: 'Screen Replacement',
    description: 'Fix cracked, damaged, or non-responsive tablet screens with our convenient doorstep service. We replace screens for all major tablet brands including iPad, Samsung Galaxy Tab, and more.',
    icon: 'tablet-alt',
    doorstep: true,
    limited: false,
    price: 'From $149',
    popular: true
  },
  {
    id: 2,
    name: 'Battery Replacement',
    description: 'Extend your tablet\'s battery life with a fresh replacement. Our technicians replace batteries for all major tablet brands right at your location.',
    icon: 'battery-full',
    doorstep: true,
    limited: false,
    price: 'From $99',
    popular: true
  }
];

// Hardcoded brands data (from src/pages/services/*.tsx)
const STATIC_LAPTOP_BRANDS = [
  'Apple MacBook (All Models)',
  'Dell',
  'HP',
  'Lenovo',
  'Microsoft Surface',
  'ASUS',
  'Acer',
  'MSI',
  'Razer',
  'Samsung'
];

const STATIC_MOBILE_BRANDS = [
  'Apple iPhone (All Models)',
  'Samsung Galaxy Series',
  'Google Pixel',
  'LG',
  'Huawei',
  'OnePlus',
  'Xiaomi',
  'Motorola',
  'Sony Xperia',
  'Nokia'
];

const STATIC_TABLET_BRANDS = [
  'Apple iPad (All Models)',
  'Samsung Galaxy Tab',
  'Microsoft Surface',
  'Lenovo Tab',
  'Huawei MediaPad',
  'Amazon Fire Tablet',
  'Google Pixel Tablet',
  'ASUS ZenPad',
  'Sony Xperia Tablet',
  'LG G Pad'
];

// Cache configuration - Use a singleton pattern to survive hot reloads
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Use a global object that persists across hot reloads
const globalCache = {
  pricing: {
    data: null as typeof STATIC_PRICING_DATA | null,
    timestamp: 0
  },
  services: {
    data: null as typeof STATIC_SERVICES | null,
    timestamp: 0
  },
  testimonials: {
    data: null as typeof STATIC_TESTIMONIALS | null,
    timestamp: 0
  },
  deviceServices: {
    laptop: { data: null as typeof STATIC_LAPTOP_SERVICES | null, timestamp: 0 },
    mobile: { data: null as typeof STATIC_MOBILE_SERVICES | null, timestamp: 0 },
    tablet: { data: null as typeof STATIC_TABLET_SERVICES | null, timestamp: 0 }
  },
  deviceBrands: {
    laptop: { data: null as typeof STATIC_LAPTOP_BRANDS | null, timestamp: 0 },
    mobile: { data: null as typeof STATIC_MOBILE_BRANDS | null, timestamp: 0 },
    tablet: { data: null as typeof STATIC_TABLET_BRANDS | null, timestamp: 0 }
  }
};

/**
 * Check if cache is still valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Get pricing data from database with fallback to static data
 * Phase 2: Implements safety check - if dynamic prices deviate by >10% from hardcoded, use static data
 */
export async function getPricingData(): Promise<typeof STATIC_PRICING_DATA> {
  // Return cached data if valid
  if (isCacheValid(globalCache.pricing.timestamp)) {
    dataLogger.debug('Returning cached pricing data');
    return globalCache.pricing.data!;
  }

  try {
    const supabase = getServiceSupabase();
    
    // Query to get price ranges per device type with proper joins
    // Using a simpler approach: query with raw SQL-like joins through multiple queries
    // First, get all active pricing with model IDs
    const { data: pricingData, error } = await supabase
      .from('dynamic_pricing')
      .select('base_price, model_id')
      .eq('is_active', true)
      .limit(1000);

    if (error) {
      dataLogger.warn('Database error fetching pricing data, using static fallback', { error: error.message });
      globalCache.pricing = {
        data: STATIC_PRICING_DATA,
        timestamp: Date.now()
      };
      return STATIC_PRICING_DATA;
    }

    if (!pricingData || pricingData.length === 0) {
      dataLogger.info('No pricing data found in database, using static fallback');
      globalCache.pricing = {
        data: STATIC_PRICING_DATA,
        timestamp: Date.now()
      };
      return STATIC_PRICING_DATA;
    }

    dataLogger.info(`Found ${pricingData.length} dynamic pricing records`);
    
    // Get all unique model IDs
    const modelIds = [...new Set(pricingData.map(item => item.model_id).filter(Boolean))];
    
    if (modelIds.length === 0) {
      dataLogger.warn('No valid model IDs found in pricing data, using static fallback');
      globalCache.pricing = {
        data: STATIC_PRICING_DATA,
        timestamp: Date.now()
      };
      return STATIC_PRICING_DATA;
    }
    
    // Fetch device models with their device types (use type_id)
    const { data: deviceModels, error: modelsError } = await supabase
      .from('device_models')
      .select('id, type_id')
      .in('id', modelIds)
      .eq('is_active', true);
    
    if (modelsError) {
      dataLogger.warn('Error fetching device models, using static fallback', { error: modelsError.message });
      globalCache.pricing = {
        data: STATIC_PRICING_DATA,
        timestamp: Date.now()
      };
      return STATIC_PRICING_DATA;
    }
    
    // Get device type IDs and fetch device types (using type_id from deviceModels)
    const deviceTypeIds = [...new Set(deviceModels.map(model => model.type_id).filter(Boolean))];
    const { data: deviceTypes, error: typesError } = await supabase
      .from('device_types')
      .select('id, name')
      .in('id', deviceTypeIds)
      .eq('is_active', true);
    
    if (typesError) {
      dataLogger.warn('Error fetching device types, using static fallback', { error: typesError.message });
      globalCache.pricing = {
        data: STATIC_PRICING_DATA,
        timestamp: Date.now()
      };
      return STATIC_PRICING_DATA;
    }
    
    // Create mapping dictionaries (using type_id from models)
    const modelToDeviceTypeId: Record<string, string> = {};
    for (const model of deviceModels) {
      if (model.id && model.type_id) {
        modelToDeviceTypeId[model.id] = model.type_id;
      }
    }
    
    const deviceTypeIdToName: Record<string, string> = {};
    for (const type of deviceTypes) {
      if (type.id && type.name) {
        deviceTypeIdToName[type.id] = type.name;
      }
    }
    
    // Group by device type and calculate min/max
    const deviceTypePrices: Record<string, { min: number; max: number; count: number }> = {};
    
    for (const item of pricingData) {
      const deviceTypeId = modelToDeviceTypeId[item.model_id];
      if (!deviceTypeId) continue;
      
      const deviceType = deviceTypeIdToName[deviceTypeId];
      if (!deviceType) continue;
      
      const price = parseFloat(item.base_price as string);
      if (isNaN(price)) continue;
      
      if (!deviceTypePrices[deviceType]) {
        deviceTypePrices[deviceType] = { min: price, max: price, count: 1 };
      } else {
        deviceTypePrices[deviceType].min = Math.min(deviceTypePrices[deviceType].min, price);
        deviceTypePrices[deviceType].max = Math.max(deviceTypePrices[deviceType].max, price);
        deviceTypePrices[deviceType].count++;
      }
    }
    
    // Hardcoded price ranges (extract min/max from strings like "$79-$189")
    const HARDCODED_RANGES = {
      mobile: { min: 79, max: 189 },
      laptop: { min: 99, max: 249 },
      tablet: { min: 89, max: 199 }
    };
    
    // Check if we have data for all device types
    const hasAllDeviceTypes = ['mobile', 'laptop', 'tablet'].every(type => deviceTypePrices[type]?.count > 0);
    
    if (!hasAllDeviceTypes) {
      dataLogger.warn(`Missing pricing data for some device types. Available: ${Object.keys(deviceTypePrices).join(', ')}. Using static fallback.`);
      globalCache.pricing = {
        data: STATIC_PRICING_DATA,
        timestamp: Date.now()
      };
      return STATIC_PRICING_DATA;
    }
    
    // Check deviation for each device type
    let shouldUseStaticData = false;
    const deviations: string[] = [];
    
    for (const [deviceType, dbRange] of Object.entries(deviceTypePrices)) {
      const hardcodedRange = HARDCODED_RANGES[deviceType as keyof typeof HARDCODED_RANGES];
      if (!hardcodedRange) continue;
      
      // Calculate percentage deviation for min and max
      const minDeviation = Math.abs((dbRange.min - hardcodedRange.min) / hardcodedRange.min);
      const maxDeviation = Math.abs((dbRange.max - hardcodedRange.max) / hardcodedRange.max);
      
      if (minDeviation > 0.1 || maxDeviation > 0.1) { // > 10%
        deviations.push(`${deviceType}: min ${dbRange.min} vs ${hardcodedRange.min} (${(minDeviation*100).toFixed(1)}%), max ${dbRange.max} vs ${hardcodedRange.max} (${(maxDeviation*100).toFixed(1)}%)`);
        shouldUseStaticData = true;
      }
    }
    
    if (shouldUseStaticData) {
      dataLogger.warn(`Dynamic pricing deviates by >10% from hardcoded values. Using static data for safety. Deviations: ${deviations.join('; ')}`);
      globalCache.pricing = {
        data: STATIC_PRICING_DATA,
        timestamp: Date.now()
      };
      return STATIC_PRICING_DATA;
    }
    
    // All checks passed - create dynamic pricing data
    const dynamicPricingData = {
      mobile: {
        range: `$${deviceTypePrices.mobile.min}-$${deviceTypePrices.mobile.max}`,
        common: `$${Math.round((deviceTypePrices.mobile.min + deviceTypePrices.mobile.max) / 2)}`,
        time: '30-45 min'
      },
      laptop: {
        range: `$${deviceTypePrices.laptop.min}-$${deviceTypePrices.laptop.max}`,
        common: `$${Math.round((deviceTypePrices.laptop.min + deviceTypePrices.laptop.max) / 2)}`,
        time: '45-90 min'
      },
      tablet: {
        range: `$${deviceTypePrices.tablet.min}-$${deviceTypePrices.tablet.max}`,
        common: `$${Math.round((deviceTypePrices.tablet.min + deviceTypePrices.tablet.max) / 2)}`,
        time: '30-60 min'
      }
    };
    
    dataLogger.info('Dynamic pricing data passed safety checks, using database values', {
      mobile: dynamicPricingData.mobile.range,
      laptop: dynamicPricingData.laptop.range,
      tablet: dynamicPricingData.tablet.range
    });
    
    // Cache the result
    globalCache.pricing = {
      data: dynamicPricingData,
      timestamp: Date.now()
    };

    return dynamicPricingData;

  } catch (error) {
    dataLogger.error('Unexpected error fetching pricing data, using static fallback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    globalCache.pricing = {
      data: STATIC_PRICING_DATA,
      timestamp: Date.now()
    };
    return STATIC_PRICING_DATA;
  }
}

/**
 * Get popular services from database with fallback to static data
 * Phase 2: Returns actual database services with safety fallback
 */
export async function getPopularServices(): Promise<typeof STATIC_SERVICES> {
  // Return cached data if valid
  if (isCacheValid(globalCache.services.timestamp)) {
    dataLogger.debug('Returning cached services data');
    return globalCache.services.data!;
  }

  try {
    const supabase = getServiceSupabase();
    
    // Query services table for popular services
    const { data, error } = await supabase
      .from('services')
      .select('name, display_name, base_price, estimated_duration_minutes')
      .eq('is_active', true)
      .eq('is_popular', true)
      .order('sort_order', { ascending: true })
      .limit(4);

    if (error) {
      dataLogger.warn('Database error fetching services, using static fallback', { error: error.message });
      globalCache.services = {
        data: STATIC_SERVICES,
        timestamp: Date.now()
      };
      return STATIC_SERVICES;
    }

    if (!data || data.length === 0) {
      dataLogger.info('No services found in database, using static fallback');
      globalCache.services = {
        data: STATIC_SERVICES,
        timestamp: Date.now()
      };
      return STATIC_SERVICES;
    }

    dataLogger.info(`Found ${data.length} services in database`);
    
    // Map database results to the same shape as static services
    // We need to map service names to appropriate icons and price labels
    const serviceToIconMap: Record<string, string> = {
      'screen': '📱',
      'battery': '🔋',
      'laptop': '💻',
      'charging': '⚡',
      'software': '🖥️',
      'water': '💧',
      'camera': '📷',
      'audio': '🔊'
    };
    
    const dynamicServices = data.map((service, index) => {
      // Determine icon based on service name
      let icon = '🔧'; // default
      const serviceName = service.display_name || service.name;
      
      for (const [keyword, serviceIcon] of Object.entries(serviceToIconMap)) {
        if (serviceName.toLowerCase().includes(keyword)) {
          icon = serviceIcon;
          break;
        }
      }
      
      // Generate price label based on service base price or fallback heuristics
      let priceLabel = service.base_price ? `From $${service.base_price}` : 'From $89';
      if (!service.base_price) {
        if (serviceName.toLowerCase().includes('battery')) {
          priceLabel = 'From $79';
        } else if (serviceName.toLowerCase().includes('laptop')) {
          priceLabel = 'From $99';
        } else if (serviceName.toLowerCase().includes('charging')) {
          priceLabel = 'From $69';
        } else if (serviceName.toLowerCase().includes('software')) {
          priceLabel = 'From $49';
        }
      }
      
      return {
        name: service.display_name || service.name,
        price: priceLabel,
        icon: icon
      };
    });
    
    // Ensure we have exactly 4 services (pad with static if needed)
    const finalServices = dynamicServices.length >= 4
      ? dynamicServices.slice(0, 4)
      : [...dynamicServices, ...STATIC_SERVICES.slice(dynamicServices.length, 4)];
    
    dataLogger.info('Using dynamic services data', {
      services: finalServices.map(s => s.name)
    });
    
    // Cache the result
    globalCache.services = {
      data: finalServices,
      timestamp: Date.now()
    };

    return finalServices;

  } catch (error) {
    dataLogger.error('Unexpected error fetching services, using static fallback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    globalCache.services = {
      data: STATIC_SERVICES,
      timestamp: Date.now()
    };
    return STATIC_SERVICES;
  }
}

/**
 * Get testimonials from database with fallback to static data
 */
export async function getTestimonials(): Promise<typeof STATIC_TESTIMONIALS> {
  // Return cached data if valid
  if (isCacheValid(globalCache.testimonials.timestamp)) {
    dataLogger.debug('Returning cached testimonials data');
    return globalCache.testimonials.data!;
  }

  try {
    // Check if testimonials table exists
    const supabase = getServiceSupabase();
    
    // First, check if the table exists by attempting a simple query
    const { error } = await supabase
      .from('testimonials')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') { // Table doesn't exist
      dataLogger.info('Testimonials table does not exist, using static fallback');
      globalCache.testimonials = {
        data: STATIC_TESTIMONIALS,
        timestamp: Date.now()
      };
      return STATIC_TESTIMONIALS;
    }

    // If table exists, fetch testimonials (using is_featured)
    const { data, error: fetchError } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_featured', true)
      .order('featured_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(4);

    if (fetchError) {
      dataLogger.warn('Database error fetching testimonials, using static fallback', { error: fetchError.message });
      globalCache.testimonials = {
        data: STATIC_TESTIMONIALS,
        timestamp: Date.now()
      };
      return STATIC_TESTIMONIALS;
    }

    if (!data || data.length === 0) {
      dataLogger.info('No testimonials found in database, using static fallback');
      globalCache.testimonials = {
        data: STATIC_TESTIMONIALS,
        timestamp: Date.now()
      };
      return STATIC_TESTIMONIALS;
    }

    // Map database testimonials to the same shape as static testimonials
    const mappedTestimonials = data.map((testimonial, index) => ({
      id: testimonial.id || index + 1,
      name: testimonial.customer_name || 'Anonymous',
      location: testimonial.city || 'Vancouver',
      rating: testimonial.rating || 5,
      comment: testimonial.review || 'Great service!',
      device: testimonial.device_model || 'Device'
    }));

    // Ensure we have at least 4 testimonials
    const finalTestimonials = mappedTestimonials.length >= 4
      ? mappedTestimonials.slice(0, 4)
      : [...mappedTestimonials, ...STATIC_TESTIMONIALS.slice(mappedTestimonials.length, 4)];

    // Cache the result
    globalCache.testimonials = {
      data: finalTestimonials,
      timestamp: Date.now()
    };

    return finalTestimonials;

  } catch (error) {
    dataLogger.error('Unexpected error fetching testimonials, using static fallback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    globalCache.testimonials = {
      data: STATIC_TESTIMONIALS,
      timestamp: Date.now()
    };
    return STATIC_TESTIMONIALS;
  }
}

/**
 * Get services by device type from database with fallback to static data
 * Phase 2: DB-first fallback for service pages
 */
export async function getServicesByDeviceType(deviceType: 'laptop' | 'mobile' | 'tablet'): Promise<typeof STATIC_LAPTOP_SERVICES> {
  // Return cached data if valid
  const cacheKey = deviceType as keyof typeof globalCache.deviceServices;
  if (isCacheValid(globalCache.deviceServices[cacheKey].timestamp)) {
    dataLogger.debug(`Returning cached ${deviceType} services data`);
    return globalCache.deviceServices[cacheKey].data!;
  }

  try {
    const supabase = getServiceSupabase();
    
    // Get device type ID from device_types table
    const { data: deviceTypeData, error: deviceTypeError } = await supabase
      .from('device_types')
      .select('id')
      .ilike('name', deviceType)
      .eq('is_active', true)
      .maybeSingle();

    if (deviceTypeError || !deviceTypeData) {
      dataLogger.warn(`Device type ${deviceType} not found in database, using static fallback`, { error: deviceTypeError?.message });
      const staticData = getStaticServicesByDeviceType(deviceType);
      globalCache.deviceServices[cacheKey] = {
        data: staticData,
        timestamp: Date.now()
      };
      return staticData;
    }

    // Query services table for this device type
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('device_type_id', deviceTypeData.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      dataLogger.warn(`Database error fetching ${deviceType} services, using static fallback`, { error: error.message });
      const staticData = getStaticServicesByDeviceType(deviceType);
      globalCache.deviceServices[cacheKey] = {
        data: staticData,
        timestamp: Date.now()
      };
      return staticData;
    }

    if (!data || data.length === 0) {
      dataLogger.info(`No ${deviceType} services found in database, using static fallback`);
      const staticData = getStaticServicesByDeviceType(deviceType);
      globalCache.deviceServices[cacheKey] = {
        data: staticData,
        timestamp: Date.now()
      };
      return staticData;
    }

    dataLogger.info(`Found ${data.length} ${deviceType} services in database`);
    
    // Map database results to the same shape as static services
    const dynamicServices = data.map((service) => {
      // Parse price from dynamic_pricing table or use default
      const price = service.base_price ? `From $${service.base_price}` : 'From $99';
      
      return {
        id: service.id,
        name: service.name,
        description: service.description || '',
        icon: service.icon || 'wrench',
        doorstep: service.is_doorstep_eligible || false,
        limited: service.is_limited || false,
        price: price,
        popular: service.is_popular || false
      };
    });

    // Apply 10% price deviation safety check — skip when all base_price values are NULL
    const staticServices = getStaticServicesByDeviceType(deviceType);
    const hasRealPrices = data.some(s => s.base_price !== null && s.base_price !== undefined);
    const shouldUseStaticData = hasRealPrices ? checkPriceDeviation(dynamicServices, staticServices) : false;
    
    if (shouldUseStaticData) {
      dataLogger.warn(`Dynamic ${deviceType} service prices deviate by >10% from hardcoded values, using static data for safety`);
      globalCache.deviceServices[cacheKey] = {
        data: staticServices,
        timestamp: Date.now()
      };
      return staticServices;
    }

    dataLogger.info(`Using dynamic ${deviceType} services data`, {
      services: dynamicServices.map(s => s.name)
    });
    
    // Cache the result
    globalCache.deviceServices[cacheKey] = {
      data: dynamicServices,
      timestamp: Date.now()
    };

    return dynamicServices;

  } catch (error) {
    dataLogger.error(`Unexpected error fetching ${deviceType} services, using static fallback`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    const staticData = getStaticServicesByDeviceType(deviceType);
    globalCache.deviceServices[cacheKey] = {
      data: staticData,
      timestamp: Date.now()
    };
    return staticData;
  }
}

/**
 * Get brands by device type from database with fallback to static data
 * Phase 2: DB-first fallback for service pages
 */
export async function getBrandsByDeviceType(deviceType: 'laptop' | 'mobile' | 'tablet'): Promise<string[]> {
  // Return cached data if valid
  const cacheKey = deviceType as keyof typeof globalCache.deviceBrands;
  if (isCacheValid(globalCache.deviceBrands[cacheKey].timestamp)) {
    dataLogger.debug(`Returning cached ${deviceType} brands data`);
    return globalCache.deviceBrands[cacheKey].data!;
  }

  try {
    const supabase = getServiceSupabase();
    
    // Get device type ID from device_types table
    const { data: deviceTypeData, error: deviceTypeError } = await supabase
      .from('device_types')
      .select('id')
      .ilike('name', deviceType)
      .eq('is_active', true)
      .maybeSingle();

    if (deviceTypeError || !deviceTypeData) {
      dataLogger.warn(`Device type ${deviceType} not found in database, using static fallback`, { error: deviceTypeError?.message });
      const staticData = getStaticBrandsByDeviceType(deviceType);
      globalCache.deviceBrands[cacheKey] = {
        data: staticData,
        timestamp: Date.now()
      };
      return staticData;
    }

    // Query brands via device_models relationship (brands don't have device_type_id)
    const { data, error } = await supabase
      .from('brands')
      .select('display_name, name, device_models!inner(type_id, is_active)')
      .eq('device_models.type_id', deviceTypeData.id)
      .eq('device_models.is_active', true)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      dataLogger.warn(`Database error fetching ${deviceType} brands, using static fallback`, { error: error.message });
      const staticData = getStaticBrandsByDeviceType(deviceType);
      globalCache.deviceBrands[cacheKey] = {
        data: staticData,
        timestamp: Date.now()
      };
      return staticData;
    }

    if (!data || data.length === 0) {
      dataLogger.info(`No ${deviceType} brands found in database, using static fallback`);
      const staticData = getStaticBrandsByDeviceType(deviceType);
      globalCache.deviceBrands[cacheKey] = {
        data: staticData,
        timestamp: Date.now()
      };
      return staticData;
    }

    dataLogger.info(`Found ${data.length} ${deviceType} brands in database`);
    
    // Extract display names (fallback to name)
    const dynamicBrands = Array.from(
      new Set(data.map(brand => brand.display_name || brand.name).filter(Boolean))
    );

    dataLogger.info(`Using dynamic ${deviceType} brands data`, {
      brands: dynamicBrands.slice(0, 5) // Log first 5 brands
    });
    
    // Cache the result
    globalCache.deviceBrands[cacheKey] = {
      data: dynamicBrands,
      timestamp: Date.now()
    };

    return dynamicBrands;

  } catch (error) {
    dataLogger.error(`Unexpected error fetching ${deviceType} brands, using static fallback`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    const staticData = getStaticBrandsByDeviceType(deviceType);
    globalCache.deviceBrands[cacheKey] = {
      data: staticData,
      timestamp: Date.now()
    };
    return staticData;
  }
}

/**
 * Helper function to get static services by device type
 */
function getStaticServicesByDeviceType(deviceType: 'laptop' | 'mobile' | 'tablet'): typeof STATIC_LAPTOP_SERVICES {
  switch (deviceType) {
    case 'laptop':
      return STATIC_LAPTOP_SERVICES;
    case 'mobile':
      return STATIC_MOBILE_SERVICES;
    case 'tablet':
      return STATIC_TABLET_SERVICES;
    default:
      return STATIC_LAPTOP_SERVICES;
  }
}

/**
 * Helper function to get static brands by device type
 */
function getStaticBrandsByDeviceType(deviceType: 'laptop' | 'mobile' | 'tablet'): string[] {
  switch (deviceType) {
    case 'laptop':
      return STATIC_LAPTOP_BRANDS;
    case 'mobile':
      return STATIC_MOBILE_BRANDS;
    case 'tablet':
      return STATIC_TABLET_BRANDS;
    default:
      return STATIC_LAPTOP_BRANDS;
  }
}

/**
 * Check price deviation between dynamic and static services
 * Returns true if any price deviates by >10%
 */
function checkPriceDeviation(dynamicServices: any[], staticServices: any[]): boolean {
  for (let i = 0; i < Math.min(dynamicServices.length, staticServices.length); i++) {
    const dynamicService = dynamicServices[i];
    const staticService = staticServices[i];
    
    // Extract numeric price from strings like "From $149"
    const dynamicPriceMatch = dynamicService.price?.match(/\$(\d+)/);
    const staticPriceMatch = staticService.price?.match(/\$(\d+)/);
    
    if (dynamicPriceMatch && staticPriceMatch) {
      const dynamicPrice = parseInt(dynamicPriceMatch[1]);
      const staticPrice = parseInt(staticPriceMatch[1]);
      
      if (staticPrice > 0) {
        const deviation = Math.abs((dynamicPrice - staticPrice) / staticPrice);
        if (deviation > 0.1) { // > 10%
          dataLogger.warn(`Price deviation detected for ${dynamicService.name}: dynamic $${dynamicPrice} vs static $${staticPrice} (${(deviation*100).toFixed(1)}%)`);
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Get city data for ISR pages
 */
export async function getCityData(citySlug: string) {
  try {
    const supabase = getServiceSupabase();
    
    const { data, error } = await supabase
      .from('service_locations')
      .select('*')
      .ilike('city_name', citySlug.replace('-', ' '))
      .eq('is_active', true)
      .single();

    if (error) {
      dataLogger.warn(`City data not found for ${citySlug}, using fallback`, { error: error.message });
      return null;
    }

    return {
      ...data,
      local_content: data?.local_content ?? null
    };
  } catch (error) {
    dataLogger.error(`Error fetching city data for ${citySlug}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Get all active cities for sitemap and ISR paths
 */
export async function getAllActiveCities() {
  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch (error) {
    dataLogger.warn('Failed to create Supabase client, returning empty cities array', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('service_locations')
      .select('city_name')
      .eq('is_active', true)
      .order('city_name');

    if (error) {
      dataLogger.warn('Error fetching active cities from database, using fallback', { error: error.message });
      return [];
    }

    return data.map(item => ({
      city: item.city_name,
      slug: item.city_name.toLowerCase().replace(/\s+/g, '-')
    }));
  } catch (error) {
    dataLogger.error('Unexpected error fetching active cities', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
}

/**
 * Get nearby service locations based on geographic proximity
 * Returns the 3 closest active service locations (excluding the current city)
 */
export async function getNearbyLocations(
  currentCitySlug: string
): Promise<Array<{
  id: number;
  city: string;
  slug: string;
  distanceKm: number;
}>> {
  try {
    const supabase = getServiceSupabase();
    
    // First, get the current city's coordinates
    const { data: currentCityData, error: currentCityError } = await supabase
      .from('service_locations')
      .select('id, city_name, latitude, longitude')
      .ilike('city_name', currentCitySlug.replace('-', ' '))
      .eq('is_active', true)
      .single();
    
    if (currentCityError || !currentCityData) {
      dataLogger.warn(`Current city ${currentCitySlug} not found or has no coordinates, returning empty nearby locations`, {
        error: currentCityError?.message
      });
      return [];
    }
    
    const currentLat = parseFloat(currentCityData.latitude as string);
    const currentLng = parseFloat(currentCityData.longitude as string);
    
    if (isNaN(currentLat) || isNaN(currentLng)) {
      dataLogger.warn(`Current city ${currentCitySlug} has invalid coordinates (lat: ${currentLat}, lng: ${currentLng}), returning empty nearby locations`);
      return [];
    }
    
    // Get all other active service locations
    const { data: allLocations, error: locationsError } = await supabase
      .from('service_locations')
      .select('id, city_name, latitude, longitude')
      .eq('is_active', true)
      .neq('id', currentCityData.id);
    
    if (locationsError) {
      dataLogger.warn('Error fetching service locations for nearby calculation, returning empty', {
        error: locationsError.message
      });
      return [];
    }
    
    if (!allLocations || allLocations.length === 0) {
      dataLogger.info('No other service locations found for nearby calculation');
      return [];
    }
    
    // Calculate distances using Haversine formula
    const locationsWithDistance = allLocations
      .map(location => {
        const lat = parseFloat(location.latitude as string);
        const lng = parseFloat(location.longitude as string);
        
        if (isNaN(lat) || isNaN(lng)) {
          return null;
        }
        
        // Haversine formula to calculate distance in kilometers
        const R = 6371; // Earth's radius in km
        const dLat = (lat - currentLat) * Math.PI / 180;
        const dLng = (lng - currentLng) * Math.PI / 180;
        const a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(currentLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distanceKm = R * c;
        
        return {
          id: location.id,
          city: location.city_name,
          slug: location.city_name.toLowerCase().replace(/\s+/g, '-'),
          distanceKm: parseFloat(distanceKm.toFixed(1))
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3); // Return only the 3 closest locations
    
    dataLogger.info(`Found ${locationsWithDistance.length} nearby locations for ${currentCitySlug}`, {
      locations: locationsWithDistance.map(l => `${l.city} (${l.distanceKm}km)`)
    });
    
    return locationsWithDistance;
    
  } catch (error) {
    dataLogger.error('Unexpected error calculating nearby locations, returning empty', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
}

/**
 * Get dynamic pricing for specific city/service/model combination
 * Returns pricing data in format expected by repair pages
 */
export async function getDynamicPricing(
  citySlug: string,
  serviceSlug: string,
  modelSlug: string
): Promise<{
  basePrice: number;
  discountedPrice: number | null;
  priceRange: string;
}> {
  try {
    const supabase = getServiceSupabase();
    
    // Map URL slugs to database names - only include currently active services
    const serviceMapping: Record<string, string> = {
      'screen-repair': 'screen-replacement-mobile',
      'battery-replacement': 'battery-replacement-mobile',
      'laptop-screen-repair': 'screen-replacement-laptop'
    };
    
    const modelMapping: Record<string, string> = {
      'iphone-14': 'iphone-14',
      'iphone-15': 'iphone-15',
      'iphone-13': 'iphone-13',
      'samsung-galaxy-s23': 'samsung-galaxy-s23',
      'samsung-galaxy-s22': 'samsung-galaxy-s22',
      'google-pixel-7': 'google-pixel-7',
      'macbook-pro-2023': 'macbook-pro-2023'
    };
    
    const serviceName = serviceMapping[serviceSlug] || serviceSlug;
    const modelName = modelMapping[modelSlug] || modelSlug;
    
    // First, get city price adjustment percentage
    let priceAdjustmentPercentage = 0;
    try {
      const { data: cityData, error: cityError } = await supabase
        .from('service_locations')
        .select('price_adjustment_percentage')
        .ilike('city_name', citySlug.replace('-', ' '))
        .eq('is_active', true)
        .single();
      
      if (!cityError && cityData) {
        priceAdjustmentPercentage = parseFloat(cityData.price_adjustment_percentage as string) || 0;
      }
    } catch (error) {
      dataLogger.warn(`Error fetching city price adjustment for ${citySlug}, using 0%`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Query dynamic pricing with joins
    const { data: pricingData, error } = await supabase
      .from('dynamic_pricing')
      .select(`
        base_price,
        discounted_price,
        compare_at_price,
        services!inner(name, slug),
        device_models!inner(name, slug)
      `)
      .eq('is_active', true)
      .eq('services.slug', serviceName)
      .eq('device_models.slug', modelName)
      .order('base_price', { ascending: true })
      .limit(1);
    
    if (error) {
      dataLogger.warn(`Database error fetching dynamic pricing for ${citySlug}/${serviceSlug}/${modelSlug}, using fallback`, { error: error.message });
      return getFallbackPricing(serviceSlug);
    }
    
    if (!pricingData || pricingData.length === 0) {
      dataLogger.info(`No dynamic pricing found for ${citySlug}/${serviceSlug}/${modelSlug}, using fallback`);
      return getFallbackPricing(serviceSlug);
    }
    
    const pricing = pricingData[0];
    let basePrice = parseFloat(pricing.base_price as string);
    let discountedPrice = pricing.discounted_price
      ? parseFloat(pricing.discounted_price as string)
      : pricing.compare_at_price
        ? parseFloat(pricing.compare_at_price as string)
        : null;

    // If discountedPrice is higher than basePrice, treat basePrice as the discount
    if (discountedPrice && discountedPrice > basePrice) {
      [basePrice, discountedPrice] = [discountedPrice, basePrice];
    }
    
    // Apply city price adjustment
    if (priceAdjustmentPercentage !== 0) {
      const adjustmentFactor = 1 + (priceAdjustmentPercentage / 100);
      basePrice = Math.round(basePrice * adjustmentFactor);
      if (discountedPrice !== null) {
        discountedPrice = Math.round(discountedPrice * adjustmentFactor);
      }
    }
    
    // Calculate price range (base price ± 20% for display purposes)
    const minPrice = Math.round(basePrice * 0.8);
    const maxPrice = Math.round(basePrice * 1.2);
    const priceRange = `$${minPrice}-$${maxPrice}`;
    
    dataLogger.info(`Dynamic pricing found for ${citySlug}/${serviceSlug}/${modelSlug}: base=$${basePrice}, range=${priceRange}`);
    
    return {
      basePrice,
      discountedPrice,
      priceRange
    };
    
  } catch (error) {
    dataLogger.error(`Unexpected error fetching dynamic pricing for ${citySlug}/${serviceSlug}/${modelSlug}, using fallback`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return getFallbackPricing(serviceSlug);
  }
}

/**
 * Helper function to get fallback pricing based on service slug
 */
function getFallbackPricing(serviceSlug: string): {
  basePrice: number;
  discountedPrice: number | null;
  priceRange: string;
} {
  // Current hardcoded logic from repair page
  if (serviceSlug.includes('screen')) {
    return {
      basePrice: 129,
      discountedPrice: 109,
      priceRange: '$109-$189'
    };
  } else if (serviceSlug.includes('battery')) {
    return {
      basePrice: 99,
      discountedPrice: 89,
      priceRange: '$89-$149'
    };
  } else {
    return {
      basePrice: 149,
      discountedPrice: 129,
      priceRange: '$129-$249'
    };
  }
}

/**
 * Get all active services for ISR paths
 * Fetches all active services from the database
 */
export async function getAllActiveServices(): Promise<Array<{
  id: number;
  name: string;
  display_name: string;
  slug: string;
  device_type_id: number;
  device_type: string;
  is_doorstep_eligible: boolean;
  is_popular: boolean;
  is_limited: boolean;
  base_price?: number;
  estimated_duration_minutes?: number;
}>> {
  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch (error) {
    dataLogger.warn('Failed to create Supabase client, returning empty services array', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
  
  try {
    // Fetch active services from database with device type info
    const { data, error } = await supabase
      .from('services')
      .select(`
        id,
        name,
        display_name,
        slug,
        device_type_id,
        is_doorstep_eligible,
        is_popular,
        is_limited,
        base_price,
        estimated_duration_minutes,
        device_types!inner(name)
      `)
      .eq('is_active', true)
      .eq('device_types.is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      dataLogger.warn('Error fetching active services from database, using fallback', { error: error.message });
      // Return empty array as fallback
      return [];
    }

    if (!data || data.length === 0) {
      dataLogger.info('No active services found in database');
      return [];
    }

    // Map database results to our expected format
    const services = data.map(service => {
      // Convert service name to URL slug format (use stored slug if available)
      const slug = service.slug || service.name.toLowerCase().replace(/\s+/g, '-');
      
      // device_types is an array, get the first one
      const deviceTypeName = service.device_types && service.device_types.length > 0
        ? service.device_types[0].name
        : 'unknown';
      
      return {
        id: service.id,
        name: service.name,
        display_name: service.display_name || service.name,
        slug: slug,
        device_type_id: service.device_type_id,
        device_type: deviceTypeName,
        is_doorstep_eligible: service.is_doorstep_eligible || false,
        is_popular: service.is_popular || false,
        is_limited: service.is_limited || false,
        base_price: service.base_price ? parseFloat(service.base_price as string) : undefined,
        estimated_duration_minutes: service.estimated_duration_minutes
      };
    });

    dataLogger.info(`Found ${services.length} active services from database`, {
      services: services.map(s => s.slug)
    });

    return services;
  } catch (error) {
    dataLogger.error('Unexpected error fetching services, using fallback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
}

/**
 * Get all device models for a specific service
 * Fetches models that have pricing for the given service
 */
export async function getModelsForService(serviceSlug: string): Promise<Array<{
  id: number;
  name: string;
  display_name: string;
  slug: string;
  brand_id: number;
  brand_name: string;
  device_type_id: number;
  device_type: string;
  is_active: boolean;
  base_price?: number;
  discounted_price?: number;
}>> {
  try {
    const supabase = getServiceSupabase();
    
    // First, get the service ID from the service slug
    // Need to map URL slug to database service name
    const serviceMapping: Record<string, string> = {
      'screen-repair': 'screen-replacement-mobile',
      'battery-replacement': 'battery-replacement-mobile',
      'charging-port-repair': 'charging-port-repair',
      'laptop-screen-repair': 'screen-replacement-laptop',
      'water-damage-repair': 'water-damage-repair',
      'software-repair': 'software-repair',
      'camera-repair': 'camera-repair'
    };
    
    const serviceName = serviceMapping[serviceSlug] || serviceSlug;
    
    // Find the service by name
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('id, name, device_type_id')
      .eq('slug', serviceName)
      .eq('is_active', true)
      .single();

    if (serviceError || !serviceData) {
      dataLogger.warn(`Service not found for slug ${serviceSlug}, using fallback`, { error: serviceError?.message });
      return [];
    }

    // Get all device models that have pricing for this service
    // Use a simpler query: first get model IDs from dynamic_pricing, then fetch models
    const { data: pricingData, error: pricingError } = await supabase
      .from('dynamic_pricing')
      .select(`
        model_id,
        base_price,
        discounted_price,
        device_models!inner(
          id,
          name,
          slug,
          display_name,
          brand_id,
          type_id,
          is_active
        )
      `)
      .eq('service_id', serviceData.id)
      .eq('is_active', true)
      .eq('device_models.is_active', true);

    if (pricingError) {
      dataLogger.warn(`Error fetching models for service ${serviceSlug}, using fallback`, { error: pricingError.message });
      return [];
    }

    if (!pricingData || pricingData.length === 0) {
      dataLogger.info(`No models found for service ${serviceSlug}`);
      return [];
    }

    // Get unique model IDs
    const modelIds = [...new Set(pricingData.map(item => item.model_id).filter(Boolean))];
    
    if (modelIds.length === 0) {
      dataLogger.info(`No valid model IDs found for service ${serviceSlug}`);
      return [];
    }

    // Fetch complete model data with brand and device type info
    const { data: modelsData, error: modelsError } = await supabase
      .from('device_models')
      .select(`
        id,
        name,
        slug,
        display_name,
        brand_id,
        type_id,
        is_active,
        brands(name),
        device_types(name)
      `)
      .in('id', modelIds)
      .eq('is_active', true);

    if (modelsError) {
      dataLogger.warn(`Error fetching model details for service ${serviceSlug}, using fallback`, { error: modelsError.message });
      return [];
    }

    if (!modelsData || modelsData.length === 0) {
      dataLogger.info(`No model details found for service ${serviceSlug}`);
      return [];
    }

    // Create a map of model ID to pricing data
    const pricingMap = new Map<number, { base_price?: string; discounted_price?: string }>();
    pricingData.forEach(item => {
      if (item.model_id) {
        pricingMap.set(item.model_id, {
          base_price: item.base_price,
          discounted_price: item.discounted_price
        });
      }
    });

    // Map models to our expected format
    const models = modelsData.map(model => {
      const pricing = pricingMap.get(model.id);
      // Convert model name to URL slug format (use stored slug if available)
      const slug = model.slug || model.name.toLowerCase().replace(/\s+/g, '-');
      
      // Handle nested arrays for brands and device_types
      const brandName = model.brands && Array.isArray(model.brands) && model.brands.length > 0
        ? model.brands[0].name
        : 'Unknown';
      
      const deviceTypeName = model.device_types && Array.isArray(model.device_types) && model.device_types.length > 0
        ? model.device_types[0].name
        : 'unknown';
      
      return {
        id: model.id,
        name: model.name,
        display_name: model.display_name || model.name,
        slug: slug,
        brand_id: model.brand_id,
        brand_name: brandName,
        device_type_id: model.type_id,
        device_type: deviceTypeName,
        is_active: model.is_active,
        base_price: pricing?.base_price ? parseFloat(pricing.base_price as string) : undefined,
        discounted_price: pricing?.discounted_price ? parseFloat(pricing.discounted_price as string) : undefined
      };
    });

    dataLogger.info(`Found ${models.length} unique models for service ${serviceSlug}`, {
      models: models.map(m => m.slug)
    });

    return models;
  } catch (error) {
    dataLogger.error(`Unexpected error fetching models for service ${serviceSlug}, using fallback`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
}

/**
 * Get all active service slugs for ISR paths
 * Fetches active device types from database and maps them to service page slugs
 */
export async function getAllActiveServiceSlugs(): Promise<Array<{ slug: string; deviceType: string }>> {
  try {
    const supabase = getServiceSupabase();
    
    // Fetch active device types from database
    const { data, error } = await supabase
      .from('device_types')
      .select('name')
      .eq('is_active', true)
      .order('id');

    if (error) {
      dataLogger.warn('Error fetching active device types, using fallback', { error: error.message });
      // Return hardcoded fallback slugs based on serviceConfig
      return getFallbackServiceSlugs();
    }

    if (!data || data.length === 0) {
      dataLogger.info('No active device types found in database, using fallback');
      return getFallbackServiceSlugs();
    }

    // Map device type names to slugs using serviceConfig mapping
    const serviceSlugs = data
      .map(deviceType => {
        const slug = getSlugForDeviceType(deviceType.name);
        return slug ? {
          slug,
          deviceType: deviceType.name
        } : null;
      })
      .filter((item): item is { slug: string; deviceType: string } => item !== null);

    dataLogger.info(`Found ${serviceSlugs.length} active service slugs from database`, {
      slugs: serviceSlugs.map(s => s.slug)
    });

    return serviceSlugs;
  } catch (error) {
    dataLogger.error('Unexpected error fetching service slugs, using fallback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return getFallbackServiceSlugs();
  }
}

/**
 * Helper function to get slug for a device type
 * Uses the mapping defined in service-page-config.ts
 */
function getSlugForDeviceType(deviceType: string): string | null {
  // Reverse mapping from device type to slug
  const deviceTypeToSlug: Record<string, string> = {
    'laptop': 'laptop-repair',
    'mobile': 'mobile-repair',
    'tablet': 'tablet-repair'
  };

  return deviceTypeToSlug[deviceType.toLowerCase()] || null;
}

/**
 * Helper function to get fallback service slugs
 * Returns the three hardcoded service slugs as fallback
 */
function getFallbackServiceSlugs(): Array<{ slug: string; deviceType: string }> {
  return [
    { slug: 'laptop-repair', deviceType: 'laptop' },
    { slug: 'mobile-repair', deviceType: 'mobile' },
    { slug: 'tablet-repair', deviceType: 'tablet' }
  ];
}

/**
 * Get service data by slug
 * Fetches service information from database using URL slug
 */
export async function getServiceBySlug(serviceSlug: string): Promise<{
  id: number;
  name: string;
  display_name: string;
  description?: string;
  slug: string;
  device_type_id: number;
  device_type: string;
  is_doorstep_eligible: boolean;
  is_popular: boolean;
  is_limited: boolean;
  base_price?: number;
  estimated_duration_minutes?: number;
} | null> {
  try {
    const supabase = getServiceSupabase();
    
    // Map URL slug to database service name - only include currently active services
    const serviceMapping: Record<string, string> = {
      'screen-repair': 'screen-replacement-mobile',
      'battery-replacement': 'battery-replacement-mobile',
      'laptop-screen-repair': 'screen-replacement-laptop'
    };
    
    const serviceName = serviceMapping[serviceSlug] || serviceSlug;
    
    // Fetch service from database
    const { data, error } = await supabase
      .from('services')
      .select(`
        id,
        name,
        display_name,
        description,
        slug,
        device_type_id,
        is_doorstep_eligible,
        is_popular,
        is_limited,
        base_price,
        estimated_duration_minutes,
        device_types!inner(name)
      `)
      .eq('slug', serviceName)
      .eq('is_active', true)
      .single();

    if (error) {
      dataLogger.warn(`Service not found for slug ${serviceSlug}`, { error: error.message });
      return null;
    }

    if (!data) {
      dataLogger.info(`No service found for slug ${serviceSlug}`);
      return null;
    }

    // Map database result to our expected format
    const deviceTypeName = data.device_types && Array.isArray(data.device_types) && data.device_types.length > 0
      ? data.device_types[0].name
      : 'unknown';
    
    return {
      id: data.id,
      name: data.name,
      display_name: data.display_name || data.name,
      slug: data.slug || serviceSlug,
      description: data.description || undefined,
      device_type_id: data.device_type_id,
      device_type: deviceTypeName,
      is_doorstep_eligible: data.is_doorstep_eligible || false,
      is_popular: data.is_popular || false,
      is_limited: data.is_limited || false,
      base_price: data.base_price ? parseFloat(data.base_price as string) : undefined,
      estimated_duration_minutes: data.estimated_duration_minutes
    };
  } catch (error) {
    dataLogger.error(`Unexpected error fetching service for slug ${serviceSlug}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Get model data by slug
 * Fetches model information from database using URL slug
 */
export async function getModelBySlug(modelSlug: string): Promise<{
  id: number;
  name: string;
  display_name: string;
  slug: string;
  brand_id: number;
  brand_name: string;
  device_type_id: number;
  device_type: string;
  is_active: boolean;
} | null> {
  try {
    const supabase = getServiceSupabase();
    
    // Map URL slug to database model name
    const { data, error } = await supabase
      .from('device_models')
      .select(`
        id,
        name,
        slug,
        display_name,
        brand_id,
        type_id,
        is_active,
        brands(name),
        device_types(name)
      `)
      .eq('slug', modelSlug)
      .eq('is_active', true)
      .single();

    if (error) {
      dataLogger.warn(`Model not found for slug ${modelSlug}`, { error: error.message });
      return null;
    }

    if (!data) {
      dataLogger.info(`No model found for slug ${modelSlug}`);
      return null;
    }

    // Map database result to our expected format
    const brandName = data.brands && Array.isArray(data.brands) && data.brands.length > 0
      ? data.brands[0].name
      : 'Unknown';
    
    const deviceTypeName = data.device_types && Array.isArray(data.device_types) && data.device_types.length > 0
      ? data.device_types[0].name
      : 'unknown';
    
    return {
      id: data.id,
      name: data.name,
      display_name: data.display_name || data.name,
      slug: data.slug || modelSlug,
      brand_id: data.brand_id,
      brand_name: brandName,
      device_type_id: data.type_id,
      device_type: deviceTypeName,
      is_active: data.is_active
    };
  } catch (error) {
    dataLogger.error(`Unexpected error fetching model for slug ${modelSlug}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Clear all caches (useful for testing)
 */
export function clearCache() {
  globalCache.pricing = { data: null, timestamp: 0 };
  globalCache.services = { data: null, timestamp: 0 };
  globalCache.testimonials = { data: null, timestamp: 0 };
  dataLogger.info('Data service cache cleared');
}

/**
 * Get neighborhood data by city and neighborhood slug
 * Phase 8.3: Fetches complete neighborhood data with Proof-of-Life stats and testimonials
 */
export async function getNeighborhoodData(citySlug: string, neighborhoodSlug: string): Promise<{
  id: string;
  neighborhoodName: string;
  cityName: string;
  latitude: number;
  longitude: number;
  monthlyIPhoneScreens: number;
  monthlySamsungScreens: number;
  monthlyPixelScreens: number;
  monthlyMacbookScreens: number;
  landmarkName: string;
  landmarkDescription: string;
  landmarkActivityWindow: string;
  neighborhoodContent: string;
  commonIssues: string[];
  postalCodes: string[];
  testimonials: any[];
} | null> {
  try {
    const supabase = getServiceSupabase();

    // First, get the city ID
    const { data: cityData, error: cityError } = await supabase
      .from('service_locations')
      .select('id, city_name')
      .ilike('city_name', citySlug.replace(/-/g, ' '))
      .eq('is_active', true)
      .single();

    if (cityError || !cityData) {
      dataLogger.warn(`City not found for slug ${citySlug}`, { error: cityError?.message });
      return null;
    }

    // Fetch neighborhood data
    const { data: neighborhoodData, error: neighborhoodError } = await supabase
      .from('neighborhood_pages')
      .select('*')
      .eq('city_id', cityData.id)
      .ilike('slug', neighborhoodSlug.replace(/-/g, ' '))
      .eq('is_active', true)
      .single();

    if (neighborhoodError || !neighborhoodData) {
      dataLogger.warn(`Neighborhood not found for city ${citySlug}, slug ${neighborhoodSlug}`, {
        error: neighborhoodError?.message
      });
      return null;
    }

    dataLogger.info(`Fetched neighborhood data: ${neighborhoodData.neighborhood_name} in ${cityData.city_name}`);

    return {
      id: neighborhoodData.id,
      neighborhoodName: neighborhoodData.neighborhood_name,
      cityName: cityData.city_name,
      latitude: parseFloat(neighborhoodData.latitude || '0'),
      longitude: parseFloat(neighborhoodData.longitude || '0'),
      monthlyIPhoneScreens: neighborhoodData.monthly_iphone_screens || 0,
      monthlySamsungScreens: neighborhoodData.monthly_samsung_screens || 0,
      monthlyPixelScreens: neighborhoodData.monthly_pixel_screens || 0,
      monthlyMacbookScreens: neighborhoodData.monthly_macbook_screens || 0,
      landmarkName: neighborhoodData.landmark_name || '',
      landmarkDescription: neighborhoodData.landmark_description || '',
      landmarkActivityWindow: neighborhoodData.landmark_activity_window || '',
      neighborhoodContent: neighborhoodData.neighborhood_content || '',
      commonIssues: neighborhoodData.common_issues || [],
      postalCodes: neighborhoodData.postal_codes || [],
      testimonials: neighborhoodData.testimonials || { primary: [], fallback: [] }
    };
  } catch (error) {
    dataLogger.error(`Unexpected error fetching neighborhood data for ${citySlug}/${neighborhoodSlug}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Get all neighborhood paths for ISR static generation
 * Phase 8.3: Returns array of { params: { city, neighborhood } } for getStaticPaths
 */
export async function getAllNeighborhoodPaths(): Promise<Array<{
  city: string;
  citySlug: string;
  neighborhood: string;
  neighborhoodSlug: string;
}>> {
  try {
    const supabase = getServiceSupabase();

    // Fetch all active neighborhoods with their city relationships
    const { data: neighborhoodData, error } = await supabase
      .from('neighborhood_pages')
      .select(`
        id,
        neighborhood_name,
        slug,
        city_id,
        service_locations!inner(city_name)
      `)
      .eq('is_active', true)
      .eq('service_locations.is_active', true)
      .order('service_locations.city_name', { ascending: true })
      .order('neighborhood_name', { ascending: true });

    if (error) {
      dataLogger.warn('Error fetching neighborhood paths for ISR', { error: error.message });
      return [];
    }

    if (!neighborhoodData || neighborhoodData.length === 0) {
      dataLogger.info('No active neighborhoods found for ISR paths');
      return [];
    }

    // Map to expected format
    const paths = neighborhoodData.map(neighborhood => {
      const cityData = neighborhood.service_locations && Array.isArray(neighborhood.service_locations)
        ? neighborhood.service_locations[0]
        : null;

      return {
        city: neighborhood.neighborhood_name,
        citySlug: cityData?.city_name.toLowerCase().replace(/\s+/g, '-') || '',
        neighborhood: neighborhood.neighborhood_name,
        neighborhoodSlug: neighborhood.slug.toLowerCase().replace(/\s+/g, '-')
      };
    });

    dataLogger.info(`Found ${paths.length} neighborhood paths for ISR generation`, {
      neighborhoods: paths.length
    });

    return paths;
  } catch (error) {
    dataLogger.error('Unexpected error fetching all neighborhood paths', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
}

/**
 * Get related neighborhoods for a specific neighborhood
 * Phase 8.3: Returns 3-4 nearby neighborhoods for internal linking
 */
export async function getRelatedNeighborhoods(
  citySlug: string,
  currentNeighborhoodSlug: string
): Promise<Array<{
  neighborhood: string;
  neighborhoodSlug: string;
  city: string;
  citySlug: string;
  latitude: number;
  longitude: number;
}>> {
  try {
    const supabase = getServiceSupabase();

    // Get current neighborhood data
    const { data: currentCity, error: cityError } = await supabase
      .from('service_locations')
      .select('id, city_name')
      .ilike('city_name', citySlug.replace(/-/g, ' '))
      .eq('is_active', true)
      .single();

    if (cityError || !currentCity) {
      dataLogger.warn(`City not found for related neighborhoods: ${citySlug}`, { error: cityError?.message });
      return [];
    }

    const { data: currentNeighborhood, error: neighborhoodError } = await supabase
      .from('neighborhood_pages')
      .select('latitude, longitude')
      .eq('city_id', currentCity.id)
      .ilike('slug', currentNeighborhoodSlug.replace(/-/g, ' '))
      .eq('is_active', true)
      .single();

    if (neighborhoodError || !currentNeighborhood) {
      dataLogger.warn(`Neighborhood not found for related calculation: ${currentNeighborhoodSlug}`, {
        error: neighborhoodError?.message
      });
      return [];
    }

    const currentLat = parseFloat(currentNeighborhood.latitude || '0');
    const currentLng = parseFloat(currentNeighborhood.longitude || '0');

    // Get all other neighborhoods in the same city
    const { data: otherNeighborhoods, error } = await supabase
      .from('neighborhood_pages')
      .select(`
        id,
        neighborhood_name,
        slug,
        latitude,
        longitude,
        service_locations!inner(city_name)
      `)
      .eq('city_id', currentCity.id)
      .not('slug', 'eq', currentNeighborhoodSlug)
      .eq('is_active', true)
      .order('neighborhood_name', { ascending: true });

    if (error) {
      dataLogger.warn('Error fetching related neighborhoods', { error: error.message });
      return [];
    }

    if (!otherNeighborhoods || otherNeighborhoods.length === 0) {
      dataLogger.info(`No other neighborhoods found in ${currentCity.city_name}`);
      return [];
    }

    // Calculate distances and sort by proximity
    const neighborhoodsWithDistance = otherNeighborhoods
      .map(neighborhood => {
        const lat = parseFloat(neighborhood.latitude || '0');
        const lng = parseFloat(neighborhood.longitude || '0');

        // Haversine formula for distance
        const R = 6371; // Earth's radius in km
        const dLat = (lat - currentLat) * Math.PI / 180;
        const dLng = (lng - currentLng) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(currentLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        const cityData = neighborhood.service_locations && Array.isArray(neighborhood.service_locations)
          ? neighborhood.service_locations[0]
          : null;

        return {
          neighborhood: neighborhood.neighborhood_name,
          neighborhoodSlug: neighborhood.slug.toLowerCase().replace(/\s+/g, '-'),
          city: cityData?.city_name || currentCity.city_name,
          citySlug: citySlug,
          latitude: lat,
          longitude: lng,
          distance: distance
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4) // Return top 4 closest neighborhoods
      .map(({ distance, ...rest }) => rest); // Remove distance from final output

    dataLogger.info(`Found ${neighborhoodsWithDistance.length} related neighborhoods for ${currentNeighborhoodSlug}`);

    return neighborhoodsWithDistance;
  } catch (error) {
    dataLogger.error(`Unexpected error fetching related neighborhoods`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
}

/**
 * Get all active brand slugs for getStaticPaths
 */
export async function getAllActiveBrandSlugs(): Promise<string[]> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('brands')
      .select('slug')
      .eq('is_active', true)
      .order('name');

    if (error || !data) {
      dataLogger.warn('Error fetching brand slugs, using fallback', { error: error?.message });
      return ['apple', 'samsung', 'google'];
    }

    const slugs = data.map(b => b.slug).filter(Boolean);
    return slugs.length > 0 ? slugs : ['apple', 'samsung', 'google'];
  } catch (error) {
    dataLogger.error('Unexpected error fetching brand slugs', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return ['apple', 'samsung', 'google'];
  }
}

/**
 * Get brand data with models grouped by device type for brand pages
 */
export async function getBrandWithModels(brandSlug: string): Promise<{
  brand: { name: string; displayName: string; slug: string };
  deviceTypeGroups: Array<{
    deviceType: string;
    models: Array<{
      name: string;
      slug: string;
      services: Array<{ name: string; slug: string; routePath: string }>;
    }>;
  }>;
  testimonials: Array<{
    customer_name: string;
    city: string;
    device_model: string;
    rating: number;
    review: string;
  }>;
} | null> {
  try {
    const supabase = getServiceSupabase();

    // Fetch brand info
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('id, name, display_name, slug')
      .eq('slug', brandSlug)
      .eq('is_active', true)
      .single();

    if (brandError || !brandData) {
      dataLogger.warn(`Brand not found for slug ${brandSlug}`, { error: brandError?.message });
      return null;
    }

    // Fetch all model-service-page routes for Vancouver matching this brand
    const { data: routesData, error: routesError } = await supabase
      .from('dynamic_routes')
      .select('slug_path, payload')
      .eq('route_type', 'model-service-page')
      .eq('is_active', true)
      .like('slug_path', 'repair/vancouver/%');

    if (routesError) {
      dataLogger.warn(`Error fetching routes for brand ${brandSlug}`, { error: routesError.message });
      return null;
    }

    // Filter routes to this brand and group by device type → model → services
    const deviceTypeMap = new Map<string, Map<string, { name: string; slug: string; services: Array<{ name: string; slug: string; routePath: string }> }>>();

    for (const route of (routesData || [])) {
      const payload = route.payload as Record<string, Record<string, string>> | null;
      if (!payload) continue;

      const routeBrandSlug = payload.brand?.slug;
      if (routeBrandSlug !== brandSlug) continue;

      const deviceType = payload.device_type?.name || 'Other';
      const modelName = payload.model?.name;
      const modelSlug = payload.model?.slug;
      const serviceName = payload.service?.display_name || payload.service?.name;
      const serviceSlug = payload.service?.slug;

      if (!modelName || !modelSlug || !serviceName || !serviceSlug) continue;

      if (!deviceTypeMap.has(deviceType)) {
        deviceTypeMap.set(deviceType, new Map());
      }
      const modelsMap = deviceTypeMap.get(deviceType)!;

      if (!modelsMap.has(modelSlug)) {
        modelsMap.set(modelSlug, { name: modelName, slug: modelSlug, services: [] });
      }

      const model = modelsMap.get(modelSlug)!;
      // Avoid duplicate services
      if (!model.services.some(s => s.slug === serviceSlug)) {
        model.services.push({
          name: serviceName,
          slug: serviceSlug,
          routePath: `/${route.slug_path}`
        });
      }
    }

    // Sort models by flagship priority
    const priorityKeywords = ['pro max', 'ultra', 'pro', 'plus', '16', '25', '15', '24', '9', 'air', 'mini'];
    const sortModels = (models: Array<{ name: string; slug: string; services: any[] }>) => {
      return models.sort((a, b) => {
        const aScore = priorityKeywords.findIndex(kw => a.name.toLowerCase().includes(kw));
        const bScore = priorityKeywords.findIndex(kw => b.name.toLowerCase().includes(kw));
        return (aScore === -1 ? 999 : aScore) - (bScore === -1 ? 999 : bScore);
      });
    };

    // Preferred device type order
    const deviceTypeOrder = ['Mobile', 'Laptop', 'Tablet'];
    const deviceTypeGroups = Array.from(deviceTypeMap.entries())
      .sort((a, b) => {
        const aIdx = deviceTypeOrder.indexOf(a[0]);
        const bIdx = deviceTypeOrder.indexOf(b[0]);
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      })
      .map(([deviceType, modelsMap]) => ({
        deviceType,
        models: sortModels(Array.from(modelsMap.values()))
      }));

    // Fetch testimonials mentioning this brand's models
    const allModelNames = deviceTypeGroups.flatMap(g => g.models.map(m => m.name));
    let testimonials: Array<{ customer_name: string; city: string; device_model: string; rating: number; review: string }> = [];

    if (allModelNames.length > 0) {
      // Build OR filter for device_model matching brand models
      const brandNameLower = brandData.name.toLowerCase();
      const { data: testimonialData } = await supabase
        .from('testimonials')
        .select('customer_name, city, device_model, rating, review')
        .eq('status', 'approved')
        .ilike('device_model', `%${brandNameLower}%`)
        .order('rating', { ascending: false })
        .limit(6);

      testimonials = (testimonialData || []).map(t => ({
        customer_name: t.customer_name || 'Customer',
        city: t.city || 'Vancouver',
        device_model: t.device_model || '',
        rating: t.rating || 5,
        review: t.review || ''
      }));
    }

    return {
      brand: {
        name: brandData.name,
        displayName: brandData.display_name || brandData.name,
        slug: brandData.slug
      },
      deviceTypeGroups,
      testimonials
    };
  } catch (error) {
    dataLogger.error(`Unexpected error fetching brand data for ${brandSlug}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Top 15 model slugs for model landing pages
 */
const MODEL_PAGE_SLUGS = [
  'iphone-16-pro-max', 'iphone-16-pro', 'iphone-15-pro-max', 'iphone-15', 'iphone-14',
  'macbook-pro-14-m3', 'macbook-air-m3',
  'galaxy-s25-ultra', 'galaxy-s25', 'galaxy-s24-ultra', 'galaxy-s24', 'galaxy-s23-ultra',
  'pixel-9-pro', 'pixel-8-pro', 'pixel-8'
];

/**
 * Get the list of model slugs that have dedicated landing pages
 */
export function getModelPageSlugs(): string[] {
  return MODEL_PAGE_SLUGS;
}

/**
 * Check if a model slug has a dedicated model landing page
 */
export function hasModelPage(modelSlug: string): boolean {
  return MODEL_PAGE_SLUGS.includes(modelSlug);
}

/**
 * Get detailed model data for model landing pages
 * Fetches model metadata, services with pricing across cities, testimonials, and related models
 */
export async function getModelWithDetails(modelSlug: string): Promise<{
  model: { name: string; displayName: string; slug: string; releaseYear?: number; deviceType: string };
  brand: { name: string; displayName: string; slug: string };
  services: Array<{
    name: string;
    displayName: string;
    slug: string;
    minPrice: number;
    maxPrice: number;
    estimatedDuration: number;
    cities: Array<{ name: string; slug: string; routePath: string; price: number }>;
  }>;
  testimonials: Array<{ customer_name: string; city: string; device_model: string; rating: number; review: string }>;
  relatedModels: Array<{ name: string; slug: string; brandName: string }>;
} | null> {
  try {
    const supabase = getServiceSupabase();

    // 1. Get model metadata with brand and device type
    const { data: modelData, error: modelError } = await supabase
      .from('device_models')
      .select(`
        id, name, display_name, slug, release_year, type_id, brand_id,
        brands(name, display_name, slug),
        device_types(name)
      `)
      .eq('slug', modelSlug)
      .eq('is_active', true)
      .single();

    if (modelError || !modelData) {
      dataLogger.warn(`Model not found for slug ${modelSlug}`, { error: modelError?.message });
      return null;
    }

    const brandInfo = Array.isArray(modelData.brands) ? modelData.brands[0] : modelData.brands;
    const deviceTypeInfo = Array.isArray(modelData.device_types) ? modelData.device_types[0] : modelData.device_types;

    if (!brandInfo) {
      dataLogger.warn(`Brand not found for model ${modelSlug}`);
      return null;
    }

    // 2. Fetch all model-service-page routes for this model across all cities
    const { data: routesData, error: routesError } = await supabase
      .from('dynamic_routes')
      .select('slug_path, payload')
      .eq('route_type', 'model-service-page')
      .eq('is_active', true)
      .like('slug_path', `repair/%/%/${modelSlug}`);

    if (routesError) {
      dataLogger.warn(`Error fetching routes for model ${modelSlug}`, { error: routesError.message });
    }

    // Group routes by service, collect cities and pricing
    const serviceMap = new Map<string, {
      name: string;
      displayName: string;
      slug: string;
      estimatedDuration: number;
      cities: Array<{ name: string; slug: string; routePath: string; price: number }>;
    }>();

    for (const route of (routesData || [])) {
      const payload = route.payload as any;
      if (!payload?.service || !payload?.city) continue;

      const serviceSlug = payload.service.slug;
      const serviceName = payload.service.name;
      const serviceDisplayName = payload.service.display_name || serviceName;
      const cityName = payload.city.name;
      const citySlug = payload.city.slug;
      const duration = payload.service.estimated_duration_minutes || 45;

      // Get price from standard_pricing or pricing fallback
      const price = payload.standard_pricing?.base_price
        ?? payload.pricing?.base_price
        ?? 0;

      if (!serviceMap.has(serviceSlug)) {
        serviceMap.set(serviceSlug, {
          name: serviceName,
          displayName: serviceDisplayName,
          slug: serviceSlug,
          estimatedDuration: duration,
          cities: []
        });
      }

      const svc = serviceMap.get(serviceSlug)!;
      // Avoid duplicate cities
      if (!svc.cities.some(c => c.slug === citySlug)) {
        svc.cities.push({
          name: cityName,
          slug: citySlug,
          routePath: `/${route.slug_path}`,
          price: typeof price === 'number' ? price : parseFloat(price) || 0
        });
      }
    }

    // Build services array with price ranges
    const services = Array.from(serviceMap.values()).map(svc => {
      const prices = svc.cities.map(c => c.price).filter(p => p > 0);
      return {
        name: svc.name,
        displayName: svc.displayName,
        slug: svc.slug,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        estimatedDuration: svc.estimatedDuration,
        cities: svc.cities.sort((a, b) => a.name.localeCompare(b.name))
      };
    });

    // 3. Fetch testimonials for this model
    const { data: testimonialData } = await supabase
      .from('testimonials')
      .select('customer_name, city, device_model, rating, review')
      .eq('status', 'approved')
      .ilike('device_model', `%${modelData.name}%`)
      .order('rating', { ascending: false })
      .limit(6);

    const testimonials = (testimonialData || []).map(t => ({
      customer_name: t.customer_name || 'Customer',
      city: t.city || 'Vancouver',
      device_model: t.device_model || '',
      rating: t.rating || 5,
      review: t.review || ''
    }));

    // 4. Get related models (same brand + device type, excluding current)
    const { data: relatedData } = await supabase
      .from('device_models')
      .select('name, slug, brands(name)')
      .eq('brand_id', modelData.brand_id)
      .eq('type_id', modelData.type_id)
      .eq('is_active', true)
      .neq('slug', modelSlug)
      .order('popularity_score', { ascending: false })
      .limit(8);

    const relatedModels = (relatedData || []).map(m => ({
      name: m.name,
      slug: m.slug,
      brandName: (Array.isArray(m.brands) ? m.brands[0]?.name : (m.brands as any)?.name) || ''
    }));

    return {
      model: {
        name: modelData.name,
        displayName: modelData.display_name || modelData.name,
        slug: modelData.slug,
        releaseYear: modelData.release_year,
        deviceType: deviceTypeInfo?.name || 'Mobile'
      },
      brand: {
        name: brandInfo.name,
        displayName: brandInfo.display_name || brandInfo.name,
        slug: brandInfo.slug
      },
      services,
      testimonials,
      relatedModels
    };
  } catch (error) {
    dataLogger.error(`Unexpected error fetching model details for ${modelSlug}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Health check for database connection
 */
export async function checkDbConnection(): Promise<{ healthy: boolean; message: string }> {
  try {
    const supabase = getServiceSupabase();
    
    // Simple query to test connection
    const { error } = await supabase
      .from('service_locations')
      .select('count')
      .limit(1);

    if (error) {
      dataLogger.warn('Database connection test failed', { error: error.message });
      return {
        healthy: false,
        message: `Database connection failed: ${error.message}`
      };
    }

    return {
      healthy: true,
      message: 'Database connection successful'
    };
  } catch (error) {
    dataLogger.error('Unexpected error during database health check', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return {
      healthy: false,
      message: `Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
