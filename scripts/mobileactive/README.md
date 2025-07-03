# MobileActive Data Extraction Pipeline

This pipeline extracts pricing data from [MobileActive.ca](https://mobileactive.ca/) and transforms it into your dynamic pricing database. It's designed to be automated, reliable, and maintainable.

## 🎯 Overview

The pipeline consists of three main components:

1. **Data Extraction** (`fetch-parts.ts`) - Scrapes MobileActive's Shopify API
2. **Data Transformation** (`transform-to-pricing.ts`) - Maps data to your database schema
3. **Master Script** (`run-extraction.ts`) - Orchestrates the entire process

## 📋 Prerequisites

### Environment Variables
```bash
# Required for database access
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional for admin API access
ADMIN_TOKEN=your_admin_token
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup
Your Supabase database must have the dynamic pricing tables set up:
- `device_types`
- `brands` 
- `device_models`
- `services`
- `pricing_tiers`
- `dynamic_pricing`

### Dependencies
```bash
npm install axios yaml p-limit fuse.js @supabase/supabase-js
```

## 🚀 Quick Start

### 1. Run Complete Pipeline
```bash
npx tsx scripts/mobileactive/run-extraction.ts
```

### 2. Run Individual Steps
```bash
# Extract data only
npx tsx scripts/mobileactive/run-extraction.ts fetch-only

# Transform and upload only
npx tsx scripts/mobileactive/run-extraction.ts transform-only
```

### 3. Get Help
```bash
npx tsx scripts/mobileactive/run-extraction.ts help
```

## 📁 Output Files

After running the pipeline, you'll find these files in the `tmp/` directory:

| File | Description |
|------|-------------|
| `mobileactive-raw.json` | Raw data from MobileActive's Shopify API |
| `mobileactive-processed.json` | Cleaned and categorized data |
| `mobileactive-parts.csv` | Human-readable CSV summary |
| `mobileactive-mapping-log.json` | Successful database mappings |
| `mobileactive-failed-mappings.json` | Failed mappings for review |

## 🔧 Configuration

### Collections Configuration (`collections.yaml`)

This file maps MobileActive's Shopify collection handles to your brand/device structure:

```yaml
collections:
  - handle: apple-iphone-15-pro
    brand: apple
    device_type: mobile
    category: phone
  - handle: samsung-galaxy-s-series
    brand: samsung
    device_type: mobile
    category: phone

services:
  - name: screen_replacement
    keywords: ["lcd", "screen", "display", "assembly"]
    priority: 1
  - name: battery_replacement
    keywords: ["battery", "cell"]
    priority: 2

pricing:
  labour_markup: 70  # Base labour cost in CAD
  tier_multipliers:
    economy: 0.8
    standard: 1.0
    premium: 1.25
    express: 1.5
```

### Adding New Collections

1. Visit MobileActive.ca and navigate to a brand/device collection
2. Note the URL path (e.g., `/collections/apple-iphone-16-pro`)
3. Extract the handle (e.g., `apple-iphone-16-pro`)
4. Add to `collections.yaml` with appropriate brand/device mapping

## 🔍 Data Processing Logic

### Service Type Detection
The pipeline identifies service types using keyword matching:

```typescript
// Example: "LCD Assembly for iPhone 15 Pro" → screen_replacement
const serviceType = identifyServiceType(product.title, config.services);
```

### Model Name Extraction
Extracts clean model names from product titles:

```typescript
// Input: "LCD Assembly for iPhone 15 Pro (Aftermarket)"
// Output: { modelName: "iPhone 15", modelVariant: "Pro" }
const modelInfo = extractModelInfo(product.title, meta);
```

### Price Calculation
Calculates service prices using part cost + labour markup + tier multipliers:

```typescript
// Part cost: $25.50
// Labour markup: $70
// Base service price: $95.50
// Economy tier (0.8): $76
// Standard tier (1.0): $96
// Premium tier (1.25): $119
// Express tier (1.5): $143
```

### Database Mapping
Uses fuzzy search to match extracted model names to your database:

```typescript
// Fuzzy search with threshold 0.3
const matcher = new Fuse(models, {
  keys: ['name', 'display_name'],
  threshold: 0.3
});
```

## 📊 Pricing Strategy

### Tier Differentiation
The pipeline creates pricing tiers based on:

1. **Part Quality** - Different screen types (OEM vs Aftermarket)
2. **Service Level** - Economy, Standard, Premium, Express
3. **Labour Complexity** - Device-specific repair difficulty

### Example Pricing Structure
```
iPhone 15 Pro Screen Replacement:
├── Economy: $76 (Aftermarket part, basic service)
├── Standard: $96 (Quality part, standard service)
├── Premium: $119 (OEM part, premium service)
└── Express: $143 (Same-day service)
```

## 🔄 Automation

### GitHub Actions (Recommended)
Create `.github/workflows/update-pricing.yml`:

```yaml
name: Update Pricing from MobileActive
on:
  schedule:
    - cron: '0 3 * * 0'  # Every Sunday at 3 AM UTC
  workflow_dispatch:     # Manual trigger

jobs:
  update-pricing:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 8 }
      - run: pnpm install --frozen-lockfile
      - run: npx tsx scripts/mobileactive/run-extraction.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          ADMIN_TOKEN: ${{ secrets.ADMIN_TOKEN }}
```

### Vercel Cron (Alternative)
Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-pricing",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Collection Not Found (404)
```
⚠️ Collection apple-iphone-16-pro not found (404)
```
**Solution**: Verify the collection handle exists on MobileActive.ca

#### 2. Model Mapping Failures
Check `tmp/mobileactive-failed-mappings.json` for models that couldn't be matched.

**Solutions**:
- Add model aliases to your database
- Update the fuzzy search threshold
- Manually add missing models

#### 3. Service Mapping Failures
**Solution**: Verify service names match your database exactly:
```sql
SELECT name, display_name FROM services WHERE device_type_id = 1;
```

#### 4. Database Connection Issues
**Solution**: Check environment variables:
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Debug Mode
Run with verbose logging:
```bash
DEBUG=* npx tsx scripts/mobileactive/run-extraction.ts
```

## 📈 Monitoring & Analytics

### Success Metrics
- **Extraction Rate**: % of collections successfully scraped
- **Mapping Rate**: % of products successfully mapped to database
- **Upload Rate**: % of pricing entries successfully uploaded

### Quality Checks
1. **Price Validation**: Check for unrealistic price changes
2. **Coverage Analysis**: Ensure all major models are covered
3. **Competitive Analysis**: Compare with other suppliers

## 🔒 Legal & Ethical Considerations

### Rate Limiting
- 3 concurrent requests maximum
- 1-second delay between requests
- Respects robots.txt and terms of service

### Data Usage
- Only extracts publicly available pricing data
- Used for competitive analysis and price optimization
- No personal or proprietary information collected

### Compliance
- Shopify's public JSON endpoints are used as intended
- No scraping of protected or private content
- Respects website terms of service

## 🚀 Advanced Features

### Custom Price Formulas
Modify pricing logic in `fetch-parts.ts`:

```typescript
function calculateServicePrices(partPrice: number, pricing: Config['pricing']) {
  // Custom formula based on device type
  const baseServicePrice = partPrice + pricing.labour_markup;
  
  // Add complexity multiplier for newer devices
  const complexityMultiplier = getComplexityMultiplier(deviceType, modelName);
  
  return {
    economy: Math.round(baseServicePrice * pricing.tier_multipliers.economy * complexityMultiplier),
    // ... other tiers
  };
}
```

### Multiple Suppliers
Extend the pipeline to support multiple suppliers:

```typescript
// Add supplier configuration
const suppliers = {
  mobileactive: {
    baseUrl: 'https://mobileactive.ca',
    collections: mobileactiveCollections
  },
  injuredgadgets: {
    baseUrl: 'https://www.injuredgadgets.com',
    collections: injuredGadgetsCollections
  }
};
```

### Price Comparison
Compare prices across suppliers:

```typescript
const priceComparison = {
  'iPhone 15 Pro Screen': {
    mobileactive: 25.50,
    injuredgadgets: 28.99,
    average: 27.25
  }
};
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the failed mappings log
3. Verify your database schema matches expectations
4. Test with a single collection first

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Compatibility**: Next.js 13+, Supabase, TypeScript 