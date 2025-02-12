import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { findNearbyDoctors } from './db';
import { Doctor } from './types';

dotenv.config();

const app = express();
const router = Router();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const getNearbyDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    const radius = parseInt(req.query.radius as string) || 5000;

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({ error: 'Invalid latitude or longitude' });
      return;
    }

    const doctors = await findNearbyDoctors(latitude, longitude, radius);
    res.json(doctors);
  } catch (error) {
    console.error('Error in /api/doctors/nearby:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/api/doctors/nearby', getNearbyDoctors);

app.use('/', router);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve index.html for all other routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
