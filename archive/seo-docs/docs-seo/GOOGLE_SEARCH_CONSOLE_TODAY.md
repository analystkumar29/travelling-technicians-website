# Google Search Console Setup - TODAY'S PUSH

## Overview
This guide walks you through pushing Phase 3-7 SEO changes to Google Search Console today. Complete these steps to get your new city pages indexed and monitored.

---

## Step 1: Verify Your Website

### Option A: HTML File Upload (Recommended)
1. **Download verification file** from Google Search Console
2. **Upload to your website** at: `https://www.travelling-technicians.ca/google-site-verification.html`
3. **Verify** in Google Search Console

### Option B: DNS TXT Record
1. **Add TXT record** to your domain DNS:
   ```
   Name: @ (or your domain)
   Type: TXT
   Value: google-site-verification=[YOUR_CODE]
   ```
2. **Wait 24-48 hours** for propagation
3. **Verify** in Google Search Console

### Option C: Google Analytics (If already set up)
1. **Ensure** Google Analytics is installed
2. **Use** "Google Analytics" verification method
3. **Verify** automatically

---

## Step 2: Submit Sitemaps

### Primary Sitemaps to Submit:
1. **Main Sitemap**: `https://www.travelling-technicians.ca/sitemap.xml`
   - ✅ Updated today with 6 new city pages
   - ✅ All dates set to 2026-01-30
   - ✅ Priorities optimized for new pages

2. **Image Sitemap**: `https://www.travelling-technicians.ca/image-sitemap.xml`
   - Already exists and configured

3. **Dynamic Sitemap** (Backup): `https://www.travelling-technicians.ca/api/sitemap.xml`
   - Auto-generated from database

### How to Submit:
1. **Go to** Google Search Console → Sitemaps
2. **Enter** each sitemap URL above
3. **Click** "Submit"
4. **Monitor** status (should show "Success")

---

## Step 3: Request Indexing for New Pages

### New City Pages to Index:
```
1. https://www.travelling-technicians.ca/locations/vancouver
2. https://www.travelling-technicians.ca/locations/burnaby
3. https://www.travelling-technicians.ca/locations/coquitlam
4. https://www.travelling-technicians.ca/locations/richmond
5. https://www.travelling-technicians.ca/locations/north-vancouver
6. https://www.travelling-technicians.ca/locations/surrey
```

### How to Request Indexing:
1. **Use** URL Inspection Tool in Search Console
2. **Enter** each URL above
3. **Click** "Request Indexing"
4. **Repeat** for all 6 city pages

### Batch Method (Faster):
1. **Go to** URL Inspection Tool
2. **Enter** first URL and request indexing
3. **Use** "Test Live URL" to verify it's accessible
4. **Repeat** for remaining URLs

---

## Step 4: Configure Monitoring

### Essential Reports to Set Up:
1. **Performance Report**
   - Monitor clicks, impressions, CTR
   - Filter by query, page, country, device

2. **Index Coverage Report**
   - Check for indexing errors
   - Monitor new page indexing status

3. **Mobile Usability**
   - Ensure all pages are mobile-friendly
   - Fix any mobile usability issues

4. **Core Web Vitals**
   - Monitor page speed metrics
   - Address any "Poor" ratings

### Alerts to Enable:
1. **Indexing Issues** (Critical)
2. **Security Issues** (Critical)
3. **Manual Actions** (Critical)
4. **Mobile Usability** (Important)
5. **Core Web Vitals** (Important)

---

## Step 5: Validate SEO Implementation

### Schema Markup Validation:
1. **Use** Google's Rich Results Test:
   ```
   https://search.google.com/test/rich-results
   ```
2. **Test** each city page URL
3. **Verify** PlaceSchema and LocalBusinessSchema are valid

### On-Page SEO Checklist:
- [ ] Each city page has unique title tag
- [ ] Each city page has unique meta description
- [ ] H1 tags include city name
- [ ] Schema markup is present and valid
- [ ] Internal links to/from city pages
- [ ] Mobile-responsive design

### Technical SEO:
- [ ] Sitemap submitted and validated
- [ ] Robots.txt allows crawling of `/locations/`
- [ ] No crawl errors in Search Console
- [ ] Page speed scores acceptable

---

## Step 6: Post-Submission Monitoring

### What to Monitor (First 7 Days):
1. **Indexing Status** (Daily)
   - Check if new pages are indexed
   - Monitor crawl stats

2. **Performance Metrics** (Weekly)
   - Track impressions for new pages
   - Monitor click-through rates

3. **Error Reports** (Daily)
   - Check for crawl errors
   - Address any 404s or server errors

### Expected Timeline:
- **1-2 days**: Initial crawl and indexing
- **3-7 days**: Pages appear in search results
- **7-14 days**: Performance data starts accumulating
- **30 days**: Full performance data available

---

## Step 7: Troubleshooting

### Common Issues & Solutions:

#### Issue: Pages Not Indexing
**Solution:**
1. Check robots.txt allows `/locations/`
2. Verify sitemap includes new pages
3. Use URL Inspection Tool to force indexing
4. Check for noindex tags on pages

#### Issue: Schema Errors
**Solution:**
1. Run Rich Results Test
2. Fix any schema validation errors
3. Resubmit pages for indexing

#### Issue: Crawl Errors
**Solution:**
1. Check Search Console → Coverage
2. Fix 404s, server errors
3. Update sitemap if needed

#### Issue: Slow Indexing
**Solution:**
1. Increase internal linking to new pages
2. Share pages on social media
3. Submit URLs via URL Inspection Tool
4. Ensure fast page load times

---

## Step 8: Next Steps

### After Today's Push:
1. **Monitor** Search Console daily for first week
2. **Check** indexing status of all 6 city pages
3. **Review** performance data after 7 days
4. **Optimize** based on initial performance

### Phase 8 Preparation:
1. **Neighborhood pages** will be added later
2. **Update sitemap** when Phase 8 completes
3. **Submit** new neighborhood pages for indexing

### Ongoing Maintenance:
1. **Monthly**: Review Search Console reports
2. **Quarterly**: Update sitemap with new content
3. **Annually**: Full SEO audit and optimization

---

## Quick Reference

### URLs to Submit:
- **Sitemap**: `https://www.travelling-technicians.ca/sitemap.xml`
- **Image Sitemap**: `https://www.travelling-technicians.ca/image-sitemap.xml`
- **New City Pages**: 6 URLs listed above

### Tools to Use:
- **Google Search Console**: Primary monitoring
- **Rich Results Test**: Schema validation
- **URL Inspection Tool**: Force indexing

### Contacts:
- **Technical Issues**: Check logs and error reports
- **SEO Questions**: Refer to Phase 3-7 documentation
- **Urgent Problems**: Monitor Search Console alerts

---

## Success Checklist

### ✅ Today's Tasks:
- [ ] Verify website in Google Search Console
- [ ] Submit updated sitemap.xml
- [ ] Request indexing for 6 new city pages
- [ ] Configure monitoring and alerts
- [ ] Validate schema markup

### ✅ Within 7 Days:
- [ ] Confirm all 6 pages are indexed
- [ ] Monitor initial performance data
- [ ] Address any crawl errors
- [ ] Review mobile usability reports

### ✅ Ongoing:
- [ ] Monthly Search Console review
- [ ] Quarterly sitemap updates
- [ ] Annual SEO optimization

---

**Need Help?** Refer to the Phase 3-7 SEO implementation documentation for detailed technical information about the city page implementation.