import { UUID, ISODateString } from './common';

/**
 * Represents a part used in a repair
 */
export interface RepairPart {
  name: string;
  description?: string;
  cost: number;
  warranty_duration?: number; // in days
}

/**
 * Represents an additional service provided during a repair
 */
export interface AdditionalService {
  name: string;
  description?: string;
  cost: number;
}

/**
 * Represents a completed repair
 */
export interface RepairCompletion {
  id: UUID;
  booking_id: UUID;
  technician_id: UUID;
  completed_at: ISODateString;
  repair_notes?: string;
  parts_used?: RepairPart[];
  repair_duration?: number; // in minutes
  customer_signature_url?: string;
  additional_services?: AdditionalService[];
  created_at: ISODateString;
}

/**
 * Data needed to register a completed repair
 */
export interface RegisterRepairDto {
  booking_id: UUID;
  technician_id: UUID;
  repair_notes?: string;
  parts_used?: RepairPart[];
  repair_duration?: number;
  customer_signature_url?: string;
  additional_services?: AdditionalService[];
}

/**
 * Represents a repair completion with extended information about the booking
 */
export interface RepairCompletionDetail extends RepairCompletion {
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
    original_booking_date?: string;
    original_booking_time?: string;
  };
  technician: {
    full_name: string;
    email: string;
    phone: string;
  };
  warranty?: {
    warranty_code: string;
    expiry_date: ISODateString;
    status: string;
  };
} 