import { logger } from '../utils/logger';

// Logger for this module
const storageLogger = logger.createModuleLogger('StorageService');

/**
 * Keys used for storage operations
 */
export const STORAGE_KEYS = {
  BOOKING_DATA: 'travellingTechnicians_bookingData',
  BOOKING_REFERENCE: 'travellingTechnicians_bookingReference',
  FORM_STATE: 'travellingTechnicians_formState',
  LAST_VISIT: 'travellingTechnicians_lastVisit',
  RECENT_SEARCHES: 'travellingTechnicians_recentSearches',
  FORMATTED_BOOKING_DATA: 'formattedBookingData',
} as const;

/**
 * Type for storage keys
 */
export type StorageKey = keyof typeof STORAGE_KEYS;

// Type for storage
type StorageValue = string | object | number | boolean | null;

/**
 * Check if we're in a browser environment
 */
const isBrowser = (): boolean => typeof window !== 'undefined';

/**
 * Storage service for handling localStorage operations
 */
const StorageService = {
  /**
   * Check if localStorage is available
   */
  isAvailable: (): boolean => {
    if (!isBrowser()) {
      return false;
    }
    
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      storageLogger.warn('localStorage is not available:', e);
      return false;
    }
  },

  /**
   * Get an item from localStorage
   */
  getItem: <T = StorageValue>(key: string, defaultValue: T = null as unknown as T): T => {
    if (!StorageService.isAvailable()) {
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
   * Set an item in localStorage
   */
  setItem: (key: string, value: StorageValue): boolean => {
    if (!StorageService.isAvailable()) {
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
   * Remove an item from localStorage
   */
  removeItem: (key: string): boolean => {
    if (!StorageService.isAvailable()) {
      return false;
    }
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      storageLogger.warn(`Failed to remove item from localStorage: ${key}`, e);
      return false;
    }
  },

  /**
   * Clear all items with a specific prefix
   */
  clearWithPrefix: (prefix: string): boolean => {
    if (!StorageService.isAvailable()) {
      return false;
    }

    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      storageLogger.error(`Error clearing items with prefix (${prefix}):`, e);
      return false;
    }
  },

  /**
   * Clear all application storage
   */
  clearAll: (): boolean => {
    if (!StorageService.isAvailable()) {
      return false;
    }

    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (e) {
      storageLogger.error('Error clearing all storage:', e);
      return false;
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear: (): boolean => {
    if (!StorageService.isAvailable()) {
      return false;
    }
    
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      storageLogger.warn('Failed to clear localStorage', e);
      return false;
    }
  }
};

export default StorageService; 