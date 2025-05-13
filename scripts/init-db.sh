#!/bin/bash
set -e

# This script initializes the database for the Docker setup
# It runs the SQL files in order to set up the schema and initial data

echo "Initializing database..."

# Check if the SQL directory exists and contains files
if [ ! -d "/docker-entrypoint-initdb.d/sql" ]; then
  echo "Error: SQL directory not found."
  exit 1
fi

# Execute schema setup
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

echo "Running database schema scripts..."

# Sort SQL files by name and run them in order
find /docker-entrypoint-initdb.d/sql -name "*.sql" | sort | while read -r file; do
  echo "Executing $file..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$file"
  echo "Completed $file"
done

# Create initial triggers
echo "Setting up triggers..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- Create booking reference trigger if not exists
  CREATE OR REPLACE FUNCTION generate_booking_reference()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.reference_number := CONCAT('TTB-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'));
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS set_booking_reference ON bookings;
  
  CREATE TRIGGER set_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.reference_number IS NULL)
  EXECUTE FUNCTION generate_booking_reference();
EOSQL

echo "Database initialization completed successfully!" 