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
} as const;

/**
 * Type for storage keys
 */
export type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Storage service for handling localStorage operations
 */
const StorageService = {
  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
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
  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.isAvailable()) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (e) {
      storageLogger.error(`Error getting item from localStorage (${key}):`, e);
      return defaultValue;
    }
  },

  /**
   * Set an item in localStorage
   */
  setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      storageLogger.error(`Error setting item in localStorage (${key}):`, e);
      return false;
    }
  },

  /**
   * Remove an item from localStorage
   */
  removeItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      storageLogger.error(`Error removing item from localStorage (${key}):`, e);
      return false;
    }
  },

  /**
   * Clear all items with a specific prefix
   */
  clearWithPrefix(prefix: string): boolean {
    if (!this.isAvailable()) {
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
  clearAll(): boolean {
    if (!this.isAvailable()) {
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
};

export default StorageService; 