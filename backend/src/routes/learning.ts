import { Router } from 'express';
import { 
  getLearningPath,
  generateLearningPath,
  completeStep,
  getRevisionItems
} from '../controllers/learningController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/path', getLearningPath);
router.post('/path/generate', generateLearningPath);
router.post('/path/complete-step', completeStep);
router.get('/revision', getRevisionItems);

export default router;
