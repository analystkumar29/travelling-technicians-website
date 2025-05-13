/**
 * Types for the booking system
 */

export type DeviceType = 'mobile' | 'laptop' | 'tablet';

export interface CreateBookingRequest {
  deviceType: DeviceType;
  deviceBrand: string;
  deviceModel: string;
  serviceType: string;
  issueDescription?: string;
  appointmentDate: string;
  appointmentTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  postalCode: string;
}

export interface BookingCreationResponse {
  success: boolean;
  message: string;
  booking?: any;
  booking_reference: string;
}

export interface BookingResponse {
  id: string;
  reference_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  device_type: string;
  device_brand: string | null;
  device_model: string | null;
  service_type: string;
  booking_date: string;
  booking_time: string;
  address: string;
  postal_code: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingData {
  id: string;
  referenceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceType: string;
  deviceBrand: string | null;
  deviceModel: string | null;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  address: string;
  postalCode: string;
  status: BookingStatus;
  createdAt: string;
}

export interface ServiceAreaResult {
  city: string;
  serviceable: boolean;
  sameDay: boolean;
  travelFee?: number;
  responseTime: string;
}
