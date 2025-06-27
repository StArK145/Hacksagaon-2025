import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import analyzeRoute from './routes/analyzeRoute.js';


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analyze', analyzeRoute);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AI Server running at http://localhost:${PORT}`);
});
