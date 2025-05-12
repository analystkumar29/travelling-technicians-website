/**
 * Strongly typed definitions for booking-related data structures.
 * These types represent the domain model used throughout the application.
 */

import type { ReactNode } from 'react';

/**
 * Possible device types
 */
export type DeviceType = 'mobile' | 'laptop' | 'tablet' | 'unknown';

/**
 * Possible booking statuses
 */
export type BookingStatus = 
  | 'pending'     // Booking is waiting for confirmation
  | 'confirmed'   // Booking has been confirmed but not completed
  | 'completed'   // Service has been completed
  | 'cancelled'   // Booking was cancelled by the customer
  | 'no_show'     // Customer did not show up
  | 'rescheduled';  // Booking was rescheduled

/**
 * Data needed to create a booking
 */
export interface CreateBookingRequest {
  deviceType: DeviceType;
  deviceBrand: string;
  deviceModel: string;
  serviceType: string;
  issueDescription?: string;
  
  appointmentDate: string;  // YYYY-MM-DD format
  appointmentTime: string;  // HH-HH format (e.g., "09-11" for 9 AM to 11 AM)
  
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  address: string;
  postalCode: string;
  
  // Fields needed for database schema alignment
  city: string;      // Required for Supabase database
  province: string;  // Required for Supabase database
  brand?: string;  // Same as deviceBrand, needed for DB triggers
  model?: string;  // Same as deviceModel, needed for DB triggers
}

/**
 * API response structure for booking operations
 */
export interface BookingResponse {
  success: boolean;
  message?: string;
  reference?: string;
  booking?: BookingData;
  error?: string;
}

/**
 * Booking creation response
 */
export interface BookingCreationResponse {
  success: boolean;
  booking_reference?: string;
  reference?: string;
  message?: string;
}

/**
 * Customer information
 */
export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
}

/**
 * Device information
 */
export interface Device {
  id?: string;
  type: DeviceType;
  brand: string;
  model: string;
  serialNumber?: string;
}

/**
 * Service information
 */
export interface Service {
  id?: string;
  type: string;
  issueDescription?: string;
  price?: number;
  warrantyPeriod?: number;
}

/**
 * Appointment information
 */
export interface Appointment {
  id?: string;
  date: string;
  time: string;
  status?: string;
}

/**
 * Location information
 */
export interface Location {
  id?: string;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Complete booking information
 */
export interface BookingData {
  id?: string;
  referenceNumber: string;
  customer: Customer;
  device: Device;
  service: Service;
  appointment: Appointment;
  location: Location;
  status: BookingStatus;
  technician?: {
    id: string;
    name: string;
    phone?: string;
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Booking form types
export interface BookingFormProps {
  onSubmit: (data: CreateBookingRequest) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateBookingRequest>;
  children?: ReactNode;
} 