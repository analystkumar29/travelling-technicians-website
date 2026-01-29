# Database Schema Master Documentation
*Generated from live database queries on 2026-01-29*

## Table of Contents
1. [Tables Overview](#tables-overview)
2. [Table Details](#table-details)
3. [Constraints](#constraints)
4. [RLS Policies](#rls-policies)
5. [Triggers](#triggers)

## Tables Overview

The database contains the following tables:

1. **booking_communications** - Communication history for bookings
2. **booking_status_history** - Status change tracking for bookings
3. **bookings** - Core booking records
4. **brands** - Device brand information
5. **city_distance_matrix** - Distance calculations between service locations
6. **customer_profiles** - Customer information and history
7. **device_models** - Device model specifications
8. **device_types** - Device type categories
9. **dynamic_pricing** - Pricing configurations
10. **faqs** - Frequently asked questions
11. **payments** - Payment records
12. **repair_parts** - Parts inventory
13. **service_locations** - Service area locations
14. **services** - Service offerings
15. **site_settings** - Application settings
16. **sitemap_regeneration_status** - Sitemap generation tracking
17. **technician_service_zones** - Technician service area assignments
18. **technicians** - Technician information
19. **testimonials** - Customer testimonials
20. **warranties** - Warranty records
21. **webhook_logs** - Webhook processing logs
22. **whatsapp_dispatches** - WhatsApp communication logs

## Table Details

### booking_communications
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| booking_id | uuid | YES | null | FOREIGN KEY |
| sender_type | text | YES | null | |
| message | text | NO | null | |
| media_url | text | YES | null | |
| read_at | timestamptz | YES | null | |
| created_at | timestamptz | YES | now() | |

### booking_status_history
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| booking_id | uuid | YES | null | FOREIGN KEY |
| changed_by | text | YES | 'system' | |
| created_at | timestamptz | YES | now() | |

### bookings
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| booking_ref | text | YES | null | UNIQUE |
| customer_profile_id | uuid | YES | null | FOREIGN KEY |
| customer_name | text | NO | null | |
| customer_phone | text | NO | null | |
| customer_email | text | YES | null | |
| customer_address | text | YES | null | |
| model_id | uuid | YES | null | FOREIGN KEY |
| service_id | uuid | YES | null | FOREIGN KEY |
| location_id | uuid | YES | null | FOREIGN KEY |
| technician_id | uuid | YES | null | FOREIGN KEY |
| quoted_price | numeric | YES | null | |
| final_price | numeric | YES | null | |
| travel_fee | numeric | YES | 0.00 | |
| scheduled_at | timestamptz | YES | null | |
| is_repeat_customer | boolean | YES | false | |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |
| notified_at | timestamptz | YES | null | |

### brands
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| name | text | NO | null | UNIQUE |
| slug | text | NO | null | UNIQUE |
| logo_url | text | YES | null | |
| is_active | boolean | YES | true | |
| created_at | timestamptz | YES | now() | |

### city_distance_matrix
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| from_location_id | uuid | YES | null | FOREIGN KEY, UNIQUE (composite) |
| to_location_id | uuid | YES | null | FOREIGN KEY, UNIQUE (composite) |
| driving_minutes | integer | YES | null | |
| distance_km | numeric | YES | null | |
| created_at | timestamptz | YES | now() | |

### customer_profiles
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| phone | text | NO | null | UNIQUE |
| email | text | YES | null | |
| full_name | text | YES | null | |
| total_bookings | integer | YES | 0 | |
| total_spent | numeric | YES | 0.00 | |
| first_booking_date | date | YES | null | |
| last_booking_date | date | YES | null | |
| notes | text | YES | null | |
| created_at | timestamptz | YES | now() | |

### device_models
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| brand_id | uuid | YES | null | FOREIGN KEY |
| type_id | uuid | YES | null | FOREIGN KEY |
| name | text | NO | null | |
| slug | text | NO | null | UNIQUE |
| release_year | integer | YES | null | |
| image_url | text | YES | null | |
| is_active | boolean | YES | true | |
| created_at | timestamptz | YES | now() | |

### device_types
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| name | text | NO | null | UNIQUE |
| slug | text | NO | null | UNIQUE |
| icon_name | text | YES | null | |
| created_at | timestamptz | YES | now() | |

### dynamic_pricing
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| model_id | uuid | YES | null | FOREIGN KEY, UNIQUE (composite) |
| service_id | uuid | YES | null | FOREIGN KEY, UNIQUE (composite) |
| base_price | numeric | NO | null | |
| compare_at_price | numeric | YES | null | |
| required_parts | ARRAY | YES | '{}'::uuid[] | |
| is_active | boolean | YES | true | |

