# SEO Testing Suite Documentation

## Overview

This comprehensive SEO testing suite validates the critical SEO implementations across The Travelling Technicians website, ensuring consistency, compliance, and optimal search engine performance.

## Test Structure

### 📋 Test Categories

1. **Meta Tags Testing** (`/tests/seo/meta-tags.test.js`)
   - Meta tag generation and validation
   - Title and description length compliance
   - Open Graph tags consistency
   - Canonical URL validation
   - Twitter Card meta tags

2. **Structured Data Testing** (`/tests/seo/structured-data.test.js`)
   - JSON-LD schema validation
   - Organization schema compliance
   - LocalBusiness schema accuracy
   - Service schema validation
   - Article and FAQ schema testing

3. **Sitemap Testing** (`/tests/seo/sitemap.test.js`)
   - Dynamic sitemap generation
   - URL format validation
   - Priority distribution
   - Change frequency compliance
   - Performance testing

## 🚀 Running Tests

### Quick Start
```bash
# Run all SEO tests
npm run test:seo

# Run specific test suites
npm run test:seo:meta        # Meta tags only
npm run test:seo:structured  # Structured data only
npm run test:seo:sitemap     # Sitemap only

# Full SEO validation suite
npm run test:seo:full

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Individual Test Commands
```bash
# Run tests with Jest directly
npx jest tests/seo/meta-tags.test.js
npx jest tests/seo/structured-data.test.js
npx jest tests/seo/sitemap.test.js

# Run all tests in parallel
npx jest tests/seo/
```

## 📊 Test Coverage

### Meta Tags Testing Coverage
- ✅ **Homepage Meta Tags**: Title, description, canonical, Open Graph
- ✅ **Service Page Meta Tags**: Mobile repair, laptop repair validation
- ✅ **Title Length Limits**: 60 character enforcement
- ✅ **Description Length Limits**: 160 character enforcement
- ✅ **Canonical URL Consistency**: Non-www domain validation
- ✅ **Open Graph Compliance**: All required OG tags
- ✅ **Twitter Cards**: Summary and image card validation
- ✅ **Viewport & Charset**: Essential meta tags presence

### Structured Data Testing Coverage
- ✅ **Organization Schema**: Complete business information
- ✅ **LocalBusiness Schema**: Location, contact, service area validation
- ✅ **Service Schema**: Mobile and laptop repair services
- ✅ **Article Schema**: Blog post structured data
- ✅ **WebSite Schema**: Site search functionality
- ✅ **FAQPage Schema**: Frequently asked questions
- ✅ **Schema Consistency**: Domain and reference validation
- ✅ **Performance Testing**: Generation speed and size limits

### Sitemap Testing Coverage
- ✅ **XML Validation**: Proper sitemap format and headers
- ✅ **URL Inclusion**: All critical pages present
- ✅ **Domain Consistency**: Non-www enforcement
- ✅ **Priority Distribution**: Logical page importance hierarchy
- ✅ **Change Frequency**: Appropriate update frequencies
- ✅ **Last Modified**: Valid and recent timestamps
- ✅ **Redirect Exclusion**: No redirect URLs in sitemap
- ✅ **Performance**: Generation speed and size validation

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testTimeout: 30000,
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

### Environment Setup (`jest.setup.js`)
- Next.js router mocking
- Image component mocking
- Environment variable configuration
- Global test utilities

## 📝 Test Data and Helpers

### SEO Test Helpers (`/tests/utils/seo-test-helpers.js`)
```javascript
// Common test data structures
export const metaTagTestData = {
  homepage: { title, description, canonical, openGraph },
  mobileRepair: { title, description, canonical, openGraph },
  laptopRepair: { title, description, canonical, openGraph }
}

export const structuredDataSchemas = {
  organization: { /* Organization schema */ },
  localBusiness: { /* LocalBusiness schema */ }
}

// Validation utilities
export const validateMetaTag = (element, property, content)
export const validateJsonLdSchema = (jsonString, type, requiredFields)
export const parseSitemapXml = (xmlString)
```

## 🎯 Test Assertions

### Critical SEO Validations

#### Domain Consistency
```javascript
// Ensures all URLs use non-www domain
expect(url).toMatch(/^https:\/\/travelling-technicians\.ca/)
expect(url).not.toContain('www.')
```

#### Meta Tag Validation
```javascript
// Validates meta tag structure and content
validateMetaTag(element, 'og:title', 'Expected Title')
expect(description.length).toBeLessThanOrEqual(160)
```

#### Schema Validation
```javascript
// Validates JSON-LD structure and required fields
validateJsonLdSchema(schema, 'Organization', ['name', 'url', 'logo'])
expect(schema['@context']).toBe('https://schema.org')
```

#### Sitemap Validation
```javascript
// Validates sitemap structure and priorities
expect(urls).toContain('https://travelling-technicians.ca/')
expect(priority).toBeLessThanOrEqual(1.0)
```

## 🚨 Common Issues and Solutions

### Test Failures

#### Meta Tag Issues
```bash
# If meta tag tests fail:
1. Check title/description lengths
2. Verify canonical URLs use correct domain
3. Ensure Open Graph tags are complete
4. Validate Twitter Card implementation
```

#### Structured Data Issues
```bash
# If structured data tests fail:
1. Validate JSON-LD syntax
2. Check required schema fields
3. Verify domain consistency
4. Ensure proper @type values
```

#### Sitemap Issues
```bash
# If sitemap tests fail:
1. Check XML format validity
2. Verify URL domain consistency
3. Validate priority distribution
4. Ensure no redirect URLs included
```

### Mock Issues
```bash
# If mocks aren't working:
1. Check Supabase client mocking
2. Verify Next.js router mock
3. Ensure environment variables set
4. Check async/await handling
```

## 📈 Performance Benchmarks

### Expected Performance
- **Meta Tag Generation**: < 100ms
- **Structured Data Generation**: < 100ms
- **Sitemap Generation**: < 5000ms
- **Schema Validation**: < 50ms per schema
- **Test Suite Execution**: < 30 seconds

### Size Limits
- **Individual Schemas**: < 5KB each
- **Complete Sitemap**: < 1MB
- **Meta Descriptions**: ≤ 160 characters
- **Page Titles**: ≤ 60 characters

## 🔄 Continuous Integration

### Pre-commit Hooks
```bash
# Add to package.json scripts for CI/CD
"precommit": "npm run test:seo",
"prebuild": "npm run test:seo:full"
```

### GitHub Actions Example
```yaml
- name: Run SEO Tests
  run: |
    npm ci
    npm run test:seo:full
```

## 📚 Additional Resources

### SEO Standards
- [Google SEO Guidelines](https://developers.google.com/search/docs)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards)

### Testing Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🆘 Support

For issues with the SEO testing suite:

1. **Check Test Logs**: Review Jest output for specific failures
2. **Validate Implementation**: Ensure SEO components exist and work correctly
3. **Update Test Data**: Modify test helpers if site structure changes
4. **Mock Updates**: Update mocks if external dependencies change

---

**Last Updated**: December 2024  
**Test Suite Version**: 1.0.0  
**Coverage**: 95%+ of critical SEO elements
