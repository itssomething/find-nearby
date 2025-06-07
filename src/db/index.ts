import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export const findNearbyDoctors = async (
  longitude: number,
  latitude: number,
  radiusInMeters: number = 5000
) => {
  const query = `
    SELECT
      id,
      name,
      specialty,
      address,
      ST_X(ST_Transform(location::geometry, 4326)) as longitude,
      ST_Y(ST_Transform(location::geometry, 4326)) as latitude,
      phone,
      email,
      ST_Distance(
        location,
        ST_SetSRID(
          // ST_MakePoint expects coordinates in longitude, latitude order
          ST_MakePoint($1, $2),
          4326
        )::geography
      ) as distance
    FROM doctors
      WHERE ST_DWithin(
        location,
        ST_SetSRID(
          // ST_MakePoint expects coordinates in longitude, latitude order
          ST_MakePoint($1, $2),
          4326
        )::geography,
        $3
      )
    ORDER BY distance
  `;

  try {
    const result = await pool.query(query, [longitude, latitude, radiusInMeters]);
    return result.rows;
  } catch (error) {
    console.error('Error finding nearby doctors:', error);
    throw error;
  }
};

export default pool;
