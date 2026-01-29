# System Patterns

## Architectural Patterns

### 1. API Design Pattern
**Pattern**: RESTful Next.js API Routes with consistent error handling, caching, and fallback static data.

**Implementation**:
- Each API endpoint lives in `src/pages/api/**/*.ts`.
- Only `GET` and `POST` methods allowed; others return `405`.
- Response shape: `{ success: boolean, data?: T, message?: string, error?: string }`.
- Cache‑Control headers set per endpoint (e.g., `s‑maxage=3600, stale‑while‑revalidate=7200`).
- Environment variable validation at startup; missing vars throw immediate errors.
- Fallback static data provided when database queries fail (graceful degradation).

**Example**: `src/pages/api/devices/brands.ts`
```typescript
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
  try {
    // parameter validation, cache key generation, cached fetch
    const brands = await withCache(cacheKey, () => fetchBrandsFromDatabase(deviceType), 'DEVICES_BRANDS');
    res.status(200).json({ success: true, brands });
  } catch (error) {
    logger.error('Unexpected error', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
```

### 2. Caching Strategy
**Pattern**: Multi‑layer in‑memory caching with configurable TTLs and cache‑key generation.

**Implementation**:
- Cache instances: `pricingCache`, `deviceCache`, `apiCache` (defined in `src/utils/cache.ts`).
- Configuration object `CACHE_CONFIG` maps endpoint to cache instance and TTL.
- `withCache(cacheKey, fetcher, configKey)` wrapper checks cache first, then fetches, stores, and returns.
- Cache keys generated via `generateCacheKey(endpoint, params, options)` – normalized, sorted, truncated if too long.
- Metrics tracked per endpoint (hits, misses, hit rate, average response time).

**Example Configuration**:
```typescript
export const CACHE_CONFIG = {
  DEVICES_BRANDS: {
    ttl: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'brands',
    cache: deviceCache
  },
  PRICING_CALCULATE: {
    ttl: 30 * 60 * 1000, // 30 minutes
    keyPrefix: 'pricing',
    cache: pricingCache
  },
  // ...
};
```

### 3. Logging & Monitoring
**Pattern**: Module‑based logger with structured JSON output.

**Implementation**:
- Central logger in `src/utils/logger.ts` using `pino` or custom implementation.
- Each module creates its own logger: `const moduleLogger = logger.createModuleLogger('moduleName')`.
- Log levels: `debug`, `info`, `warn`, `error`.
- Log entries include timestamp, module, message, and optional metadata (e.g., `{ deviceType, count }`).
- API endpoints log request parameters, cache hits/misses, errors.

**Example**:
```typescript
const apiLogger = logger.createModuleLogger('api/devices/brands');
apiLogger.info('Fetching brands', { deviceType, count: brands.length });
```

### 4. Error Handling & Fallbacks
**Pattern**: Graceful degradation with static fallback data and user‑friendly error messages.

**Implementation**:
- Database queries wrapped in try‑catch; on failure, return static fallback data (e.g., `getStaticBrands()`).
- API endpoints validate required parameters; return `400` with descriptive messages.
- Frontend components show appropriate UI states (loading, error, empty) using React Query or local state.
- Network errors trigger automatic retries (where appropriate) and fallback to cached data.

**Example Fallback**:
```typescript
function getStaticBrands(deviceType: string): string[] {
  const deviceBrands = {
    mobile: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Other'],
    laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Other'],
    tablet: ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Other']
  };
  return deviceBrands[deviceType.toLowerCase()] || [];
}
```

### 5. Database Access Pattern
**Pattern**: Supabase client with service‑role key for server‑side operations, anonymous key for browser.

**Implementation**:
- `src/utils/supabaseClient.ts` exports:
  - `supabase` – client using `NEXT_PUBLIC_SUPABASE_ANON_KEY` for browser.
  - `getServiceSupabase()` – returns client using `SUPABASE_SERVICE_ROLE_KEY` for server‑side (API routes).
- Environment variables validated at module import; missing keys throw immediate errors.
- Queries use Supabase’s fluent API with proper filtering, ordering, and relationship joins.
- Row‑Level Security (RLS) policies enable public read access for device data, full access for service role.

**Example Query**:
```typescript
const { data: brands } = await supabase
  .from('brands')
  .select('id, name, display_name, logo_url, device_types!inner(name)')
  .eq('device_types.name', deviceType)
  .eq('is_active', true)
  .order('sort_order', { ascending: true });
```

### 6. Component Architecture
**Pattern**: Reusable UI components built with shadcn/ui, Tailwind CSS, and Framer Motion.

**Implementation**:
- Component library configured via `components.json` (style: `new‑york`, icon library: `lucide`).
- Utility function `cn()` merges Tailwind classes using `clsx` and `tailwind‑merge`.
- Components are located in `src/components/` with subdirectories:
  - `ui/` – base shadcn components (button, card, dialog, etc.)
  - `booking/` – booking‑flow specific components (DeviceSelector, ServiceTierCard, etc.)
  - `management/` – admin‑panel components (AuditLogs, ReviewQueue, etc.)
- Animations added via `framer‑motion` for subtle feedback (hover, transitions, loading states).

**Example Component**:
```tsx
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

export const Card = ({ className, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn('rounded-lg border bg-card p-6 shadow-sm', className)}
    {...props}
  />
);
```

### 7. State Management Pattern
**Pattern**: React Context for global booking state; React Query (TanStack) for server‑state caching.

**Implementation**:
- `BookingContext` (`src/context/BookingContext.tsx`) manages multi‑step booking form state.
- `ErrorContext` provides global error handling and notifications.
- `useQuery` and `useMutation` from `@tanstack/react‑query` handle data fetching, caching, and synchronization.
- Query keys are arrays describing the resource (e.g., `['brands', deviceType]`).

**Example**:
```tsx
const { data: brands, isLoading } = useQuery({
  queryKey: ['brands', deviceType],
  queryFn: () => fetchBrands(deviceType),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 8. Security Patterns
**Pattern**: Environment‑variable validation, Row‑Level Security, input sanitization, and HTTPS enforcement.

**Implementation**:
- Required environment variables checked at startup (Supabase URL, keys, SendGrid API).
- Supabase RLS policies restrict `SELECT` to active records; `INSERT/UPDATE/DELETE` limited to service role.
- API endpoints validate and sanitize query/body parameters.
- Vercel enforces HTTPS; `next.config.js` sets security headers (HSTS, CSP, X‑Frame‑Options).
- Sensitive keys (service role) never exposed to client; used only in server‑side functions.

**Example RLS Policy**:
```sql
CREATE POLICY "Public read access for device_types"
  ON device_types FOR SELECT
  USING (is_active = true);
```

### 9. Testing & Quality Patterns
**Pattern**: Jest for unit/integration tests, ESLint for code quality, and automated script validation.

**Implementation**:
- Test files reside in `tests/` with mirrors of `src/` structure.
- SEO tests validate meta tags, structured data, sitemap, and robots.txt.
- Performance tests measure API response times and Lighthouse scores.
- Custom npm scripts (`npm run test:seo:full`, `npm run test:cache‑full`) run test suites.
- ESLint configuration extends `next/core‑web‑vitals` and `@typescript‑eslint`.

**Example Test**:
```typescript
describe('Brands API', () => {
  it('returns valid brands for mobile device type', async () => {
    const res = await request(app).get('/api/devices/brands?deviceType=mobile');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.brands).toBeInstanceOf(Array);
  });
});
```

### 10. Deployment & DevOps Patterns
**Pattern**: Vercel serverless deployment with environment‑specific configuration and health checks.

**Implementation**:
- `next.config.js` customizes images domains, redirects, headers.
- `vercel.json` defines build commands, routes, and environment variables.
- Environment variables separated by stage (development, preview, production).
- Health‑check endpoints (`/api/health`) verify database connectivity and cache status.
- Deployment pipelines automatically run `npm run build` and `npm run test` on push.

**Health Check Example**:
```typescript
export default function handler(req, res) {
  const dbOk = await testDatabaseConnection();
  const cacheOk = await testCacheConnection();
  res.status(dbOk && cacheOk ? 200 : 503).json({
    status: dbOk && cacheOk ? 'healthy' : 'unhealthy',
    database: dbOk ? 'connected' : 'disconnected',
    cache: cacheOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
}
```

### 11. Dynamic Pricing Pattern
**Pattern**: Real‑time price calculation based on device type, service tier, location, and technician availability.

**Implementation**:
- `usePriceCalculation` hook (`src/hooks/usePriceCalculation.ts`) centralizes pricing logic.
- Database table `dynamic_pricing` contains base prices for device‑service‑tier combinations.
- Location multipliers (`location_adjustments`) adjust prices based on postal‑code region.
- Technician availability may affect pricing through `availability_surcharge`.
- Fallback to static pricing if database query fails (graceful degradation).

**Example Hook Usage**:
```typescript
const { price, isLoading, error } = usePriceCalculation({
  deviceType: 'mobile',
  brand: 'Apple',
  model: 'iPhone 15 Pro',
  serviceTier: 'screen_replacement',
  postalCode: 'V6B 2T9'
});
```

### 12. Sitemap Regeneration Pattern
**Pattern**: Database‑triggered sitemap regeneration with queue‑based processing for SEO freshness.

**Implementation**:
- **Database triggers** on key tables (`service_locations`, `services`, `dynamic_pricing`, `technicians`, `testimonials`, `bookings`) insert into `sitemap_regeneration_queue`.
- **Queue table** (`sitemap_regeneration_queue`) tracks pending, processing, completed, and failed regeneration requests.
- **Queue processor** (`scripts/process-sitemap-queue.js`) runs as cron job, calls webhook endpoint to invalidate cache.
- **Webhook endpoint** (`/api/webhooks/sitemap-regenerate`) triggers sitemap cache invalidation and logs activity.
- **Cache invalidation** - Sitemap‑specific cache with 24‑hour TTL, invalidated on database changes.
- **Fallback sitemap** - Static XML generated when database unavailable.

**Example Trigger**:
```sql
CREATE TRIGGER sitemap_trigger_service_locations
AFTER INSERT OR UPDATE OR DELETE ON service_locations
FOR EACH ROW EXECUTE FUNCTION trigger_sitemap_regeneration();
```

**Example Queue Processing**:
```javascript
// scripts/process-sitemap-queue.js
const result = await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ table: item.table_name, operation: item.operation })
});
```

### 13. Database-First Pattern with Fallback
**Pattern**: Query database first, fall back to hardcoded constants if database is empty or fails, with safety mechanisms for data integrity.

**Implementation**:
- `src/lib/data-service.ts` implements singleton caching with 5-minute TTL for database queries.
- Functions like `getServicesByDeviceType()` query Supabase first, return hardcoded constants if database returns empty or errors.
- **10% Price Deviation Safety**: Database prices are validated against hardcoded baseline prices; if deviation exceeds 10%, fallback to hardcoded price.
- **Upsert Logic**: Seed scripts use upsert (update existing, insert new) to handle pre-existing data with unique constraints.
- **Schema Evolution**: Database schema extended with new columns (`icon`, `is_popular`, `is_limited`, `is_doorstep_eligible`) to support UI requirements.

**Example Implementation**:
```typescript
// Singleton cache pattern
const globalCache = {
  services: { data: null, timestamp: 0 },
  pricing: { data: null, timestamp: 0 }
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getServicesByDeviceType(deviceType: string) {
  const cacheKey = `services-${deviceType}`;
  const cached = globalCache.services;
  
  if (cached.data && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('device_type_id', deviceTypeId)
      .eq('is_active', true);
    
    if (error || !data || data.length === 0) {
      return getHardcodedServices(deviceType); // Fallback
    }
    
    globalCache.services = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    return getHardcodedServices(deviceType); // Fallback
  }
}
```

### 14. Dynamic Service Pages Pattern (Seed & Switch)
**Pattern**: Four-phase strategy for migrating static content to database-driven dynamic pages with zero UI regression.

**Implementation**:
1. **Seed Phase**: Extract hardcoded data from React components, upsert into database with data normalization.
2. **Safety Phase**: Update data layer with DB-first fallback and safety mechanisms.
3. **Switch Phase**: Create dynamic route (`pages/services/[slug].tsx`) with ISR (`revalidate: 3600`).
4. **SEO Phase**: Inject dynamic JSON-LD structured data with location-specific keywords.

**Key Learnings**:
- **Production vs. Migration Schema Mismatch**: Production uses integer IDs with foreign keys; migration files define UUID-based schemas.
- **Data Quality Issues**: Existing database had inconsistent casing, inactive records, conflicting sort orders.
- **Icon Mapping Strategy**: Map React JSX icon components to string identifiers for database storage.
- **Price Parsing**: Convert strings like "From $149" to numeric values for dynamic pricing table.

**Example Seed Script Logic**:
```typescript
// Upsert pattern for services
const { data: existingService } = await supabase
  .from('services')
  .select('id')
  .eq('name', service.name)
  .eq('device_type_id', deviceTypeId)
  .single();

if (existingService) {
  await supabase.from('services').update(serviceData).eq('id', existingService.id);
} else {
  await supabase.from('services').insert(serviceData);
}
```

### 15. Custom Hooks Pattern
**Pattern**: Domain‑specific hooks encapsulate complex business logic and data fetching.

**Implementation**:
- `useBookingForm` (`src/hooks/useBookingForm.ts`) manages multi‑step form state, validation, and submission.
- `useSafeRouter` (`src/hooks/useSafeRouter.ts`) provides safe routing with error boundaries.
- `usePriceCalculation` (see above) handles pricing.
- Each hook follows the naming convention `use[Feature]`, returns an object with `{ data, isLoading, error, mutate }`.
- Hooks are unit‑tested in isolation (`tests/hooks/`).

**Example Hook**:
```typescript
export function useBookingForm(initialStep = 1) {
  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState<BookingFormData>({});
  // ... logic for validation, navigation, submission
  return { step, setStep, formData, setFormData, validate, submit };
}
```

### 16. V2 Database Schema Pattern (Operation Ready)
**Pattern**: Normalized relational schema with UUID primary keys, foreign key relationships, and PostgreSQL ENUM types for business-critical operations.

**Implementation**:
- **UUID Primary Keys**: All tables use `UUID PRIMARY KEY DEFAULT uuid_generate_v4()` for globally unique identifiers.
- **Foreign Key Relationships**: Normalized relationships between core entities (brands → device_models → bookings).
- **PostgreSQL ENUM Types**: Custom enum types for status fields (`booking_status`, `technician_status`, `warranty_status`).
- **Triggers & Automation**: Database triggers for auto-generating booking references, warranty numbers, and audit logging.
- **Row-Level Security (RLS)**: Comprehensive RLS policies for public read access and service role full access.

**Core Tables**:
1. **brands** - Device manufacturers (Apple, Samsung, etc.)
2. **device_types** - Device categories (Phone, Laptop, Tablet)
3. **service_locations** - Service areas/cities with travel fees
4. **services** - Repair services (Screen Repair, Battery Replacement, etc.)
5. **device_models** - Specific device models with brand and type references
6. **dynamic_pricing** - Pricing rules for model-service combinations
7. **technicians** - Technician information and availability
8. **customer_profiles** - Customer history and contact information
9. **bookings** - Core booking table with foreign keys to models, services, locations
10. **warranties** - Warranty information linked to bookings
11. **booking_communications** - Communication logs
12. **booking_status_history** - Audit trail for status changes

**Key Relationships**:
- `bookings.model_id` → `device_models.id`
- `bookings.service_id` → `services.id`
- `bookings.location_id` → `service_locations.id`
- `device_models.brand_id` → `brands.id`
- `device_models.type_id` → `device_types.id`
- `dynamic_pricing.model_id` → `device_models.id`
- `dynamic_pricing.service_id` → `services.id`

**Example Schema Definition**:
```sql
-- Core booking table with V2 normalized schema
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref TEXT UNIQUE, -- Auto-generated (TEC-1001)
    
    customer_profile_id UUID REFERENCES customer_profiles(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT,
    
    model_id UUID REFERENCES device_models(id),
    service_id UUID REFERENCES services(id),
    location_id UUID REFERENCES service_locations(id),
    
    status booking_status DEFAULT 'pending',
    technician_id UUID REFERENCES technicians(id),
    
    quoted_price DECIMAL(10,2),
    final_price DECIMAL(10,2),
    travel_fee DECIMAL(10,2) DEFAULT 0.00,
    
    scheduled_at TIMESTAMPTZ,
    is_repeat_customer BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Triggers & Automation**:
- **Auto-generate booking reference**: `TEC-1001`, `TEC-1002`, etc.
- **Auto-generate warranty number**: `WT-YYMMDD-XXXX`
- **Auto-log status changes**: Audit trail in `booking_status_history`
- **Updated_at timestamps**: Automatic on row update

**Key Learnings from V2 Migration**:
- **Schema Mismatch Resolution**: Legacy V1 code used column names like `service_location_id` while V2 schema uses `location_id`.
- **UUID vs Integer IDs**: V2 uses UUIDs for all foreign keys, requiring code updates to fetch UUIDs from reference tables.
- **Count Query Syntax**: Supabase client requires `select('*', { count: 'exact', head: true })` not `select('count(*)')`.
- **Import-Level Crashes**: Top-level `throw` statements in module imports cause Vercel 500 errors with no logs.
- **Environment Variable Validation**: Must be done at runtime, not module import time, to prevent crashes.
- **Service Role Client Configuration**: Requires `persistSession: false` and `global.fetch` binding for server-side usage.

### 17. TypeScript Compilation & Build Pipeline Pattern
**Pattern**: Proactive local build testing before deployment to catch TypeScript errors early, with systematic error resolution.

**Implementation**:
- **Local Build Testing**: Run `npm run build` locally before pushing to git to identify TypeScript compilation errors that would break Vercel deployment.
- **Error Analysis**: Parse TypeScript error messages to identify root causes (import paths, interface mismatches, package version incompatibilities).
- **Package Compatibility**: Verify `next-seo` package version (7.0.1) and its TypeScript definitions; adjust imports and configurations accordingly.
- **Interface Alignment**: Ensure configuration objects match expected TypeScript interfaces (e.g., `Twitter` interface only accepts `handle`, `site`, `cardType`).
- **Module Resolution**: With `tsconfig.json` `"moduleResolution": "bundler"`, import paths may need adjustment (e.g., `'next-seo/pages'` vs `'next-seo'`).
- **Fix & Verify Cycle**: Apply fixes, rebuild to confirm resolution, then commit and push.

**Example Error Resolution**:
```typescript
// Before (error: Module '"next-seo"' has no exported member 'DefaultSeoProps')
import { DefaultSeoProps } from 'next-seo';

// After (correct import path)
import { DefaultSeoProps } from 'next-seo/pages';

// Before (error: Object literal may only specify known properties)
twitter={{
  handle: '@travellingtech',
  site: '@travellingtech',
  cardType: 'summary_large_image',
  title: '...',  // ❌ Not allowed in next-seo@7.0.1 Twitter interface
}}

// After (only valid properties)
twitter={{
  handle: '@travellingtech',
  site: '@travellingtech',
  cardType: 'summary_large_image',
}}
```

**Key Learnings**:
- **Vercel Deployment Failure Prevention**: Local build testing catches TypeScript errors before they reach CI/CD pipeline.
- **Package Version Awareness**: `next-seo@7.0.1` has stricter TypeScript definitions than earlier versions; configuration must match published interfaces.
- **Import Path Variations**: Some packages export types from subpaths (`'next-seo/pages'`) while others from main entry point.
- **Systematic Fix Approach**: Address one error at a time, rebuild after each fix to ensure cumulative changes don't introduce new errors.

## Conventions & Standards
- **File Naming**: `kebab‑case` for files, `PascalCase` for components, `camelCase` for utilities.
- **Imports**: Absolute aliases (`@/components`, `@/utils`) over relative paths.
- **TypeScript**: Strict mode enabled; explicit types for function returns and API responses.
- **Git**: Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`); main branch protected.
- **Documentation**: All new features require updates to `/docs/` and `README.md`.

## Recurring Solutions
- **Device Selection Flow**: Device type → brand → model → service → tier → customer info.
- **Pricing Calculation**: Look up `dynamic_pricing` by device/service/tier; apply location adjustments; fallback to static price.
- **Contamination Detection**: Pattern‑based scanning of model names (technical codes, generic terms) to flag low‑quality entries using `src/utils/anomalyDetection.ts`.
- **Bulk Operations**: Admin endpoints accept arrays of IDs and perform actions (deactivate, mark for review, update quality score).
- **Enhanced Device Mapping**: `src/utils/enhancedMapping.ts` provides mappings between device families and models for better user experience.
- **Sitemap Regeneration**: Database triggers → queue insertion → cron processing → webhook call → cache invalidation → fresh sitemap generation.

## Database Schema (Live State)

*Audit performed: 2026-01-16 (UTC) - After Dynamic Service Pages Implementation*

### Tables
The following tables exist in the `public` schema:

| Table | Columns | RLS Enabled | Primary Key | Foreign Keys | Row Count |
|-------|---------|-------------|-------------|--------------|-----------|
| customer_feedback | 18 | ❌ | id | 0 | 0 |
| device_types | 7 | ✅ | id | 4 | 3 |
| brands | 10 | ✅ | id | 4 | 30+ |
| device_models | 20 | ✅ | id | 4 | 0 |
| services | 16 | ✅ | id | 3 | 26 |
| pricing_tiers | 10 | ✅ | id | 1 | 0 |
| dynamic_pricing | 12 | ✅ | id | 3 | 24 |
| service_locations | 9 | ✅ | id | 0 | 0 |
| service_categories | 8 | ✅ | id | 1 | 0 |
| bookings | 30 | ✅ | id | 0 | 0 |
| testimonials | 10 | ❌ | id | 0 | 4 |
| technicians | 15 | ✅ | id | 0 | 4 |
| sitemap_regeneration_queue | 13 | ❌ | id | 0 | 1+ |

*Note: Row counts reflect post-seed state after Dynamic Service Pages implementation.*

### Key Schema Learnings (Production vs. Migration)
1. **Production Schema Uses Integer IDs**: Actual production database uses integer IDs with foreign key relationships, while migration files (`sql/001-create-tables.sql`) define UUID-based schemas.
2. **Services Table Evolution**: Extended with new columns (`icon`, `is_popular`, `is_limited`, `is_doorstep_eligible`) to support UI requirements from hardcoded service pages.
3. **Data Quality Issues**: Existing database had inconsistent brand naming (casing), inactive records, and conflicting sort orders.
4. **Unique Constraints**: Added unique constraints on `(name, device_type_id)` for services and brands tables to prevent duplicate entries.
5. **Schema Mapping Strategy**: Developed mapping from React JSX icon components to string identifiers for database storage.
6. **Price Parsing**: Convert strings like "From $149" to numeric values for dynamic pricing table.

### Schema Changes Applied
- **SQL/006-add-service-icon-flags.sql**: Adds `icon`, `is_popular`, `is_limited`, `is_doorstep_eligible` columns to services table.
- **SQL/007-update-unique-constraints.sql**: Adds unique constraints for data integrity.

### Indexes
- Each table has a primary key index.
- Secondary indexes exist for foreign keys, status columns, and search optimization.
- Unused indexes flagged by advisor: 43 indexes never used (e.g., idx_bookings_status, idx_import_batches_status). Consider removing them.
- Missing indexes on foreign keys: brand_mappings_system_brand_id_fkey, dynamic_pricing_pricing_tier_id_fkey, model_mappings_brand_id_fkey, model_mappings_system_model_id_fkey, service_categories_device_type_id_fkey, service_mappings_system_service_id_fkey.

### Row-Level Security
- RLS enabled on all core business tables (device_types, brands, device_models, services, pricing_tiers, dynamic_pricing, service_locations, mobileactive_products, quality_tiers, service_categories, brand_mappings, model_mappings, service_mappings, mobileactive_pricing, bookings).
- RLS **disabled** on administrative tables (import_batches, quality_rules, anomaly_detections, customer_feedback) – security risk.
- Policies: Public read policies restrict to active/published records; service role has full access.
- Overly permissive policies: "Public can insert bookings" allows unrestricted INSERT; "Service role can do everything" bypasses RLS for service role.

### Extensions
- 83 extensions available, including essential ones: `pg_stat_statements`, `pg_cron`, `pg_net`, `pgjwt`, `pgcrypto`, `uuid-ossp`, `postgis`, `vector`, `timescaledb`.
- Installed extensions: `pgjwt`, `pgcrypto`, `pg_graphql`, `pg_stat_statements`, `supabase_vault`, `uuid-ossp`, `plpgsql`.

### Advisor Recommendations
**Security**:
- ERROR: RLS disabled on public tables (quality_rules, import_batches, anomaly_detections, customer_feedback).
- ERROR: Security definer views (staging_dashboard, anomaly_summary).
- WARN: Function search path mutable (publish_model, archive_model, bulk_publish_models, update_updated_at_column).
- WARN: RLS policy always true (multiple tables).
- WARN: Auth OTP long expiry.

**Performance**:
- INFO: Unindexed foreign keys (6 instances).
- INFO: Unused indexes (43 instances).
- WARN: Multiple permissive policies (multiple tables).

### Schema Drift
See `activeContext.md` for detailed drift analysis.

---

*Last Updated: January 28, 2026*
*These patterns reflect the current design decisions and may evolve as the project grows.*