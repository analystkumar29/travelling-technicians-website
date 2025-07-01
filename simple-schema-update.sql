-- Simple update to create the missing technician_schedules table

-- Create Technician Schedule Table (if not exists)
CREATE TABLE IF NOT EXISTS public.technician_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technician_id UUID REFERENCES technicians(id) NOT NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL, -- Format: 'HH-HH' (e.g., '09-11')
    is_available BOOLEAN DEFAULT TRUE,
    booking_id UUID REFERENCES bookings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(technician_id, date, time_slot) -- Each technician can only have one status per time slot
);

-- Add RLS policy for the table
ALTER TABLE technician_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Technicians can view assigned schedules" 
ON technician_schedules FOR SELECT
USING (technician_id IN (
  SELECT id FROM technicians WHERE auth_id = auth.uid()
));

-- Add timestamp update trigger (if missing)
DROP TRIGGER IF EXISTS update_technician_schedules_timestamp ON technician_schedules;
CREATE TRIGGER update_technician_schedules_timestamp
BEFORE UPDATE ON technician_schedules
FOR EACH ROW
EXECUTE FUNCTION update_timestamp(); 