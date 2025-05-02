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
    apiLogger.debug('Creating booking with data:', bookingData);
    
    // Convert camelCase to snake_case for API
    const apiBookingData = denormalizeBookingData(bookingData);
    
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE_BOOKING}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiBookingData),
      });
      
      const result = await handleResponse<BookingCreationResponse>(response);
      apiLogger.info(`Booking created successfully. Reference: ${result.booking_reference}`);
      
      return result;
    } catch (error) {
      if (error instanceof BookingServiceError) {
        throw error;
      }
      
      apiLogger.error('Booking creation failed:', error);
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
      return normalizeBookingData(result);
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
      } else if (error.statusCode >= 500) {
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