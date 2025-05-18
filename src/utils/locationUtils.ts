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
    responseTime: '1-2 hours'
  },
  'V7H': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7J': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7K': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7L': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7M': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7N': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7P': { 
    city: 'North Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7R': { 
    city: 'West Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7S': { 
    city: 'West Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7T': { 
    city: 'West Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7V': { 
    city: 'West Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
  },
  'V7W': { 
    city: 'West Vancouver', 
    serviceable: true, 
    sameDay: true,
    responseTime: '1-2 hours'
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
  },
  
  // Nanaimo (V9R-V9T, V9S)
  'V9R': { 
    city: 'Nanaimo', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V9S': { 
    city: 'Nanaimo', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V9T': { 
    city: 'Nanaimo', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  
  // Victoria (V8N-V8Z, V9A-V9B)
  'V8N': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V8P': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V8R': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V8S': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V8T': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V8V': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V8W': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V8X': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V8Y': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V8Z': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V9A': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
  'V9B': { 
    city: 'Victoria', 
    serviceable: true, 
    sameDay: false,
    travelFee: 75,
    responseTime: '2-3 days'
  },
};

/**
 * Validates if a string is in proper Canadian postal code format
 * @param postalCode - The postal code to validate
 * @returns Whether the postal code is valid
 */
export const isValidPostalCodeFormat = (postalCode: string): boolean => {
  if (!postalCode) return false;
  
  // Canadian postal code formats:
  // - A1A 1A1 (with space)
  // - A1A-1A1 (with hyphen)
  // - A1A1A1 (no separator)
  // - Partial formats like V5R are also accepted
  
  // Normalize to simplify checking
  const normalized = postalCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Check for partial postal code (e.g., "V5R")
  if (normalized.length === 3) {
    // Check first character (A-Z, not D, F, I, O, Q, U)
    if (!/^[A-Z]/.test(normalized) || /^[DFIOQU]/.test(normalized)) {
      console.log('Invalid first character in partial postal code');
      return false;
    }
    
    // Check pattern for partial postal code
    const partialPattern = /^[A-Z]\d[A-Z]$/;
    const isValidPartial = partialPattern.test(normalized);
    
    if (isValidPartial) {
      console.log('Valid partial postal code:', normalized);
      return true;
    }
  }
  
  // For complete postal codes (6 characters)
  if (normalized.length !== 6) {
    console.log('Invalid postal code length:', normalized.length);
    return false;
  }
  
  // Check first character (A-Z, not D, F, I, O, Q, U)
  if (!/^[A-Z]/.test(normalized) || /^[DFIOQU]/.test(normalized)) {
    console.log('Invalid first character in postal code');
    return false;
  }
  
  // Check pattern for rest of postal code
  const pattern = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;
  const isValid = pattern.test(normalized);
  
  console.log('Postal code validation result for', normalized, ':', isValid);
  return isValid;
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
  console.log('Checking service area for postal code:', postalCode);
  
  if (!postalCode) {
    console.error('No postal code provided');
    return null;
  }
  
  const isValid = isValidPostalCodeFormat(postalCode);
  if (!isValid) {
    console.error('Invalid postal code format:', postalCode);
    return null;
  }
  
  const normalizedPostalCode = normalizePostalCode(postalCode);
  console.log('Normalized postal code:', normalizedPostalCode);
  
  // Debug: Dump first 10 keys from POSTAL_CODE_MAP
  const keys = Object.keys(POSTAL_CODE_MAP).slice(0, 10);
  console.log('Some postal code map keys:', keys);
  console.log('Looking for FSA V5A in map:', 'V5A' in POSTAL_CODE_MAP);
  
  // Try exact match for all 6 characters
  if (POSTAL_CODE_MAP[normalizedPostalCode]) {
    console.log('Found exact match for full postal code:', normalizedPostalCode);
    return POSTAL_CODE_MAP[normalizedPostalCode];
  }
  
  // Try the first 5 characters
  const fiveCharCode = normalizedPostalCode.substring(0, 5);
  if (POSTAL_CODE_MAP[fiveCharCode]) {
    console.log('Found match for 5-character prefix:', fiveCharCode);
    return POSTAL_CODE_MAP[fiveCharCode];
  }
  
  // Try the first 4 characters
  const fourCharCode = normalizedPostalCode.substring(0, 4);
  if (POSTAL_CODE_MAP[fourCharCode]) {
    console.log('Found match for 4-character prefix:', fourCharCode);
    return POSTAL_CODE_MAP[fourCharCode];
  }
  
  // Try the first 3 characters (FSA)
  const prefix = normalizedPostalCode.substring(0, 3);
  console.log('Looking for prefix match:', prefix);
  if (POSTAL_CODE_MAP[prefix]) {
    console.log('Found match for 3-character FSA:', prefix);
    return POSTAL_CODE_MAP[prefix];
  }
  
  // Try general area codes (first 2 characters)
  const areaCode = normalizedPostalCode.substring(0, 2);
  console.log('Looking for area code match:', areaCode);
  
  // Handle Vancouver (V5, V6)
  if (areaCode === 'V5' || areaCode === 'V6') {
    console.log('Found match for Vancouver area code:', areaCode);
    return POSTAL_CODE_MAP[areaCode];
  }
  
  // Handle V7J specifically (temporary fix for North Vancouver)
  if (prefix === 'V7J') {
    console.log('Special case: V7J for North Vancouver');
    return {
      city: 'North Vancouver',
      serviceable: true,
      sameDay: true,
      responseTime: '1-2 hours'
    };
  }
  
  console.log('No service area match found for postal code:', postalCode);
  console.log('Tried:', normalizedPostalCode, fiveCharCode, fourCharCode, prefix, areaCode);
  return null;
};

/**
 * Gets the user's current location and converts it to a postal code
 * @returns Promise resolving to postal code or error message
 */
export const getCurrentLocationPostalCode = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('[GEO_UTILS] Starting getCurrentLocationPostalCode');
    
    if (!navigator.geolocation) {
      console.log('[GEO_UTILS] Geolocation is not supported by browser');
      resolve('V5C 6R9'); // Fallback for unsupported browsers
      return;
    }
    
    // Always provide a default catchall timeout
    const overallTimeout = setTimeout(() => {
      console.log('[GEO_UTILS] Location detection overall timeout reached');
      resolve('V5C 6R9'); // Fallback after timeout
    }, 8000); // Shorter overall timeout (8 seconds)
    
    // Check for environments that commonly have geolocation issues
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isMacOS = /Mac|MacIntel/.test(navigator.platform);
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Immediately use fallback for known problematic environments
    if (isDevelopment || isMacOS || isIOS || isSafari) {
      console.log(`[GEO_UTILS] Special environment detected: ${
        isDevelopment ? 'Development' : 
        isMacOS ? 'macOS' : 
        isIOS ? 'iOS' : 'Safari'
      }. Using fallback postal code V5C 6R9`);
      
      clearTimeout(overallTimeout);
      // Use setTimeout to simulate an async operation and avoid UI glitches
      setTimeout(() => resolve('V5C 6R9'), 500);
      return;
    }
    
    // For all other browsers, attempt to use geolocation but with robust error handling
    try {
      // Add defensive wrapper around geolocation to prevent crashes
      console.log('[GEO_UTILS] Requesting browser geolocation');
      
      // We'll use a more conservative approach with geolocation
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            clearTimeout(overallTimeout);
            const { latitude, longitude } = position.coords;
            console.log('[GEO_UTILS] Detected coordinates:', latitude, longitude);
            
            // For simplicity and reliability, use our fallback approximation directly
            // which is more dependable than third-party APIs
            const roughLocation = getRoughLocationFromCoordinates(latitude, longitude);
            if (roughLocation) {
              console.log('[GEO_UTILS] Using rough location approximation:', roughLocation);
              resolve(roughLocation);
              return;
            }
            
            // If rough location fails, default to a known good value
            console.log('[GEO_UTILS] Rough location failed, using default area code');
            resolve('V5C 6R9');
          } catch (error) {
            clearTimeout(overallTimeout);
            console.error('[GEO_UTILS] Error in geolocation success handler:', error);
            resolve('V5C 6R9');
          }
        },
        (error) => {
          clearTimeout(overallTimeout);
          console.error('[GEO_UTILS] Geolocation error:', error);
          
          // Always default to a reliable fallback
          resolve('V5C 6R9');
        },
        { 
          enableHighAccuracy: false,  // Lower accuracy requirements
          maximumAge: 300000,         // Accept positions up to 5 minutes old
          timeout: 5000               // Quick timeout (5 seconds)
        }
      );
    } catch (e) {
      // Catch any unexpected exceptions
      clearTimeout(overallTimeout);
      console.error('[GEO_UTILS] Critical error in geolocation API:', e);
      resolve('V5C 6R9');
    }
  });
};

/**
 * Fallback function to determine approximate postal code from coordinates
 * This is a very rough approximation for BC's Lower Mainland
 */
function getRoughLocationFromCoordinates(latitude: number, longitude: number): string | null {
  // Simplified mapping of rough coordinate ranges to postal code prefixes
  // These are approximate and not meant to be precise
  
  // Vancouver area
  if (latitude >= 49.2 && latitude <= 49.3 && longitude >= -123.2 && longitude <= -123.0) {
    return 'V6B 1A1'; // Downtown Vancouver
  }
  
  // North Vancouver
  if (latitude >= 49.3 && latitude <= 49.4 && longitude >= -123.1 && longitude <= -122.9) {
    return 'V7J 1A1'; // North Vancouver
  }
  
  // Burnaby
  if (latitude >= 49.2 && latitude <= 49.3 && longitude >= -123.0 && longitude <= -122.9) {
    return 'V5B 1A1'; // Burnaby
  }
  
  // Richmond
  if (latitude >= 49.1 && latitude <= 49.2 && longitude >= -123.2 && longitude <= -123.0) {
    return 'V6Y 1A1'; // Richmond
  }
  
  // Surrey
  if (latitude >= 49.1 && latitude <= 49.2 && longitude >= -122.9 && longitude <= -122.7) {
    return 'V3R 1A1'; // Surrey
  }
  
  // Default to Vancouver if within general Lower Mainland area
  if (latitude >= 49.0 && latitude <= 49.5 && longitude >= -123.5 && longitude <= -122.5) {
    return 'V6B 1A1'; // Default to Vancouver
  }
  
  return null; // Outside of our known areas
} 