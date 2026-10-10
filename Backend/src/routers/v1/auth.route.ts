import { Router } from 'express';
import { registerHandler, loginHandler, logoutHandler, getMeHandler, updateProfileHandler } from '../../controllers/auth.controller';
import { authenticateToken } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.get('/me', authenticateToken, getMeHandler);
router.put('/profile', authenticateToken, updateProfileHandler);

export default router;

