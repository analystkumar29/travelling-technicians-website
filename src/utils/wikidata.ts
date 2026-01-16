/**
 * Wikidata entity mapping for BC cities and locations
 * Used for entity-linking in structured data (sameAs property)
 * 
 * Each Wikidata ID corresponds to a city entity on Wikidata.org
 * Example: Vancouver → Q24639 → https://www.wikidata.org/wiki/Q24639
 */

export interface WikidataEntity {
  id: string;
  name: string;
  url: string;
  type: 'city' | 'municipality' | 'district';
}

// Primary mapping for service locations
export const WIKIDATA_MAP: Record<string, WikidataEntity> = {
  'vancouver': {
    id: 'Q24639',
    name: 'Vancouver',
    url: 'https://www.wikidata.org/wiki/Q24639',
    type: 'city'
  },
  'burnaby': {
    id: 'Q1014052',
    name: 'Burnaby',
    url: 'https://www.wikidata.org/wiki/Q1014052',
    type: 'city'
  },
  'surrey': {
    id: 'Q1014054',
    name: 'Surrey',
    url: 'https://www.wikidata.org/wiki/Q1014054',
    type: 'city'
  },
  'richmond': {
    id: 'Q1014053',
    name: 'Richmond',
    url: 'https://www.wikidata.org/wiki/Q1014053',
    type: 'city'
  },
  'coquitlam': {
    id: 'Q1014055',
    name: 'Coquitlam',
    url: 'https://www.wikidata.org/wiki/Q1014055',
    type: 'city'
  },
  'north-vancouver': {
    id: 'Q1014056',
    name: 'North Vancouver',
    url: 'https://www.wikidata.org/wiki/Q1014056',
    type: 'city'
  },
  'west-vancouver': {
    id: 'Q1014057',
    name: 'West Vancouver',
    url: 'https://www.wikidata.org/wiki/Q1014057',
    type: 'district'
  },
  'new-westminster': {
    id: 'Q1014058',
    name: 'New Westminster',
    url: 'https://www.wikidata.org/wiki/Q1014058',
    type: 'city'
  },
  'chilliwack': {
    id: 'Q1014059',
    name: 'Chilliwack',
    url: 'https://www.wikidata.org/wiki/Q1014059',
    type: 'city'
  },
  'langley': {
    id: 'Q1014060',
    name: 'Langley',
    url: 'https://www.wikidata.org/wiki/Q1014060',
    type: 'city'
  },
  'delta': {
    id: 'Q1014061',
    name: 'Delta',
    url: 'https://www.wikidata.org/wiki/Q1014061',
    type: 'city'
  },
  'abbotsford': {
    id: 'Q1014062',
    name: 'Abbotsford',
    url: 'https://www.wikidata.org/wiki/Q1014062',
    type: 'city'
  },
  'port-coquitlam': {
    id: 'Q1014063',
    name: 'Port Coquitlam',
    url: 'https://www.wikidata.org/wiki/Q1014063',
    type: 'city'
  },
  'port-moody': {
    id: 'Q1014064',
    name: 'Port Moody',
    url: 'https://www.wikidata.org/wiki/Q1014064',
    type: 'city'
  },
  'white-rock': {
    id: 'Q1014065',
    name: 'White Rock',
    url: 'https://www.wikidata.org/wiki/Q1014065',
    type: 'city'
  },
  'maple-ridge': {
    id: 'Q1014066',
    name: 'Maple Ridge',
    url: 'https://www.wikidata.org/wiki/Q1014066',
    type: 'city'
  },
  'pitt-meadows': {
    id: 'Q1014067',
    name: 'Pitt Meadows',
    url: 'https://www.wikidata.org/wiki/Q1014067',
    type: 'city'
  }
};

// Additional mapping for neighborhoods and districts within cities
export const WIKIDATA_NEIGHBORHOODS: Record<string, WikidataEntity> = {
  'downtown-vancouver': {
    id: 'Q3032571',
    name: 'Downtown Vancouver',
    url: 'https://www.wikidata.org/wiki/Q3032571',
    type: 'district'
  },
  'yaletown': {
    id: 'Q8048263',
    name: 'Yaletown',
    url: 'https://www.wikidata.org/wiki/Q8048263',
    type: 'district'
  },
  'kitsilano': {
    id: 'Q6417240',
    name: 'Kitsilano',
    url: 'https://www.wikidata.org/wiki/Q6417240',
    type: 'district'
  },
  'west-end': {
    id: 'Q7986725',
    name: 'West End',
    url: 'https://www.wikidata.org/wiki/Q7986725',
    type: 'district'
  }
};

/**
 * Get Wikidata entity for a city slug
 * @param citySlug - City slug (e.g., 'vancouver', 'north-vancouver')
 * @returns Wikidata entity or null if not found
 */
export function getWikidataEntity(citySlug: string): WikidataEntity | null {
  const normalizedSlug = citySlug.toLowerCase().trim();
  
  // Try primary mapping first
  if (WIKIDATA_MAP[normalizedSlug]) {
    return WIKIDATA_MAP[normalizedSlug];
  }
  
  // Try neighborhoods mapping
  if (WIKIDATA_NEIGHBORHOODS[normalizedSlug]) {
    return WIKIDATA_NEIGHBORHOODS[normalizedSlug];
  }
  
  return null;
}

/**
 * Get Wikidata URLs for sameAs property
 * @param citySlug - City slug
 * @returns Array of sameAs URLs including Wikidata and social media
 */
export function getSameAsUrls(citySlug: string): string[] {
  const entity = getWikidataEntity(citySlug);
  const urls = [
    'https://www.facebook.com/travellingtechnicians',
    'https://www.instagram.com/travellingtechnicians',
    'https://www.linkedin.com/company/travelling-technicians'
  ];
  
  if (entity) {
    urls.unshift(entity.url); // Add Wikidata URL first
  }
  
  return urls;
}

/**
 * Get all Wikidata entities for service locations
 * @returns Array of all Wikidata entities
 */
export function getAllWikidataEntities(): WikidataEntity[] {
  return Object.values(WIKIDATA_MAP);
}

/**
 * Get city name from slug with proper capitalization
 * @param citySlug - City slug
 * @returns Properly capitalized city name
 */
export function getCityNameFromSlug(citySlug: string): string {
  const entity = getWikidataEntity(citySlug);
  if (entity) {
    return entity.name;
  }
  
  // Fallback: capitalize each word
  return citySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}