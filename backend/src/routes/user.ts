import { Router } from 'express';
import { getUserProfile, updateEnergy } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.post('/energy', updateEnergy);

export default router;
