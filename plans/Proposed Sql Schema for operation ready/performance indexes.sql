-- =============================================================================
-- CRITICAL PERFORMANCE INDEXES
-- =============================================================================

-- Booking lookups (most frequent query)
CREATE INDEX idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX idx_bookings_booking_ref ON bookings(booking_ref);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_technician ON bookings(technician_id) WHERE technician_id IS NOT NULL;

-- WhatsApp dispatch performance
CREATE INDEX idx_whatsapp_dispatches_status ON whatsapp_dispatches(status);
CREATE INDEX idx_whatsapp_dispatches_technician ON whatsapp_dispatches(technician_id);
CREATE INDEX idx_whatsapp_dispatches_booking ON whatsapp_dispatches(booking_id);

-- Dynamic pricing lookups
CREATE INDEX idx_dynamic_pricing_model_service ON dynamic_pricing(model_id, service_id) WHERE is_active = true;

-- Device models for SEO
CREATE INDEX idx_device_models_slug ON device_models(slug) WHERE is_active = true;
CREATE INDEX idx_service_locations_slug ON service_locations(slug) WHERE is_active = true;

-- Customer profiles
CREATE INDEX idx_customer_profiles_phone ON customer_profiles(phone);