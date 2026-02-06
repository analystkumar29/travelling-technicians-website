# Database Triggers Documentation

**Project:** OperationReady (Travelling Technicians)
**Last Updated:** 2026-02-06
**Total Triggers:** 31 (public schema) — cleaned up from 34 on 2026-02-06
**Total Trigger Functions:** 16

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Trigger Summary by Table](#trigger-summary-by-table)
3. [Trigger Functions - Detailed Reference](#trigger-functions---detailed-reference)
4. [Trigger Flow Diagrams](#trigger-flow-diagrams)
5. [Remaining Considerations](#remaining-considerations)
6. [Changelog](#changelog)

---

## Architecture Overview

The database uses triggers for five core purposes:

| Category | Purpose | Tables Affected |
|---|---|---|
| **Route Refresh** | Regenerates the `dynamic_routes` cache table when source data changes | brands, device_models, device_types, dynamic_pricing, service_locations, services |
| **Route Update** | Updates `last_updated` / `content_updated_at` timestamps on routes when SEO-relevant content changes | service_locations, services, device_models, dynamic_pricing, neighborhood_pages |
| **Active Status Sync** | Keeps `is_active` flags synchronized between `dynamic_pricing`, `device_models`, and `dynamic_routes` | dynamic_pricing |
| **Timestamp Management** | Auto-updates `updated_at` columns | device_models, services, neighborhood_pages |
| **ID/Ref Generation** | Auto-generates human-readable reference numbers | bookings, warranties |

---

## Trigger Summary by Table

### `bookings` (2 triggers)

| Trigger Name | Event | Timing | Orientation | Function | Condition |
|---|---|---|---|---|---|
| `set_booking_ref` | INSERT | BEFORE | ROW | `generate_booking_ref()` | `NEW.booking_ref IS NULL` |
| `booking_status_change_trigger` | UPDATE | AFTER | ROW | `log_booking_status_change()` | - |

---

### `brands` (1 trigger, fires on 3 events)

| Trigger Name | Event | Timing | Orientation | Function | Condition |
|---|---|---|---|---|---|
| `trigger_refresh_routes_brands` | INSERT / UPDATE / DELETE | AFTER | STATEMENT | `trigger_handler_refresh_routes()` | - |

---

### `device_models` (4 triggers)

| Trigger Name | Event | Timing | Orientation | Function | Condition |
|---|---|---|---|---|---|
| `update_device_models_updated_at_trigger` | UPDATE | BEFORE | ROW | `handle_updated_at()` | - |
| `auto_regenerate_city_model_routes` | INSERT / UPDATE | AFTER | ROW | `trigger_regenerate_city_model_routes()` | `NEW.is_active = true` |
| `trigger_refresh_routes_models` | INSERT / UPDATE / DELETE | AFTER | STATEMENT | `trigger_handler_refresh_routes()` | - |
| `trigger_update_routes_on_model_change` | UPDATE | AFTER | ROW | `update_routes_on_model_change()` | - |

---

### `device_types` (1 trigger, fires on 3 events)

| Trigger Name | Event | Timing | Orientation | Function | Condition |
|---|---|---|---|---|---|
| `trigger_refresh_routes_types` | INSERT / UPDATE / DELETE | AFTER | STATEMENT | `trigger_handler_refresh_routes()` | - |

---

### `dynamic_pricing` (8 triggers) - MOST COMPLEX TABLE

| Trigger Name | Event | Timing | Orientation | Function | Condition |
|---|---|---|---|---|---|
| `trg_pricing_sync_routes` | UPDATE OF `is_active` | AFTER | ROW | `update_route_active_status()` | `OLD.is_active IS DISTINCT FROM NEW.is_active` |
| `trg_pricing_sync_routes_insert` | INSERT | AFTER | ROW | `update_route_active_status()` | - |
| `trg_pricing_sync_routes_delete` | DELETE | AFTER | ROW | `update_route_active_status()` | - |
| `trg_pricing_sync_device_models` | UPDATE OF `is_active` | AFTER | ROW | `update_device_model_active_status()` | `OLD.is_active IS DISTINCT FROM NEW.is_active` |
| `trg_pricing_sync_device_models_insert` | INSERT | AFTER | ROW | `update_device_model_active_status()` | - |
| `trg_pricing_sync_device_models_delete` | DELETE | AFTER | ROW | `update_device_model_active_status()` | - |
| `trigger_refresh_routes_pricing` | INSERT / UPDATE / DELETE | AFTER | STATEMENT | `trigger_handler_refresh_routes()` | - |
| `trigger_update_routes_on_pricing_change` | INSERT / UPDATE | AFTER | ROW | `update_routes_on_pricing_change()` | - |

Each sync function now fires **exactly once** per operation. The `trg_pricing_sync_routes` and `trg_pricing_sync_device_models` UPDATE triggers include a `WHEN` guard that prevents firing when `is_active` hasn't actually changed.

---

### `neighborhood_pages` (2 triggers)

| Trigger Name | Event | Timing | Orientation | Function | Condition |
|---|---|---|---|---|---|
| `update_neighborhood_pages_timestamp` | UPDATE | BEFORE | ROW | `update_timestamp()` | - |
| `trigger_update_routes_on_neighborhood_change` | UPDATE | AFTER | ROW | `update_routes_on_neighborhood_change()` | - |

---

### `service_locations` (2 triggers)

| Trigger Name | Event | Timing | Orientation | Function | Condition |
|---|---|---|---|---|---|
| `trigger_refresh_routes_locations` | INSERT / UPDATE / DELETE | AFTER | STATEMENT | `trigger_handler_refresh_routes()` | - |
| `trigger_update_routes_on_city_change` | UPDATE | AFTER | ROW | `update_routes_on_city_change()` | - |

---

### `services` (3 triggers)

| Trigger Name | Event | Timing | Orientation | Function | Condition |
|---|---|---|---|---|---|
| `update_services_updated_at_trigger` | UPDATE | BEFORE | ROW | `handle_updated_at()` | - |
| `trigger_refresh_routes_services` | INSERT / UPDATE / DELETE | AFTER | STATEMENT | `trigger_handler_refresh_routes()` | - |
| `trigger_update_routes_on_service_change` | UPDATE | AFTER | ROW | `update_routes_on_service_change()` | - |

---

### `warranties` (1 trigger)

| Trigger Name | Event | Timing | Orientation | Function | Condition |
|---|---|---|---|---|---|
| `set_warranty_number` | INSERT | BEFORE | ROW | `generate_warranty_number()` | - |

---

## Trigger Functions - Detailed Reference

### 1. `generate_booking_ref()`

**Purpose:** Auto-generates a human-readable booking reference number.

**Format:** `TEC-{sequential_number}` (starting from 1001)

**Logic:**
1. Finds the highest existing numeric portion from all `booking_ref` values
2. Increments by 1
3. Prepends `TEC-` prefix

**Example Output:** `TEC-1001`, `TEC-1002`, `TEC-1003`

**Used By:** `set_booking_ref` on `bookings` (BEFORE INSERT)

```sql
SELECT COALESCE(MAX(NULLIF(regexp_replace(booking_ref, '\D', '', 'g'), '')::int), 1000) + 1
INTO next_num FROM bookings;
NEW.booking_ref := 'TEC-' || next_num;
```

---

### 2. `generate_warranty_number()`

**Purpose:** Auto-generates a warranty tracking number.

**Format:** `WT-{YYMMDD}-{first_4_chars_of_uuid}`

**Example Output:** `WT-260206-a1b2`

**Used By:** `set_warranty_number` on `warranties` (BEFORE INSERT)

```sql
NEW.warranty_number := 'WT-' || to_char(NOW(), 'YYMMDD') || '-' || substring(NEW.id::text from 1 for 4);
```

---

### 3. `handle_updated_at()`

**Purpose:** Generic timestamp updater - sets `updated_at` to current time on any row update.

**Used By:**
- `update_device_models_updated_at_trigger` on `device_models` (BEFORE UPDATE)
- `update_services_updated_at_trigger` on `services` (BEFORE UPDATE)

```sql
NEW.updated_at = CURRENT_TIMESTAMP;
```

---

### 4. `update_timestamp()`

**Purpose:** Same as `handle_updated_at()` but uses `NOW()` instead of `CURRENT_TIMESTAMP`.

**Used By:** `update_neighborhood_pages_timestamp` on `neighborhood_pages` (BEFORE UPDATE)

> **Note:** Functionally identical to `handle_updated_at()`. Could be consolidated.

---

### 5. `log_booking_status_change()`

**Purpose:** Creates an audit trail entry in `booking_status_history` whenever a booking's status changes.

**Logic:**
1. Checks if `OLD.status` is different from `NEW.status`
2. If changed, inserts a record with `booking_id`, `old_status`, `new_status`, and `changed_by` (defaults to `'system'`)

**Target Table:** `booking_status_history`

**Used By:**
- `booking_status_change_trigger` on `bookings` (AFTER UPDATE)

---

### 6. `trigger_handler_refresh_routes()`

**Purpose:** Wrapper function that calls `refresh_dynamic_routes_logic('trigger')` to fully regenerate the `dynamic_routes` cache table.

**Used By:** (6 triggers across 6 tables)
- `trigger_refresh_routes_brands` on `brands`
- `trigger_refresh_routes_models` on `device_models`
- `trigger_refresh_routes_types` on `device_types`
- `trigger_refresh_routes_pricing` on `dynamic_pricing`
- `trigger_refresh_routes_locations` on `service_locations`
- `trigger_refresh_routes_services` on `services`

**Fires On:** INSERT, UPDATE, DELETE (AFTER STATEMENT)

---

### 7. `refresh_dynamic_routes()`

**Purpose:** Core route regeneration engine. Truncates and rebuilds the entire `dynamic_routes` table from the `view_active_repair_routes` view.

**Logic:**
1. Logs start of refresh to `route_generation_logs`
2. `TRUNCATE TABLE dynamic_routes`
3. `INSERT INTO dynamic_routes ... SELECT FROM view_active_repair_routes`
4. Records count and duration to `route_generation_logs`
5. On error, logs error details and re-raises

**Performance Notes:**
- Uses TRUNCATE (faster than DELETE)
- Rebuilds ~4,771 routes each time
- Logs timing data for monitoring

---

### 8. `trigger_regenerate_city_model_routes()`

**Purpose:** Regenerates city-model routes when a device model is activated or inserted.

**Logic:** Calls `generate_city_model_routes()` function.

**Used By:** `auto_regenerate_city_model_routes` on `device_models` (AFTER INSERT/UPDATE, when `NEW.is_active = true`)

---

### 9. `update_route_active_status()`

**Purpose:** Syncs `is_active` flag on `dynamic_routes` based on whether any active pricing exists for a model+service combination.

**Logic:**
1. Determines `model_id` and `service_id` from the affected pricing row
2. Checks if ANY `dynamic_pricing` row exists with `is_active = true` for that combination
3. Updates ALL `dynamic_routes` of type `model-service-page` for that model+service

**Used By:**
- `trg_pricing_sync_routes` on `dynamic_pricing` (AFTER UPDATE OF `is_active`, with WHEN guard)
- `trg_pricing_sync_routes_insert` on `dynamic_pricing` (AFTER INSERT)
- `trg_pricing_sync_routes_delete` on `dynamic_pricing` (AFTER DELETE)

---

### 10. `update_device_model_active_status()`

**Purpose:** Syncs `is_active` flag on `device_models` based on whether any active pricing exists for that model.

**Logic:**
1. Gets `model_id` from the affected pricing row
2. Sets `device_models.is_active = true` if ANY `dynamic_pricing` row for that model has `is_active = true`
3. Updates `updated_at` timestamp

**Used By:**
- `trg_pricing_sync_device_models` on `dynamic_pricing` (AFTER UPDATE OF `is_active`, with WHEN guard)
- `trg_pricing_sync_device_models_insert` on `dynamic_pricing` (AFTER INSERT)
- `trg_pricing_sync_device_models_delete` on `dynamic_pricing` (AFTER DELETE)

---

### 11. `update_routes_on_city_change()`

**Purpose:** Updates route timestamps when SEO-relevant city data changes.

**Monitored Fields:** `city_name`, `local_content`, `neighborhoods`

**Affected Route Types:**
- `city-page` (1 route per city)
- `city-service-page` (4 routes per city)
- `model-service-page` (~396 routes per city)

**Used By:** `trigger_update_routes_on_city_change` on `service_locations` (AFTER UPDATE)

---

### 12. `update_routes_on_service_change()`

**Purpose:** Updates route timestamps when SEO-relevant service data changes.

**Monitored Fields:** `name`, `description`, `display_name`, `updated_at`

**Affected Route Types:**
- `city-service-page` (13 routes per service)
- `model-service-page` (~1,287 routes per service)

**Used By:** `trigger_update_routes_on_service_change` on `services` (AFTER UPDATE)

---

### 13. `update_routes_on_model_change()`

**Purpose:** Updates route timestamps when SEO-relevant model data changes.

**Monitored Fields:** `name`, `display_name`, `updated_at`

**Affected Route Types:**
- `model-service-page` (~52 routes per model)

**Used By:** `trigger_update_routes_on_model_change` on `device_models` (AFTER UPDATE)

---

### 14. `update_routes_on_pricing_change()`

**Purpose:** Updates route timestamps when pricing data changes.

**Affected Route Types:**
- `model-service-page` (13 routes per model-service combo, one per city)

**Used By:** `trigger_update_routes_on_pricing_change` on `dynamic_pricing` (AFTER INSERT/UPDATE)

---

### 15. `update_routes_on_neighborhood_change()`

**Purpose:** Updates parent city page routes when neighborhood content changes.

**Logic:** Joins `neighborhood_pages` to `dynamic_routes` via `city_id` and updates `city-page` routes.

**Used By:** `trigger_update_routes_on_neighborhood_change` on `neighborhood_pages` (AFTER UPDATE)

---

## Trigger Flow Diagrams

### Flow 1: New Booking Created
```
INSERT INTO bookings
    |
    v
[BEFORE INSERT] set_booking_ref
    |-- Condition: booking_ref IS NULL
    |-- Action: Generate "TEC-XXXX" reference number
    v
Row is inserted into bookings table
```

### Flow 2: Booking Status Updated
```
UPDATE bookings SET status = 'confirmed'
    |
    v
[AFTER UPDATE] booking_status_change_trigger
    |-- Checks: OLD.status != NEW.status
    |-- Action: INSERT single row into booking_status_history
    v
Done (1 audit entry per status change)
```

### Flow 3: Pricing `is_active` Toggled
```
UPDATE dynamic_pricing SET is_active = false WHERE ...
    |
    +--[AFTER ROW]-- trg_pricing_sync_routes         --> update_route_active_status()
    +--[AFTER ROW]-- trg_pricing_sync_device_models   --> update_device_model_active_status()
    +--[AFTER ROW]-- trigger_update_routes_on_pricing_change --> update_routes_on_pricing_change()
    |
    +--[AFTER STATEMENT]-- trigger_refresh_routes_pricing --> refresh_dynamic_routes_logic()
         |-- Upserts all routes from view_active_repair_routes
         |-- Deletes stale routes
```

### Flow 3b: Pricing Row Inserted
```
INSERT INTO dynamic_pricing (...)
    |
    +--[AFTER ROW]-- trg_pricing_sync_routes_insert           --> update_route_active_status()
    +--[AFTER ROW]-- trg_pricing_sync_device_models_insert    --> update_device_model_active_status()
    +--[AFTER ROW]-- trigger_update_routes_on_pricing_change  --> update_routes_on_pricing_change()
    |
    +--[AFTER STATEMENT]-- trigger_refresh_routes_pricing     --> refresh_dynamic_routes_logic()
```

### Flow 3c: Pricing Row Deleted
```
DELETE FROM dynamic_pricing WHERE ...
    |
    +--[AFTER ROW]-- trg_pricing_sync_routes_delete           --> update_route_active_status()
    +--[AFTER ROW]-- trg_pricing_sync_device_models_delete    --> update_device_model_active_status()
    |
    +--[AFTER STATEMENT]-- trigger_refresh_routes_pricing     --> refresh_dynamic_routes_logic()
```

### Flow 4: City/Service/Model Data Updated
```
UPDATE on service_locations / services / device_models
    |
    +--[BEFORE ROW]-- handle_updated_at() --> sets updated_at
    |
    +--[AFTER ROW]-- update_routes_on_*_change()
    |   |-- Updates last_updated & content_updated_at on affected routes
    |
    +--[AFTER STATEMENT]-- trigger_handler_refresh_routes()
        |-- Calls refresh_dynamic_routes_logic()
        |-- TRUNCATES and rebuilds ALL routes
```

### Flow 5: New Warranty Created
```
INSERT INTO warranties
    |
    v
[BEFORE INSERT] set_warranty_number
    |-- Action: Generate "WT-YYMMDD-XXXX" warranty number
    v
Row is inserted into warranties table
```

---

## Remaining Considerations

### Performance Concern: Full Route Rebuild

The `trigger_handler_refresh_routes()` fires on **every** INSERT/UPDATE/DELETE across 6 tables. Each invocation upserts all routes from `view_active_repair_routes` and deletes stale ones (avg ~1,835ms, up to ~8,000ms).

This means editing a single brand name triggers a full rebuild of ~3,172 routes. Combined with the row-level `update_routes_on_*_change()` triggers that run before the statement-level rebuild, there is some redundant work:
- Row-level triggers update timestamps on specific routes
- Statement-level trigger then upserts everything (overwriting those timestamps)

**Potential optimization:** Consider whether both row-level updates AND full rebuilds are necessary on the same operation.

---

### Minor: Duplicate Timestamp Functions

Two functions do the same thing:
- `handle_updated_at()` uses `CURRENT_TIMESTAMP`
- `update_timestamp()` uses `NOW()`

Both are functionally identical within a transaction. Consider consolidating to one function.

---

## Trigger Execution Order Reference

PostgreSQL fires triggers in **alphabetical order** when multiple triggers exist on the same table/event/timing.

**On `dynamic_pricing` UPDATE OF `is_active` (alphabetical order):**
1. `trg_pricing_sync_device_models` --> `update_device_model_active_status()` (ROW, with WHEN guard)
2. `trg_pricing_sync_routes` --> `update_route_active_status()` (ROW, with WHEN guard)
3. `trigger_update_routes_on_pricing_change` --> `update_routes_on_pricing_change()` (ROW)
4. `trigger_refresh_routes_pricing` --> full route rebuild (STATEMENT level, fires last)

**On `dynamic_pricing` INSERT:**
1. `trg_pricing_sync_device_models_insert` --> `update_device_model_active_status()` (ROW)
2. `trg_pricing_sync_routes_insert` --> `update_route_active_status()` (ROW)
3. `trigger_update_routes_on_pricing_change` --> `update_routes_on_pricing_change()` (ROW)
4. `trigger_refresh_routes_pricing` --> full route rebuild (STATEMENT level, fires last)

**On `dynamic_pricing` DELETE:**
1. `trg_pricing_sync_device_models_delete` --> `update_device_model_active_status()` (ROW)
2. `trg_pricing_sync_routes_delete` --> `update_route_active_status()` (ROW)
3. `trigger_refresh_routes_pricing` --> full route rebuild (STATEMENT level, fires last)

---

## Quick Reference: What Happens When...

| Action | Triggers Fired | Side Effects |
|---|---|---|
| New booking created | `set_booking_ref` | Generates `TEC-XXXX` ref |
| Booking status changed | `booking_status_change_trigger` | 1 entry in `booking_status_history` |
| New warranty created | `set_warranty_number` | Generates `WT-YYMMDD-XXXX` number |
| Brand updated | `trigger_refresh_routes_brands` | Full route rebuild (~3,172 routes) |
| Device model updated | `handle_updated_at` + `auto_regenerate_city_model_routes` + `trigger_refresh_routes_models` + `trigger_update_routes_on_model_change` | Timestamp update + city-model routes regen + full rebuild + route timestamp update |
| Pricing `is_active` toggled | 3 row-level triggers + 1 statement-level | Route sync + model sync + timestamp update + full rebuild |
| Pricing row inserted | 3 row-level triggers + 1 statement-level | Route sync + model sync + timestamp update + full rebuild |
| Pricing row deleted | 2 row-level triggers + 1 statement-level | Route sync + model sync + full rebuild |
| City name changed | `trigger_refresh_routes_locations` + `trigger_update_routes_on_city_change` | Full rebuild + route timestamps updated |
| Service updated | `handle_updated_at` + `trigger_refresh_routes_services` + `trigger_update_routes_on_service_change` | Timestamp + full rebuild + route timestamps |
| Neighborhood updated | `update_timestamp` + `trigger_update_routes_on_neighborhood_change` | Timestamp + parent city page route updated |

---

## Changelog

### 2026-02-06: Duplicate Trigger Cleanup

**Migration:** `drop_duplicate_triggers_cleanup`

Dropped 3 redundant triggers after a full side-effect analysis confirmed they were safe to remove:

| Dropped Trigger | Table | Reason |
|---|---|---|
| `trigger_log_status_change` | `bookings` | Identical duplicate of `booking_status_change_trigger`. Same function, same timing, same event, no WHEN clause. Was causing double entries in `booking_status_history`. |
| `dynamic_pricing_route_status` | `dynamic_pricing` | Gen-1 trigger with no WHEN guard, fully overlapped by Gen-2 `trg_pricing_sync_routes*` triggers. Caused `update_route_active_status()` to fire 2x per operation. |
| `sync_device_model_active_status` | `dynamic_pricing` | Gen-1 trigger with no WHEN guard, fully overlapped by Gen-2 `trg_pricing_sync_device_models*` triggers. Caused `update_device_model_active_status()` to fire 2x per operation. |

**Verification performed:**
- Both trigger functions are idempotent (duplicate calls produced same result, just wasted work)
- No edge functions, database webhooks, or application code referenced the dropped trigger names
- `booking_status_history` table had 0 rows, so no existing data was affected
- `pg_depend` showed no external dependencies beyond standard table/function references
