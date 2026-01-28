-- CRITICAL INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_technician ON bookings(technician_id) WHERE technician_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_status ON whatsapp_dispatches(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_technician ON whatsapp_dispatches(technician_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_booking ON whatsapp_dispatches(booking_id);

CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_model_service ON dynamic_pricing(model_id, service_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_device_models_slug ON device_models(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_service_locations_slug ON service_locations(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);