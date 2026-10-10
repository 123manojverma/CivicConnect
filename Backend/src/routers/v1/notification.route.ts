import { Router } from 'express';
import { getNotificationsHandler, markAllReadHandler, getUnreadCountHandler } from '../../controllers/notification.controller';
import { authenticateToken } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getNotificationsHandler);
router.get('/unread-count', authenticateToken, getUnreadCountHandler);
router.patch('/mark-read', authenticateToken, markAllReadHandler);

export default router;
