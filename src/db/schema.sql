-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create doctors table with location data
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for spatial queries
CREATE INDEX doctors_location_idx ON doctors USING GIST (location);

-- Sample data
INSERT INTO doctors (name, specialty, address, location, phone, email)
VALUES
    ('Dr. John Smith', 'General Practice', '123 Main St, City', ST_SetSRID(ST_MakePoint(106.6297, 10.8231), 4326), '+1234567890', 'john.smith@email.com'),
    ('Dr. Sarah Johnson', 'Pediatrics', '456 Oak Ave, City', ST_SetSRID(ST_MakePoint(106.6297, 10.8231), 4326), '+1234567891', 'sarah.johnson@email.com'),
    ('Dr. Michael Lee', 'Cardiology', '789 Pine Rd, City', ST_SetSRID(ST_MakePoint(106.6298, 10.8232), 4326), '+1234567892', 'michael.lee@email.com');
