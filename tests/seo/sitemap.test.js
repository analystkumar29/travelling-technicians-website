/**
 * Sitemap SEO Test Suite
 * Tests for sitemap generation, validation, and consistency
 */

import { createRequest, createResponse } from 'node-mocks-http'
import {
  sitemapTestData,
  parseSitemapXml
} from '../utils/seo-test-helpers'

// Import sitemap handler
import sitemapHandler from '@/pages/api/sitemap.xml'

// Mock Supabase for testing
jest.mock('@/utils/supabaseClient', () => ({
  getServiceSupabase: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              { city: 'Vancouver', updated_at: '2024-12-01T10:00:00Z' },
              { city: 'Burnaby', updated_at: '2024-12-01T10:00:00Z' },
              { city: 'Richmond', updated_at: '2024-12-01T10:00:00Z' },
              { city: 'North Vancouver', updated_at: '2024-12-01T10:00:00Z' },
              { city: 'New Westminster', updated_at: '2024-12-01T10:00:00Z' },
              { city: 'Coquitlam', updated_at: '2024-12-01T10:00:00Z' },
              { city: 'West Vancouver', updated_at: '2024-12-01T10:00:00Z' },
              { city: 'Chilliwack', updated_at: '2024-12-01T10:00:00Z' }
            ]
          }))
        }))
      }))
    }))
  })),
  getSiteUrl: jest.fn(() => 'https://travelling-technicians.ca')
}))

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    createModuleLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    }))
  }
}))

describe('Sitemap SEO Tests', () => {
  
  describe('Sitemap Generation', () => {
    
    test('should generate valid XML sitemap', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      expect(res._getStatusCode()).toBe(200)
      
      const sitemapXml = res._getData()
      expect(sitemapXml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(sitemapXml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
      expect(sitemapXml).toContain('</urlset>')
    })
    
    test('should set correct content type headers', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      expect(res.getHeader('Content-Type')).toBe('text/xml; charset=utf-8')
      expect(res.getHeader('Cache-Control')).toContain('public')
      expect(res.getHeader('Cache-Control')).toContain('s-maxage')
    })
    
    test('should include all required URLs', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      const urlLocs = urls.map(url => url.loc)
      
      // Check for required high-priority URLs
      expect(urlLocs).toContain('https://travelling-technicians.ca/')
      expect(urlLocs).toContain('https://travelling-technicians.ca/book-online')
      expect(urlLocs).toContain('https://travelling-technicians.ca/repair')
      expect(urlLocs).toContain('https://travelling-technicians.ca/about')
      expect(urlLocs).toContain('https://travelling-technicians.ca/contact')
    })
    
    test('should include service area pages', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      const urlLocs = urls.map(url => url.loc)
      
      // Check for city repair pages
      expect(urlLocs).toContain('https://travelling-technicians.ca/repair/vancouver')
      expect(urlLocs).toContain('https://travelling-technicians.ca/repair/burnaby')
      expect(urlLocs).toContain('https://travelling-technicians.ca/repair/richmond')
      expect(urlLocs).toContain('https://travelling-technicians.ca/service-areas')
    })
    
    test('should include blog pages', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      const urlLocs = urls.map(url => url.loc)
      
      // Check for blog index page
      expect(urlLocs).toContain('https://travelling-technicians.ca/blog')
    })
    
  })
  
  describe('URL Format Validation', () => {
    
    test('should use non-www domain consistently', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      
      urls.forEach(url => {
        expect(url.loc).toMatch(/^https:\/\/travelling-technicians\.ca/)
        expect(url.loc).not.toContain('www.')
      })
    })
    
    test('should use HTTPS for all URLs', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      
      urls.forEach(url => {
        expect(url.loc).toMatch(/^https:\/\//)
        expect(url.loc).not.toMatch(/^http:\/\//)
      })
    })
    
    test('should not include redirect URLs', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      const urlLocs = urls.map(url => url.loc)
      
      // These URLs redirect and should NOT be in sitemap
      expect(urlLocs).not.toContain('https://travelling-technicians.ca/service-areas/vancouver')
      expect(urlLocs).not.toContain('https://travelling-technicians.ca/service-areas/richmond')
      expect(urlLocs).not.toContain('https://travelling-technicians.ca/service-areas/new-westminster')
    })
    
    test('should not include admin or API URLs', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      const urlLocs = urls.map(url => url.loc)
      
      // These should NOT be in sitemap
      const forbiddenPatterns = [
        '/api/',
        '/management/',
        '/admin/',
        '/login',
        '/debug'
      ]
      
      forbiddenPatterns.forEach(pattern => {
        expect(urlLocs.some(url => url.includes(pattern))).toBe(false)
      })
    })
    
  })
  
  describe('Priority Validation', () => {
    
    test('should assign correct priority values', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      
      const urlsByPriority = {}
      urls.forEach(url => {
        if (url.priority) {
          if (!urlsByPriority[url.priority]) {
            urlsByPriority[url.priority] = []
          }
          urlsByPriority[url.priority].push(url.loc)
        }
      })
      
      // Homepage should have highest priority
      expect(urlsByPriority['1.0']).toContain('https://travelling-technicians.ca/')
      
      // Booking should have very high priority
      expect(urlsByPriority['0.95']).toContain('https://travelling-technicians.ca/book-online')
      
      // Core services should have high priority
      expect(urlsByPriority['0.9']).toContain('https://travelling-technicians.ca/repair')
      
      // Legal pages should have low priority
      if (urlsByPriority['0.3']) {
        expect(urlsByPriority['0.3']).toContain('https://travelling-technicians.ca/privacy-policy')
      }
    })
    
    test('should not exceed priority of 1.0', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      
      urls.forEach(url => {
        if (url.priority) {
          const priority = parseFloat(url.priority)
          expect(priority).toBeLessThanOrEqual(1.0)
          expect(priority).toBeGreaterThan(0)
        }
      })
    })
    
  })
  
  describe('Change Frequency Validation', () => {
    
    test('should use valid changefreq values', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      
      const validChangefreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
      
      urls.forEach(url => {
        if (url.changefreq) {
          expect(validChangefreqs).toContain(url.changefreq)
        }
      })
    })
    
    test('should assign appropriate changefreq for different page types', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      
      urls.forEach(url => {
        if (url.loc.includes('/blog/')) {
          // Blog posts should change monthly
          expect(url.changefreq).toBe('monthly')
        } else if (url.loc.includes('/privacy-policy') || url.loc.includes('/terms-conditions')) {
          // Legal pages should change yearly
          expect(url.changefreq).toBe('yearly')
        } else if (url.loc === 'https://travelling-technicians.ca/') {
          // Homepage should change daily
          expect(url.changefreq).toBe('daily')
        }
      })
    })
    
  })
  
  describe('Last Modified Validation', () => {
    
    test('should include valid lastmod dates', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      
      urls.forEach(url => {
        if (url.lastmod) {
          // Should be valid ISO date
          expect(() => new Date(url.lastmod)).not.toThrow()
          expect(new Date(url.lastmod).toString()).not.toBe('Invalid Date')
        }
      })
    })
    
    test('should use recent dates for dynamic content', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      
      urls.forEach(url => {
        if (url.lastmod) {
          const lastmodDate = new Date(url.lastmod)
          // All dates should be within the last year (reasonable for active site)
          expect(lastmodDate.getTime()).toBeGreaterThan(oneYearAgo.getTime())
          expect(lastmodDate.getTime()).toBeLessThanOrEqual(now.getTime())
        }
      })
    })
    
  })
  
  describe('Sitemap Performance', () => {
    
    test('should generate sitemap within reasonable time', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      const startTime = Date.now()
      await sitemapHandler(req, res)
      const endTime = Date.now()
      
      const duration = endTime - startTime
      
      // Should generate within 5 seconds
      expect(duration).toBeLessThan(5000)
    })
    
    test('should produce reasonable sitemap size', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const sizeInKB = new Blob([sitemapXml]).size / 1024
      
      // Should be reasonable size (under 1MB, typically much smaller)
      expect(sizeInKB).toBeLessThan(1024)
      expect(sizeInKB).toBeGreaterThan(1) // Should have content
    })
    
  })
  
  describe('Static Sitemap Validation', () => {
    
    test('should validate static sitemap structure', () => {
      // This would read the actual static sitemap file
      const fs = require('fs')
      const path = require('path')
      
      const staticSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
      
      if (fs.existsSync(staticSitemapPath)) {
        const staticSitemapContent = fs.readFileSync(staticSitemapPath, 'utf8')
        const urls = parseSitemapXml(staticSitemapContent)
        
        // Should use non-www domain
        urls.forEach(url => {
          expect(url.loc).toMatch(/^https:\/\/travelling-technicians\.ca/)
          expect(url.loc).not.toContain('www.')
        })
        
        // Should not include redirect URLs
        const urlLocs = urls.map(url => url.loc)
        expect(urlLocs).not.toContain('https://travelling-technicians.ca/service-areas/vancouver')
      }
    })
    
  })
  
  describe('Robots.txt Integration', () => {
    
    test('should validate robots.txt sitemap references', () => {
      const fs = require('fs')
      const path = require('path')
      
      const robotsPath = path.join(process.cwd(), 'public', 'robots.txt')
      
      if (fs.existsSync(robotsPath)) {
        const robotsContent = fs.readFileSync(robotsPath, 'utf8')
        
        // Should reference the domain
        expect(robotsContent).toContain('travelling-technicians.ca')

        // Should reference sitemap files
        expect(robotsContent).toContain('/api/sitemap.xml')
        expect(robotsContent).toContain('/sitemap.xml')
      }
    })
    
  })
  
  describe('URL Coverage Analysis', () => {
    
    test('should include all important landing pages', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      const urlLocs = urls.map(url => url.loc)
      
      const importantPages = [
        'https://travelling-technicians.ca/',
        'https://travelling-technicians.ca/book-online',
        'https://travelling-technicians.ca/repair',
        'https://travelling-technicians.ca/about',
        'https://travelling-technicians.ca/contact',
        'https://travelling-technicians.ca/pricing',
        'https://travelling-technicians.ca/faq',
        'https://travelling-technicians.ca/blog',
        'https://travelling-technicians.ca/privacy-policy',
        'https://travelling-technicians.ca/terms-conditions'
      ]
      
      importantPages.forEach(page => {
        expect(urlLocs).toContain(page)
      })
    })
    
    test('should not exceed reasonable URL count', async () => {
      const req = createRequest({
        method: 'GET',
        url: '/api/sitemap.xml'
      })
      const res = createResponse()
      
      await sitemapHandler(req, res)
      
      const sitemapXml = res._getData()
      const urls = parseSitemapXml(sitemapXml)
      
      // Should have reasonable number of URLs (not empty, not too many)
      expect(urls.length).toBeGreaterThan(10)
      expect(urls.length).toBeLessThan(1000) // Adjust based on your site size
    })
    
  })
  
})

export default {
  parseSitemapXml,
  sitemapTestData
}
