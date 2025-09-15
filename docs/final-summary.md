# Booking API Debugging Summary

## Issue Diagnosis

After extensive testing and debugging, the following issues were identified in the booking API:

1. **Database Schema Mismatch**: 
   - The transformer functions expected fields (`city` and `province`) that didn't exist in the database schema
   - The database trigger was looking for an `appointmentdate` field that doesn't exist

2. **Field Naming Inconsistency**:
   - The frontend used camelCase fields (e.g., `appointmentDate`)
   - The API transformer was converting to snake_case (e.g., `booking_date`)
   - But a database trigger was still looking for the camelCase version (e.g., `appointmentdate`)

3. **Table Structure Issues**:
   - Verification confirmed the bookings table exists but appears to be empty
   - All booking creation attempts failed due to trigger errors

## Attempted Fixes

1. **Transformer Updates**:
   - Modified `denormalizeBookingData` to properly handle field naming
   - Added mappings for `brand` and `model` fields that might be needed by triggers
   - Ensured `city` and `province` fields were included when available

2. **Schema Alignment**:
   - Updated the `CreateBookingRequest` interface to include fields that might be needed
   - Created specialized test endpoints to bypass normal validation

3. **Verification Methods**:
   - Created a specialized verification endpoint to check bookings directly in the database
   - Implemented SQL-based queries to bypass any ORM limitations

## Current Status

1. The booking API still has issues:
   - The SQL queries confirm the table exists but is empty
   - All direct booking creation attempts fail with trigger errors
   - The test endpoint appears to accept bookings but they don't persist in the database

2. Most likely cause: 
   - There is a database trigger that expects different field names than what we're providing
   - The trigger is failing with `record "new" has no field "appointmentdate"` error
   - This suggests a trigger is trying to access `new.appointmentdate` but we're sending `booking_date`

## Recommended Next Steps

1. **Database Schema Investigation**:
   - Check all database triggers on the `bookings` table
   - Examine the trigger that references `appointmentdate`
   - Update trigger to use the correct field names (e.g., `booking_date` instead of `appointmentdate`)

2. **Alternatives**:
   - Temporarily disable triggers for testing
   - Modify the API to send both field versions (`appointmentDate` and `booking_date`)
   - Create a new version of the booking table without problematic triggers

3. **Testing Approach**:
   - Fix the database schema issues first
   - Then verify with the specialized test endpoints 
   - Finally test the standard API endpoints

## Code Examples

### Updated Transformer Function

```typescript
export function denormalizeBookingData(bookingData: Partial<CreateBookingRequest>): Record<string, any> {
  // Handle tablet device type for API compatibility
  const apiDeviceType = bookingData.deviceType === 'tablet' ? 'mobile' : bookingData.deviceType;
  
  // Important: Database expects booking_date and booking_time, not appointmentDate/Time
  // We need to map these fields correctly to avoid trigger errors with appointmentdate field
  
  return {
    // Basic device info - snake_case for DB
    ...(bookingData.deviceType && { device_type: apiDeviceType }),
    ...(bookingData.deviceBrand && { device_brand: bookingData.deviceBrand }),
    ...(bookingData.deviceModel && { device_model: bookingData.deviceModel }),
    
    // Add brand and model fields for DB triggers
    ...(bookingData.deviceBrand && { brand: bookingData.deviceBrand }),
    ...(bookingData.deviceModel && { model: bookingData.deviceModel }),
    
    // Service info - snake_case for DB
    ...(bookingData.serviceType && { service_type: bookingData.serviceType }),
    ...(bookingData.issueDescription && { issue_description: bookingData.issueDescription }),
    
    // Appointment info - IMPORTANT: convert to booking_date and booking_time
    ...(bookingData.appointmentDate && { booking_date: bookingData.appointmentDate }),
    ...(bookingData.appointmentTime && { booking_time: bookingData.appointmentTime }),
    
    // Customer info - snake_case for DB
    ...(bookingData.customerName && { customer_name: bookingData.customerName }),
    ...(bookingData.customerEmail && { customer_email: bookingData.customerEmail }),
    ...(bookingData.customerPhone && { customer_phone: bookingData.customerPhone }),
    
    // Location info - snake_case for DB
    ...(bookingData.address && { address: bookingData.address }),
    ...(bookingData.postalCode && { postal_code: bookingData.postalCode }),
    
    // Add city and province fields if present
    ...(bookingData.city && { city: bookingData.city }),
    ...(bookingData.province && { province: bookingData.province }),
  };
}
```

### Fix for Database Trigger Issue

If you need to modify the database trigger, you could use SQL like this:

```sql
-- Drop the problematic trigger
DROP TRIGGER IF EXISTS trigger_name ON bookings;

-- Re-create it with correct field names
CREATE TRIGGER trigger_name
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION trigger_function();

-- Or update the trigger function to handle both naming conventions
CREATE OR REPLACE FUNCTION trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Example of handling both field naming conventions
  NEW.some_field := COALESCE(NEW.booking_date, NEW.appointmentdate, CURRENT_DATE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 