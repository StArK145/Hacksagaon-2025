import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import distanceRoute from './routes/distance.js';

import analyzeRoute from './routes/analyzeRoute.js';
import imageRoute from './routes/imageRoute.js';
import summaryRouter from "./routes/summary.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/distance', distanceRoute);

// Routes
app.use('/api/analyze', analyzeRoute);
app.use('/api/image-diagnose', imageRoute);
app.use("/api/summary", summaryRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AI Server running at http://localhost:${PORT}`);
});
