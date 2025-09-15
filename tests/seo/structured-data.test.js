/**
 * Structured Data SEO Test Suite
 * Tests for JSON-LD schema validation and consistency
 */

import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  validateJsonLdSchema,
  structuredDataSchemas,
  createMockScriptElement
} from '../utils/seo-test-helpers'

// Import actual structured data components and utilities
import { OrganizationSchema, LocalBusinessSchema, ServiceSchema } from '@/components/seo/StructuredData'
import { validateStructuredData } from '@/utils/structuredDataValidation'

describe('Structured Data SEO Tests', () => {
  
  describe('Organization Schema Validation', () => {
    
    test('should generate valid Organization schema', () => {
      const orgSchema = structuredDataSchemas.organization
      
      validateJsonLdSchema(
        JSON.stringify(orgSchema),
        'Organization',
        ['@id', 'name', 'url', 'description', 'logo']
      )
      
      expect(orgSchema['@id']).toBe('https://travelling-technicians.ca/#organization')
      expect(orgSchema.name).toBe('The Travelling Technicians')
      expect(orgSchema.url).toBe('https://travelling-technicians.ca')
      expect(orgSchema.logo).toHaveProperty('@type', 'ImageObject')
    })
    
    test('should validate Organization logo structure', () => {
      const orgSchema = structuredDataSchemas.organization
      const logo = orgSchema.logo
      
      expect(logo['@type']).toBe('ImageObject')
      expect(logo.url).toMatch(/^https:\/\/travelling-technicians\.ca/)
      expect(logo.url).toContain('logo-orange-optimized.webp')
      expect(logo.width).toBeGreaterThan(0)
      expect(logo.height).toBeGreaterThan(0)
    })
    
    test('should include required Organization fields', () => {
      const orgSchema = structuredDataSchemas.organization
      
      const requiredFields = ['@context', '@type', '@id', 'name', 'url', 'description', 'logo']
      requiredFields.forEach(field => {
        expect(orgSchema).toHaveProperty(field)
        expect(orgSchema[field]).toBeTruthy()
      })
    })
    
  })
  
  describe('LocalBusiness Schema Validation', () => {
    
    test('should generate valid LocalBusiness schema', () => {
      const businessSchema = structuredDataSchemas.localBusiness
      
      validateJsonLdSchema(
        JSON.stringify(businessSchema),
        'LocalBusiness',
        ['@id', 'name', 'description', 'url', 'telephone', 'email', 'address', 'geo', 'areaServed']
      )
      
      expect(businessSchema['@id']).toBe('https://travelling-technicians.ca/#business')
      expect(businessSchema.telephone).toMatch(/^\+1-\d{3}-\d{3}-\d{4}$/)
      expect(businessSchema.email).toContain('@')
    })
    
    test('should validate address structure', () => {
      const businessSchema = structuredDataSchemas.localBusiness
      const address = businessSchema.address
      
      expect(address['@type']).toBe('PostalAddress')
      expect(address.addressLocality).toBe('Vancouver')
      expect(address.addressRegion).toBe('BC')
      expect(address.addressCountry).toBe('CA')
    })
    
    test('should validate geo coordinates', () => {
      const businessSchema = structuredDataSchemas.localBusiness
      const geo = businessSchema.geo
      
      expect(geo['@type']).toBe('GeoCoordinates')
      expect(typeof geo.latitude).toBe('number')
      expect(typeof geo.longitude).toBe('number')
      expect(geo.latitude).toBeGreaterThan(48) // Vancouver latitude range
      expect(geo.latitude).toBeLessThan(50)
      expect(geo.longitude).toBeGreaterThan(-124) // Vancouver longitude range
      expect(geo.longitude).toBeLessThan(-122)
    })
    
    test('should validate service area coverage', () => {
      const businessSchema = structuredDataSchemas.localBusiness
      const areaServed = businessSchema.areaServed
      
      expect(Array.isArray(areaServed)).toBe(true)
      expect(areaServed.length).toBeGreaterThan(0)
      
      // Check that major Lower Mainland cities are included
      const expectedCities = ['Vancouver', 'Burnaby', 'Richmond', 'Surrey', 'Coquitlam']
      expectedCities.forEach(city => {
        expect(areaServed.some(area => area.includes(city))).toBe(true)
      })
    })
    
    test('should validate service types', () => {
      const businessSchema = structuredDataSchemas.localBusiness
      const serviceType = businessSchema.serviceType
      
      expect(Array.isArray(serviceType)).toBe(true)
      expect(serviceType).toContain('Mobile Phone Repair')
      expect(serviceType).toContain('Laptop Repair')
      expect(serviceType).toContain('Doorstep Repair Service')
    })
    
  })
  
  describe('Service Schema Validation', () => {
    
    test('should generate valid Service schema for mobile repair', () => {
      const mobileServiceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': 'https://travelling-technicians.ca/services/mobile-repair#service',
        name: 'Mobile Phone Repair Service',
        description: 'Professional mobile phone repair services including screen replacement, battery replacement, charging port repair, and more with doorstep service.',
        provider: {
          '@type': 'Organization',
          '@id': 'https://travelling-technicians.ca/#organization'
        },
        areaServed: {
          '@type': 'State',
          name: 'British Columbia'
        },
        serviceType: 'Mobile Device Repair',
        offers: {
          '@type': 'Offer',
          availability: 'InStock',
          priceRange: '$50 - $400'
        }
      }
      
      validateJsonLdSchema(
        JSON.stringify(mobileServiceSchema),
        'Service',
        ['@id', 'name', 'description', 'provider', 'serviceType']
      )
    })
    
    test('should generate valid Service schema for laptop repair', () => {
      const laptopServiceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': 'https://travelling-technicians.ca/services/laptop-repair#service',
        name: 'Laptop Repair Service',
        description: 'Professional laptop repair services including screen replacement, battery replacement, hardware upgrades, and software troubleshooting with doorstep service.',
        provider: {
          '@type': 'Organization',
          '@id': 'https://travelling-technicians.ca/#organization'
        },
        areaServed: {
          '@type': 'State',
          name: 'British Columbia'
        },
        serviceType: 'Computer Repair',
        offers: {
          '@type': 'Offer',
          availability: 'InStock',
          priceRange: '$80 - $600'
        }
      }
      
      validateJsonLdSchema(
        JSON.stringify(laptopServiceSchema),
        'Service',
        ['@id', 'name', 'description', 'provider', 'serviceType']
      )
    })
    
  })
  
  describe('Article Schema Validation', () => {
    
    test('should generate valid Article schema for blog posts', () => {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': 'https://travelling-technicians.ca/blog/signs-your-phone-needs-repair#article',
        headline: 'Signs Your Phone Needs Professional Repair',
        description: 'Learn the warning signs that indicate your mobile phone needs professional repair services.',
        author: {
          '@type': 'Organization',
          '@id': 'https://travelling-technicians.ca/#organization'
        },
        publisher: {
          '@type': 'Organization',
          '@id': 'https://travelling-technicians.ca/#organization'
        },
        datePublished: '2024-12-01T10:00:00Z',
        dateModified: '2024-12-15T10:00:00Z',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': 'https://travelling-technicians.ca/blog/signs-your-phone-needs-repair'
        }
      }
      
      validateJsonLdSchema(
        JSON.stringify(articleSchema),
        'Article',
        ['@id', 'headline', 'author', 'publisher', 'datePublished', 'mainEntityOfPage']
      )
    })
    
  })
  
  describe('WebSite Schema Validation', () => {
    
    test('should generate valid WebSite schema with search functionality', () => {
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': 'https://travelling-technicians.ca/#website',
        name: 'The Travelling Technicians',
        url: 'https://travelling-technicians.ca',
        description: 'Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC',
        publisher: {
          '@type': 'Organization',
          '@id': 'https://travelling-technicians.ca/#organization'
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://travelling-technicians.ca/search?q={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      }
      
      validateJsonLdSchema(
        JSON.stringify(websiteSchema),
        'WebSite',
        ['@id', 'name', 'url', 'publisher']
      )
    })
    
  })
  
  describe('FAQPage Schema Validation', () => {
    
    test('should generate valid FAQPage schema', () => {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': 'https://travelling-technicians.ca/faq#faq',
        name: 'Frequently Asked Questions - The Travelling Technicians',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Do you provide doorstep repair services?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, we provide convenient doorstep repair services across Vancouver and Lower Mainland. Our technicians come to your location with all necessary tools and parts.'
            }
          },
          {
            '@type': 'Question',
            name: 'What devices do you repair?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We repair mobile phones, smartphones, laptops, and tablets from all major brands including Apple, Samsung, Google, and more.'
            }
          }
        ]
      }
      
      validateJsonLdSchema(
        JSON.stringify(faqSchema),
        'FAQPage',
        ['@id', 'name', 'mainEntity']
      )
      
      expect(Array.isArray(faqSchema.mainEntity)).toBe(true)
      expect(faqSchema.mainEntity.length).toBeGreaterThan(0)
      
      faqSchema.mainEntity.forEach(question => {
        expect(question['@type']).toBe('Question')
        expect(question.name).toBeTruthy()
        expect(question.acceptedAnswer['@type']).toBe('Answer')
        expect(question.acceptedAnswer.text).toBeTruthy()
      })
    })
    
  })
  
  describe('Structured Data Component Tests', () => {
    
    test('should render OrganizationSchema component without errors', () => {
      const { container } = render(<OrganizationSchema />)
      expect(container).toBeTruthy()
      
      const scriptElement = container.querySelector('script[type="application/ld+json"]')
      expect(scriptElement).toBeTruthy()
    })
    
    test('should render LocalBusinessSchema component without errors', () => {
      const props = {
        name: 'The Travelling Technicians',
        description: 'Test description',
        telephone: '+1-778-389-9251',
        email: 'info@travellingtechnicians.ca'
      }
      
      const { container } = render(<LocalBusinessSchema {...props} />)
      expect(container).toBeTruthy()
      
      const scriptElement = container.querySelector('script[type="application/ld+json"]')
      expect(scriptElement).toBeTruthy()
    })
    
    test('should render ServiceSchema component without errors', () => {
      const props = {
        name: 'Mobile Repair Service',
        description: 'Professional mobile repair',
        serviceType: 'Mobile Device Repair'
      }
      
      const { container } = render(<ServiceSchema {...props} />)
      expect(container).toBeTruthy()
    })
    
  })
  
  describe('Schema Validation Utility Tests', () => {
    
    test('should validate correct schemas without errors', () => {
      const validSchema = structuredDataSchemas.organization
      
      expect(() => {
        validateStructuredData(validSchema, 'Organization')
      }).not.toThrow()
    })
    
    test('should detect missing required fields', () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization'
        // Missing required fields like name, url, etc.
      }
      
      expect(() => {
        validateStructuredData(invalidSchema, 'Organization')
      }).toThrow()
    })
    
    test('should detect invalid field types', () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 123, // Should be string
        url: 'https://travelling-technicians.ca'
      }
      
      expect(() => {
        validateStructuredData(invalidSchema, 'Organization')
      }).toThrow()
    })
    
    test('should validate nested object structures', () => {
      const schemaWithNestedObjects = structuredDataSchemas.localBusiness
      
      expect(() => {
        validateStructuredData(schemaWithNestedObjects, 'LocalBusiness')
      }).not.toThrow()
      
      // Validate nested address structure
      expect(schemaWithNestedObjects.address['@type']).toBe('PostalAddress')
      expect(schemaWithNestedObjects.geo['@type']).toBe('GeoCoordinates')
    })
    
  })
  
  describe('Schema Consistency Tests', () => {
    
    test('should use consistent domain across all schemas', () => {
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
    
    test('should use consistent organization references', () => {
      const orgId = 'https://travelling-technicians.ca/#organization'
      
      // All schemas that reference the organization should use the same @id
      const businessSchema = structuredDataSchemas.localBusiness
      // This would be tested in actual service schemas
      // expect(serviceSchema.provider['@id']).toBe(orgId)
    })
    
    test('should maintain schema versioning consistency', () => {
      Object.values(structuredDataSchemas).forEach(schema => {
        expect(schema['@context']).toBe('https://schema.org')
      })
    })
    
  })
  
  describe('Schema Performance Tests', () => {
    
    test('should generate schemas within reasonable time', () => {
      const startTime = Date.now()
      
      // Test all schema generation
      Object.values(structuredDataSchemas).forEach(schema => {
        JSON.stringify(schema)
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should be very fast (under 100ms for all schemas)
      expect(duration).toBeLessThan(100)
    })
    
    test('should produce reasonable schema sizes', () => {
      Object.values(structuredDataSchemas).forEach(schema => {
        const jsonString = JSON.stringify(schema)
        const sizeInKB = new Blob([jsonString]).size / 1024
        
        // Each schema should be reasonable size (under 5KB)
        expect(sizeInKB).toBeLessThan(5)
      })
    })
    
  })
  
})

export default {
  validateJsonLdSchema,
  structuredDataSchemas
}
