### faqs
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| question | text | NO | null | |
| answer | text | NO | null | |
| category | text | YES | 'general' | |
| sort_order | integer | YES | 0 | |
| created_at | timestamptz | YES | now() | |

### payments
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| booking_id | uuid | YES | null | UNIQUE, FOREIGN KEY |
| amount | numeric | NO | null | |
| payment_method | text | YES | null | |
| transaction_id | text | YES | null | |
| status | text | YES | 'pending' | |
| processed_at | timestamptz | YES | null | |
| notes | text | YES | null | |
| created_at | timestamptz | YES | now() | |
| currency | text | YES | 'CAD' | |

### repair_parts
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| part_number | text | YES | null | UNIQUE |
| description | text | YES | null | |
| supplier | text | YES | null | |
| cost_price | numeric | YES | null | |
| retail_price | numeric | YES | null | |
| stock_quantity | integer | YES | 0 | |
| min_stock_level | integer | YES | 2 | |
| created_at | timestamptz | YES | now() | |

### service_locations
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| city_name | text | NO | null | UNIQUE |
| slug | text | NO | null | UNIQUE |
| base_travel_fee | numeric | YES | 0.00 | |
| travel_fee_rules | jsonb | YES | '{"free_areas": ["downtown", "city_center"], "weekend_surcharge": 15, "emergency_surcharge": 25, "peak_hours_surcharge": 10}' | |
| is_active | boolean | YES | true | |
| created_at | timestamptz | YES | now() | |

### services
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| name | text | NO | null | |
| slug | text | NO | null | UNIQUE |
| description | text | YES | null | |
| avg_time_minutes | integer | YES | 45 | |
| is_active | boolean | YES | true | |
| created_at | timestamptz | YES | now() | |

### site_settings
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| key | text | NO | null | UNIQUE |
| value | text | NO | null | |
| description | text | YES | null | |
| created_at | timestamptz | YES | now() | |

### sitemap_regeneration_status
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| last_generated | timestamptz | YES | null | |
| status | text | YES | null | |
| pages_count | integer | YES | null | |
| created_at | timestamptz | YES | now() | |

### technician_service_zones
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| technician_id | uuid | YES | null | FOREIGN KEY, UNIQUE (composite) |
| location_id | uuid | YES | null | FOREIGN KEY, UNIQUE (composite) |
| priority | integer | YES | 1 | |

### technicians
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| full_name | text | NO | null | |
| whatsapp_number | text | NO | null | UNIQUE |
| whatsapp_capable | boolean | YES | true | |
| is_active | boolean | YES | true | |
| created_at | timestamptz | YES | now() | |
| current_status | text | YES | 'available' | |

### testimonials
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| customer_name | text | NO | null | UNIQUE (composite) |
| city | text | YES | null | UNIQUE (composite) |
| device_model | text | YES | null | |
| service | text | YES | null | |
| rating | integer | YES | null | |
| review | text | YES | null | |
| is_featured | boolean | YES | false | |
| featured_order | integer | YES | 0 | |
| created_at | timestamptz | YES | now() | |

### warranties
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| booking_id | uuid | YES | null | FOREIGN KEY |
| warranty_number | text | YES | null | UNIQUE |
| start_date | date | NO | null | |
| end_date | date | NO | null | |
| duration_days | integer | YES | 90 | |
| terms | text | YES | 'Standard 90-day warranty on parts and labor.' | |
| claim_count | integer | YES | 0 | |
| created_at | timestamptz | YES | now() | |

### webhook_logs
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| source | text | YES | null | |
| payload | jsonb | YES | null | |
| processed | boolean | YES | false | |
| error | text | YES | null | |
| created_at | timestamptz | YES | now() | |

### whatsapp_dispatches
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | PRIMARY KEY |
| booking_id | uuid | YES | null | FOREIGN KEY |
| technician_id | uuid | YES | null | FOREIGN KEY |
| message_sid | text | YES | null | |
| response | text | YES | null | |
| response_message | text | YES | null | |
| status | text | YES | 'pending' | |
| sent_at | timestamptz | YES | now() | |
| responded_at | timestamptz | YES | null | |
| created_at | timestamptz | YES | now() | |