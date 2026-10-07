import { Router } from 'express';
import { startSession, getSessions, getSessionById, submitAnswer, completeSession } from '../controllers/mockInterviewController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.post('/start', startSession);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionById);
router.post('/sessions/:id/answer', submitAnswer);
router.post('/sessions/:id/complete', completeSession);

export default router;
