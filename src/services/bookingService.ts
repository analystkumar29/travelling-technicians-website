import { CreateBookingRequest, BookingResponse, BookingData } from '@/types/booking';
import { ApiCallResponse } from './apiUtils';
import { logger } from '@/utils/logger';
import { denormalizeBookingData, normalizeBookingData } from './transformers/bookingTransformer';
import SupabaseStorageService from './SupabaseStorageService';

// Module logger
const bookingLogger = logger.createModuleLogger('bookingService');

/**
 * Service layer for all booking-related API operations
 */
export const bookingService = {
  /**
   * Create a new booking
   */
  createBooking: async (bookingData: CreateBookingRequest): Promise<BookingResponse> => {
    try {
      bookingLogger.info('Creating booking', { 
        deviceType: bookingData.deviceType,
        serviceType: bookingData.serviceType
      });
      
      // Make sure all required fields are present
      const requiredFields = [
        'deviceType', 'deviceBrand', 'deviceModel', 'serviceType',
        'customerName', 'customerEmail', 'customerPhone',
        'address', 'postalCode', 'appointmentDate', 'appointmentTime'
      ];
      
      const missingFields = requiredFields.filter(field => !bookingData[field as keyof CreateBookingRequest]);
      
      if (missingFields.length > 0) {
        bookingLogger.warn('Missing required fields', { missingFields });
        return {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          error: 'Validation failed'
        };
      }
      
      // Transform data for API - map the camelCase to snake_case fields
      // Provide both camelCase and snake_case versions for maximum compatibility
      const apiData = {
        // Device Information
        deviceType: bookingData.deviceType,
        device_type: bookingData.deviceType,
        deviceBrand: bookingData.deviceBrand,
        device_brand: bookingData.deviceBrand,
        brand: bookingData.deviceBrand,
        deviceModel: bookingData.deviceModel,
        device_model: bookingData.deviceModel,
        model: bookingData.deviceModel,

        // Service Information
        serviceType: bookingData.serviceType,
        service_type: bookingData.serviceType,
        issueDescription: bookingData.issueDescription,
        issue_description: bookingData.issueDescription,

        // Appointment Information
        appointmentDate: bookingData.appointmentDate,
        appointment_date: bookingData.appointmentDate,
        bookingDate: bookingData.appointmentDate,
        booking_date: bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime,
        appointment_time: bookingData.appointmentTime,
        bookingTime: bookingData.appointmentTime,
        booking_time: bookingData.appointmentTime,

        // Customer Information
        customerName: bookingData.customerName,
        customer_name: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customer_email: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        customer_phone: bookingData.customerPhone,

        // Location Information
        address: bookingData.address,
        postalCode: bookingData.postalCode,
        postal_code: bookingData.postalCode,
        city: bookingData.city || 'Vancouver',
        province: bookingData.province || 'BC'
      };
      
      // Log the transformed data
      bookingLogger.debug('Transformed booking data for API', {
        ...apiData,
        customer_email: '[REDACTED]',
        customerEmail: '[REDACTED]',
        customer_phone: '[REDACTED]',
        customerPhone: '[REDACTED]'
      });
      
      // Make the API call
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      // Parse the response
      const result = await response.json();
      
      if (!response.ok) {
        bookingLogger.error('Failed to create booking', {
          status: response.status,
          error: result.message || result.error || 'Unknown error'
        });
        
        return {
          success: false,
          message: result.message || 'Failed to create booking',
          error: result.error
        };
      }
      
      // Look for either reference or booking_reference in the result
      const bookingReference = result.reference || result.booking_reference;
      
      if (!bookingReference) {
        bookingLogger.warn('Missing booking reference in response', result);
        return {
          success: false,
          message: 'Missing booking reference in response',
          error: 'Invalid API response'
        };
      }
      
      bookingLogger.info('Booking created successfully', {
        reference: bookingReference
      });
      
      return {
        success: true,
        message: result.message || 'Booking created successfully',
        reference: bookingReference
      };
    } catch (error) {
      bookingLogger.error('Error creating booking', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        message: 'An error occurred while creating the booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  /**
   * Find a booking by reference number
   */
  getBookingByReference: async (reference: string): Promise<BookingResponse> => {
    try {
      bookingLogger.info('Fetching booking', { reference });
      
      const response = await fetch(`/api/bookings/reference/${reference}`);
      const result = await response.json();
      
      if (!response.ok) {
        bookingLogger.error('Failed to fetch booking', {
          status: response.status,
          error: result.message || result.error || 'Unknown error'
        });
        
        return {
          success: false,
          message: result.message || 'Failed to fetch booking',
          error: result.error
        };
      }
      
      bookingLogger.info('Booking fetched successfully', { reference });
      
      // If result is a booking object, include it properly in the response
      const booking = result.booking || result;
      
      return {
        success: true,
        message: 'Booking fetched successfully',
        reference,
        booking: booking as BookingData
      };
    } catch (error) {
      bookingLogger.error('Error fetching booking', {
        reference,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        message: 'An error occurred while fetching the booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  /**
   * Update an existing booking
   */
  updateBooking: async (referenceNumber: string, updateData: Partial<CreateBookingRequest>): Promise<ApiCallResponse<{ success: boolean; booking: BookingData }>> => {
    bookingLogger.info('Updating booking', { referenceNumber, fields: Object.keys(updateData) });
    
    try {
      // Transform data for API if needed
      const apiData = {
        reference: referenceNumber,
        ...denormalizeBookingData(updateData as CreateBookingRequest)
      };
      
      const response = await fetch('/api/bookings/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          data: null,
          error: result.message || 'Failed to update booking',
          status: response.status
        };
      }
      
      return {
        data: {
          success: true,
          booking: normalizeBookingData(result.booking)
        },
        error: null,
        status: response.status
      };
    } catch (error) {
      bookingLogger.error('Failed to update booking', {
        error: error instanceof Error ? error.message : 'Unknown error',
        referenceNumber
      });
      
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0
      };
    }
  },
  
  /**
   * Validate postal code serviceability
   */
  checkServiceArea: async (postalCode: string): Promise<ApiCallResponse<{
    serviceable: boolean;
    city?: string;
    sameDay?: boolean;
    travelFee?: number;
  }>> => {
    bookingLogger.info('Checking service area', { postalCode });
    
    try {
      const response = await fetch(`/api/check-postal-code?code=${postalCode}`);
      const result = await response.json();
      
      if (!response.ok) {
        return {
          data: null,
          error: result.message || 'Failed to check postal code',
          status: response.status
        };
      }
      
      return {
        data: result,
        error: null,
        status: response.status
      };
    } catch (error) {
      bookingLogger.error('Failed to check service area', {
        error: error instanceof Error ? error.message : 'Unknown error',
        postalCode
      });
      
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0
      };
    }
  },
  
  /**
   * Send booking confirmation email
   */
  sendConfirmationEmail: async (bookingData: BookingData): Promise<ApiCallResponse<{ success: boolean }>> => {
    bookingLogger.info('Sending confirmation email', { 
      referenceNumber: bookingData.referenceNumber,
      email: bookingData.customer?.email?.replace(/(?<=.).(?=.*@)/g, '*') // Mask email in logs
    });
    
    try {
      const emailData = {
        to: bookingData.customer?.email,
        name: bookingData.customer?.name,
        bookingDate: bookingData.appointment?.date,
        bookingTime: bookingData.appointment?.time,
        deviceType: bookingData.device?.type,
        brand: bookingData.device?.brand,
        model: bookingData.device?.model,
        service: bookingData.service?.type,
        address: bookingData.location?.address,
        bookingReference: bookingData.referenceNumber
      };
      
      const response = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          data: null,
          error: result.message || 'Failed to send confirmation email',
          status: response.status
        };
      }
      
      return {
        data: { success: true },
        error: null,
        status: response.status
      };
    } catch (error) {
      bookingLogger.error('Failed to send confirmation email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        reference: bookingData.referenceNumber
      });
      
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0
      };
    }
  }
}; 