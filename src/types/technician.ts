import { UUID } from './common';

/**
 * Represents a technician in the system
 */
export interface Technician {
  id: UUID;
  auth_id: UUID;
  full_name: string;
  email: string;
  phone: string;
  profile_image_url?: string;
  specializations: string[];
  active_service_areas: string[];
  is_active: boolean;
  hourly_rate?: number;
  max_daily_bookings: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

/**
 * Data used for creating a new technician
 */
export type CreateTechnicianDto = Omit<Technician, 'id' | 'created_at' | 'updated_at'>;

/**
 * Data used for updating an existing technician
 */
export type UpdateTechnicianDto = Partial<Omit<Technician, 'id' | 'auth_id' | 'created_at' | 'updated_at'>>;

/**
 * Represents a technician's schedule for a specific date and time slot
 */
export interface TechnicianSchedule {
  id: UUID;
  technician_id: UUID;
  date: string; // YYYY-MM-DD format
  time_slot: string; // HH-HH format (e.g., "09-11")
  is_available: boolean;
  booking_id?: UUID;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a technician's daily availability
 */
export interface DailyAvailability {
  date: string;
  technician_id: UUID;
  time_slots: {
    slot: string;
    available: boolean;
    booking_id?: UUID;
  }[];
}

/**
 * Response object containing technician with their availability
 */
export interface TechnicianWithAvailability extends Technician {
  availability: DailyAvailability[];
} 