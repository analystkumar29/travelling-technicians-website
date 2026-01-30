/**
 * Admin Panel TypeScript Definitions
 * Aligned with ACTUAL DATABASE SCHEMA (Source of Truth)
 * 
 * Last Updated: Jan 29, 2026
 * Schema verified via Supabase MCP
 */

/**
 * Device Type Record (e.g., Mobile, Laptop, Tablet)
 */
export interface DeviceTypeRecord {
  id: string;  // UUID
  name: string;  // e.g., "Mobile", "Laptop"
  slug: string;
  icon_name: string | null;
  is_active: boolean;
  created_at?: string;
}

/**
 * Brand Record (e.g., Apple, Samsung)
 * NOTE: Brands table does NOT have device_type_id FK in current schema
 */
export interface BrandRecord {
  id: string;  // UUID
  name: string;  // e.g., "Apple"
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at?: string;
}

/**
 * Device Model Record (e.g., iPhone 16, MacBook Pro M3)
 */
export interface DeviceModelRecord {
  id: string;  // UUID
  name: string;  // e.g., "iPhone 16"
  slug: string;
  brand_id: string;  // FK to brands (UUID)
  type_id: string;  // FK to device_types (UUID)
  release_year: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
  
  // Joined data from relationships
  brand?: BrandRecord;
  device_type?: DeviceTypeRecord;
}

/**
 * Service Category (e.g., Common Repairs, Hardware Services)
 */
export interface ServiceCategoryRecord {
  id: string;  // UUID
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

/**
 * Service Record (e.g., Screen Replacement, Battery Replacement)
 * NOTE: Services table DOES have display_name field
 */
export interface ServiceRecord {
  id: string;  // UUID
  name: string;  // e.g., "screen_replacement"
  display_name: string | null;  // e.g., "Screen Replacement"
  slug: string;
  description: string | null;
  device_type_id: string | null;  // FK to device_types (UUID)
  category_id: string | null;  // FK to service_categories (UUID)
  is_doorstep_eligible: boolean;
  requires_diagnostics: boolean;
  estimated_duration_minutes: number;
  avg_time_minutes: number;
  is_active: boolean;
  created_at?: string;
  
  // Joined data from relationships
  device_type?: DeviceTypeRecord;
  category?: ServiceCategoryRecord;
}

/**
 * Dynamic Pricing Record (the core pricing matrix)
 * Links: device_model + service + pricing_tier (TEXT) = price
 * 
 * IMPORTANT: pricing_tier is TEXT field ('standard'|'premium'), NOT a FK!
 * There is NO pricing_tiers table in the current schema.
 * 
 * Example: iPhone 16 + Screen Replacement + 'premium' = $299
 */
export interface DynamicPricingRecord {
  id: string;  // UUID
  model_id: string | null;  // FK to device_models (UUID)
  service_id: string | null;  // FK to services (UUID)
  base_price: number;  // e.g., 225.00
  compare_at_price: number | null;  // Sale/comparison price
  required_parts: string[];  // UUID array
  pricing_tier: 'standard' | 'premium';  // TEXT field with CHECK constraint
  part_quality: string | null;  // e.g., "OEM Parts", "Aftermarket Parts"
  part_warranty_months: number;  // Default: 3
  includes_installation: boolean;  // Default: true
  is_active: boolean;
  created_at?: string;
  
  // Joined data from relationships - Full objects
  device_model?: DeviceModelRecord;
  service?: ServiceRecord;
  brand?: BrandRecord;
  device_type?: DeviceTypeRecord;
}

/**
 * Technician Record (repair technicians)
 * Aligned with actual database schema after migration
 */
export interface TechnicianRecord {
  id: string;  // UUID
  full_name: string;
  whatsapp_number: string;  // Primary contact (unique)
  whatsapp_capable: boolean;
  current_status: 'available' | 'busy' | 'offline';
  is_active: boolean;
  email?: string;  // Optional email for notifications
  phone?: string;  // Optional regular phone number
  specializations: string[];  // JSONB array of device types/services
  hourly_rate: number;  // Default: 25.00
  max_daily_appointments: number;  // Default: 100
  notes?: string;  // Administrative notes
  experience_years: number;  // Default: 1
  rating: number;  // Average customer rating (1.00-5.00)
  total_bookings_completed: number;  // Total bookings completed
  created_at?: string;
  
  // Joined data from relationships
  service_zones?: TechnicianServiceZoneRecord[];
}

/**
 * Technician Service Zone Record
 * Links technicians to service locations with priority
 */
export interface TechnicianServiceZoneRecord {
  id: string;  // UUID
  technician_id: string;  // FK to technicians (UUID)
  location_id: string;  // FK to service_locations (UUID)
  priority: number;  // Default: 1
  is_primary: boolean;  // Default: false
  travel_time_minutes?: number;  // Estimated travel time
  service_fee_adjustment: number;  // Default: 0.00
  created_at?: string;
  
  // Joined data from relationships
  technician?: TechnicianRecord;
  location?: ServiceLocationRecord;
}

/**
 * Service Location Record (cities/areas served)
 */
export interface ServiceLocationRecord {
  id: string;  // UUID
  city_name: string;
  slug: string;
  base_travel_fee: number;
  travel_fee_rules: Record<string, any>;  // JSONB
  is_active: boolean;
  created_at?: string;
}

/**
 * Technician Availability Record
 * Weekly availability schedule for technicians
 */
export interface TechnicianAvailabilityRecord {
  id: string;  // UUID
  technician_id: string;  // FK to technicians (UUID)
  day_of_week: number;  // 0=Sunday, 6=Saturday
  start_time: string;  // Time format
  end_time: string;  // Time format
  is_available: boolean;
  created_at?: string;
}


// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Create Brand Request
 */
export interface CreateBrandRequest {
  name: string;
  slug?: string;
  logo_url?: string;
  is_active?: boolean;
}

/**
 * Create Device Model Request
 */
export interface CreateDeviceModelRequest {
  name: string;
  slug?: string;
  brand_id: string;  // UUID
  type_id: string;  // UUID (device_type_id)
  release_year?: number;
  image_url?: string;
  is_active?: boolean;
}

/**
 * Create Service Request
 */
export interface CreateServiceRequest {
  name: string;
  display_name?: string;
  slug?: string;
  description?: string;
  device_type_id?: string;  // UUID
  category_id?: string;  // UUID
  is_doorstep_eligible?: boolean;
  requires_diagnostics?: boolean;
  estimated_duration_minutes?: number;
  avg_time_minutes?: number;
  is_active?: boolean;
}

/**
 * Create Dynamic Pricing Request
 */
export interface CreateDynamicPricingRequest {
  model_id: string;  // UUID
  service_id: string;  // UUID
  pricing_tier: 'standard' | 'premium';  // TEXT field
  base_price: number;
  compare_at_price?: number;
  part_quality?: string;
  part_warranty_months?: number;
  includes_installation?: boolean;
  is_active?: boolean;
}

/**
 * Update Dynamic Pricing Request (all fields optional)
 */
export interface UpdateDynamicPricingRequest {
  model_id?: string;
  service_id?: string;
  pricing_tier?: 'standard' | 'premium';
  base_price?: number;
  compare_at_price?: number;
  part_quality?: string;
  part_warranty_months?: number;
  includes_installation?: boolean;
  is_active?: boolean;
}

/**
 * Bulk Price Update Request
 */
export interface BulkPriceUpdateRequest {
  percentage: number;  // e.g., 5 for 5%, -10 for -10%
  filter?: {
    device_type_id?: string;
    brand_id?: string;
    model_id?: string;
    service_id?: string;
    pricing_tier?: 'standard' | 'premium';
  };
}

// ============================================================================
// FILTER & DROPDOWN HELPER TYPES
// ============================================================================

/**
 * Pricing page filter state
 */
export interface PricingFilterState {
  deviceTypeId: string;  // UUID or 'all'
  brandId: string;  // UUID or 'all'
  modelId: string;  // UUID or 'all'
  serviceId: string;  // UUID or 'all'
  pricingTier: 'all' | 'standard' | 'premium';
}

/**
 * Pricing filter options (for dropdown values)
 */
export interface PricingFilterOptions {
  deviceTypes: DeviceTypeRecord[];
  brands: BrandRecord[];
  models: DeviceModelRecord[];
  services: ServiceRecord[];
}

/**
 * Device model selector state
 */
export interface DeviceModelSelector {
  selectedDeviceTypeId: string;
  selectedBrandId: string;
  selectedModelId: string;
}

/**
 * Service selector state
 */
export interface ServiceSelector {
  selectedDeviceTypeId: string;
  selectedServiceId: string;
  availableServices: ServiceRecord[];
}

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid UUID
 */
export function isValidUUID(value: unknown): value is string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof value === 'string' && uuidRegex.test(value);
}

/**
 * Assert that a value is a valid UUID
 */
export function assertValidUUID(value: unknown, fieldName: string = 'id'): asserts value is string {
  if (!isValidUUID(value)) {
    throw new Error(`Invalid UUID for field "${fieldName}": ${value}`);
  }
}
