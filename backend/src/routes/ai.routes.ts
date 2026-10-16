import { Router } from 'express';
import { askTutor } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/tutor', authenticate, askTutor);

export default router;
