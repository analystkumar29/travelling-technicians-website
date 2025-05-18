import { UUID, ISODateString } from './common';

/**
 * Represents a user profile
 */
export interface UserProfile {
  id: UUID;
  full_name?: string;
  email: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Data needed to create a user profile
 */
export interface CreateUserProfileDto {
  id: UUID; // From Supabase auth
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  province?: string;
}

/**
 * Data needed to update a user profile
 */
export interface UpdateUserProfileDto {
  full_name?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  province?: string;
}

/**
 * User profile with extended booking history
 */
export interface UserProfileWithBookings extends UserProfile {
  bookings: {
    id: UUID;
    reference_number: string;
    booking_date: string;
    booking_time: string;
    device_type: string;
    device_brand: string;
    device_model: string;
    service_type: string;
    status: string;
    created_at: ISODateString;
  }[];
}

/**
 * User profile with extended warranty information
 */
export interface UserProfileWithWarranties extends UserProfile {
  warranties: {
    id: UUID;
    warranty_code: string;
    issue_date: ISODateString;
    expiry_date: ISODateString;
    status: string;
    device_type: string;
    device_brand: string;
    device_model: string;
    service_type: string;
  }[];
} 