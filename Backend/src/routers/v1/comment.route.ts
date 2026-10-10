import { Router } from 'express';
import { addCommentHandler, getCommentsHandler } from '../../controllers/comment.controller';
import { authenticateToken } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/:issueId', getCommentsHandler);
router.post('/:issueId', authenticateToken, addCommentHandler);

export default router;
