/**
 * SEO Test Utilities
 * Common helpers for testing SEO implementations
 */

// Mock DOM head for testing meta tags
export const createMockHead = () => {
  const head = {
    children: [],
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  }
  
  head.querySelector.mockImplementation((selector) => {
    return head.children.find(child => 
      child.matches && child.matches(selector)
    ) || null
  })
  
  head.querySelectorAll.mockImplementation((selector) => {
    return head.children.filter(child => 
      child.matches && child.matches(selector)
    )
  })
  
  return head
}

// Create mock meta element
export const createMockMetaElement = (attributes = {}) => ({
  tagName: 'META',
  getAttribute: jest.fn((attr) => attributes[attr] || null),
  setAttribute: jest.fn(),
  matches: jest.fn((selector) => {
    // Simple selector matching for tests
    if (selector.includes('[property=')) {
      const property = selector.match(/\[property="([^"]+)"\]/)?.[1]
      return attributes.property === property
    }
    if (selector.includes('[name=')) {
      const name = selector.match(/\[name="([^"]+)"\]/)?.[1]
      return attributes.name === name
    }
    return selector === 'meta'
  }),
  ...attributes
})

// Create mock title element
export const createMockTitleElement = (text = '') => ({
  tagName: 'TITLE',
  textContent: text,
  innerText: text,
  matches: jest.fn((selector) => selector === 'title')
})

// Create mock link element
export const createMockLinkElement = (attributes = {}) => ({
  tagName: 'LINK',
  getAttribute: jest.fn((attr) => attributes[attr] || null),
  setAttribute: jest.fn(),
  matches: jest.fn((selector) => {
    if (selector.includes('[rel=')) {
      const rel = selector.match(/\[rel="([^"]+)"\]/)?.[1]
      return attributes.rel === rel
    }
    return selector === 'link'
  }),
  ...attributes
})

// Create mock script element for JSON-LD
export const createMockScriptElement = (content = '', type = 'application/ld+json') => ({
  tagName: 'SCRIPT',
  type,
  textContent: content,
  innerHTML: content,
  getAttribute: jest.fn((attr) => {
    if (attr === 'type') return type
    return null
  }),
  matches: jest.fn((selector) => {
    if (selector.includes('[type=')) {
      const typeMatch = selector.match(/\[type="([^"]+)"\]/)?.[1]
      return type === typeMatch
    }
    return selector === 'script'
  })
})

// Validate meta tag structure
export const validateMetaTag = (element, expectedProperty, expectedContent) => {
  expect(element).toBeTruthy()
  expect(element.getAttribute('property') || element.getAttribute('name')).toBe(expectedProperty)
  expect(element.getAttribute('content')).toBe(expectedContent)
}

// Validate canonical link
export const validateCanonicalLink = (element, expectedHref) => {
  expect(element).toBeTruthy()
  expect(element.getAttribute('rel')).toBe('canonical')
  expect(element.getAttribute('href')).toBe(expectedHref)
}

// Validate JSON-LD schema
export const validateJsonLdSchema = (jsonString, expectedType, requiredFields = []) => {
  let schema
  try {
    schema = JSON.parse(jsonString)
  } catch (error) {
    throw new Error(`Invalid JSON-LD: ${error.message}`)
  }
  
  expect(schema['@context']).toBe('https://schema.org')
  expect(schema['@type']).toBe(expectedType)
  
  requiredFields.forEach(field => {
    expect(schema).toHaveProperty(field)
    expect(schema[field]).toBeTruthy()
  })
  
  return schema
}

// Common meta tag test data
export const metaTagTestData = {
  homepage: {
    title: 'Mobile & Laptop Repair Service | The Travelling Technicians',
    description: 'Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC. Expert technicians, same-day service.',
    canonical: 'https://travelling-technicians.ca/',
    ogTitle: 'Mobile & Laptop Repair Service | The Travelling Technicians',
    ogDescription: 'Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC.',
    ogUrl: 'https://travelling-technicians.ca/',
    ogType: 'website'
  },
  mobileRepair: {
    title: 'Mobile Phone Repair Services | The Travelling Technicians',
    description: 'Expert mobile phone repair services including screen replacement, battery replacement. Doorstep service across Vancouver and Lower Mainland.',
    canonical: 'https://travelling-technicians.ca/services/mobile-repair',
    ogTitle: 'Mobile Phone Repair Services | The Travelling Technicians',
    ogDescription: 'Expert mobile phone repair services with doorstep service across Vancouver and Lower Mainland.',
    ogUrl: 'https://travelling-technicians.ca/services/mobile-repair',
    ogType: 'service'
  },
  laptopRepair: {
    title: 'Laptop Repair Services | The Travelling Technicians',
    description: 'Professional laptop repair services including screen replacement, battery replacement, hardware upgrades. Doorstep service across Vancouver.',
    canonical: 'https://travelling-technicians.ca/services/laptop-repair',
    ogTitle: 'Laptop Repair Services | The Travelling Technicians', 
    ogDescription: 'Professional laptop repair services with doorstep service across Vancouver and Lower Mainland.',
    ogUrl: 'https://travelling-technicians.ca/services/laptop-repair',
    ogType: 'service'
  }
}

// Common structured data test schemas
export const structuredDataSchemas = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://travelling-technicians.ca/#organization',
    name: 'The Travelling Technicians',
    url: 'https://travelling-technicians.ca',
    description: 'Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC',
    logo: {
      '@type': 'ImageObject',
      url: 'https://travelling-technicians.ca/images/logo/logo-orange-optimized.webp',
      width: 300,
      height: 60
    }
  },
  localBusiness: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://travelling-technicians.ca/#business',
    name: 'The Travelling Technicians',
    description: 'Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC',
    url: 'https://travelling-technicians.ca',
    telephone: '+1-778-389-9251',
    email: 'info@travellingtechnicians.ca',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Vancouver',
      addressRegion: 'BC',
      addressCountry: 'CA'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 49.2827,
      longitude: -123.1207
    },
    areaServed: [
      'Vancouver, BC',
      'Burnaby, BC', 
      'Richmond, BC',
      'Surrey, BC',
      'Coquitlam, BC'
    ],
    serviceType: ['Mobile Phone Repair', 'Laptop Repair', 'Doorstep Repair Service']
  }
}

// Mock sitemap URL data
export const sitemapTestData = {
  expectedUrls: [
    'https://travelling-technicians.ca/',
    'https://travelling-technicians.ca/book-online',
    'https://travelling-technicians.ca/doorstep-repair',
    'https://travelling-technicians.ca/mobile-screen-repair',
    'https://travelling-technicians.ca/laptop-screen-repair',
    'https://travelling-technicians.ca/mobile-repair-near-me',
    'https://travelling-technicians.ca/services/mobile-repair',
    'https://travelling-technicians.ca/services/laptop-repair',
    'https://travelling-technicians.ca/repair/vancouver',
    'https://travelling-technicians.ca/repair/burnaby',
    'https://travelling-technicians.ca/repair/richmond',
    'https://travelling-technicians.ca/about',
    'https://travelling-technicians.ca/contact',
    'https://travelling-technicians.ca/service-areas',
    'https://travelling-technicians.ca/blog',
    'https://travelling-technicians.ca/privacy-policy',
    'https://travelling-technicians.ca/terms-conditions'
  ],
  excludedUrls: [
    'https://www.travelling-technicians.ca/', // Should not have www
    'https://travelling-technicians.ca/service-areas/vancouver', // Redirects
    'https://travelling-technicians.ca/api/', // Should be excluded
    'https://travelling-technicians.ca/management/', // Should be excluded
  ],
  priorityRules: {
    'https://travelling-technicians.ca/': '1.0',
    'https://travelling-technicians.ca/book-online': '0.95',
    'https://travelling-technicians.ca/doorstep-repair': '0.9',
    'https://travelling-technicians.ca/services/mobile-repair': '0.9',
    'https://travelling-technicians.ca/about': '0.8',
    'https://travelling-technicians.ca/blog': '0.8',
    'https://travelling-technicians.ca/privacy-policy': '0.3'
  }
}

// Helper to parse XML sitemap for testing
export const parseSitemapXml = (xmlString) => {
  const urls = []
  const urlRegex = /<url>(.*?)<\/url>/gs
  const locRegex = /<loc>(.*?)<\/loc>/
  const priorityRegex = /<priority>(.*?)<\/priority>/
  const changefreqRegex = /<changefreq>(.*?)<\/changefreq>/
  const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/
  
  let match
  while ((match = urlRegex.exec(xmlString)) !== null) {
    const urlBlock = match[1]
    
    const locMatch = locRegex.exec(urlBlock)
    const priorityMatch = priorityRegex.exec(urlBlock)
    const changefreqMatch = changefreqRegex.exec(urlBlock)
    const lastmodMatch = lastmodRegex.exec(urlBlock)
    
    if (locMatch) {
      urls.push({
        loc: locMatch[1],
        priority: priorityMatch?.[1] || null,
        changefreq: changefreqMatch?.[1] || null,
        lastmod: lastmodMatch?.[1] || null
      })
    }
  }
  
  return urls
}

export default {
  createMockHead,
  createMockMetaElement,
  createMockTitleElement,
  createMockLinkElement,
  createMockScriptElement,
  validateMetaTag,
  validateCanonicalLink,
  validateJsonLdSchema,
  metaTagTestData,
  structuredDataSchemas,
  sitemapTestData,
  parseSitemapXml
}
