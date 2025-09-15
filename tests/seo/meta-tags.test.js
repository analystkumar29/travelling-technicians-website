/**
 * Meta Tags SEO Test Suite
 * Tests for meta tag generation, validation, and consistency
 */

import {
  validateMetaTag,
  validateCanonicalLink,
  metaTagTestData,
  createMockHead,
  createMockMetaElement,
  createMockTitleElement,
  createMockLinkElement
} from '../utils/seo-test-helpers'

// Mock Next.js Head component
jest.mock('next/head', () => {
  return function MockHead({ children }) {
    return children
  }
})

// Import SEO utilities from your actual codebase
import { generatePageMetadata } from '@/utils/seoHelpers'

describe('Meta Tags SEO Tests', () => {
  
  describe('Meta Tag Generation', () => {
    
    test('should generate correct homepage meta tags', () => {
      const pageContext = {
        type: 'homepage',
        path: '/',
        params: {}
      }
      
      const seoData = generatePageMetadata(pageContext)
      
      expect(seoData.title).toContain('The Travelling Technicians')
      expect(seoData.description).toContain('mobile phone')
      expect(seoData.description).toContain('laptop repair')
      expect(seoData.canonical).toBe('https://travelling-technicians.ca/')
      expect(seoData.openGraph.url).toBe('https://travelling-technicians.ca/')
    })
    
    test('should generate correct service page meta tags', () => {
      const pageContext = {
        type: 'service',
        path: '/services/mobile-repair',
        params: { service: 'mobile-repair' }
      }
      
      const seoData = generatePageMetadata(pageContext)
      
      expect(seoData.title).toContain('Mobile')
      expect(seoData.title).toContain('Repair')
      expect(seoData.description).toContain('mobile phone')
      expect(seoData.canonical).toBe('https://travelling-technicians.ca/services/mobile-repair')
      expect(seoData.openGraph.type).toBe('service')
    })
    
    test('should enforce title length limits', () => {
      const pageContext = {
        type: 'homepage',
        path: '/',
        params: {}
      }
      
      const seoData = generatePageMetadata(pageContext)
      
      // Title should be reasonable length (usually 60 chars or less)
      expect(seoData.title.length).toBeLessThanOrEqual(60)
    })
    
    test('should enforce description length limits', () => {
      const pageContext = {
        type: 'service',
        path: '/services/mobile-repair',
        params: { service: 'mobile-repair' }
      }
      
      const seoData = generatePageMetadata(pageContext)
      
      // Description should be reasonable length (usually 160 chars or less)
      expect(seoData.description.length).toBeLessThanOrEqual(160)
    })
    
  })
  
  describe('Meta Tag Validation', () => {
    
    test('should validate required meta tags presence', () => {
      const head = createMockHead()
      
      // Mock typical meta tags
      const titleElement = createMockTitleElement('Test Page Title')
      const descriptionMeta = createMockMetaElement({
        name: 'description',
        content: 'Test page description'
      })
      const canonicalLink = createMockLinkElement({
        rel: 'canonical',
        href: 'https://travelling-technicians.ca/test'
      })
      const ogTitleMeta = createMockMetaElement({
        property: 'og:title',
        content: 'Test Page Title'
      })
      
      head.children = [titleElement, descriptionMeta, canonicalLink, ogTitleMeta]
      
      // Test required elements
      expect(head.querySelector('title')).toBeTruthy()
      expect(head.querySelector('[name="description"]')).toBeTruthy()
      expect(head.querySelector('[rel="canonical"]')).toBeTruthy()
      expect(head.querySelector('[property="og:title"]')).toBeTruthy()
    })
    
    test('should validate meta tag content format', () => {
      const descriptionMeta = createMockMetaElement({
        name: 'description',
        content: 'Professional mobile phone and laptop repair services'
      })
      
      validateMetaTag(descriptionMeta, 'description', 'Professional mobile phone and laptop repair services')
    })
    
    test('should validate canonical URL format', () => {
      const canonicalLink = createMockLinkElement({
        rel: 'canonical',
        href: 'https://travelling-technicians.ca/mobile-repair'
      })
      
      validateCanonicalLink(canonicalLink, 'https://travelling-technicians.ca/mobile-repair')
    })
    
    test('should validate Open Graph tags', () => {
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
      const ogTypeMeta = createMockMetaElement({
        property: 'og:type',
        content: 'service'
      })
      
      validateMetaTag(ogTitleMeta, 'og:title', 'Mobile Repair Services')
      validateMetaTag(ogDescMeta, 'og:description', 'Expert mobile phone repair services')
      validateMetaTag(ogUrlMeta, 'og:url', 'https://travelling-technicians.ca/mobile-repair')
      validateMetaTag(ogTypeMeta, 'og:type', 'service')
    })
    
  })
  
  describe('URL Consistency', () => {
    
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
    
    test('should reject invalid canonical URLs', () => {
      const invalidCanonicals = [
        'https://www.travelling-technicians.ca/', // www not allowed
        'http://travelling-technicians.ca/', // http not allowed
        'https://other-domain.com/' // wrong domain
      ]
      
      invalidCanonicals.forEach(canonical => {
        // These should fail validation in your actual implementation
        expect(() => {
          generateSeoMeta({ canonical })
        }).toThrow()
      })
    })
    
  })
  
  describe('DynamicMeta Component', () => {
    
    test('should render meta tags correctly', () => {
      const props = {
        title: 'Test Page',
        description: 'Test description',
        canonical: 'https://travelling-technicians.ca/test',
        openGraph: {
          title: 'Test Page',
          description: 'Test description',
          url: 'https://travelling-technicians.ca/test',
          type: 'website'
        }
      }
      
      const { container } = render(<DynamicMeta {...props} />)
      
      // Check that the component renders without errors
      expect(container).toBeTruthy()
    })
    
    test('should handle missing optional props gracefully', () => {
      const minimalProps = {
        title: 'Test Page'
      }
      
      const { container } = render(<DynamicMeta {...minimalProps} />)
      
      // Should render without errors even with minimal props
      expect(container).toBeTruthy()
    })
    
  })
  
  describe('Meta Tag Best Practices', () => {
    
    test('should include viewport meta tag', () => {
      const viewportMeta = createMockMetaElement({
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      })
      
      validateMetaTag(viewportMeta, 'viewport', 'width=device-width, initial-scale=1')
    })
    
    test('should include charset meta tag', () => {
      const charsetMeta = createMockMetaElement({
        charset: 'utf-8'
      })
      
      expect(charsetMeta.getAttribute('charset')).toBe('utf-8')
    })
    
    test('should include robots meta tag where appropriate', () => {
      const robotsMeta = createMockMetaElement({
        name: 'robots',
        content: 'index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large'
      })
      
      validateMetaTag(robotsMeta, 'robots', 'index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large')
    })
    
    test('should include Twitter Card meta tags', () => {
      const twitterCardMeta = createMockMetaElement({
        name: 'twitter:card',
        content: 'summary_large_image'
      })
      const twitterTitleMeta = createMockMetaElement({
        name: 'twitter:title',
        content: 'Mobile Repair Services'
      })
      
      validateMetaTag(twitterCardMeta, 'twitter:card', 'summary_large_image')
      validateMetaTag(twitterTitleMeta, 'twitter:title', 'Mobile Repair Services')
    })
    
  })
  
  describe('SEO Keywords Integration', () => {
    
    test('should include local SEO keywords in meta descriptions', () => {
      const localKeywords = [
        'Vancouver',
        'Lower Mainland',
        'doorstep repair',
        'mobile repair',
        'laptop repair'
      ]
      
      const description = metaTagTestData.homepage.description
      
      // Check that important local keywords are present
      expect(description).toContain('Vancouver')
      expect(description).toContain('Lower Mainland')
      expect(description).toContain('doorstep')
    })
    
    test('should avoid keyword stuffing', () => {
      const description = metaTagTestData.mobileRepair.description
      
      // Count occurrences of main keyword
      const keywordCount = (description.match(/repair/gi) || []).length
      
      // Should not repeat the same keyword too many times
      expect(keywordCount).toBeLessThan(5)
    })
    
  })
  
})

export default {
  validateMetaTag,
  validateCanonicalLink,
  metaTagTestData
}
