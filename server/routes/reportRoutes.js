import express from 'express';
import { generateMonthlyReport } from '../controllers/monthlyReportController.js';

const router = express.Router();

// POST /api/monthly-report
router.post('/monthly-report', generateMonthlyReport);

export default router;
