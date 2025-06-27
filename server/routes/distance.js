// server/routes/distance.js
import express from 'express';
import fetch from 'node-fetch'; // v3+
const router = express.Router();

const GOOGLE_API_KEY = 'AIzaSyDW9Wb_R2qnxSllRN92mG2e0saPq1q9tHY'; // 🔁 Replace with your real key

router.get('/', async (req, res) => {
  const { origins, destinations } = req.query;

  if (!origins || !destinations) {
    return res.status(400).json({ error: 'Missing origins or destinations' });
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Distance Matrix API error:', err);
    res.status(500).json({ error: 'Failed to fetch distance data' });
  }
});

export default router;
