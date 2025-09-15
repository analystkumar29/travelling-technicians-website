# MobileActive Data Extraction - Complete Step-by-Step Plan

## 🎯 What We're Building

A complete automated system to extract pricing data from [MobileActive.ca](https://mobileactive.ca/) and integrate it into your dynamic pricing database. This will give you real-time competitive pricing for mobile phone and laptop repair services.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Supabase database with dynamic pricing tables set up
- [ ] Environment variables configured (see below)
- [ ] Node.js 16+ installed
- [ ] Access to your project directory

### Required Environment Variables
```bash
# Add these to your .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_TOKEN=your_admin_token  # Optional, for API access
```

## 🚀 Step-by-Step Implementation

### Step 1: Install Dependencies

```bash
# Install required packages
npm install axios yaml p-limit fuse.js

# Verify installation
npm run extract:pricing:test
```

### Step 2: Test Your Setup

```bash
# Run the setup test to verify everything is working
npm run extract:pricing:test
```

This will test:
- ✅ Environment variables
- ✅ Database connection
- ✅ MobileActive API access
- ✅ Configuration files
- ✅ Dependencies

### Step 3: Extract Data from MobileActive

```bash
# Extract raw data from MobileActive (this may take 5-10 minutes)
npm run extract:pricing:fetch
```

**What happens:**
1. Connects to MobileActive's Shopify API
2. Downloads product data from all configured collections
3. Processes and categorizes products by service type
4. Generates CSV file for easy review

**Output files:**
- `tmp/mobileactive-raw.json` - Raw Shopify data
- `tmp/mobileactive-processed.json` - Cleaned data
- `tmp/mobileactive-parts.csv` - Human-readable summary

### Step 4: Review Extracted Data

Open `tmp/mobileactive-parts.csv` in Excel/Google Sheets to review:

| Column | Description |
|--------|-------------|
| Brand | Apple, Samsung, etc. |
| Device Type | mobile, laptop, tablet |
| Model Name | iPhone 15, Galaxy S24, etc. |
| Service Type | screen_replacement, battery_replacement, etc. |
| Part Price | Cost from MobileActive |
| Economy/Standard/Premium/Express | Calculated service prices |

**Key things to check:**
- Are all major brands covered?
- Are prices reasonable?
- Are model names correctly extracted?

### Step 5: Transform and Upload to Database

```bash
# Transform data and upload to your Supabase database
npm run extract:pricing:transform
```

**What happens:**
1. Maps extracted data to your database schema
2. Uses fuzzy search to match model names
3. Creates pricing entries for all tiers
4. Uploads to your `dynamic_pricing` table

**Output files:**
- `tmp/mobileactive-mapping-log.json` - Successful mappings
- `tmp/mobileactive-failed-mappings.json` - Failed mappings

### Step 6: Verify Results

1. **Check your admin panel** at `/management/pricing`
2. **Review failed mappings** in `tmp/mobileactive-failed-mappings.json`
3. **Test pricing API** at `/api/pricing/calculate`

## 🔧 Configuration Options

### Modify Collections (`scripts/mobileactive/collections.yaml`)

Add new brands or devices:

```yaml
collections:
  - handle: new-brand-device
    brand: newbrand
    device_type: mobile
    category: phone
```

### Adjust Pricing Strategy

Modify labour costs and tier multipliers:

```yaml
pricing:
  labour_markup: 70  # Base labour cost
  tier_multipliers:
    economy: 0.8     # 20% discount
    standard: 1.0    # Standard price
    premium: 1.25    # 25% premium
    express: 1.5     # 50% premium
```

### Add New Service Types

```yaml
services:
  - name: new_service
    keywords: ["keyword1", "keyword2"]
    priority: 7
```

## 📊 Understanding the Data Structure

### Example: iPhone 15 Pro Screen Replacement

**MobileActive Product:** "LCD Assembly for iPhone 15 Pro (Aftermarket)"

**Extracted Data:**
```json
{
  "brand": "apple",
  "device_type": "mobile",
  "model_name": "iPhone 15",
  "model_variant": "Pro",
  "service_type": "screen_replacement",
  "part_price": 25.50,
  "service_prices": {
    "economy": 76,    // (25.50 + 70) * 0.8
    "standard": 96,   // (25.50 + 70) * 1.0
    "premium": 119,   // (25.50 + 70) * 1.25
    "express": 143    // (25.50 + 70) * 1.5
  }
}
```

### Pricing Tiers Explained

| Tier | Multiplier | Description | Use Case |
|------|------------|-------------|----------|
| Economy | 0.8x | Aftermarket parts, basic service | Budget-conscious customers |
| Standard | 1.0x | Quality parts, standard service | Most customers |
| Premium | 1.25x | OEM parts, premium service | Quality-focused customers |
| Express | 1.5x | Same-day service | Urgent repairs |

## 🔄 Automation Setup

### Option 1: GitHub Actions (Recommended)

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
      - run: npm run extract:pricing
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          ADMIN_TOKEN: ${{ secrets.ADMIN_TOKEN }}
```

### Option 2: Vercel Cron

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

#### 1. "Collection not found" errors
**Solution:** Verify collection handles exist on MobileActive.ca

#### 2. Model mapping failures
**Solution:** Check `tmp/mobileactive-failed-mappings.json` and add missing models to your database

#### 3. Database connection errors
**Solution:** Verify environment variables are set correctly

#### 4. API rate limiting
**Solution:** The script includes built-in delays, but you can increase them if needed

### Debug Commands

```bash
# Test setup only
npm run extract:pricing:test

# Extract data only
npm run extract:pricing:fetch

# Transform only (if you have existing data)
npm run extract:pricing:transform

# Run with verbose logging
DEBUG=* npm run extract:pricing
```

## 📈 Monitoring & Quality Assurance

### Success Metrics

Track these metrics after each run:

1. **Extraction Rate**: % of collections successfully scraped
2. **Mapping Rate**: % of products successfully mapped to database
3. **Coverage**: Number of unique device/service combinations
4. **Price Range**: Min/max/average prices per service type

### Quality Checks

1. **Price Validation**: Look for unrealistic price changes
2. **Coverage Analysis**: Ensure all major models are covered
3. **Competitive Analysis**: Compare with other suppliers

### Manual Review Process

1. Check the CSV file for data quality
2. Review failed mappings and fix issues
3. Verify pricing in your admin panel
4. Test the booking flow with new prices

## 🔒 Legal & Ethical Considerations

### Rate Limiting
- Maximum 3 concurrent requests
- 1-second delay between requests
- Respects robots.txt and terms of service

### Data Usage
- Only extracts publicly available pricing data
- Used for competitive analysis and price optimization
- No personal or proprietary information collected

### Compliance
- Uses Shopify's public JSON endpoints as intended
- No scraping of protected or private content
- Respects website terms of service

## 🚀 Advanced Features

### Custom Price Formulas

You can modify the pricing logic in `scripts/mobileactive/fetch-parts.ts`:

```typescript
function calculateServicePrices(partPrice: number, deviceType: string, modelName: string) {
  const baseServicePrice = partPrice + pricing.labour_markup;
  
  // Add complexity multiplier for newer devices
  const complexityMultiplier = getComplexityMultiplier(deviceType, modelName);
  
  return {
    economy: Math.round(baseServicePrice * 0.8 * complexityMultiplier),
    standard: Math.round(baseServicePrice * 1.0 * complexityMultiplier),
    premium: Math.round(baseServicePrice * 1.25 * complexityMultiplier),
    express: Math.round(baseServicePrice * 1.5 * complexityMultiplier)
  };
}
```

### Multiple Suppliers

Extend the pipeline to support multiple suppliers:

```typescript
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

### Price Comparison Dashboard

Create a dashboard to compare prices across suppliers:

```typescript
const priceComparison = {
  'iPhone 15 Pro Screen': {
    mobileactive: 25.50,
    injuredgadgets: 28.99,
    average: 27.25,
    recommended: 26.50
  }
};
```

## 📞 Support & Next Steps

### If You Need Help

1. **Check the troubleshooting section above**
2. **Review the failed mappings log**
3. **Verify your database schema matches expectations**
4. **Test with a single collection first**

### Next Steps After Implementation

1. **Set up automated scheduling** (GitHub Actions or Vercel Cron)
2. **Create price monitoring alerts** for significant changes
3. **Build a price comparison dashboard** for business insights
4. **Extend to other suppliers** for comprehensive market data
5. **Implement dynamic pricing rules** based on competitor data

### Maintenance

- **Weekly**: Review extraction logs and failed mappings
- **Monthly**: Analyze pricing trends and adjust strategies
- **Quarterly**: Update collection configurations for new devices
- **Annually**: Review and optimize pricing formulas

---

## 🎉 Congratulations!

You now have a complete, automated system for extracting competitive pricing data from MobileActive and integrating it into your dynamic pricing database. This will help you:

- **Stay competitive** with real-time market pricing
- **Optimize profit margins** with data-driven pricing strategies
- **Improve customer satisfaction** with fair, market-based pricing
- **Scale efficiently** with automated price updates

The system is designed to be maintainable, reliable, and ethical. Happy pricing! 🚀

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Compatibility**: Next.js 13+, Supabase, TypeScript 