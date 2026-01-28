- =============================================================================
-- CRITICAL MISSING TABLES - RUN THESE NOW
-- =============================================================================

-- 1. SITE SETTINGS (ESSENTIAL FOR n8n AUTOMATION)
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TESTIMONIALS (ESSENTIAL FOR SEO & MARKETING)
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    city TEXT,
    device_model TEXT,
    service TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_featured BOOLEAN DEFAULT false,
    featured_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAYMENTS TABLE (BUSINESS OPERATIONS)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'debit', 'credit', 'etransfer', 'paypal')),
    transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add payment reference to bookings
ALTER TABLE bookings 
ADD COLUMN payment_id UUID REFERENCES payments(id);

-- 4. FAQS (SEO & CUSTOMER SUPPORT)
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SITEMAP TABLES (SEO)
CREATE TABLE sitemap_regeneration_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    last_generated TIMESTAMPTZ,
    status TEXT,
    pages_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);