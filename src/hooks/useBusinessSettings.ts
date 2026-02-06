/**
 * React hook for accessing business settings
 * Provides caching, loading states, and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import {
  BusinessSettings,
  CityBusinessSettings,
  fetchBusinessSettings,
  fetchCityBusinessSettings,
  fetchAllCityBusinessSettings,
  getPhoneNumberForCity,
  DEFAULT_BUSINESS_SETTINGS
} from '@/lib/business-settings';
import { PhoneNumber } from '@/utils/phone-formatter';

export interface UseBusinessSettingsResult {
  /** Business settings data */
  settings: BusinessSettings;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh function */
  refresh: () => Promise<void>;
}

export interface UseCityBusinessSettingsResult {
  /** City-specific business settings */
  citySettings: CityBusinessSettings | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh function */
  refresh: () => Promise<void>;
}

export interface UsePhoneNumberResult {
  /** Phone number object with display and href formats */
  phoneNumber: PhoneNumber;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh function */
  refresh: () => Promise<void>;
}

// Cache for business settings to avoid duplicate requests
let businessSettingsCache: BusinessSettings | null = null;
let businessSettingsCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for city settings
const citySettingsCache = new Map<string, { data: CityBusinessSettings | null; time: number }>();

/**
 * Hook to fetch and cache business settings
 */
export function useBusinessSettings(): UseBusinessSettingsResult {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (businessSettingsCache && now - businessSettingsCacheTime < CACHE_DURATION) {
      setSettings(businessSettingsCache);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchBusinessSettings();
      
      // Update cache
      businessSettingsCache = data;
      businessSettingsCacheTime = now;
      
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Error in useBusinessSettings:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch business settings'));
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refresh: fetchSettings
  };
}

/**
 * Hook to fetch city-specific business settings
 */
export function useCityBusinessSettings(citySlug: string): UseCityBusinessSettingsResult {
  const [citySettings, setCitySettings] = useState<CityBusinessSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCitySettings = useCallback(async () => {
    if (!citySlug) {
      setCitySettings(null);
      setLoading(false);
      return;
    }

    // Check cache first
    const now = Date.now();
    const cached = citySettingsCache.get(citySlug);
    if (cached && now - cached.time < CACHE_DURATION) {
      setCitySettings(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCityBusinessSettings(citySlug);
      
      // Update cache
      citySettingsCache.set(citySlug, { data, time: now });
      
      setCitySettings(data);
      setError(null);
    } catch (err) {
      console.error(`Error in useCityBusinessSettings for ${citySlug}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to fetch city settings for ${citySlug}`));
    } finally {
      setLoading(false);
    }
  }, [citySlug]);

  useEffect(() => {
    fetchCitySettings();
  }, [fetchCitySettings]);

  return {
    citySettings,
    loading,
    error,
    refresh: fetchCitySettings
  };
}

/**
 * Hook to get phone number for a specific city or global business
 * This is the main hook pages should use for phone numbers
 */
export function usePhoneNumber(citySlug?: string): UsePhoneNumberResult {
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber>(DEFAULT_BUSINESS_SETTINGS.phone);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPhoneNumber = useCallback(async () => {
    // Create cache key
    const cacheKey = citySlug || 'global';
    const now = Date.now();
    
    // Simple in-memory cache for phone numbers
    const phoneNumberCache = new Map<string, { data: PhoneNumber; time: number }>();
    const cached = phoneNumberCache.get(cacheKey);
    
    if (cached && now - cached.time < CACHE_DURATION) {
      setPhoneNumber(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getPhoneNumberForCity(citySlug);
      
      // Update cache
      phoneNumberCache.set(cacheKey, { data, time: now });
      
      setPhoneNumber(data);
      setError(null);
    } catch (err) {
      console.error(`Error in usePhoneNumber for ${citySlug || 'global'}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to fetch phone number'));
      // Keep default phone number on error
    } finally {
      setLoading(false);
    }
  }, [citySlug]);

  useEffect(() => {
    fetchPhoneNumber();
  }, [fetchPhoneNumber]);

  return {
    phoneNumber,
    loading,
    error,
    refresh: fetchPhoneNumber
  };
}

/**
 * Simple hook for phone number display with minimal overhead
 * Good for components that just need to display a phone number
 */
export function useSimplePhoneNumber(citySlug?: string): {
  display: string;
  href: string;
  loading: boolean;
} {
  const { phoneNumber, loading } = usePhoneNumber(citySlug);
  
  return {
    display: phoneNumber.display,
    href: phoneNumber.href,
    loading
  };
}

/**
 * Hook to get business phone number with area code
 * Useful for displaying area code-specific content
 */
export function usePhoneNumberWithAreaCode(citySlug?: string): {
  phoneNumber: PhoneNumber;
  areaCode: string | null;
  loading: boolean;
} {
  const { phoneNumber, loading } = usePhoneNumber(citySlug);
  
  // Extract area code from E.164 format
  const areaCode = phoneNumber.e164.match(/^\+1(\d{3})/)?.[1] || null;
  
  return {
    phoneNumber,
    areaCode,
    loading
  };
}

/**
 * Hook to fetch all active service areas (cities)
 */
export function useServiceAreas(): {
  cities: Array<{ cityName: string; slug: string }>;
  loading: boolean;
} {
  const [cities, setCities] = useState<Array<{ cityName: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCityBusinessSettings()
      .then((data) => setCities(data.map(({ cityName, slug }) => ({ cityName, slug }))))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, []);

  return { cities, loading };
}

/**
 * Clear all business settings caches
 * Useful after updating business information
 */
export function clearBusinessSettingsCache(): void {
  businessSettingsCache = null;
  businessSettingsCacheTime = 0;
  citySettingsCache.clear();
}

// Export default hook for convenience
export default useBusinessSettings;