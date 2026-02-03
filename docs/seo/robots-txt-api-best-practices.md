# Robots.txt & API Access Best Practices

## Overview

This document outlines the strategic approach to managing API access in `robots.txt` for The Travelling Technicians website. The goal is to prevent "Soft 404" errors that occur when Googlebot visits pages that load content via client-side API calls, but those APIs are blocked by `robots.txt`.

## The Problem: Soft 404s from Blocked APIs

### Scenario
1. Googlebot visits `/locations/burnaby`
2. The page loads content via client-side API call to `/api/locations/burnaby`
3. `robots.txt` blocks `/api/`
4. Googlebot cannot fetch the API content
5. Google sees an empty page with no "Phone Repair" text
6. Result: Google marks it as a **Soft 404** (a page that exists but has no value)

### Impact
- Reduced search rankings
- Pages not indexed properly
- Poor user experience in search results

## Current Implementation

### Location Pages Analysis
Our location pages (e.g., `/locations/[city]`) use:
- **Static Generation** (`getStaticProps`/`getStaticPaths`)
- **Direct database calls** via `getCityData()` function
- **No client-side API calls** for critical content

✅ **Good news**: Our current location pages don't have this problem because all content is baked into the HTML during build/ISR.

## Robots.txt Strategy

### Granular API Access Control
Instead of blanket blocking `/api/`, we use a whitelist approach:

```robots.txt
# PUBLIC APIs - Allow search engines
Allow: /api/ping
Allow: /api/check-postal-code
Allow: /api/geocode
Allow: /api/sitemap.xml
Allow: /api/pricing/calculate
Allow: /api/pricing/calculate-fixed
# ... etc

# PRIVATE APIs - Block sensitive endpoints
Disallow: /api/management/
Disallow: /api/bookings/
Disallow: /api/login
# ... etc

# General API disallow (catches any other endpoints)
Disallow: /api/
```

### Order Matters
In `robots.txt`, more specific rules should come before general ones. The parser processes rules in order.

## Development Best Practices

### 1. Prefer Server-Side Rendering
For pages that need dynamic content:

```typescript
// ✅ GOOD: Server-side rendering
export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetchDataDirectly(); // Direct DB call
  return { props: { data } };
};

// ✅ GOOD: Static generation with ISR
export const getStaticProps: GetStaticProps = async () => {
  const data = await fetchDataDirectly(); // Direct DB call
  return { 
    props: { data },
    revalidate: 3600 // ISR: revalidate every hour
  };
};
```

### 2. Limit Client-Side API Calls
If you must use client-side API calls:

```typescript
// ⚠️ USE WITH CAUTION: Client-side API call
useEffect(() => {
  fetch('/api/public-endpoint') // Must be in PUBLIC APIs whitelist
    .then(res => res.json())
    .then(data => setState(data));
}, []);
```

### 3. API Endpoint Classification
When creating new API endpoints, classify them:

| Category | Examples | robots.txt | Notes |
|----------|----------|------------|-------|
| **Public** | Pricing, device lists, service areas | `Allow: /api/endpoint` | Safe for search engines |
| **Private** | Bookings, user data, admin functions | `Disallow: /api/endpoint/` | Sensitive data |
| **Mixed** | Some public methods, some private | Split into separate endpoints | Avoid mixed permissions |

### 4. Testing Checklist
Before deploying new pages with API calls:

- [ ] Check if page uses client-side API calls
- [ ] Verify API endpoint is in `robots.txt` whitelist
- [ ] Test with Google's Mobile-Friendly Test tool
- [ ] Check Google Search Console for indexing issues
- [ ] Verify page renders without JavaScript

## Common Pitfalls to Avoid

### ❌ Don't: Mix public and private data in same endpoint
```typescript
// ❌ BAD: Mixed permissions
app.get('/api/data', (req, res) => {
  if (req.user) {
    res.json(privateData); // Private when authenticated
  } else {
    res.json(publicData); // Public when not authenticated
  }
});
```

### ✅ Do: Separate endpoints
```typescript
// ✅ GOOD: Separate endpoints
app.get('/api/public/data', (req, res) => {
  res.json(publicData); // Always public
});

app.get('/api/private/data', authMiddleware, (req, res) => {
  res.json(privateData); // Always requires auth
});
```

### ❌ Don't: Rely on client-side rendering for SEO content
```typescript
// ❌ BAD: Critical content loaded client-side
function Page() {
  const [content, setContent] = useState('');
  
  useEffect(() => {
    fetch('/api/critical-content') // Blocked by robots.txt!
      .then(res => res.json())
      .then(data => setContent(data));
  }, []);
  
  return <div>{content || 'Loading...'}</div>; // Empty for Googlebot
}
```

### ✅ Do: Server-render critical content
```typescript
// ✅ GOOD: Server-rendered content
function Page({ content }) { // content from getServerSideProps
  return <div>{content}</div>; // Always has content
}
```

## Monitoring and Maintenance

### Regular Checks
1. **Monthly**: Review `robots.txt` for completeness
2. **After deployments**: Test affected pages
3. **Quarterly**: Audit all client-side API calls

### Tools
- Google Search Console: Coverage report
- Google's Mobile-Friendly Test
- Screaming Frog SEO Spider
- `robots.txt` testing tools

### Alert Signs
- Pages dropping in rankings
- "Soft 404" errors in Search Console
- Pages not indexed
- High bounce rates from search

## Emergency Response

If you discover a "Soft 404" issue:

1. **Immediate**: Add missing API endpoint to `robots.txt` whitelist
2. **Short-term**: Consider server-side rendering for affected page
3. **Long-term**: Implement proper content delivery strategy
4. **Verify**: Use Google's URL Inspection tool to re-crawl

## FAQ

### Q: Why not just allow all APIs?
**A**: Security and privacy. Some APIs return sensitive data (bookings, user info, admin functions).

### Q: Can I use authentication to protect private APIs?
**A**: Yes, but `robots.txt` provides an additional layer. Googlebot doesn't authenticate, so it won't see private data even if it accesses the endpoint.

### Q: What about API endpoints I forgot to whitelist?
**A**: The general `Disallow: /api/` at the end catches anything not explicitly allowed. This is a security feature.

### Q: How do I test my robots.txt changes?
**A**: Use Google's robots.txt Tester in Search Console or online tools like https://technicalseo.com/tools/robots-txt/

## Conclusion

The key principle: **If a page loads content via client-side API calls, those API endpoints must be accessible to search engines in `robots.txt`.**

By following these best practices and using our granular `robots.txt` approach, we can:
- Prevent Soft 404 errors
- Maintain good SEO rankings
- Protect sensitive data
- Provide clear guidelines for developers

## Related Documents
- [API Documentation](../api/README.md)
- [SEO Implementation Guide](../seo/implementation-guide.md)
- [Development Standards](../../development/standards.md)