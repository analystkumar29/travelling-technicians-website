# SEO Master Reference Guide - Travelling Technicians Website

## Document Purpose
This comprehensive guide documents all SEO issues encountered, fixes implemented, and troubleshooting procedures for the Travelling Technicians website. Use this as a reference for future Google Search Console errors and SEO optimization.

---

## Table of Contents
1. [Site Overview](#site-overview)
2. [SEO Issues Resolved](#seo-issues-resolved)
3. [Technical Implementation Details](#technical-implementation-details)
4. [Files Modified](#files-modified)
5. [Testing Procedures](#testing-procedures)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Monitoring Checklist](#monitoring-checklist)

---

## Site Overview

### Core Information
- **Primary Domain:** `https://www.travelling-technicians.ca` (canonical)
- **Secondary Domain:** `https://travelling-technicians.ca` (redirects to primary)
- **Technology Stack:** Next.js, Vercel hosting, Supabase database
- **SEO Strategy:** Local SEO focus on Lower Mainland, BC

### Canonical URL Strategy
- **Decision:** Use www domain as canonical (Updated July 2, 2025)
- **Reasoning:** Resolved redirect loop conflicts, maintains site accessibility
- **Implementation:** All pages use `https://www.travelling-technicians.ca` in canonical tags

---

## SEO Issues Resolved

### Issue #1: Duplicate FAQPage Structured Data
**Date Resolved:** July 2, 2025  
**GSC Error:** "Duplicate field 'FAQPage'"

#### Problem
- Two identical FAQPage schema blocks in `_document.tsx`
- Causing structured data validation errors
- Affecting rich snippets display

#### Root Cause
```javascript
// Duplicate schema blocks found:
// Block 1: Lines ~450-490 (4 FAQ questions)
// Block 2: Lines ~498-537 (identical 4 FAQ questions)
```

#### Solution Applied
- Removed second duplicate FAQPage schema block (lines ~498-537)
- Kept first block with 4 FAQ questions about:
  1. Mobile repair costs
  2. Same-day service availability
  3. Service areas coverage
  4. Warranty information

#### Files Modified
- `src/pages/_document.tsx` - Removed duplicate structured data

#### Verification Method
```bash
# Test structured data
curl -s https://travelling-technicians.ca | grep -A 20 "@type.*FAQPage"
```

---

### Issue #2: Page Indexing Redirect Problems
**Date Resolved:** July 2, 2025  
**GSC Error:** "Page with redirect"

#### Problem URLs
- `http://travelling-technicians.ca/` (HTTP redirect missing)
- `https://travelling-technicians.ca/` (www redirect issues)
- `https://www.travelling-technicians.ca/contact/` (redirect chains)

#### Root Causes
1. Missing HTTP → HTTPS redirects
2. Conflicting canonical URLs (www vs non-www)
3. Missing www → non-www redirects
4. Inconsistent domain references in schema markup

#### Solution Applied

##### 1. Fixed Redirect Configuration
```json
// Added to vercel.json
{
  "source": "/(.*)",
  "has": [{"type": "host", "value": "www.travelling-technicians.ca"}],
  "destination": "https://travelling-technicians.ca/$1",
  "permanent": true
}
```

##### 2. Updated Canonical URLs (8+ pages)
Fixed canonical tags to use non-www domain:
- `src/pages/services/mobile.tsx`
- `src/pages/mobile-repair-near-me.tsx`
- `src/pages/mobile-screen-repair.tsx`
- `src/pages/laptop-screen-repair.tsx`
- `src/pages/service-areas/vancouver.tsx`
- `src/pages/service-areas/new-westminster.tsx`
- `src/pages/service-areas/north-vancouver.tsx`
- `src/pages/service-areas/richmond.tsx`

##### 3. Updated Schema Markup
Fixed domain references in `_document.tsx`:
```javascript
// Before
"url": "https://www.travelling-technicians.ca"
// After  
"url": "https://travelling-technicians.ca"
```

#### Files Modified
- `vercel.json` - Added domain redirects
- Multiple page files - Updated canonical URLs
- `src/pages/_document.tsx` - Fixed schema domain references

---

### Issue #3: Crawled - Currently Not Indexed
**Date Resolved:** July 2, 2025  
**GSC Issue:** Multiple pages not being indexed

#### Problem URLs
- `https://www.travelling-technicians.ca/blog/ultimate-guide-to-screen-protection`
- `https://www.travelling-technicians.ca/blog/water-damage-first-aid-for-devices`
- `https://www.travelling-technicians.ca/doorstep/`
- `https://www.travelling-technicians.ca/services/mobile`

#### Root Causes
1. Thin content redirect pages with minimal SEO value
2. Blog posts missing proper HEAD tags and structured data
3. URL consistency issues

#### Solutions Applied

##### 1. Eliminated Thin Content Pages
- **Deleted:** `src/pages/doorstep.tsx` (thin content redirect)
- **Added:** Server redirects in `vercel.json`:
```json
{
  "source": "/doorstep",
  "destination": "/doorstep-repair",
  "permanent": true
},
{
  "source": "/services/mobile", 
  "destination": "/services/mobile-repair",
  "permanent": true
}
```

##### 2. Enhanced Blog Post SEO
Added comprehensive HEAD sections with:
- SEO-optimized titles and meta descriptions
- Canonical URLs using non-www domain
- Open Graph properties for social sharing
- Article-specific meta tags (author, section, published date)
- JSON-LD Article schema markup

##### 3. Fixed URL Consistency
- Updated dynamic sitemap (`src/pages/api/sitemap.xml.ts`) to use canonical non-www URLs
- Updated `robots.txt` sitemap references

#### Files Modified
- `src/pages/doorstep.tsx` - DELETED
- `src/pages/blog/ultimate-guide-to-screen-protection.tsx` - Enhanced SEO
- `src/pages/blog/water-damage-first-aid-for-devices.tsx` - Enhanced SEO
- `src/pages/api/sitemap.xml.ts` - Updated to non-www URLs
- `public/robots.txt` - Updated sitemap reference
- `vercel.json` - Added server redirects

---

### Issue #4: Duplicate Without User-Selected Canonical
**Date Resolved:** July 2, 2025  
**GSC Error:** Canonical duplication issues

#### Problem URLs
- `https://www.travelling-technicians.ca/mobile-repair-near-me`
- `https://www.travelling-technicians.ca/blog/how-to-extend-your-laptop-battery-life`

#### Root Causes
1. Blog post completely missing `<Head>` section with meta tags
2. Static sitemap vs dynamic sitemap inconsistency (www vs non-www URLs)

#### Solutions Applied

##### 1. Fixed Missing SEO Head Section
Added complete `<Head>` section to blog post:
```jsx
<Head>
  <title>How to Extend Your Laptop Battery Life - Travelling Technicians</title>
  <meta name="description" content="Learn expert tips to maximize your laptop battery life..." />
  <link rel="canonical" href="https://travelling-technicians.ca/blog/how-to-extend-your-laptop-battery-life" />
  {/* Open Graph, Article schema, etc. */}
</Head>
```

##### 2. Resolved Sitemap URL Conflicts
Updated static sitemap (`public/sitemap.xml`) to use non-www URLs matching dynamic sitemap:
- Fixed 32+ URL conflicts across both sitemaps
- Ensured consistent canonical domain usage

#### Files Modified
- `src/pages/blog/how-to-extend-your-laptop-battery-life.tsx` - Added complete HEAD section
- `public/sitemap.xml` - Updated to non-www URLs

---

### Issue #5: Redirect Loop Problem (ERR_TOO_MANY_REDIRECTS)
**Date Resolved:** July 2, 2025  
**Critical Error:** Site completely inaccessible

#### Problem
- `www.travelling-technicians.ca` showing "ERR_TOO_MANY_REDIRECTS"
- Infinite redirect loops preventing site access

#### Root Causes
1. Conflicting redirect configurations in `vercel.json`
2. `cleanUrls: true` conflicting with manual redirects
3. Improper redirect ordering creating chains

#### Solution Applied

##### 1. Removed Conflicting Configuration
```json
// REMOVED these conflicting settings:
"cleanUrls": true  // Was conflicting with manual redirects
```

##### 2. Optimized Redirect Order
Implemented critical redirect hierarchy:
```json
"redirects": [
  // 1. DOMAIN REDIRECT (First Priority)
  {
    "source": "/(.*)",
    "has": [{"type": "host", "value": "www.travelling-technicians.ca"}],
    "destination": "https://travelling-technicians.ca/$1",
    "permanent": true
  },
  
  // 2. TRAILING SLASH REDIRECTS (Second Priority)  
  {
    "source": "/contact/",
    "destination": "/contact",
    "permanent": true
  },
  // ... other trailing slash redirects
  
  // 3. BUSINESS LOGIC REDIRECTS (Final Priority)
  {
    "source": "/doorstep",
    "destination": "/doorstep-repair", 
    "permanent": true
  }
]
```

#### Files Modified
- `vercel.json` - Completely restructured redirect configuration

---

## Technical Implementation Details

### Redirect Flow Hierarchy
The current redirect system follows this priority order:

1. **Domain Normalization** (Highest Priority)
   - `travelling-technicians.ca/*` → `www.travelling-technicians.ca/*`

2. **URL Normalization** (Medium Priority)
   - `/path/` → `/path` (trailing slash removal)

3. **Business Logic** (Lowest Priority)
   - `/doorstep` → `/doorstep-repair`
   - `/services/mobile` → `/services/mobile-repair`

### Canonical URL Strategy
```html
<!-- Standard canonical tag format used across all pages -->
<link rel="canonical" href="https://www.travelling-technicians.ca/[page-path]" />
```

### Schema Markup Standards
```javascript
// Organization schema (in _document.tsx)
{
  "@type": "Organization",
  "name": "The Travelling Technicians",
  "url": "https://travelling-technicians.ca",
  "logo": "https://travelling-technicians.ca/images/logo/logo-orange.png"
}

// Article schema (for blog posts)
{
  "@type": "Article", 
  "headline": "[Article Title]",
  "url": "https://travelling-technicians.ca/blog/[slug]",
  "author": {
    "@type": "Organization",
    "name": "The Travelling Technicians"
  }
}
```

---

## Files Modified

### Complete List of Files Changed

#### Core Configuration Files
- `vercel.json` - Redirect configuration, deployment settings
- `public/sitemap.xml` - Static sitemap with canonical URLs
- `public/robots.txt` - Search engine directives

#### Application Files
- `src/pages/_document.tsx` - Global HEAD, schema markup
- `src/pages/api/sitemap.xml.ts` - Dynamic sitemap generation

#### Page Files (Canonical URL Updates)
- `src/pages/services/mobile.tsx`
- `src/pages/mobile-repair-near-me.tsx` 
- `src/pages/mobile-screen-repair.tsx`
- `src/pages/laptop-screen-repair.tsx`
- `src/pages/service-areas/vancouver.tsx`
- `src/pages/service-areas/new-westminster.tsx`
- `src/pages/service-areas/north-vancouver.tsx`
- `src/pages/service-areas/richmond.tsx`

#### Blog Post Files (SEO Enhancement)
- `src/pages/blog/ultimate-guide-to-screen-protection.tsx`
- `src/pages/blog/water-damage-first-aid-for-devices.tsx`
- `src/pages/blog/how-to-extend-your-laptop-battery-life.tsx`

#### Deleted Files
- `src/pages/doorstep.tsx` - Removed thin content redirect page

### Git Commit History
```bash
# Key commits for reference:
git log --oneline --grep="SEO\|redirect\|canonical"
```

---

## Testing Procedures

### 1. Redirect Testing
```bash
# Test www to non-www redirect
curl -I "https://www.travelling-technicians.ca/"

# Test trailing slash redirects  
curl -I "https://travelling-technicians.ca/contact/"

# Test business logic redirects
curl -I "https://travelling-technicians.ca/doorstep"
```

Expected responses:
- Status: `301` or `308` (permanent redirect)
- Location header pointing to canonical URL

### 2. Canonical URL Verification
```bash
# Check canonical tags on key pages
curl -s https://travelling-technicians.ca/services/mobile-repair | grep "canonical"
curl -s https://travelling-technicians.ca/blog/how-to-extend-your-laptop-battery-life | grep "canonical"
```

### 3. Structured Data Testing
```bash
# Test for duplicate schema
curl -s https://travelling-technicians.ca | grep -c "@type.*FAQPage"
# Should return: 1 (not 2)

# Validate with Google's tool
# https://developers.google.com/search/docs/appearance/structured-data
```

### 4. Sitemap Validation
```bash
# Check both sitemaps use consistent URLs
curl -s https://travelling-technicians.ca/sitemap.xml | grep -o "https://[^<]*"
curl -s https://travelling-technicians.ca/api/sitemap.xml | grep -o "https://[^<]*"
```

### 5. Performance Testing
```bash
# Test redirect speed
time curl -s -I "https://www.travelling-technicians.ca/contact/"
```

---

## Troubleshooting Guide

### Common GSC Errors and Solutions

#### "Page with redirect" Error
**Symptoms:** GSC reports redirect issues on specific URLs

**Investigation Steps:**
1. Test redirect chain with `curl -I [URL]`
2. Check for redirect loops (status 301/308 → 301/308)
3. Verify redirect destinations are correct

**Common Causes:**
- Multiple redirect hops (A→B→C instead of A→C)
- HTTP/HTTPS mixed redirects
- Trailing slash inconsistencies

**Solution Pattern:**
```json
// Direct redirect instead of chain
{
  "source": "/old-path",
  "destination": "https://travelling-technicians.ca/new-path",
  "permanent": true
}
```

#### "Duplicate without user-selected canonical" Error
**Symptoms:** Multiple versions of same content indexed

**Investigation Steps:**
1. Check canonical tags: `curl -s [URL] | grep canonical`
2. Verify sitemap consistency
3. Check for www/non-www conflicts

**Common Causes:**
- Missing canonical tags
- Conflicting canonical URLs (www vs non-www)
- Sitemap inconsistencies

**Solution Pattern:**
```jsx
// Add to page HEAD
<link rel="canonical" href="https://travelling-technicians.ca/current-path" />
```

#### "Crawled - currently not indexed" Error
**Symptoms:** Pages crawled but not appearing in search results

**Investigation Steps:**
1. Check content quality and length
2. Verify meta tags and structured data
3. Check internal linking
4. Review page performance

**Common Causes:**
- Thin content
- Missing meta descriptions
- No internal links
- Slow loading times

**Solution Pattern:**
```jsx
<Head>
  <title>Descriptive Title - Brand</title>
  <meta name="description" content="Detailed description 150-160 chars" />
  <link rel="canonical" href="https://travelling-technicians.ca/path" />
</Head>
```

#### "ERR_TOO_MANY_REDIRECTS" Error
**Symptoms:** Site inaccessible, infinite redirect loops

**Investigation Steps:**
1. Check `vercel.json` redirect order
2. Test individual redirect rules
3. Look for circular redirects

**Common Causes:**
- Conflicting redirect rules
- Improper redirect ordering
- `cleanUrls` conflicts

**Solution Pattern:**
```json
// Ensure proper hierarchy
"redirects": [
  // Domain first
  {"source": "/(.*)", "has": [{"type": "host", "value": "www.domain.com"}], "destination": "https://domain.com/$1"},
  // URL normalization second  
  {"source": "/path/", "destination": "/path"},
  // Business logic last
  {"source": "/old", "destination": "/new"}
]
```

### Emergency Rollback Procedures

#### If SEO Changes Break Site
```bash
# Rollback to previous working version
git revert HEAD
git push

# Or rollback specific file
git checkout HEAD~1 -- vercel.json
git commit -m "rollback: revert vercel.json changes"
git push
```

#### If Redirects Create Loops
```bash
# Quick fix: simplify vercel.json
# Keep only essential www→non-www redirect
# Remove all other redirects temporarily
# Deploy, then add back one by one
```

---

## Monitoring Checklist

### Daily Monitoring (Automated)
- [ ] Site accessibility check
- [ ] Core redirect functionality
- [ ] 404 error monitoring

### Weekly Monitoring
- [ ] Google Search Console error reports
- [ ] Sitemap submission status
- [ ] Core Web Vitals performance
- [ ] Structured data validation

### Monthly Monitoring  
- [ ] Complete redirect audit
- [ ] Canonical URL consistency check
- [ ] Search ranking performance
- [ ] GSC coverage report analysis

### Tools and Resources
- **Google Search Console:** Monitor errors and performance
- **Google's Rich Results Test:** Validate structured data
- **Lighthouse:** Performance and SEO audits
- **Screaming Frog:** Technical SEO crawling
- **curl:** Command-line redirect testing

---

## Expected Outcomes and Timeline

### Immediate (0-24 hours)
- ✅ Site accessibility restored
- ✅ Redirect loops eliminated
- ✅ Basic functionality working

### Short-term (1-2 weeks)
- ✅ Google re-crawling with new configuration
- ✅ Reduced GSC errors
- ✅ Improved crawl efficiency

### Medium-term (2-4 weeks)
- ✅ Better search rankings
- ✅ Enhanced rich snippets
- ✅ Improved local SEO performance

### Long-term (1-3 months)
- ✅ Sustained organic traffic growth
- ✅ Better user engagement metrics
- ✅ Enhanced local search visibility

---

## Contact and Maintenance

### Key Stakeholders
- **Technical Owner:** Manoj Kumar
- **Domain:** travelling-technicians.ca
- **Hosting:** Vercel
- **Repository:** GitHub (private)

### Regular Maintenance Tasks
1. **Monthly GSC Review:** Check for new errors
2. **Quarterly Redirect Audit:** Ensure no broken redirects
3. **Bi-annual SEO Audit:** Comprehensive technical review
4. **Annual Strategy Review:** Update SEO goals and tactics

---

## Document Version Control
- **Created:** July 2, 2025
- **Last Updated:** July 2, 2025
- **Version:** 1.0
- **Next Review:** August 2, 2025

---

*This document serves as the master reference for all SEO-related changes and troubleshooting for the Travelling Technicians website. Keep it updated with any future modifications.* 