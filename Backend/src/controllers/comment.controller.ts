import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { addCommentService, getCommentsService } from '../services/comment.service';
import { InternalServerError } from '../utils/errors/app.error';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const addCommentHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { issueId } = req.params;
        const { content, userName, userAvatar } = req.body;
        const userId = req.user!.id;
        const comment = await addCommentService(issueId, userId, userName, content, userAvatar);
        res.status(StatusCodes.CREATED).json({ success: true, data: comment });
    } catch (error) {
        throw new InternalServerError('Failed to add comment');
    }
};

export const getCommentsHandler = async (req: Request, res: Response) => {
    try {
        const { issueId } = req.params;
        const comments = await getCommentsService(issueId);
        res.status(StatusCodes.OK).json({ success: true, data: comments, count: comments.length });
    } catch (error) {
        throw new InternalServerError('Failed to fetch comments');
    }
};
