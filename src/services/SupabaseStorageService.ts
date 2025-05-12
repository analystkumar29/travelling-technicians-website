import { supabase, getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Logger for this module
const storageLogger = logger.createModuleLogger('SupabaseStorageService');

/**
 * Keys used for temporary client-side storage (for UI state only)
 * These will be minimal and only for UI/UX improvement
 */
export const STORAGE_KEYS = {
  FORM_STATE: 'travellingTechnicians_formState',
  LAST_VISIT: 'travellingTechnicians_lastVisit',
} as const;

/**
 * Type for storage keys
 */
export type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Check if we're in a browser environment
 */
const isBrowser = (): boolean => typeof window !== 'undefined';

/**
 * Check if we're in a server environment
 */
const isServer = (): boolean => !isBrowser();

/**
 * SupabaseStorageService for handling data persistence with Supabase
 * This replaces the localStorage-based StorageService
 */
const SupabaseStorageService = {
  /**
   * Get a booking by reference number
   */
  getBookingByReference: async (referenceNumber: string) => {
    try {
      storageLogger.debug(`Getting booking by reference: ${referenceNumber}`);
      
      // Use service role client on server-side, anon client on client-side
      const client = isServer() ? getServiceSupabase() : supabase;
      
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .eq('reference_number', referenceNumber)
        .single();
      
      if (error) {
        storageLogger.error(`Error getting booking by reference: ${error.message}`, { code: error.code });
        return null;
      }
      
      return data;
    } catch (e) {
      storageLogger.error(`Failed to get booking by reference: ${e}`);
      return null;
    }
  },

  /**
   * Create a new booking
   */
  createBooking: async (bookingData: any) => {
    try {
      storageLogger.debug('Creating new booking');
      
      // Must use service role for insert operations
      const client = getServiceSupabase();
      
      const { data, error } = await client
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
      
      if (error) {
        storageLogger.error(`Error creating booking: ${error.message}`, { code: error.code });
        throw error;
      }
      
      return data;
    } catch (e) {
      storageLogger.error(`Failed to create booking: ${e}`);
      throw e;
    }
  },

  /**
   * Update an existing booking
   */
  updateBooking: async (referenceNumber: string, updateData: any) => {
    try {
      storageLogger.debug(`Updating booking: ${referenceNumber}`);
      
      // Must use service role for update operations
      const client = getServiceSupabase();
      
      const { data, error } = await client
        .from('bookings')
        .update(updateData)
        .eq('reference_number', referenceNumber)
        .select()
        .single();
      
      if (error) {
        storageLogger.error(`Error updating booking: ${error.message}`, { code: error.code });
        throw error;
      }
      
      return data;
    } catch (e) {
      storageLogger.error(`Failed to update booking: ${e}`);
      throw e;
    }
  },

  /**
   * Get all bookings (admin only)
   */
  getAllBookings: async () => {
    try {
      storageLogger.debug('Getting all bookings');
      
      // Must use service role for admin operations
      const client = getServiceSupabase();
      
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        storageLogger.error(`Error getting all bookings: ${error.message}`, { code: error.code });
        throw error;
      }
      
      return data;
    } catch (e) {
      storageLogger.error(`Failed to get all bookings: ${e}`);
      throw e;
    }
  },

  /**
   * Delete a booking (admin only)
   */
  deleteBooking: async (referenceNumber: string) => {
    try {
      storageLogger.debug(`Deleting booking: ${referenceNumber}`);
      
      // Must use service role for delete operations
      const client = getServiceSupabase();
      
      const { error } = await client
        .from('bookings')
        .delete()
        .eq('reference_number', referenceNumber);
      
      if (error) {
        storageLogger.error(`Error deleting booking: ${error.message}`, { code: error.code });
        throw error;
      }
      
      return true;
    } catch (e) {
      storageLogger.error(`Failed to delete booking: ${e}`);
      throw e;
    }
  },

  /**
   * For UI persistence only - get item from localStorage
   * This should only be used for UI state, not critical data
   */
  getLocalItem: <T = any>(key: string, defaultValue: T | null = null): T | null => {
    if (!isBrowser()) {
      return defaultValue;
    }
    
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      
      try {
        // Try to parse as JSON
        return JSON.parse(item) as T;
      } catch {
        // If not valid JSON, return as is
        return item as unknown as T;
      }
    } catch (e) {
      storageLogger.warn(`Failed to get item from localStorage: ${key}`, e);
      return defaultValue;
    }
  },

  /**
   * For UI persistence only - set item in localStorage
   * This should only be used for UI state, not critical data
   */
  setLocalItem: (key: string, value: any): boolean => {
    if (!isBrowser()) {
      return false;
    }
    
    try {
      if (typeof value === 'object' && value !== null) {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, String(value));
      }
      return true;
    } catch (e) {
      storageLogger.warn(`Failed to set item in localStorage: ${key}`, e);
      return false;
    }
  },

  /**
   * For UI persistence only - remove item from localStorage
   */
  removeLocalItem: (key: string): boolean => {
    if (!isBrowser()) {
      return false;
    }
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      storageLogger.warn(`Failed to remove item from localStorage: ${key}`, e);
      return false;
    }
  }
};

export default SupabaseStorageService; 