/**
 * Strongly typed definitions for booking-related data structures.
 * These types represent the domain model used throughout the application.
 */

/**
 * Device types supported by the service
 */
export type DeviceType = 'mobile' | 'laptop' | 'tablet';

/**
 * Status values for bookings
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/**
 * Data needed to create a booking
 */
export interface CreateBookingRequest {
  deviceType: string;
  deviceBrand?: string;
  deviceModel?: string;
  serviceType: string;
  issueDescription?: string;
  
  appointmentDate: string;  // YYYY-MM-DD format
  appointmentTime: string;  // HH-HH format (e.g., "09-11" for 9 AM to 11 AM)
  
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  address: string;
  postalCode: string;
}

/**
 * Customer information
 */
export interface Customer {
  name: string;
  email: string;
  phone: string;
}

/**
 * Device information
 */
export interface Device {
  type: DeviceType;
  brand: string;
  model: string;
}

/**
 * Service information
 */
export interface Service {
  type: string;
  description?: string;
  price?: string;
}

/**
 * Appointment information
 */
export interface Appointment {
  date: string;
  time: string;
  confirmed: boolean;
}

/**
 * Location information
 */
export interface Location {
  address: string;
  postalCode: string;
  city?: string;
  province?: string;
}

/**
 * Complete booking information
 */
export interface BookingData {
  id: string;
  referenceNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  device: {
    type: string;
    brand?: string;
    model?: string;
  };
  service: {
    type: string;
    description?: string;
  };
  appointment: {
    date: string;
    time: string;
  };
  location: {
    address: string;
    postalCode: string;
  };
  status: BookingStatus;
  technician?: {
    id?: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Response from booking creation
 */
export interface BookingCreationResponse {
  success: boolean;
  booking_reference: string;
  booking_id?: string;
  status?: string;
  error?: string;
} 