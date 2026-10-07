import { Router } from 'express';
import { getUserPerformance, generateAdvice } from '../controllers/aiMentorController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/performance', getUserPerformance);
router.post('/generate-advice', generateAdvice);

export default router;
