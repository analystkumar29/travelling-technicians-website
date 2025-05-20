# Technician and Warranty System

This document describes the implementation of the technician-driven warranty system for The Travelling Technicians.

## Overview

The warranty system consists of several components:

1. **Database Structure**:
   - Technician profiles
   - User profiles for customers
   - Repair completion records
   - Warranty records
   - Warranty claims
   - Technician schedules

2. **Automation**:
   - Automatic warranty generation when repairs are completed
   - Warranty expiration handling
   - Association of bookings with user profiles

3. **API Endpoints**:
   - Technician management
   - Warranty lookup and creation
   - Repair completion registration

## Setup Instructions

### 1. Run the Migrations

To set up the database structure and triggers, run:

```bash
node run-technician-warranty-migration.js
```

This script will create all necessary tables, relationships, and triggers in your Supabase database.

### 2. Create a Technician Account

1. Create a user account in Supabase Auth:
   - Go to your Supabase dashboard
   - Navigate to Authentication > Users
   - Click "Add User"
   - Enter email and password

2. Add technician profile:
   - Insert a record in the `technicians` table with the Auth user ID
   - Example SQL:
   ```sql
   INSERT INTO technicians (
     auth_id, 
     full_name, 
     email, 
     phone, 
     specializations, 
     active_service_areas, 
     is_active
   ) VALUES (
     '00000000-0000-0000-0000-000000000000', -- Replace with actual auth_id
     'John Smith',
     'john@thetravellingtechnicians.com',
     '604-123-4567',
     ARRAY['mobile', 'laptop'],
     ARRAY['V5K', 'V5L', 'V5M'],
     true
   );
   ```

### 3. Test the Warranty System

1. Make a booking through the regular booking flow
2. Register a repair completion using the API:
   ```
   POST /api/repairs/complete
   {
     "booking_id": "00000000-0000-0000-0000-000000000000", 
     "technician_id": "00000000-0000-0000-0000-000000000000",
     "repair_notes": "Replaced screen and battery",
     "parts_used": [
       {
         "name": "iPhone 12 Screen",
         "description": "OEM replacement screen",
         "cost": 120
       },
       {
         "name": "iPhone 12 Battery",
         "description": "OEM replacement battery",
         "cost": 60
       }
     ],
     "repair_duration": 45
   }
   ```

3. Verify warranty creation:
   ```
   GET /api/warranties?booking_id=00000000-0000-0000-0000-000000000000
   ```

## How It Works

### Warranty Creation Flow

1. Customer books a repair
2. Technician completes the repair and registers it via the API
3. Database trigger automatically creates a warranty record
4. Warranty is linked to the booking, technician, and repair details
5. Default warranty period is 90 days

### User Registration

User profiles are created in two ways:

1. **Explicit registration**: When a user creates an account
2. **Implicit association**: Bookings are linked to user profiles by email

### Warranty Claims

1. Customer submits a claim for a warranty
2. Claim is assigned to a technician
3. Technician resolves the issue
4. Claim is marked as completed

## API Endpoints

### Technicians

- `GET /api/technicians` - List all technicians
- `POST /api/technicians` - Create a new technician

### Warranties

- `GET /api/warranties` - List warranties with optional filtering
- `POST /api/warranties` - Create a warranty manually

### Repairs

- `POST /api/repairs/complete` - Register a completed repair

## Front-End Integration

TypeScript types have been defined in:

- `src/types/technician.ts`
- `src/types/warranty.ts`
- `src/types/repair.ts`
- `src/types/user.ts`

Use these types for strong typing in your front-end components.

## Future Enhancements

- Technician dashboard for managing repairs and schedules
- Customer dashboard for viewing warranties and submitting claims
- Email notifications for warranty creation and expiry
- QR code generation for warranty certificates 