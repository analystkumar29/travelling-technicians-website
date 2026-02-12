# MobileSentrix API Integration Plan

> **Status**: PENDING — Waiting for API credentials from MobileSentrix
> **Created**: 2026-02-09
> **Next Step**: Register at [mobilesentrix.com/api-consumer](https://www.mobilesentrix.com/api-consumer) to get Consumer Key + Consumer Secret

---

## Overview

MobileSentrix is a wholesale phone repair parts supplier (18,000+ SKUs). Their REST API (OAuth 1.0a, Magento-based) will enable:

1. **Dynamic pricing** — wholesale cost x markup = retail price (auto-updated)
2. **Automated parts ordering** — daily cart generation from repair completions
3. **Stock visibility** — show "parts in stock" badges on customer-facing pages
4. **Catalog expansion** — add new brands/models as MobileSentrix stocks them

**Primary focus**: Screen replacement for all brands/models IN STOCK at mobilesentrix.ca

---

## Step 1: Getting API Access

### What to Request

Contact MobileSentrix via their API Consumer page or your existing sales contact:

> "We're a mobile repair business (Travelling Technicians, www.travelling-technicians.ca) and need API access for automated parts ordering and inventory checks. We need a Consumer Key and Consumer Secret. Our callback URL is `https://www.travelling-technicians.ca/api/mobilesentrix/callback`."

### What They'll Provide

1. **Consumer Key** (hex string, e.g., `78560dc3a59ec0c92241a6db9883685a`)
2. **Consumer Secret** (hex string, e.g., `010980cd7d8a8354eaa7bf806a29b5c4`)

### OAuth 1.0a Flow (One-Time)

```
Step 1: Open in browser:
  https://www.mobilesentrix.com/oauth/authorize/identifier
    ?consumer=travelling-technicians
    &authtype=1
    &flowentry=SignIn
    &consumer_key=YOUR_KEY
    &consumer_secret=YOUR_SECRET
    &callback=https://www.travelling-technicians.ca/api/mobilesentrix/callback

Step 2: Log in with your MobileSentrix account → Authorize

Step 3: Callback returns oauth_token + oauth_verifier

Step 4: POST to /oauth/authorize/identifiercallback:
  {
    "consumer_key": "YOUR_KEY",
    "consumer_secret": "YOUR_SECRET",
    "oauth_token": "FROM_STEP_3",
    "oauth_verifier": "FROM_STEP_3"
  }

Step 5: Receive permanent Access Token + Access Token Secret
  → Store in Vercel env vars (never expire unless revoked)
```

### Environment Variables to Set

```env
MOBILESENTRIX_CONSUMER_KEY=...
MOBILESENTRIX_CONSUMER_SECRET=...
MOBILESENTRIX_ACCESS_TOKEN=...
MOBILESENTRIX_ACCESS_TOKEN_SECRET=...
MOBILESENTRIX_API_BASE_URL=https://www.mobilesentrix.com
```

---

## API Endpoints We'll Use

### Authentication
All requests require OAuth 1.0a headers: Consumer Key, Consumer Secret, Access Token, Access Token Secret.

### Products (Main Endpoint)

```
GET /api/rest/products
GET /api/rest/products?category_id=:id
GET /api/rest/products/:id
GET /api/rest/products?limit=100&page=1&pageinfo=1
GET /api/rest/products?filter[1][attribute]=sku&filter[1][in][0]=:sku
```

**Key Response Fields (Customer Auth)**:

```json
{
  "73": {
    "entity_id": "73",
    "sku": "107082005005",
    "name": "LCD Compatible For iPad 2 (Premium)",
    "manufacturer_text": "Apple",
    "model_text": "iPad 2",
    "front_position_text": "LCD Assembly",
    "product_badges_text": "Premium",
    "customer_price": 33.40,
    "is_in_stock": 1,
    "in_stock_qty": 81,
    "warranty_period": "7645",
    "end_of_life": "0",
    "attribute_set_id": "4",
    "category_ids": ["2", "5", "18", "165"],
    "image_url": "https://...",
    "status": "Enabled"
  }
}
```

### Cart (For Ordering)

```
GET  /api/rest/cart                    — View cart
POST /api/rest/cart                    — Add products
DELETE /api/rest/cart                  — Clear cart

POST body: {
  "customrest": 1,
  "products": [
    { "sku": "107082005005", "qty": 3 },
    { "entity_id": "104694", "qty": 1 }
  ]
}
```

### Tags/Compatibility

```
GET /api/rest/tags?filter[1][attribute]=sku&filter[1][in][0]=:sku
```

---

## Data Mapping: MobileSentrix → Our Database

| MS Field | Our Table.Column | Mapping Logic |
|---|---|---|
| `manufacturer_text` | `brands.name` | Exact match ("Apple", "Samsung", "Google") |
| `model_text` | `device_models.name` | Fuzzy match via `strictModelMatch()` |
| `attribute_set_id` | `services` | 4=Parts(screens), 14=Battery |
| `front_position_text` | `services` | "LCD Assembly"/"OLED" → screen-replacement |
| `product_badges_text` | `dynamic_pricing.pricing_tier` | "Premium"/"OEM" → premium, else → standard |
| `customer_price` | `repair_parts.cost_price` | Wholesale cost (apply markup for retail) |
| `is_in_stock` | `repair_parts.is_in_stock` | Boolean |
| `in_stock_qty` | `repair_parts.stock_quantity` | Integer |
| `warranty_period` | `repair_parts.warranty_months` | 7627→0, 7630→1, 7636→3, 7642→6, 7645→12 |
| `end_of_life` | Skip if 1 | Don't import discontinued parts |
| `sku` | `repair_parts.part_number` | Unique identifier for ordering |
| `entity_id` | `repair_parts.msx_entity_id` | Deduplication key for sync |

### Attribute Set ID Reference
- 4 = Parts (screens, digitizers, etc.)
- 10 = Device System (pre-owned devices)
- 12 = Macbook Parts
- 13 = Game Console
- 14 = Battery
- 17 = Tools
- 20 = Accessories

### Warranty Period Code Reference
- 7627 = No Warranty
- 7630 = 30 Days
- 7633 = 60 Days
- 7636 = 90 Days
- 7642 = 6 Months
- 7648 = 1 Year
- 7645 = Lifetime Warranty

---

## Pricing Formula

```
Standard retail = wholesale_cost × (1 + markup_pct/100)
Premium retail  = standard_retail × (1 + premium_addon_pct/100)
Floor           = max(calculated, wholesale_cost + min_margin)
Final           = ceil(price / 5) * 5  (round to nearest $5)

Default config:
  Screen markup: 65%
  Battery markup: 80%
  Premium addon: 25%
  Min margin: $40
  Round to: $5

Example: iPhone 15 screen at $85 wholesale
  Standard: $85 × 1.65 = $140.25 → $145
  Premium:  $145 × 1.25 = $181.25 → $185
  Margin:   Standard $60 (41%), Premium $100 (54%)
```

---

## Existing Database Assets

### `repair_parts` table (exists, 0 rows, 9 columns)
```
id (uuid PK), part_number (text unique), description, supplier,
cost_price (numeric), retail_price (numeric), stock_quantity (int, default 0),
min_stock_level (int, default 2), created_at
```
**Plan**: Extend with MobileSentrix columns (msx_entity_id, brand, model, quality_tier, is_in_stock, mapping_status, brand_id FK, model_id FK, service_id FK)

### `dynamic_pricing.required_parts` (UUID array, all empty)
**Plan**: Link to `repair_parts.id` after mapping is complete

### `repair_completions.parts_used` (JSONB, free-text)
**Plan**: Change to structured format: `[{part_id, msx_sku, quantity}]`

---

## Implementation Phases

### Phase 1: Infrastructure (buildable before credentials)
- DB migration: extend `repair_parts`, create `supplier_sync_logs`, `part_cost_history`
- API client library: `src/lib/mobilesentrix/client.ts` (OAuth 1.0a signing)
- Mapper: `src/lib/mobilesentrix/mapper.ts` (auto-map products to our schema)
- Pricing engine: `src/lib/mobilesentrix/pricing-engine.ts`
- Types: `src/lib/mobilesentrix/types.ts`

### Phase 2: Product Catalog Sync (needs credentials)
- Sync engine: `src/lib/mobilesentrix/sync.ts`
- Admin APIs: sync trigger, product browsing/mapping
- Cron jobs: daily full sync + 4-hourly stock sync
- Admin UI: `src/pages/management/parts-catalog.tsx`

### Phase 3: Dynamic Pricing
- Auto-update `dynamic_pricing.base_price` from wholesale cost changes
- Admin UI: markup config, margin visibility, preview before apply
- Safety: 20% change cap, min margin floor, cost history tracking

### Phase 4: Customer-Facing
- Stock badges in booking form (TierPriceComparison.tsx)
- Availability API: `GET /api/parts/availability?model_id=X&service_id=Y`
- Catalog expansion: add new models from unmapped MS products

### Phase 5: Automated Ordering
- Order generator: sum daily repairs → MobileSentrix cart
- Admin UI: daily order preview, submit to MS
- Parts tracking: structured parts_used + stock decrement

---

## Next Actions

1. [ ] Contact MobileSentrix for API Consumer credentials
2. [ ] Once credentials received, test GET /api/rest/products to verify actual response format
3. [ ] Compare real response fields against mapping table above
4. [ ] Confirm `customer_price` is available (requires Customer auth, not Admin)
5. [ ] Confirm `is_in_stock` and `in_stock_qty` are present in Customer auth response
6. [ ] Identify screen-specific category_ids for filtered sync
7. [ ] Test cart API with a small order
8. [ ] Begin Phase 1 implementation
