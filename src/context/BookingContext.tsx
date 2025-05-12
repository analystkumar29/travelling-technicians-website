import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { BookingData, BookingStatus, CreateBookingRequest } from '@/types/booking';
import { bookingService } from '@/services/bookingService';
import { logger } from '@/utils/logger';
import SupabaseStorageService, { STORAGE_KEYS } from '@/services/SupabaseStorageService';

// Logger for this module
const contextLogger = logger.createModuleLogger('BookingContext');

/**
 * Types for the context state
 */
interface BookingContextState {
  bookingData: BookingData | null;
  bookingReference: string | null;
  bookingStatus: BookingStatus | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Formatted booking data for display
 */
export interface FormattedBookingData {
  ref: string;
  device: string;
  service: string;
  date: string;
  time: string;
  address: string;
  email: string;
}

/**
 * Types for the context value
 */
interface BookingContextValue extends BookingContextState {
  createNewBooking: (bookingData: CreateBookingRequest) => Promise<string | null>;
  fetchBookingByReference: (reference: string) => Promise<BookingData | null>;
  clearBookingData: () => void;
  setBookingReference: (reference: string | null) => void;
  isBookingDataLoaded: boolean;
  getStoredFormattedData: () => FormattedBookingData | null;
}

// Create the context with default values
const BookingContext = createContext<BookingContextValue>({
  bookingData: null,
  bookingReference: null,
  bookingStatus: null,
  isLoading: false,
  error: null,
  isBookingDataLoaded: false,
  createNewBooking: async () => null,
  fetchBookingByReference: async () => null,
  clearBookingData: () => {},
  setBookingReference: () => {},
  getStoredFormattedData: () => null,
});

/**
 * Hook to use the booking context
 */
export const useBooking = () => useContext(BookingContext);

/**
 * Provider component for booking context
 */
interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  // State for booking data
  const [state, setState] = useState<BookingContextState>({
    bookingData: null,
    bookingReference: null,
    bookingStatus: null,
    isLoading: false,
    error: null,
  });

  // Initialize booking reference from localStorage on client-side only - now using temp storage
  // This is just for UI state persistence between page refreshes
  const [formattedBookingData, setFormattedBookingData] = useState<FormattedBookingData | null>(null);
  
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      try {
        // Try to get reference from URL query params first
        const urlParams = new URLSearchParams(window.location.search);
        const urlReference = urlParams.get('reference');
        
        if (urlReference) {
          setState(prev => ({ ...prev, bookingReference: urlReference }));
          // If we find a reference in URL, auto-fetch that booking
          fetchBookingByReference(urlReference);
        } else {
          // Fall back to local storage for UI persistence
          const storedReference = SupabaseStorageService.getLocalItem<string>(STORAGE_KEYS.FORM_STATE);
          if (storedReference) {
            setState(prev => ({ ...prev, bookingReference: storedReference }));
          }
        }
      } catch (err) {
        contextLogger.error('Failed to get booking reference from storage', err);
      }
    }
  }, []);

  /**
   * Save booking reference to temporary storage for UI persistence
   */
  const saveBookingReferenceLocally = useCallback((reference: string | null) => {
    if (typeof window === 'undefined') return;
    
    try {
      if (reference) {
        SupabaseStorageService.setLocalItem(STORAGE_KEYS.FORM_STATE, reference);
      } else {
        SupabaseStorageService.removeLocalItem(STORAGE_KEYS.FORM_STATE);
      }
    } catch (err) {
      contextLogger.error('Failed to save booking reference to local storage', err);
    }
  }, []);

  /**
   * Create a new booking
   */
  const createNewBooking = useCallback(async (bookingData: CreateBookingRequest): Promise<string | null> => {
    contextLogger.info('Creating new booking', {
      deviceType: bookingData.deviceType,
      serviceType: bookingData.serviceType
    });
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Log the booking data being sent (with sensitive info redacted)
      const redactedData = { 
        ...bookingData, 
        customerEmail: bookingData.customerEmail ? '***@***.com' : undefined,
        customerPhone: bookingData.customerPhone ? '***-***-****' : undefined
      };
      contextLogger.debug('Sending booking data', redactedData);
      
      const response = await bookingService.createBooking(bookingData);
      
      // Log the response for debugging
      contextLogger.debug('API response received', {
        success: response.success,
        hasReference: !!response.reference,
        error: response.error
      });
      
      if (response && response.success && response.reference) {
        const reference = response.reference;
        saveBookingReferenceLocally(reference);
        
        setState(prev => ({
          ...prev,
          bookingReference: reference,
          bookingStatus: 'pending',
          isLoading: false,
        }));
        
        contextLogger.info(`Booking created successfully. Reference: ${reference}`);
        return reference;
      } else {
        // If response has an error message, use it
        const errorMsg = response.error || 'Invalid response from booking creation';
        contextLogger.error('Booking creation failed with API response', {
          success: response.success,
          error: errorMsg
        });
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      
      contextLogger.error('Error creating booking:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return null;
    }
  }, [saveBookingReferenceLocally]);

  /**
   * Fetch booking by reference directly from Supabase
   */
  const fetchBookingByReference = useCallback(async (reference: string): Promise<BookingData | null> => {
    contextLogger.info(`Fetching booking with reference: ${reference}`);
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // 'data' here is BookingResponse from the service
      const response = await bookingService.getBookingByReference(reference);
      
      if (!response.success || !response.booking) {
        throw new Error(response.message || response.error || 'Booking not found or invalid response');
      }
      
      // Now, response.booking is the actual BookingData
      const bookingDetails = response.booking;

      setState(prev => ({
        ...prev,
        bookingData: bookingDetails, // Use the nested booking data
        bookingStatus: bookingDetails.status, // Access status from bookingDetails
        bookingReference: reference,
        isLoading: false,
      }));
      
      // Store reference in local storage for UI persistence
      saveBookingReferenceLocally(reference);
      
      return bookingDetails; // Return the actual BookingData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking';
      
      contextLogger.error(`Error fetching booking (${reference}):`, error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return null;
    }
  }, [saveBookingReferenceLocally]);

  /**
   * Clear booking data
   */
  const clearBookingData = useCallback(() => {
    contextLogger.debug('Clearing booking data');
    saveBookingReferenceLocally(null);
    
    setState({
      bookingData: null,
      bookingReference: null,
      bookingStatus: null,
      isLoading: false,
      error: null,
    });
    
    setFormattedBookingData(null);
  }, [saveBookingReferenceLocally]);

  /**
   * Set booking reference
   */
  const setBookingReference = useCallback((reference: string | null) => {
    contextLogger.debug(`Setting booking reference: ${reference}`);
    saveBookingReferenceLocally(reference);
    setState(prev => ({ ...prev, bookingReference: reference }));
  }, [saveBookingReferenceLocally]);

  /**
   * Get stored formatted data for UI display
   * This is just for temporary UI state between pages
   */
  const getStoredFormattedData = useCallback((): FormattedBookingData | null => {
    // First check our state
    if (formattedBookingData) {
      return formattedBookingData;
    }
    
    // If not in state, try to get from URL or storage
    if (typeof window === 'undefined') return null;
    
    // Try to construct from state
    if (state.bookingData) {
      const data: FormattedBookingData = {
        ref: state.bookingReference || '',
        device: `${state.bookingData.device.type} ${state.bookingData.device.brand} ${state.bookingData.device.model}`,
        service: state.bookingData.service.type,
        date: state.bookingData.appointment.date,
        time: state.bookingData.appointment.time,
        address: state.bookingData.location.address,
        email: state.bookingData.customer.email
      };
      
      setFormattedBookingData(data);
      return data;
    }
    
    return null;
  }, [formattedBookingData, state]);

  return (
    <BookingContext.Provider
      value={{
        ...state,
        isBookingDataLoaded: !!state.bookingData,
        createNewBooking,
        fetchBookingByReference,
        clearBookingData,
        setBookingReference,
        getStoredFormattedData,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext; 