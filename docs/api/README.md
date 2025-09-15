# API Documentation

The Travelling Technicians website provides a comprehensive API for booking management, pricing calculations, and service area verification. All APIs are built using Next.js API routes with Supabase backend integration.

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (for admin panel)
- **Email**: SendGrid for transactional emails
- **Hosting**: Vercel with serverless functions

### Database Schema
See [booking-system-db-schema.md](./booking-system-db-schema.md) for complete database structure.

## 📡 API Endpoints

### Booking Management

#### Create Booking
```
POST /api/bookings
```

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "604-555-0123",
  "service_address": "123 Main St, Vancouver, BC",
  "device_type": "mobile",
  "device_brand": "Apple",
  "device_model": "iPhone 14",
  "issue_description": "Cracked screen",
  "preferred_date": "2025-09-20",
  "time_slot": "morning",
  "postal_code": "V6B 1A1",
  "service_fee": 89.99,
  "warranty_selected": true
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "booking_123",
    "reference": "TTT-2025-001234",
    "status": "pending",
    "created_at": "2025-09-15T10:30:00Z"
  }
}
```

#### Get Booking by Reference
```
GET /api/bookings/[reference]
```

**Response:**
```json
{
  "booking": {
    "id": "booking_123",
    "reference": "TTT-2025-001234",
    "customer_name": "John Doe",
    "status": "confirmed",
    "scheduled_date": "2025-09-20",
    "time_slot": "morning"
  }
}
```

#### Update Booking Status
```
PUT /api/bookings/[reference]
```

**Request Body:**
```json
{
  "status": "confirmed",
  "technician_notes": "Confirmed for 9 AM appointment"
}
```

#### Reschedule Booking
```
POST /api/bookings/reschedule
```

**Request Body:**
```json
{
  "booking_id": "booking_123",
  "new_date": "2025-09-21",
  "new_time_slot": "afternoon",
  "reason": "Customer request"
}
```

#### Get Bookings by Email
```
GET /api/bookings/by-email?email=customer@example.com
```

### Pricing API

#### Calculate Service Price
```
POST /api/pricing/calculate
```

**Request Body:**
```json
{
  "device_type": "mobile",
  "device_brand": "Apple",
  "device_model": "iPhone 14",
  "issue_type": "screen_replacement",
  "postal_code": "V6B 1A1",
  "warranty_required": true
}
```

**Response:**
```json
{
  "pricing": {
    "base_price": 79.99,
    "service_fee": 29.99,
    "warranty_fee": 15.00,
    "total": 124.98,
    "doorstep_eligible": true,
    "estimated_duration": "45 minutes"
  }
}
```

#### Get Fixed Pricing
```
GET /api/pricing/calculate-fixed?device_type=mobile&brand=Apple&model=iPhone%2014
```

### Device Information

#### Get Device Brands
```
GET /api/devices/brands?type=mobile
```

**Response:**
```json
{
  "brands": ["Apple", "Samsung", "Google", "OnePlus", "Huawei"]
}
```

#### Get Device Models
```
GET /api/devices/models?brand=Apple&type=mobile
```

**Response:**
```json
{
  "models": [
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14"
  ]
}
```

### Service Area Verification

#### Check Postal Code
```
GET /api/check-postal-code?code=V6B1A1
```

**Response:**
```json
{
  "valid": true,
  "city": "Vancouver",
  "region": "BC",
  "service_available": true,
  "doorstep_eligible": true
}
```

#### Geocoding
```
GET /api/geocode?address=123%20Main%20St,%20Vancouver,%20BC
```

**Response:**
```json
{
  "coordinates": {
    "lat": 49.2827,
    "lng": -123.1207
  },
  "formatted_address": "123 Main St, Vancouver, BC V6B 1A1, Canada",
  "postal_code": "V6B 1A1"
}
```

### Management API (Admin)

#### Get All Bookings
```
GET /api/management/bookings
```

**Query Parameters:**
- `status` - Filter by booking status
- `date_from` - Start date filter
- `date_to` - End date filter
- `limit` - Number of results (default: 50)

#### Update Pricing
```
POST /api/management/pricing
```

**Request Body:**
```json
{
  "device_type": "mobile",
  "brand": "Apple",
  "model": "iPhone 14",
  "service_type": "screen_replacement",
  "price": 89.99,
  "warranty_price": 15.00
}
```

#### Get Technicians
```
GET /api/technicians
```

#### Update Warranty System
```
POST /api/warranties/update
```

## 🔐 Authentication

### Admin Panel Authentication
The management API endpoints require authentication using Supabase Auth:

```javascript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password'
})
```

### API Key Authentication (Future)
For external integrations, API key authentication will be implemented:

```
Authorization: Bearer your-api-key
```

## 📧 Email Integration

### SendGrid Configuration
Email notifications are handled through SendGrid integration. See [SUPABASE_EMAIL_SETUP.md](./SUPABASE_EMAIL_SETUP.md) for setup details.

### Email Templates
- **Booking Confirmation** - Sent when booking is created
- **Booking Update** - Sent when status changes
- **Reschedule Confirmation** - Sent when booking is rescheduled
- **Completion Notification** - Sent when service is completed

### Email API
```
POST /api/email/send
```

**Request Body:**
```json
{
  "to": "customer@example.com",
  "template": "booking_confirmation",
  "data": {
    "booking_reference": "TTT-2025-001234",
    "customer_name": "John Doe",
    "service_date": "2025-09-20"
  }
}
```

## 🚦 Rate Limiting

### Current Limits
- **Booking API**: 10 requests per minute per IP
- **Pricing API**: 100 requests per minute per IP
- **Management API**: 1000 requests per minute (authenticated)

### Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1632150000
```

## 🔍 Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_DEVICE",
    "message": "Device model not found in database",
    "details": {
      "provided_model": "iPhone 99",
      "suggested_models": ["iPhone 15", "iPhone 14"]
    }
  }
}
```

### Error Codes
- `INVALID_DEVICE` - Device not found in database
- `INVALID_POSTAL_CODE` - Postal code not in service area
- `BOOKING_NOT_FOUND` - Booking reference not found
- `PAYMENT_REQUIRED` - Payment information missing
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `AUTHENTICATION_REQUIRED` - Admin access required

## 🧪 Testing

### API Testing
```bash
# Test booking creation
npm run test:api:booking

# Test pricing calculation
npm run test:api:pricing

# Test service area validation
npm run test:api:service-area
```

### Postman Collection
Import the Postman collection from `tests/api/travelling-technicians.postman_collection.json`

### Example Requests
```bash
# Create a test booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test Customer",
    "customer_email": "test@example.com",
    "device_type": "mobile",
    "device_brand": "Apple",
    "device_model": "iPhone 14"
  }'

# Get pricing
curl "http://localhost:3000/api/pricing/calculate-fixed?device_type=mobile&brand=Apple&model=iPhone%2014"
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Response Times**: Tracked via Vercel Analytics
- **Error Rates**: Monitored through Supabase Dashboard
- **Database Performance**: Query optimization reports

### API Usage Analytics
```bash
# Check API performance
npm run api:performance-test

# Monitor response times
npm run benchmark:api-response-times
```

## 🔄 Webhooks (Future)

### Planned Webhook Events
- `booking.created`
- `booking.updated`
- `booking.completed`
- `booking.cancelled`

### Webhook Format
```json
{
  "event": "booking.created",
  "data": {
    "booking_id": "booking_123",
    "reference": "TTT-2025-001234"
  },
  "timestamp": "2025-09-15T10:30:00Z"
}
```

---

For complete database schema details, see [booking-system-db-schema.md](./booking-system-db-schema.md).
For email setup and configuration, see [SUPABASE_EMAIL_SETUP.md](./SUPABASE_EMAIL_SETUP.md).
