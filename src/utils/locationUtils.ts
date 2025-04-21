// Map of postal code prefixes to their corresponding service areas
export type ServiceAreaType = {
  city: string;
  serviceable: boolean;
  sameDay: boolean;
  travelFee?: number;
  responseTime: string;
};

export const POSTAL_CODE_MAP: Record<string, ServiceAreaType> = {
  // Full 6-character postal codes for precise location matching (Squamish specific)
  'V0N1T0': { 
    city: 'Squamish', 
    serviceable: true, 
    sameDay: false,
    travelFee: 25,
    responseTime: '1-2 days'
  },
  'V0N1H0': { 
    city: 'Squamish', 
    serviceable: true, 
    sameDay: false,
    travelFee: 25,
    responseTime: '1-2 days'
  },
  'V8B0V1': { 
    city: 'Squamish', 
    serviceable: true, 
    sameDay: false,
    travelFee: 25,
    responseTime: '1-2 days'
  },
  
  // Full 6-character postal codes for precise location matching (Whistler specific)
  'V0N1B0': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  'V0N1B1': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  'V0N1B2': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  'V0N1B3': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  'V0N1B4': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  'V0N1B5': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  'V0N1B6': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  'V0N1B7': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  'V0N1B8': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  'V0N1B9': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  'V8E0A1': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  
  // Full 6-character postal codes for precise location matching (Vancouver specific)
  'V6B1A1': { 
    city: 'Downtown Vancouver', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '30-60 minutes'
  },
  'V5K0A1': { 
    city: 'East Vancouver', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '30-60 minutes'
  },
  'V6E1V3': { 
    city: 'West End Vancouver', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '30-60 minutes'
  },
  'V5Y1V4': { 
    city: 'Mount Pleasant', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '30-60 minutes'
  },
  'V5T3H5': { 
    city: 'Fairview', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '30-60 minutes'
  },
  
  // Vancouver (V5, V6)
  'V5': { 
    city: 'Vancouver', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V6': { 
    city: 'Vancouver', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  
  // Burnaby (V3N, V5A-V5J)
  'V3N': { 
    city: 'Burnaby', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V5A': { 
    city: 'Burnaby', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V5B': { 
    city: 'Burnaby', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V5C': { 
    city: 'Burnaby', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V5E': { 
    city: 'Burnaby', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V5G': { 
    city: 'Burnaby', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V5H': { 
    city: 'Burnaby', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V5J': { 
    city: 'Burnaby', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  
  // Richmond (V6V-V6Y, V7A-V7C)
  'V6V': { 
    city: 'Richmond', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V6W': { 
    city: 'Richmond', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V6X': { 
    city: 'Richmond', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V6Y': { 
    city: 'Richmond', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V7A': { 
    city: 'Richmond', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V7B': { 
    city: 'Richmond', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  'V7C': { 
    city: 'Richmond', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '1-2 hours'
  },
  
  // Surrey (V3R-V3X, V4A, V4N, V4P)
  'V3R': { 
    city: 'Surrey', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '2-3 hours'
  },
  'V3S': { 
    city: 'Surrey', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '2-3 hours'
  },
  'V3T': { 
    city: 'Surrey', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '2-3 hours'
  },
  'V3V': { 
    city: 'Surrey', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '2-3 hours'
  },
  'V3W': { 
    city: 'Surrey', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '2-3 hours'
  },
  'V3X': { 
    city: 'Surrey', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '2-3 hours'
  },
  'V4A': { 
    city: 'Surrey', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '2-3 hours'
  },
  'V4N': { 
    city: 'Surrey', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '2-3 hours'
  },
  'V4P': { 
    city: 'Surrey', 
    serviceable: true, 
    sameDay: true, 
    responseTime: '2-3 hours'
  },
  
  // Coquitlam, Port Coquitlam, Port Moody (V3B-V3E, V3H, V3K)
  'V3B': { 
    city: 'Coquitlam', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V3C': { 
    city: 'Coquitlam', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V3E': { 
    city: 'Coquitlam', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V3H': { 
    city: 'Port Moody', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V3K': { 
    city: 'Port Coquitlam', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  
  // North Vancouver and West Vancouver (V7G-V7P, V7R-V7W)
  'V7G': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7H': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7J': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7K': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7L': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7M': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7N': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7P': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7R': { 
    city: 'West Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7S': { 
    city: 'West Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7T': { 
    city: 'West Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7V': { 
    city: 'West Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V7W': { 
    city: 'West Vancouver', 
    serviceable: true, 
    sameDay: false,
    responseTime: '3-4 hours'
  },
  
  // New Westminster (V3L, V3M)
  'V3L': { 
    city: 'New Westminster', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  'V3M': { 
    city: 'New Westminster', 
    serviceable: true, 
    sameDay: true,
    responseTime: '2-3 hours'
  },
  
  // Delta, Ladner, Tsawwassen (V4C, V4E, V4K, V4L, V4M)
  'V4C': { 
    city: 'Delta', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V4E': { 
    city: 'Delta', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V4K': { 
    city: 'Ladner', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V4L': { 
    city: 'Tsawwassen', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V4M': { 
    city: 'Tsawwassen', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  
  // Langley (V1M, V2Y, V2Z, V3A, V4W)
  'V1M': { 
    city: 'Langley', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V2Y': { 
    city: 'Langley', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V2Z': { 
    city: 'Langley', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V3A': { 
    city: 'Langley', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V4W': { 
    city: 'Langley', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  
  // White Rock (V4B)
  'V4B': { 
    city: 'White Rock', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  
  // Maple Ridge, Pitt Meadows (V2W, V2X, V3Y, V4R)
  'V2W': { 
    city: 'Maple Ridge', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V2X': { 
    city: 'Maple Ridge', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V3Y': { 
    city: 'Pitt Meadows', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  'V4R': { 
    city: 'Maple Ridge', 
    serviceable: true, 
    sameDay: false,
    responseTime: 'Next day'
  },
  
  // Squamish (V8B)
  'V8B': { 
    city: 'Squamish', 
    serviceable: true, 
    sameDay: false,
    travelFee: 25,
    responseTime: '1-2 days'
  },
  
  // Whistler (V0N, V8E)
  'V8E': { 
    city: 'Whistler', 
    serviceable: true, 
    sameDay: false,
    travelFee: 50,
    responseTime: '1-2 days'
  },
  
  // Chilliwack (V2P, V2R)
  'V2P': { 
    city: 'Chilliwack', 
    serviceable: true, 
    sameDay: false,
    travelFee: 35,
    responseTime: '1-2 days'
  },
  'V2R': { 
    city: 'Chilliwack', 
    serviceable: true, 
    sameDay: false,
    travelFee: 35,
    responseTime: '1-2 days'
  },
  
  // Abbotsford (V2S, V2T, V3G)
  'V2S': { 
    city: 'Abbotsford', 
    serviceable: true, 
    sameDay: false,
    travelFee: 25,
    responseTime: '1-2 days'
  },
  'V2T': { 
    city: 'Abbotsford', 
    serviceable: true, 
    sameDay: false,
    travelFee: 25,
    responseTime: '1-2 days'
  },
  'V3G': { 
    city: 'Abbotsford', 
    serviceable: true, 
    sameDay: false,
    travelFee: 25,
    responseTime: '1-2 days'
  },
  
  // Mission (V2V, V4S)
  'V2V': { 
    city: 'Mission', 
    serviceable: true, 
    sameDay: false,
    travelFee: 25,
    responseTime: '1-2 days'
  },
  'V4S': { 
    city: 'Mission', 
    serviceable: true, 
    sameDay: false,
    travelFee: 25,
    responseTime: '1-2 days'
  },
  
  // Other areas along Highway 99 between Vancouver and Whistler
  'V0V': { 
    city: 'Sea to Sky Corridor', 
    serviceable: true, 
    sameDay: false,
    travelFee: 35,
    responseTime: '1-2 days'
  },
  
  // V0N has different locations, so we need to handle it differently
  'V0N': { 
    city: 'Sea to Sky Region', 
    serviceable: true, 
    sameDay: false,
    travelFee: 35,
    responseTime: '1-2 days'
  }
};

/**
 * Validates if a postal code is properly formatted (Canadian format)
 * @param postalCode - The postal code to validate
 * @returns boolean indicating if the format is valid
 */
export const isValidPostalCodeFormat = (postalCode: string): boolean => {
  // Canadian postal code format: A1A 1A1 or A1A1A1
  const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * Extracts the postal code without spaces or special characters
 * @param postalCode - The postal code to process
 * @returns The normalized postal code (uppercase, no spaces)
 */
export const normalizePostalCode = (postalCode: string): string => {
  if (!postalCode) return '';
  return postalCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
};

/**
 * Extracts the first three characters of a postal code (FSA)
 * @param postalCode - The postal code to process
 * @returns The FSA (Forward Sortation Area) of the postal code
 */
export const getPostalCodePrefix = (postalCode: string): string => {
  if (!postalCode || !isValidPostalCodeFormat(postalCode)) return '';
  
  // Extract and return the first three characters (FSA)
  return normalizePostalCode(postalCode).substring(0, 3);
};

/**
 * Checks if a postal code is within our service area
 * @param postalCode - The postal code to check
 * @returns Service area information or null if not serviced
 */
export const checkServiceArea = (postalCode: string): ServiceAreaType | null => {
  if (!postalCode || !isValidPostalCodeFormat(postalCode)) return null;
  
  const normalizedPostalCode = normalizePostalCode(postalCode);
  const fullPostalCode = normalizedPostalCode.substring(0, 6); // Full 6-character code
  const fiveCharCode = normalizedPostalCode.substring(0, 5); // First 5 characters
  const fourCharCode = normalizedPostalCode.substring(0, 4); // First 4 characters 
  const prefix = normalizedPostalCode.substring(0, 3); // First 3 characters (FSA)
  
  // First try to match the full 6-character postal code for more precise location matching
  if (POSTAL_CODE_MAP[fullPostalCode]) {
    return POSTAL_CODE_MAP[fullPostalCode];
  }
  
  // Then try to match the first 5 characters
  if (POSTAL_CODE_MAP[fiveCharCode]) {
    return POSTAL_CODE_MAP[fiveCharCode];
  }
  
  // Then try to match the first 4 characters
  if (POSTAL_CODE_MAP[fourCharCode]) {
    return POSTAL_CODE_MAP[fourCharCode];
  }
  
  // Fall back to the 3-character FSA
  if (POSTAL_CODE_MAP[prefix]) {
    return POSTAL_CODE_MAP[prefix];
  }
  
  return null;
};

/**
 * Gets the user's current location and converts it to a postal code
 * @returns Promise resolving to postal code or error message
 */
export const getCurrentLocationPostalCode = async (): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Call the Nominatim API to get the address from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              { headers: { 'Accept-Language': 'en-US,en' } }
            );
            
            if (!response.ok) {
              reject('Failed to fetch location data');
              return;
            }
            
            const data = await response.json();
            const postalCode = data.address?.postcode || '';
            
            resolve(postalCode);
          } catch (error) {
            reject('Error fetching address data');
          }
        },
        (error) => {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              reject('Location permission denied');
              break;
            case error.POSITION_UNAVAILABLE:
              reject('Location information is unavailable');
              break;
            case error.TIMEOUT:
              reject('Location request timed out');
              break;
            default:
              reject('An unknown error occurred');
          }
        },
        { maximumAge: 60000, timeout: 10000, enableHighAccuracy: true }
      );
    });
  } catch (error) {
    throw new Error('Failed to get location: ' + error);
  }
}; 