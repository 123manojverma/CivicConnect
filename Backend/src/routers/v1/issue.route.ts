import { Router } from "express";
import { createIssueHandler, getNGOIssuesHandler, getWardIssuesHandler, updateIssueStatusHandler, upvoteIssueHandler } from "../../controllers/issue.controller";


const router = Router();

// POST /api/issues
router.post('/create', createIssueHandler);

// PATCH /api/issues/:id/upvote
router.patch('/:id/upvote', upvoteIssueHandler);

// GET /api/issues/ward/:wardId?status=In Progress
router.get('/ward/:wardId', getWardIssuesHandler);

// GET /api/issues/ngo/:ngoId
router.get('/ngo/:ngoId', getNGOIssuesHandler);

// PATCH /api/issues/:id/status
router.patch('/:id/status', updateIssueStatusHandler);

export default router;