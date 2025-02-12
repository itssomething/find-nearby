# Nearby Doctors Finder

A full-stack application to find nearby doctors based on your current location or any selected location on the map. Built with Node.js, TypeScript, PostgreSQL, and PostGIS for efficient spatial queries.

## Features

- 🗺️ Interactive map interface using OpenStreetMap
- 📍 Multiple location selection methods:
  - Current location using browser geolocation
  - Click anywhere on the map
  - Search address with autocomplete suggestions
- 🔍 Configurable search radius
- 🏥 Real-time display of nearby doctors
- 📊 Distance-based sorting
- 📱 Responsive design
- 🌐 Address geocoding and reverse geocoding
- ⚡ Optimized API requests with throttling and debouncing

## Tech Stack

- **Backend**:
  - Node.js
  - TypeScript
  - Express.js
  - PostgreSQL with PostGIS extension
  - Node-Postgres (pg)

- **Frontend**:
  - HTML5/CSS3
  - TypeScript
  - Leaflet.js for maps
  - Bootstrap 5 for UI
  - Font Awesome icons

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- PostGIS extension for PostgreSQL
- Yarn package manager

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nearby-doctors
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up PostgreSQL and PostGIS**
   ```bash
   # Install PostGIS extension if not already installed
   sudo apt-get install postgresql-14-postgis-3

   # Create database
   sudo -u postgres psql -c "CREATE DATABASE nearby_doctors;"

   # Enable PostGIS extension
   sudo -u postgres psql nearby_doctors -c "CREATE EXTENSION postgis;"
   ```

4. **Configure environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env

   # Update the .env file with your database credentials
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=nearby_doctors
   DB_PASSWORD=your_password
   DB_PORT=5432
   PORT=3000
   ```

5. **Initialize the database**
   ```bash
   # Run the schema file to create tables
   sudo -u postgres psql nearby_doctors -f src/db/schema.sql

   # Generate and insert sample doctor data
   node scripts/generate_coordinates.js | sudo -u postgres psql nearby_doctors
   ```

6. **Start the development server**
   ```bash
   yarn dev
   ```

7. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Allow location access if you want to use the "Current Location" feature

## API Endpoints

### GET `/api/doctors/nearby`
Find doctors near a specified location.

Query Parameters:
- `latitude` (required): Latitude of the search location
- `longitude` (required): Longitude of the search location
- `radius` (optional): Search radius in meters (default: 5000)

Response:
```json
[
  {
    "id": 1,
    "name": "Dr. John Smith",
    "specialty": "General Practice",
    "address": "123 Main St, City",
    "latitude": 21.0269,
    "longitude": 105.7887,
    "distance": 1234,
    "phone": "+1234567890",
    "email": "john.smith@example.com"
  }
]
```

## Project Structure

```
nearby-doctors/
├── src/
│   ├── types/          # TypeScript interfaces
│   ├── db/            # Database related files
│   └── index.ts       # Main application entry
├── public/
│   ├── index.html    # Frontend HTML
│   ├── styles.css    # CSS styles
│   └── app.js        # Frontend JavaScript
├── scripts/          # Utility scripts
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
