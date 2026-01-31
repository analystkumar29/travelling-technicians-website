/**
 * Business settings library
 * Fetches and manages business configuration from database
 */

import { supabase, getServiceSupabase } from '@/utils/supabaseClient';
import { parsePhoneNumber, PhoneNumber, DEFAULT_PHONE_NUMBER } from '@/utils/phone-formatter';

export interface BusinessSettings {
  /** Business name */
  name: string;
  /** Business phone number */
  phone: PhoneNumber;
  /** Business email */
  email: string;
  /** Business hours in JSON format */
  hours: Record<string, any>;
  /** WhatsApp business number */
  whatsapp: PhoneNumber;
  /** Business address (if available) */
  address?: string;
  /** Social media links (if available) */
  socialMedia?: Record<string, string>;
}

export interface CityBusinessSettings {
  /** City name */
  cityName: string;
  /** City slug */
  slug: string;
  /** Local phone number for this city */
  localPhone?: PhoneNumber;
  /** Local email for this city */
  localEmail?: string;
  /** Whether this city is active */
  isActive: boolean;
}

/**
 * Default fallback business settings for development/offline
 */
export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  name: 'The Travelling Technicians',
  phone: parsePhoneNumber(DEFAULT_PHONE_NUMBER),
  email: 'info@travelling-technicians.ca',
  hours: {
    weekdays: '9am-7pm',
    weekends: '10am-5pm',
    emergency: true
  },
  whatsapp: parsePhoneNumber(DEFAULT_PHONE_NUMBER),
  address: 'Metro Vancouver Service Area',
  socialMedia: {
    facebook: 'https://www.facebook.com/travellingtechnicians',
    instagram: 'https://www.instagram.com/travellingtechnicians',
    linkedin: 'https://www.linkedin.com/company/travelling-technicians'
  }
};

/**
 * Fetch business settings from site_settings table
 * Uses Supabase client with proper error handling
 */
export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['business_name', 'business_phone', 'business_email', 'business_hours', 'whatsapp_business_number']);

    if (error) {
      console.error('Error fetching business settings:', error);
      return DEFAULT_BUSINESS_SETTINGS;
    }

    if (!data || data.length === 0) {
      console.warn('No business settings found in database, using defaults');
      return DEFAULT_BUSINESS_SETTINGS;
    }

    // Convert array of key-value pairs to object
    const settingsMap = data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    // Parse business hours JSON
    let hours = DEFAULT_BUSINESS_SETTINGS.hours;
    try {
      if (settingsMap.business_hours) {
        hours = JSON.parse(settingsMap.business_hours);
      }
    } catch (error) {
      console.error('Error parsing business hours JSON:', error);
    }

    // Parse phone numbers
    const businessPhone = settingsMap.business_phone || DEFAULT_PHONE_NUMBER;
    const whatsappNumber = settingsMap.whatsapp_business_number || businessPhone;

    return {
      name: settingsMap.business_name || DEFAULT_BUSINESS_SETTINGS.name,
      phone: parsePhoneNumber(businessPhone),
      email: settingsMap.business_email || DEFAULT_BUSINESS_SETTINGS.email,
      hours,
      whatsapp: parsePhoneNumber(whatsappNumber),
      address: DEFAULT_BUSINESS_SETTINGS.address,
      socialMedia: DEFAULT_BUSINESS_SETTINGS.socialMedia
    };
  } catch (error) {
    console.error('Unexpected error fetching business settings:', error);
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

/**
 * Fetch city-specific business settings from service_locations table
 */
export async function fetchCityBusinessSettings(citySlug: string): Promise<CityBusinessSettings | null> {
  try {
    const { data, error } = await supabase
      .from('service_locations')
      .select('city_name, slug, local_phone, local_email, is_active')
      .eq('slug', citySlug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No city found with this slug
        return null;
      }
      console.error(`Error fetching city settings for ${citySlug}:`, error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      cityName: data.city_name,
      slug: data.slug,
      localPhone: data.local_phone ? parsePhoneNumber(data.local_phone) : undefined,
      localEmail: data.local_email,
      isActive: data.is_active
    };
  } catch (error) {
    console.error(`Unexpected error fetching city settings for ${citySlug}:`, error);
    return null;
  }
}

/**
 * Fetch all active cities with their business settings
 */
export async function fetchAllCityBusinessSettings(): Promise<CityBusinessSettings[]> {
  try {
    const { data, error } = await supabase
      .from('service_locations')
      .select('city_name, slug, local_phone, local_email, is_active')
      .eq('is_active', true)
      .order('city_name');

    if (error) {
      console.error('Error fetching all city settings:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(city => ({
      cityName: city.city_name,
      slug: city.slug,
      localPhone: city.local_phone ? parsePhoneNumber(city.local_phone) : undefined,
      localEmail: city.local_email,
      isActive: city.is_active
    }));
  } catch (error) {
    console.error('Unexpected error fetching all city settings:', error);
    return [];
  }
}

/**
 * Get phone number for a specific city or fallback to global business phone
 * This is the main function pages should use to get phone numbers
 */
export async function getPhoneNumberForCity(citySlug?: string): Promise<PhoneNumber> {
  try {
    // If city slug is provided, try to get city-specific phone number
    if (citySlug) {
      const citySettings = await fetchCityBusinessSettings(citySlug);
      if (citySettings?.localPhone) {
        return citySettings.localPhone;
      }
    }

    // Fallback to global business phone number
    const businessSettings = await fetchBusinessSettings();
    return businessSettings.phone;
  } catch (error) {
    console.error('Error getting phone number for city:', error);
    return parsePhoneNumber(DEFAULT_PHONE_NUMBER);
  }
}

/**
 * Server-side function for static generation (SSG)
 * Fetches business settings without React hooks
 */
export async function getBusinessSettingsForSSG(): Promise<BusinessSettings> {
  // Use service role client for server-side operations
  try {
    const serviceSupabase = getServiceSupabase();
    
    const { data, error } = await serviceSupabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['business_name', 'business_phone', 'business_email', 'business_hours', 'whatsapp_business_number']);

    if (error) {
      console.error('Error fetching business settings for SSG:', error);
      return DEFAULT_BUSINESS_SETTINGS;
    }

    if (!data || data.length === 0) {
      return DEFAULT_BUSINESS_SETTINGS;
    }

    const settingsMap = data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    let hours = DEFAULT_BUSINESS_SETTINGS.hours;
    try {
      if (settingsMap.business_hours) {
        hours = JSON.parse(settingsMap.business_hours);
      }
    } catch (error) {
      console.error('Error parsing business hours JSON for SSG:', error);
    }

    const businessPhone = settingsMap.business_phone || DEFAULT_PHONE_NUMBER;
    const whatsappNumber = settingsMap.whatsapp_business_number || businessPhone;

    return {
      name: settingsMap.business_name || DEFAULT_BUSINESS_SETTINGS.name,
      phone: parsePhoneNumber(businessPhone),
      email: settingsMap.business_email || DEFAULT_BUSINESS_SETTINGS.email,
      hours,
      whatsapp: parsePhoneNumber(whatsappNumber),
      address: DEFAULT_BUSINESS_SETTINGS.address,
      socialMedia: DEFAULT_BUSINESS_SETTINGS.socialMedia
    };
  } catch (error) {
    console.error('Unexpected error in getBusinessSettingsForSSG:', error);
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

/**
 * Server-side function to get phone number for city (for SSG)
 */
export async function getPhoneNumberForCitySSG(citySlug?: string): Promise<PhoneNumber> {
  try {
    if (citySlug) {
      const serviceSupabase = getServiceSupabase();
      
      const { data } = await serviceSupabase
        .from('service_locations')
        .select('local_phone')
        .eq('slug', citySlug)
        .eq('is_active', true)
        .single();

      if (data?.local_phone) {
        return parsePhoneNumber(data.local_phone);
      }
    }

    const businessSettings = await getBusinessSettingsForSSG();
    return businessSettings.phone;
  } catch (error) {
    console.error('Error in getPhoneNumberForCitySSG:', error);
    return parsePhoneNumber(DEFAULT_PHONE_NUMBER);
  }
}