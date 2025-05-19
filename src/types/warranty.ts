import { UUID, ISODateString } from './common';

/**
 * Possible warranty status values
 */
export type WarrantyStatus = 
  | 'active'     // Warranty is currently active
  | 'expired'    // Warranty has expired
  | 'void'       // Warranty has been voided
  | 'claimed'    // Warranty has been claimed

/**
 * Possible warranty claim status values
 */
export type WarrantyClaimStatus = 
  | 'pending'     // Claim is waiting for review
  | 'approved'    // Claim has been approved
  | 'in_progress' // Claim is being processed
  | 'completed'   // Claim has been fulfilled
  | 'rejected'    // Claim was rejected

/**
 * Represents a warranty record
 */
export interface Warranty {
  id: UUID;
  booking_id: UUID;
  repair_completion_id: UUID;
  technician_id: UUID;
  warranty_code: string;
  issue_date: ISODateString;
  expiry_date: ISODateString;
  status: WarrantyStatus;
  parts_covered: string[];
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Simplified warranty information for display
 */
export interface WarrantySummary {
  warranty_code: string;
  issue_date: ISODateString;
  expiry_date: ISODateString;
  status: WarrantyStatus;
  device_type: string;
  device_brand: string;
  device_model: string;
  service_type: string;
  days_remaining: number;
}

/**
 * Represents a warranty claim
 */
export interface WarrantyClaim {
  id: UUID;
  warranty_id: UUID;
  claim_date: ISODateString;
  issue_description: string;
  resolution?: string;
  status: WarrantyClaimStatus;
  assigned_technician_id?: UUID;
  follow_up_date?: ISODateString;
  technician_notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Data needed to create a warranty claim
 */
export interface CreateWarrantyClaimDto {
  warranty_id: UUID;
  issue_description: string;
  preferred_date?: ISODateString;
}

/**
 * Represents a warranty with its associated customer, booking, and repair details
 */
export interface WarrantyDetail extends Warranty {
  booking: {
    reference_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    address: string;
    postal_code: string;
    city?: string;
    province?: string;
    device_type: string;
    device_brand: string;
    device_model: string;
    service_type: string;
    status: string;
  };
  technician: {
    full_name: string;
    email: string;
    phone: string;
  };
  repair: {
    completed_at: ISODateString;
    repair_notes?: string;
    parts_used: any[];
    repair_duration?: number;
  };
  claim?: WarrantyClaim;
} 