import { Router } from 'express';
import { startArena, getArenaSession, submitSnapshot, completeArena } from '../controllers/arenaController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.post('/start', startArena);
router.get('/:id', getArenaSession);
router.post('/:id/snapshot', submitSnapshot);
router.post('/:id/complete', completeArena);

export default router;
