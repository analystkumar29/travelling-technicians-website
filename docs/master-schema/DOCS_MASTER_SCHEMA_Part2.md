## Constraints

### Primary Keys
- All tables have a primary key named `id` of type `uuid` with default `uuid_generate_v4()`

### Foreign Key Relationships
1. **booking_communications** → **bookings** (booking_id)
2. **booking_status_history** → **bookings** (booking_id)
3. **bookings** → **customer_profiles** (customer_profile_id)
4. **bookings** → **device_models** (model_id)
5. **bookings** → **services** (service_id)
6. **bookings** → **service_locations** (location_id)
7. **bookings** → **technicians** (technician_id)
8. **city_distance_matrix** → **service_locations** (from_location_id, to_location_id)
9. **device_models** → **brands** (brand_id)
10. **device_models** → **device_types** (type_id)
11. **dynamic_pricing** → **device_models** (model_id)
12. **dynamic_pricing** → **services** (service_id)
13. **payments** → **bookings** (booking_id)
14. **technician_service_zones** → **technicians** (technician_id)
15. **technician_service_zones** → **service_locations** (location_id)
16. **warranties** → **bookings** (booking_id)
17. **whatsapp_dispatches** → **bookings** (booking_id)
18. **whatsapp_dispatches** → **technicians** (technician_id)

### Unique Constraints
1. **bookings**: booking_ref
2. **brands**: name, slug
3. **city_distance_matrix**: from_location_id + to_location_id (composite)
4. **customer_profiles**: phone
5. **device_models**: slug
6. **device_types**: name, slug
7. **dynamic_pricing**: model_id + service_id (composite)
8. **payments**: booking_id (one_payment_per_booking)
9. **repair_parts**: part_number
10. **service_locations**: city_name, slug
11. **services**: slug
12. **site_settings**: key
13. **technicians**: whatsapp_number
14. **testimonials**: customer_name + city (composite)
15. **warranties**: warranty_number

---

## RLS Policies

Row Level Security (RLS) policies control access to data at the row level. The following policies are currently active:

### bookings
- **Public Create Booking**: Allows public users to INSERT new bookings (no qualifier)

### brands
- **Allow public read**: Allows SELECT on all rows (qualifier: `true`)
- **Public Read Brands**: Allows SELECT on active brands only (qualifier: `(is_active = true)`)

### device_models
- **Allow public read**: Allows SELECT on all rows (qualifier: `true`)
- **Public Read Models**: Allows SELECT on active models only (qualifier: `(is_active = true)`)

### device_types
- **Allow public read**: Allows SELECT on all rows (qualifier: `true`)
- **Public Read Types**: Allows SELECT on all rows (qualifier: `true`)

### dynamic_pricing
- **Allow public read**: Allows SELECT on all rows (qualifier: `true`)
- **Public Read Pricing**: Allows SELECT on active pricing only (qualifier: `(is_active = true)`)

### faqs
- **Public Read FAQs**: Allows SELECT on all rows (qualifier: `true`)

### service_locations
- **Public Read Locations**: Allows SELECT on active locations only (qualifier: `(is_active = true)`)

### services
- **Allow public read**: Allows SELECT on all rows (qualifier: `true`)
- **Public Read Services**: Allows SELECT on active services only (qualifier: `(is_active = true)`)

### site_settings
- **Public Read Settings**: Allows SELECT on all rows (qualifier: `true`)

### testimonials
- **Public Read Testimonials**: Allows SELECT on all rows (qualifier: `true`)

## Security Notes
1. Most tables have RLS enabled with public read access for active records
2. Only the `bookings` table allows public INSERT operations
3. No UPDATE or DELETE operations are permitted for public users
4. Administrative operations require authenticated users with appropriate roles

---
## Triggers

Database triggers are special stored procedures that automatically execute in response to specific events (INSERT, UPDATE, DELETE) on tables. The following triggers are currently active:

### Custom Application Triggers

1. **booking_status_change_trigger** (AFTER UPDATE on `bookings`)
   - **Purpose**: Logs status changes to `booking_status_history` table
   - **Event**: AFTER UPDATE (trigger type 17)
   - **Function**: `log_booking_status_change()`
   - **Description**: Automatically creates a historical record whenever a booking's status changes, tracking who made the change and when.

2. **set_booking_ref** (BEFORE INSERT on `bookings`)
   - **Purpose**: Generates unique booking reference numbers
   - **Event**: BEFORE INSERT (trigger type 7)
   - **Function**: `generate_booking_ref()`
   - **Description**: Automatically generates a unique booking reference (e.g., "TEC-1001") for new bookings before they are inserted.

3. **set_warranty_number** (BEFORE INSERT on `warranties`)
   - **Purpose**: Generates unique warranty numbers
   - **Event**: BEFORE INSERT (trigger type 7)
   - **Function**: `generate_warranty_number()`
   - **Description**: Automatically generates a unique warranty number for new warranty records before they are inserted.

### System Referential Integrity Triggers

The database also includes PostgreSQL's internal referential integrity triggers (prefixed with `RI_ConstraintTrigger_`). These are automatically created by PostgreSQL to enforce foreign key constraints:

- **RI_ConstraintTrigger_c_* triggers** (BEFORE DELETE, BEFORE UPDATE)
  - **Purpose**: Prevent orphaned records by enforcing foreign key constraints
  - **Event**: BEFORE DELETE (type 5) and BEFORE UPDATE (type 9)
  - **Description**: System-generated triggers that ensure referential integrity when deleting or updating parent records.

### Trigger Analysis

| Trigger Name | Table | Event | Type | Purpose |
|--------------|-------|-------|------|---------|
| booking_status_change_trigger | bookings | AFTER UPDATE | 17 | Log status changes |
| set_booking_ref | bookings | BEFORE INSERT | 7 | Generate booking reference |
| set_warranty_number | warranties | BEFORE INSERT | 7 | Generate warranty number |
| RI_ConstraintTrigger_c_* | Various | BEFORE DELETE/UPDATE | 5/9 | Enforce referential integrity |

### Key Business Logic Implemented via Triggers

1. **Automatic Reference Generation**: Booking references (TEC-XXXX) and warranty numbers are automatically generated, ensuring uniqueness and consistency.

2. **Audit Trail**: All booking status changes are automatically logged with timestamp and actor information.

3. **Data Integrity**: PostgreSQL's internal triggers ensure that foreign key relationships are maintained, preventing orphaned records.

### Performance Considerations

- Triggers execute synchronously with the transaction
- BEFORE INSERT triggers add minimal overhead as they run before the row is written
- AFTER UPDATE triggers on frequently updated tables (like `bookings`) should be monitored for performance impact
- The `booking_status_change_trigger` only fires when the `status` column changes (not on every update)

---