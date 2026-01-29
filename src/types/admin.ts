/**
 * Admin Panel TypeScript Definitions
 * V2 Schema with UUID-based relationships and proper joins
 * 
 * This file defines all types used in the admin management panel,
 * replacing hardcoded strings with UUID-based references.
 */

/**
 * Device Type Record (e.g., Mobile, Laptop, Tablet)
 * Primary key: UUID
 */
export interface DeviceTypeRecord {
  id: string;  // UUID
  name: string;  // e.g., "Mobile", "Laptop"
  display_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Brand Record (e.g., Apple, Samsung)
 * Linked to device_type via device_type_id
 */
export interface BrandRecord {
  id: string;  // UUID
  name: string;  // e.g., "Apple"
  display_name: string;
  device_type_id: string;  // FK to device_types (UUID)
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Joined data from relationships
  device_type?: DeviceTypeRecord;
}

/**
 * Device Model Record (e.g., iPhone 16, MacBook Pro M3)
 * Linked to brand and device_type
 */
export interface DeviceModelRecord {
  id: string;  // UUID
  name: string;  // e.g., "iPhone 16"
  display_name: string;
  brand_id: string;  // FK to brands (UUID)
  type_id: string;  // FK to device_types (UUID)
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  
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
 * Linked to device_type and service_category
 */
export interface ServiceRecord {
  id: string;  // UUID
  name: string;  // e.g., "screen_replacement"
  display_name: string;  // e.g., "Screen Replacement"
  device_type_id: string;  // FK to device_types (UUID)
  category_id?: string;  // FK to service_categories (UUID)
  is_doorstep_eligible: boolean;
  requires_diagnostics: boolean;
  estimated_duration_minutes: number;
  warranty_period_days: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Joined data from relationships
  device_type?: DeviceTypeRecord;
  category?: ServiceCategoryRecord;
}

/**
 * Pricing Tier Record (e.g., Standard, Premium)
 * Defines price multipliers and service levels
 */
export interface PricingTierRecord {
  id: string;  // UUID
  name: string;  // e.g., "premium"
  display_name: string;  // e.g., "Premium Service"
  description?: string;
  price_multiplier: number;  // e.g., 1.5
  estimated_delivery_hours?: number;  // e.g., 24
  includes_features: string[];  // e.g., ["1-Year Warranty", "Premium Parts"]
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Dynamic Pricing Record (the core pricing matrix)
 * Links: device_model + service + pricing_tier = price
 * 
 * Example: iPhone 16 + Screen Replacement + Premium = $299
 */
export interface DynamicPricingRecord {
  id: string;  // UUID
  model_id: string;  // FK to device_models (UUID)
  service_id: string;  // FK to services (UUID)
  pricing_tier_id: string;  // FK to pricing_tiers (UUID)
  base_price: number;  // e.g., 225.00
  discounted_price?: number;  // Optional sale price
  cost_price?: number;  // Cost tracking for profit margin
  pricing_tier?: string;  // Text: 'standard', 'premium', 'economy', 'express'
  part_quality?: string;  // e.g., "OEM Parts", "Aftermarket Parts"
  part_warranty_months?: number;
  includes_installation: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Joined data from relationships - Full objects
  device_model?: DeviceModelRecord;
  service?: ServiceRecord;
  pricing_tier_record?: PricingTierRecord;
  brand?: BrandRecord;
  device_type?: DeviceTypeRecord;
}

/**
 * Audit Log Record
 * Tracks admin actions for compliance
 */
export interface AuditLogRecord {
  id: string;  // UUID
  action: string;  // e.g., "created", "updated", "deleted"
  table_name: string;  // e.g., "dynamic_pricing"
  record_id: string;  // UUID of affected record
  admin_username: string;
  old_values?: Record<string, any>;  // JSON before change
  new_values?: Record<string, any>;  // JSON after change
  created_at: string;
}

/**
 * Review Queue Item
 * Quality control workflow
 */
export interface ReviewQueueRecord {
  id: string;  // UUID
  table_name: string;  // e.g., "device_models"
  record_id: string;  // UUID of record to review
  review_type: string;  // e.g., "quality_check", "approval"
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  assigned_to?: string;  // Admin username
  created_by: string;
  review_notes?: string;
  review_data?: Record<string, any>;  // JSON context
  deadline?: string;
  created_at: string;
  updated_at?: string;
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
  display_name: string;
  device_type_id: string;  // UUID
  is_active?: boolean;
}

/**
 * Create Device Model Request
 */
export interface CreateDeviceModelRequest {
  name: string;
  display_name: string;
  brand_id: string;  // UUID
  type_id: string;  // UUID (device_type_id)
  is_active?: boolean;
}

/**
 * Create Service Request
 */
export interface CreateServiceRequest {
  name: string;
  display_name: string;
  device_type_id: string;  // UUID
  category_id?: string;  // UUID
  is_doorstep_eligible?: boolean;
  requires_diagnostics?: boolean;
  estimated_duration_minutes?: number;
  warranty_period_days?: number;
  is_active?: boolean;
}

/**
 * Create Pricing Tier Request
 */
export interface CreatePricingTierRequest {
  name: string;
  display_name: string;
  description?: string;
  price_multiplier: number;
  estimated_delivery_hours?: number;
  includes_features?: string[];
  is_active?: boolean;
  sort_order?: number;
}

/**
 * Create Dynamic Pricing Request
 */
export interface CreateDynamicPricingRequest {
  model_id: string;  // UUID
  service_id: string;  // UUID
  pricing_tier_id: string;  // UUID
  base_price: number;
  discounted_price?: number;
  cost_price?: number;
  pricing_tier?: string;
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
  pricing_tier_id?: string;
  base_price?: number;
  discounted_price?: number;
  cost_price?: number;
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
    pricing_tier_id?: string;
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
  tierId: string;  // UUID or 'all'
}

/**
 * Pricing filter options (for dropdown values)
 */
export interface PricingFilterOptions {
  deviceTypes: DeviceTypeRecord[];
  brands: BrandRecord[];
  models: DeviceModelRecord[];
  services: ServiceRecord[];
  tiers: PricingTierRecord[];
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
