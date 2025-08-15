import express from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

export default router;
