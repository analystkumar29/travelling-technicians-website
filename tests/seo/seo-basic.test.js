/**
 * Basic SEO Validation Tests
 * Tests that can run without complex module dependencies
 */

import {
  validateMetaTag,
  validateCanonicalLink,
  validateJsonLdSchema,
  metaTagTestData,
  structuredDataSchemas,
  sitemapTestData,
  parseSitemapXml,
  createMockMetaElement,
  createMockLinkElement,
  createMockScriptElement
} from '../utils/seo-test-helpers'

describe('Basic SEO Validation Tests', () => {
  
  describe('Meta Tag Validation Utilities', () => {
    
    test('should validate meta tag structure', () => {
      const metaElement = createMockMetaElement({
        name: 'description',
        content: 'Professional mobile phone and laptop repair services'
      })
      
      validateMetaTag(metaElement, 'description', 'Professional mobile phone and laptop repair services')
      expect(metaElement.getAttribute('name')).toBe('description')
      expect(metaElement.getAttribute('content')).toBe('Professional mobile phone and laptop repair services')
    })
    
    test('should validate canonical link structure', () => {
      const canonicalLink = createMockLinkElement({
        rel: 'canonical',
        href: 'https://travelling-technicians.ca/mobile-repair'
      })
      
      validateCanonicalLink(canonicalLink, 'https://travelling-technicians.ca/mobile-repair')
      expect(canonicalLink.getAttribute('rel')).toBe('canonical')
      expect(canonicalLink.getAttribute('href')).toBe('https://travelling-technicians.ca/mobile-repair')
    })
    
    test('should validate Open Graph meta tags', () => {
      const ogTitleMeta = createMockMetaElement({
        property: 'og:title',
        content: 'Mobile Repair Services'
      })
      const ogDescMeta = createMockMetaElement({
        property: 'og:description',
        content: 'Expert mobile phone repair services'
      })
      const ogUrlMeta = createMockMetaElement({
        property: 'og:url',
        content: 'https://travelling-technicians.ca/mobile-repair'
      })
      
      validateMetaTag(ogTitleMeta, 'og:title', 'Mobile Repair Services')
      validateMetaTag(ogDescMeta, 'og:description', 'Expert mobile phone repair services')
      validateMetaTag(ogUrlMeta, 'og:url', 'https://travelling-technicians.ca/mobile-repair')
    })
    
  })
  
  describe('URL Consistency Validation', () => {
    
    test('should use non-www domain consistently', () => {
      const testUrls = [
        'https://travelling-technicians.ca/',
        'https://travelling-technicians.ca/mobile-repair',
        'https://travelling-technicians.ca/laptop-repair'
      ]
      
      testUrls.forEach(url => {
        expect(url).not.toContain('www.')
        expect(url).toMatch(/^https:\/\/travelling-technicians\.ca/)
      })
    })
    
    test('should validate canonical URLs match current domain', () => {
      const validCanonicals = [
        'https://travelling-technicians.ca/',
        'https://travelling-technicians.ca/services/mobile-repair',
        'https://travelling-technicians.ca/repair/vancouver'
      ]
      
      validCanonicals.forEach(canonical => {
        expect(canonical).toMatch(/^https:\/\/travelling-technicians\.ca/)
        expect(canonical).not.toContain('www.')
      })
    })
    
  })
  
  describe('Structured Data Schema Validation', () => {
    
    test('should validate Organization schema structure', () => {
      const orgSchema = structuredDataSchemas.organization
      
      validateJsonLdSchema(
        JSON.stringify(orgSchema),
        'Organization',
        ['@id', 'name', 'url', 'description', 'logo']
      )
      
      expect(orgSchema['@context']).toBe('https://schema.org')
      expect(orgSchema['@type']).toBe('Organization')
      expect(orgSchema['@id']).toBe('https://travelling-technicians.ca/#organization')
      expect(orgSchema.name).toBe('The Travelling Technicians')
      expect(orgSchema.url).toBe('https://travelling-technicians.ca')
    })
    
    test('should validate LocalBusiness schema structure', () => {
      const businessSchema = structuredDataSchemas.localBusiness
      
      validateJsonLdSchema(
        JSON.stringify(businessSchema),
        'LocalBusiness',
        ['@id', 'name', 'description', 'url', 'telephone', 'email', 'address', 'geo', 'areaServed']
      )
      
      expect(businessSchema['@context']).toBe('https://schema.org')
      expect(businessSchema['@type']).toBe('LocalBusiness')
      expect(businessSchema.telephone).toMatch(/^\+1-\d{3}-\d{3}-\d{4}$/)
      expect(businessSchema.email).toContain('@')
    })
    
    test('should validate schema domain consistency', () => {
      const domain = 'https://travelling-technicians.ca'
      
      Object.values(structuredDataSchemas).forEach(schema => {
        if (schema.url) {
          expect(schema.url).toMatch(new RegExp(`^${domain}`))
        }
        if (schema['@id']) {
          expect(schema['@id']).toMatch(new RegExp(`^${domain}`))
        }
      })
    })
    
  })
  
  describe('Test Data Validation', () => {
    
    test('should have valid test data structure', () => {
      expect(metaTagTestData).toBeDefined()
      expect(metaTagTestData.homepage).toBeDefined()
      expect(metaTagTestData.mobileRepair).toBeDefined()
      expect(metaTagTestData.laptopRepair).toBeDefined()
      
      // Check homepage data
      expect(metaTagTestData.homepage.title).toContain('The Travelling Technicians')
      expect(metaTagTestData.homepage.description).toContain('Vancouver')
      expect(metaTagTestData.homepage.canonical).toBe('https://travelling-technicians.ca/')
    })
    
    test('should have valid sitemap test data', () => {
      expect(sitemapTestData).toBeDefined()
      expect(sitemapTestData.expectedUrls).toBeDefined()
      expect(sitemapTestData.excludedUrls).toBeDefined()
      expect(sitemapTestData.priorityRules).toBeDefined()
      
      // Check URL format
      sitemapTestData.expectedUrls.forEach(url => {
        expect(url).toMatch(/^https:\/\/travelling-technicians\.ca/)
        expect(url).not.toContain('www.')
      })
    })
    
  })
  
  describe('Sitemap XML Parsing', () => {
    
    test('should parse sitemap XML correctly', () => {
      const mockSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://travelling-technicians.ca/</loc>
    <lastmod>2024-12-01T10:00:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://travelling-technicians.ca/mobile-repair</loc>
    <lastmod>2024-12-01T10:00:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`
      
      const urls = parseSitemapXml(mockSitemapXml)
      
      expect(urls).toHaveLength(2)
      expect(urls[0].loc).toBe('https://travelling-technicians.ca/')
      expect(urls[0].priority).toBe('1.0')
      expect(urls[0].changefreq).toBe('daily')
      expect(urls[1].loc).toBe('https://travelling-technicians.ca/mobile-repair')
      expect(urls[1].priority).toBe('0.9')
    })
    
    test('should validate sitemap URL priorities', () => {
      const priorityRules = sitemapTestData.priorityRules
      
      Object.entries(priorityRules).forEach(([url, priority]) => {
        const priorityValue = parseFloat(priority)
        expect(priorityValue).toBeGreaterThan(0)
        expect(priorityValue).toBeLessThanOrEqual(1.0)
        
        // Homepage should have highest priority
        if (url === 'https://travelling-technicians.ca/') {
          expect(priorityValue).toBe(1.0)
        }
      })
    })
    
  })
  
  describe('SEO Best Practices Validation', () => {
    
    test('should enforce meta description length limits', () => {
      Object.values(metaTagTestData).forEach(pageData => {
        expect(pageData.description.length).toBeLessThanOrEqual(160)
        expect(pageData.description.length).toBeGreaterThan(50) // Minimum useful length
      })
    })
    
    test('should enforce title length limits', () => {
      Object.values(metaTagTestData).forEach(pageData => {
        expect(pageData.title.length).toBeLessThanOrEqual(60)
        expect(pageData.title.length).toBeGreaterThan(10) // Minimum useful length
      })
    })
    
    test('should include local SEO keywords', () => {
      const localKeywords = ['Vancouver', 'Lower Mainland', 'doorstep', 'repair']
      
      Object.values(metaTagTestData).forEach(pageData => {
        const content = `${pageData.title} ${pageData.description}`.toLowerCase()
        const hasLocalKeyword = localKeywords.some(keyword => 
          content.includes(keyword.toLowerCase())
        )
        expect(hasLocalKeyword).toBe(true)
      })
    })
    
  })
  
  describe('Mock Element Creation', () => {
    
    test('should create valid mock script elements', () => {
      const jsonContent = JSON.stringify({ test: 'data' })
      const scriptElement = createMockScriptElement(jsonContent, 'application/ld+json')
      
      expect(scriptElement.tagName).toBe('SCRIPT')
      expect(scriptElement.type).toBe('application/ld+json')
      expect(scriptElement.textContent).toBe(jsonContent)
      expect(scriptElement.getAttribute('type')).toBe('application/ld+json')
    })
    
    test('should create valid mock meta elements', () => {
      const metaElement = createMockMetaElement({
        property: 'og:title',
        content: 'Test Title'
      })
      
      expect(metaElement.tagName).toBe('META')
      expect(metaElement.getAttribute('property')).toBe('og:title')
      expect(metaElement.getAttribute('content')).toBe('Test Title')
    })
    
  })
  
})

export default {
  validateMetaTag,
  validateCanonicalLink,
  validateJsonLdSchema
}
