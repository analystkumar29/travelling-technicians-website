import { CreateBookingRequest, BookingCreationResponse, BookingData } from '../../types/booking';
import { logger } from '../../utils/logger';
import { normalizeBookingData, denormalizeBookingData } from '../transformers/bookingTransformer';

// Logger for this module
const apiLogger = logger.createModuleLogger('BookingAPI');

/**
 * Base URL for API calls
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * API endpoints for booking operations
 */
const ENDPOINTS = {
  CREATE_BOOKING: '/api/bookings/create',
  GET_BOOKING: '/api/bookings',
  CHECK_SERVICE_AREA: '/api/service-areas/check',
  GET_AVAILABLE_SLOTS: '/api/bookings/available-slots',
};

/**
 * Error class for booking service errors
 */
export class BookingServiceError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'BookingServiceError';
    this.statusCode = statusCode;
  }
}

/**
 * Function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    apiLogger.error(`API Error: ${response.status} - ${errorText}`);
    
    throw new BookingServiceError(
      `API error (${response.status}): ${errorText}`,
      response.status
    );
  }
  
  try {
    return await response.json() as T;
  } catch (error) {
    apiLogger.error('Failed to parse API response:', error);
    throw new BookingServiceError('Failed to parse API response');
  }
}

/**
 * Booking service with methods for all booking-related API operations
 */
export const bookingService = {
  /**
   * Check if a location is within the service area
   */
  async checkServiceArea(postalCode: string): Promise<{
    city: string;
    serviceable: boolean;
    sameDay: boolean;
    travelFee?: number;
    responseTime: string;
  }> {
    apiLogger.debug(`Checking service area for postal code: ${postalCode}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CHECK_SERVICE_AREA}?postal_code=${postalCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof BookingServiceError) {
        throw error;
      }
      
      apiLogger.error('Service area check failed:', error);
      throw new BookingServiceError('Failed to check service area');
    }
  },

  /**
   * Get available time slots for a given date
   */
  async getAvailableTimeSlots(date: string, serviceType: string): Promise<string[]> {
    apiLogger.debug(`Getting available slots for date: ${date}, service: ${serviceType}`);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.GET_AVAILABLE_SLOTS}?date=${date}&service_type=${serviceType}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof BookingServiceError) {
        throw error;
      }
      
      apiLogger.error('Failed to fetch available time slots:', error);
      throw new BookingServiceError('Failed to fetch available time slots');
    }
  },

  /**
   * Create a new booking
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<BookingCreationResponse> {
    apiLogger.debug('Creating booking with data:', {
      deviceType: bookingData.deviceType,
      serviceType: bookingData.serviceType,
      hasAppointmentDate: !!bookingData.appointmentDate,
      hasAppointmentTime: !!bookingData.appointmentTime
    });
    
    try {
      // Convert camelCase to snake_case for API
      const apiBookingData = denormalizeBookingData(bookingData);
      
      apiLogger.debug('Sending to API with transformed data', {
        device_type: apiBookingData.device_type,
        service_type: apiBookingData.service_type,
        hasBookingDate: !!apiBookingData.booking_date,
        hasBookingTime: !!apiBookingData.booking_time
      });
      
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE_BOOKING}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiBookingData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        apiLogger.error('API response not OK', {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 200) // Log part of the response for debugging
        });
        
        let parsedError;
        try {
          parsedError = JSON.parse(errorText);
        } catch (e) {
          // If it's not valid JSON, use the text directly
          throw new BookingServiceError(
            `API error (${response.status}): ${errorText.substring(0, 100)}`,
            response.status
          );
        }
        
        throw new BookingServiceError(
          `API error (${response.status}): ${parsedError.message || parsedError.details || 'Unknown error'}`,
          response.status
        );
      }
      
      const result = await response.json();
      
      // Validate the response structure
      if (!result || typeof result !== 'object') {
        throw new BookingServiceError('Invalid response format from server');
      }
      
      // Ensure the response has all required fields
      if (result.success === false) {
        throw new BookingServiceError(
          result.message || 'Booking creation failed',
          response.status
        );
      }
      
      if (!result.booking_reference) {
        apiLogger.warn('Missing booking reference in successful response', result);
        // If we have a booking object with reference_number, use that instead
        if (result.booking && result.booking.reference_number) {
          result.booking_reference = result.booking.reference_number;
        } else {
          throw new BookingServiceError('Missing booking reference in response');
        }
      }
      
      apiLogger.info(`Booking created successfully. Reference: ${result.booking_reference}`);
      return result;
    } catch (error) {
      if (error instanceof BookingServiceError) {
        throw error;
      }
      
      apiLogger.error('Booking creation failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      throw new BookingServiceError('Failed to create booking');
    }
  },

  /**
   * Get a booking by reference number
   */
  async getBookingByReference(reference: string): Promise<BookingData> {
    apiLogger.debug(`Fetching booking with reference: ${reference}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.GET_BOOKING}/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await handleResponse<any>(response);
      
      // Convert snake_case to camelCase for frontend
      const normalizedData = normalizeBookingData(result);
      
      if (!normalizedData) {
        throw new BookingServiceError('Failed to normalize booking data');
      }
      
      return normalizedData;
    } catch (error) {
      if (error instanceof BookingServiceError) {
        throw error;
      }
      
      apiLogger.error('Failed to fetch booking:', error);
      throw new BookingServiceError('Failed to fetch booking');
    }
  },

  /**
   * Format error message for user display
   */
  formatErrorMessage(error: unknown): string {
    if (error instanceof BookingServiceError) {
      // Return a user-friendly message based on status code
      if (error.statusCode === 404) {
        return 'The requested booking could not be found.';
      } else if (error.statusCode === 400) {
        return 'Please check your information and try again.';
      } else if (error.statusCode === 429) {
        return 'Too many requests. Please try again later.';
      } else if (error.statusCode && error.statusCode >= 500) {
        return 'We\'re experiencing technical difficulties. Please try again later.';
      }
      
      return error.message;
    }
    
    if (error instanceof Error) {
      return 'An unexpected error occurred. Please try again later.';
    }
    
    return 'An unknown error occurred.';
  }
}; 