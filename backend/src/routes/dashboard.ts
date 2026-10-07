import { Router } from 'express';
import { 
  getActivities, 
  addActivity, 
  getDailyPlan, 
  updateDailyPlan, 
  getDailyChallenge, 
  completeDailyChallenge 
} from '../controllers/dashboardController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/activities', getActivities);
router.post('/activities', addActivity);

router.get('/daily-plan', getDailyPlan);
router.post('/daily-plan', updateDailyPlan);

router.get('/daily-challenge', getDailyChallenge);
router.post('/daily-challenge/:id/complete', completeDailyChallenge);

export default router;
