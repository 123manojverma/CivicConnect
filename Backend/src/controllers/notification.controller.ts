import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getNotificationsService, markAllReadService, getUnreadCountService } from '../services/notification.service';
import { InternalServerError } from '../utils/errors/app.error';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getNotificationsHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const notifications = await getNotificationsService(req.user!.id);
        res.status(StatusCodes.OK).json({ success: true, data: notifications });
    } catch (error) {
        throw new InternalServerError('Failed to fetch notifications');
    }
};

export const markAllReadHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        await markAllReadService(req.user!.id);
        res.status(StatusCodes.OK).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        throw new InternalServerError('Failed to mark notifications');
    }
};

export const getUnreadCountHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const count = await getUnreadCountService(req.user!.id);
        res.status(StatusCodes.OK).json({ success: true, count });
    } catch (error) {
        throw new InternalServerError('Failed to get unread count');
    }
};
