import { Router } from "express";
import { createIssueHandler, getNGOIssuesHandler, getWardIssuesHandler, updateIssueStatusHandler, upvoteIssueHandler, govMarkCompleteHandler, voteCompletionHandler, getIssueByIdHandler } from "../../controllers/issue.controller";
import { authenticateToken } from "../../middlewares/authMiddleware";

const router = Router();

router.post('/create', authenticateToken, createIssueHandler);
router.get('/:id', getIssueByIdHandler);
router.patch('/:id/upvote', authenticateToken, upvoteIssueHandler);
router.get('/ward/:wardId', getWardIssuesHandler);
router.get('/ngo/:ngoId', getNGOIssuesHandler);
router.patch('/:id/status', authenticateToken, updateIssueStatusHandler);
router.patch('/:id/gov-complete', authenticateToken, govMarkCompleteHandler);
router.post('/:id/vote-completion', authenticateToken, voteCompletionHandler);

export default router;