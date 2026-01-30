import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { logger } from '../utils/logger';

// Logger for this module
const dataLogger = logger.createModuleLogger('BookingData');

// ============================================
// TYPE DEFINITIONS (V2 Schema - UUID-based)
// ============================================

/**
 * Brand interface matching V2 schema with UUID
 */
export interface Brand {
  id: string; // UUID
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Device Model interface matching V2 schema with UUID
 */
export interface DeviceModel {
  id: string; // UUID
  brand_id: string; // UUID
  type_id: string; // UUID
  name: string;
  slug: string;
  release_year?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  // Populated fields
  brand_name?: string;
  device_type?: string;
}

/**
 * Service interface matching V2 schema with UUID
 */
export interface Service {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string;
  avg_time_minutes: number;
  is_active: boolean;
  created_at: string;
  // Additional fields that may come from API
  display_name?: string;
  estimated_duration_minutes?: number;
  warranty_period_days?: number;
  is_doorstep_eligible?: boolean;
  requires_diagnostics?: boolean;
  category?: {
    id: string;
    name: string;
    display_name: string;
    description?: string;
    icon_name?: string;
  };
  device_type?: string;
  sort_order?: number;
}

/**
 * API Response types
 */
interface BrandsApiResponse {
  success: boolean;
  brands?: Brand[];
  message?: string;
  error?: string;
}

interface ModelsApiResponse {
  success: boolean;
  models?: DeviceModel[];
  message?: string;
  error?: string;
}

interface ServicesApiResponse {
  success: boolean;
  services?: Service[];
  message?: string;
  error?: string;
}

// ============================================
// API FETCHER FUNCTIONS
// ============================================

/**
 * Fetch brands for a specific device type from API
 */
async function fetchBrands(deviceType: string): Promise<Brand[]> {
  const url = `/api/devices/brands?deviceType=${encodeURIComponent(deviceType)}`;
  
  dataLogger.debug('Fetching brands', { deviceType, url });
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    dataLogger.error('Failed to fetch brands', { 
      status: response.status, 
      statusText: response.statusText,
      error: errorText 
    });
    throw new Error(`Failed to fetch brands: ${response.statusText}`);
  }
  
  const data: BrandsApiResponse = await response.json();
  
  if (!data.success) {
    dataLogger.error('API returned error for brands', { error: data.error, message: data.message });
    throw new Error(data.error || data.message || 'Failed to fetch brands');
  }
  
  // Transform data to ensure UUID format
  const brands = (data.brands || []).map(brand => ({
    ...brand,
    id: String(brand.id), // Ensure ID is string (UUID)
  }));
  
  dataLogger.info('Successfully fetched brands', { count: brands.length, deviceType });
  
  return brands;
}

/**
 * Fetch models for a specific device type and brand from API
 */
async function fetchModels(deviceType: string, brand: string): Promise<DeviceModel[]> {
  const url = `/api/devices/models?deviceType=${encodeURIComponent(deviceType)}&brand=${encodeURIComponent(brand)}`;
  
  dataLogger.debug('Fetching models', { deviceType, brand, url });
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    dataLogger.error('Failed to fetch models', { 
      status: response.status, 
      statusText: response.statusText,
      error: errorText 
    });
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }
  
  const data: ModelsApiResponse = await response.json();
  
  if (!data.success) {
    dataLogger.error('API returned error for models', { error: data.error, message: data.message });
    throw new Error(data.error || data.message || 'Failed to fetch models');
  }
  
  // Transform data to ensure UUID format
  const models = (data.models || []).map(model => ({
    ...model,
    id: String(model.id), // Ensure ID is string (UUID)
    brand_id: String(model.brand_id), // Ensure brand_id is string (UUID)
    type_id: model.type_id ? String(model.type_id) : '', // Ensure type_id is string (UUID)
  }));
  
  dataLogger.info('Successfully fetched models', { 
    count: models.length, 
    deviceType, 
    brand 
  });
  
  return models;
}

/**
 * Pricing data interface
 */
export interface PricingData {
  base_price: number;
  final_price: number;
  travel_fee: number;
  discount?: number;
  breakdown?: {
    service_price: number;
    parts_price: number;
    labor_price: number;
  };
}

/**
 * API Response for pricing
 */
interface PricingApiResponse {
  success: boolean;
  pricing?: PricingData;
  message?: string;
  error?: string;
}

/**
 * Fetch pricing calculation from API
 * This now accepts device/brand/model/service names (not UUIDs)
 */
async function fetchPricing(
  deviceType: string,
  brand: string,
  model: string,
  service: string,
  tier: 'standard' | 'premium' = 'standard'
): Promise<PricingData> {
  const params = new URLSearchParams({
    deviceType,
    brand,
    model,
    service,
    tier,
  });
  
  const url = `/api/pricing/calculate?${params.toString()}`;
  
  dataLogger.debug('Fetching pricing', { deviceType, brand, model, service, tier });
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    dataLogger.error('Failed to fetch pricing', { 
      status: response.status, 
      statusText: response.statusText,
      error: errorText,
      url
    });
    throw new Error(`Failed to fetch pricing: ${response.statusText}`);
  }
  
  const data: any = await response.json();
  
  if (!data.success || !data.data) {
    dataLogger.error('API returned error for pricing', { error: data.error, message: data.message, data });
    throw new Error(data.error || data.message || 'Failed to fetch pricing');
  }
  
  // Transform API response to match our PricingData interface
  const pricing: PricingData = {
    base_price: data.data.base_price || 0,
    final_price: data.data.final_price || 0,
    travel_fee: 0, // Not returned by this API
    discount: 0,
  };
  
  dataLogger.info('Successfully fetched pricing', { 
    base_price: pricing.base_price,
    final_price: pricing.final_price
  });
  
  return pricing;
}

/**
 * Fetch services for a specific device type from API
 */
async function fetchServices(deviceType: string, category?: string): Promise<Service[]> {
  let url = `/api/pricing/services?deviceType=${encodeURIComponent(deviceType)}`;
  
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }
  
  dataLogger.debug('Fetching services', { deviceType, category, url });
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    dataLogger.error('Failed to fetch services', { 
      status: response.status, 
      statusText: response.statusText,
      error: errorText 
    });
    throw new Error(`Failed to fetch services: ${response.statusText}`);
  }
  
  const data: ServicesApiResponse = await response.json();
  
  if (!data.success) {
    dataLogger.error('API returned error for services', { error: data.error, message: data.message });
    throw new Error(data.error || data.message || 'Failed to fetch services');
  }
  
  // Transform data to ensure UUID format and normalize structure
  const services = (data.services || []).map(service => ({
    id: String(service.id), // Ensure ID is string (UUID)
    name: service.name,
    slug: service.slug || service.name.toLowerCase().replace(/\s+/g, '-'),
    description: service.description,
    avg_time_minutes: service.avg_time_minutes || service.estimated_duration_minutes || 45,
    is_active: service.is_active !== undefined ? service.is_active : true,
    created_at: service.created_at || new Date().toISOString(),
    // Additional optional fields
    display_name: service.display_name,
    estimated_duration_minutes: service.estimated_duration_minutes,
    warranty_period_days: service.warranty_period_days,
    is_doorstep_eligible: service.is_doorstep_eligible,
    requires_diagnostics: service.requires_diagnostics,
    category: service.category ? {
      id: String(service.category.id),
      name: service.category.name,
      display_name: service.category.display_name,
      description: service.category.description,
      icon_name: service.category.icon_name,
    } : undefined,
    device_type: service.device_type,
    sort_order: service.sort_order,
  }));
  
  dataLogger.info('Successfully fetched services', { 
    count: services.length, 
    deviceType,
    category 
  });
  
  return services;
}

// ============================================
// REACT QUERY HOOKS
// ============================================

/**
 * React Query hook to fetch brands for a device type
 * 
 * @param deviceType - The type of device (mobile, laptop, tablet)
 * @param options - Optional config to enable/disable the query
 * @returns UseQueryResult with brands data
 * 
 * @example
 * ```tsx
 * const { data: brands, isLoading, error } = useBrands('mobile');
 * ```
 */
export function useBrands(
  deviceType: string,
  options?: { enabled?: boolean }
): UseQueryResult<Brand[], Error> {
  return useQuery<Brand[], Error>({
    queryKey: ['brands', deviceType],
    queryFn: () => fetchBrands(deviceType),
    enabled: options?.enabled !== false && !!deviceType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to fetch models for a device type and brand
 * 
 * @param deviceType - The type of device (mobile, laptop, tablet)
 * @param brand - The brand name
 * @param options - Optional config to enable/disable the query
 * @returns UseQueryResult with models data
 * 
 * @example
 * ```tsx
 * const { data: models, isLoading, error } = useModels('mobile', 'Apple');
 * ```
 */
export function useModels(
  deviceType: string,
  brand: string,
  options?: { enabled?: boolean }
): UseQueryResult<DeviceModel[], Error> {
  return useQuery<DeviceModel[], Error>({
    queryKey: ['models', deviceType, brand],
    queryFn: () => fetchModels(deviceType, brand),
    enabled: options?.enabled !== false && !!deviceType && !!brand,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to fetch services for a device type
 * 
 * @param deviceType - The type of device (mobile, laptop, tablet)
 * @param category - Optional category filter
 * @param options - Optional config to enable/disable the query
 * @returns UseQueryResult with services data
 * 
 * @example
 * ```tsx
 * const { data: services, isLoading, error } = useServices('mobile');
 * const { data: screenServices } = useServices('mobile', 'screen_repair');
 * ```
 */
export function useServices(
  deviceType: string,
  category?: string,
  options?: { enabled?: boolean }
): UseQueryResult<Service[], Error> {
  return useQuery<Service[], Error>({
    queryKey: ['services', deviceType, category],
    queryFn: () => fetchServices(deviceType, category),
    enabled: options?.enabled !== false && !!deviceType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to calculate pricing
 * 
 * @param deviceType - Device type (mobile, laptop, tablet)
 * @param brand - Brand name (e.g., "apple", "samsung")
 * @param model - Model name (e.g., "iPhone 16 Pro Max")
 * @param service - Service slug (e.g., "screen-replacement")
 * @param tier - Service tier ('standard' or 'premium')
 * @param options - Optional config to enable/disable the query
 * @returns UseQueryResult with pricing data
 * 
 * @example
 * ```tsx
 * const { data: pricing, isLoading } = useCalculatePrice(
 *   'mobile',
 *   'apple',
 *   'iPhone 16 Pro Max',
 *   'screen-replacement',
 *   'standard'
 * );
 * ```
 */
export function useCalculatePrice(
  deviceType: string,
  brand: string,
  model: string,
  service: string | string[],
  tier: 'standard' | 'premium' = 'standard',
  options?: { enabled?: boolean }
): UseQueryResult<PricingData, Error> {
  // If service is an array, use the first one for pricing calculation
  const serviceSlug = Array.isArray(service) ? service[0] : service;
  
  return useQuery<PricingData, Error>({
    queryKey: ['pricing', deviceType, brand, model, serviceSlug, tier],
    queryFn: () => fetchPricing(deviceType, brand, model, serviceSlug, tier),
    enabled: options?.enabled !== false && !!deviceType && !!brand && !!model && !!serviceSlug,
    staleTime: 2 * 60 * 1000, // 2 minutes (pricing can change)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
