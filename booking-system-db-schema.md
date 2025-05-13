# Booking System Database Schema Documentation

## Overview

This document outlines the database schema for The Travelling Technicians' booking system. It describes the structure of the database tables, their fields, and the relationships between them.

## Table: bookings

The `bookings` table is the central table that stores all customer repair bookings.

### Columns

| Column Name      | Type          | Description                            | Notes                       |
|------------------|---------------|----------------------------------------|-----------------------------|
| id               | uuid          | Primary key                            | Auto-generated              |
| reference_number | text          | Unique booking reference               | Format: XXX-XXXXXX-XXX      |
| device_type      | text          | Type of device                         | 'mobile', 'laptop', 'tablet'|
| device_brand     | text          | Brand of device                        | Maps to 'brand'             |
| device_model     | text          | Model of device                        | Maps to 'model'             |
| service_type     | text          | Type of repair service                 |                             |
| booking_date     | date          | Appointment date                       | Maps to 'appointmentDate'   |
| booking_time     | text          | Appointment time slot                  | Format: 'HH-HH'             |
| customer_name    | text          | Customer's full name                   |                             |
| customer_email   | text          | Customer's email address               |                             |
| customer_phone   | text          | Customer's phone number                |                             |
| address          | text          | Service address                        |                             |
| postal_code      | text          | Postal code                            |                             |
| issue_description| text          | Description of the issue               | Optional                    |
| status           | text          | Booking status                         | Default: 'pending'          |
| created_at       | timestamptz   | Creation timestamp                     | Auto-generated              |
| updated_at       | timestamptz   | Last update timestamp                  | Auto-generated              |
| city             | text          | City                                   | Optional                    |
| province         | text          | Province                               | Optional                    |
| brand            | text          | Brand (duplicate of device_brand)      | Used for field mapping      |
| model            | text          | Model (duplicate of device_model)      | Used for field mapping      |

### Triggers

#### before_booking_insert

**Function**: `map_booking_fields()`

**Purpose**: Maps between different field naming conventions to allow flexibility in API inputs.

**Details**:
- Maps between `brand` and `device_brand` (bidirectional)
- Maps between `model` and `device_model` (bidirectional)
- Maps `appointmentDate` to `booking_date` when needed
- Maps `appointmentTime` to `booking_time` when needed
- Sets default values for missing fields

## Field Naming Conventions

The booking system deals with two naming conventions:

1. **camelCase** (used in the frontend/API):
   - `deviceType`
   - `deviceBrand`
   - `deviceModel`
   - `appointmentDate`
   - `appointmentTime`
   - etc.

2. **snake_case** (used in the database):
   - `device_type`
   - `device_brand`
   - `device_model`
   - `booking_date`
   - `booking_time`
   - etc.

The field mapping trigger helps manage the conversion between these conventions.

## Booking Status Values

The `status` field can have the following values:

- `pending`: Booking is awaiting confirmation
- `confirmed`: Booking has been confirmed but service not yet completed
- `completed`: Service has been completed
- `cancelled`: Booking was cancelled
- `no_show`: Customer did not show up
- `rescheduled`: Booking was rescheduled to new date/time

## API Considerations

When working with the booking API:

1. **Inserting Bookings**:
   - For maximum compatibility, include both camelCase and snake_case versions of fields
   - Example: include both `appointmentDate` and `booking_date` with the same value
   - This ensures the trigger functions properly

2. **Reading Bookings**:
   - Bookings are stored with snake_case field names in the database
   - Use the `normalizeBookingData` transformer to convert to the frontend format

## Implementation Notes

- The system uses Supabase (PostgreSQL) as the database
- Row-level security (RLS) is not currently implemented but should be added for production
- Consider adding indexes on frequently queried fields like `reference_number` and `customer_email`
- It's recommended to modify the trigger function rather than API code when resolving field naming conflicts

## Future Schema Enhancements

Potential improvements to consider:

1. Add a `technicians` table to store information about repair technicians
2. Add a `services` table to formalize available service types
3. Add a `postal_codes` table to define service areas
4. Create proper foreign key relationships between tables
5. Add enum types for status and device_type instead of using text fields 