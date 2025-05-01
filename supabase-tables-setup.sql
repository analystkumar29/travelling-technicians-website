-- Create extension for UUID generation if not already exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'laptop')),
  device_brand TEXT NOT NULL,
  device_model TEXT,
  issue_description TEXT,
  service_type TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  technician_id UUID,
  notes TEXT,
  reference_number TEXT NOT NULL UNIQUE
);

-- Create technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  specialties TEXT[] NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  areas_covered TEXT[] NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  booking_id UUID REFERENCES bookings(id),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  service_type TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT TRUE
);

-- Add foreign key constraint after tables are created
ALTER TABLE bookings 
  ADD CONSTRAINT fk_bookings_technician 
  FOREIGN KEY (technician_id) 
  REFERENCES technicians(id);

-- Add row level security policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policy for bookings
CREATE POLICY "Public bookings are viewable by everyone" 
ON bookings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert bookings" 
ON bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update bookings"
ON bookings FOR UPDATE USING (true);

-- Create policy for technicians
CREATE POLICY "Public technician profiles are viewable by everyone" 
ON technicians FOR SELECT USING (true);

-- Create policy for reviews
CREATE POLICY "Public reviews are viewable by everyone" 
ON reviews FOR SELECT USING (visible = true);

CREATE POLICY "Users can insert reviews" 
ON reviews FOR INSERT WITH CHECK (true); 