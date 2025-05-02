import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { BookingData, BookingStatus, CreateBookingRequest, BookingCreationResponse } from '../types/booking';
import { bookingService } from '@/services/api/bookingService';
import logger from '@/utils/logger';
import { StorageService } from '@/services/StorageService';

// Storage keys for consistent access
export const STORAGE_KEYS = {
  BOOKING_REFERENCE: 'bookingReference',
  BOOKING_REFERENCES: 'bookingReferences', 
  FORMATTED_BOOKING_DATA: 'formattedBookingData'
};

// Logger for this module
const bookingLogger = logger.createModuleLogger('BookingContext');

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
 * Types for the context value
 */
interface BookingContextValue extends BookingContextState {
  createNewBooking: (bookingData: CreateBookingRequest) => Promise<string | null>;
  fetchBookingByReference: (reference: string) => Promise<BookingData | null>;
  clearBookingData: () => void;
  setBookingReference: (reference: string | null) => void;
  isBookingDataLoaded: boolean;
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
    bookingReference: StorageService.getItem(STORAGE_KEYS.BOOKING_REFERENCE, null),
    bookingStatus: null,
    isLoading: false,
    error: null,
  });

  /**
   * Save booking reference to storage
   */
  const saveBookingReference = useCallback((reference: string | null) => {
    if (reference) {
      StorageService.setItem(STORAGE_KEYS.BOOKING_REFERENCE, reference);
    } else {
      StorageService.removeItem(STORAGE_KEYS.BOOKING_REFERENCE);
    }
  }, []);

  /**
   * Create a new booking
   */
  const createNewBooking = useCallback(async (bookingData: CreateBookingRequest): Promise<string | null> => {
    bookingLogger.info('Creating new booking');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await bookingService.createBooking(bookingData);
      
      if (response && response.success && response.booking_reference) {
        saveBookingReference(response.booking_reference);
        
        setState(prev => ({
          ...prev,
          bookingReference: response.booking_reference,
          bookingStatus: 'pending',
          isLoading: false,
        }));
        
        bookingLogger.info(`Booking created successfully. Reference: ${response.booking_reference}`);
        return response.booking_reference;
      } else {
        throw new Error('Invalid response from booking creation');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      
      bookingLogger.error('Error creating booking:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return null;
    }
  }, [saveBookingReference]);

  /**
   * Fetch booking by reference
   */
  const fetchBookingByReference = useCallback(async (reference: string): Promise<BookingData | null> => {
    bookingLogger.info(`Fetching booking with reference: ${reference}`);
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await bookingService.getBookingByReference(reference);
      
      setState(prev => ({
        ...prev,
        bookingData: data,
        bookingStatus: data.status,
        bookingReference: reference,
        isLoading: false,
      }));
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking';
      
      bookingLogger.error(`Error fetching booking (${reference}):`, error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return null;
    }
  }, []);

  /**
   * Clear booking data
   */
  const clearBookingData = useCallback(() => {
    bookingLogger.debug('Clearing booking data');
    saveBookingReference(null);
    
    setState({
      bookingData: null,
      bookingReference: null,
      bookingStatus: null,
      isLoading: false,
      error: null,
    });
  }, [saveBookingReference]);

  /**
   * Set booking reference
   */
  const setBookingReference = useCallback((reference: string | null) => {
    bookingLogger.debug(`Setting booking reference: ${reference}`);
    saveBookingReference(reference);
    setState(prev => ({ ...prev, bookingReference: reference }));
  }, [saveBookingReference]);

  // The value provided to consumers of the context
  const value: BookingContextValue = {
    ...state,
    createNewBooking,
    fetchBookingByReference,
    clearBookingData,
    setBookingReference,
    isBookingDataLoaded: !!state.bookingData,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext; 