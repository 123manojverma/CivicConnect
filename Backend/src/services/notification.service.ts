import { notificationRepository } from '../repo/notification.repository';

export async function getNotificationsService(userId: string) {
    return await notificationRepository.findByUser(userId);
}

export async function markAllReadService(userId: string) {
    return await notificationRepository.markRead(userId);
}

export async function getUnreadCountService(userId: string) {
    return await notificationRepository.getUnreadCount(userId);
}

export async function createNotificationService(userId: string, type: any, message: string, issueId?: string) {
    return await notificationRepository.create({ userId, type, message, issueId });
}

export async function broadcastNotificationToWardService(wardId: string, type: any, message: string, issueId: string) {
    const { User } = await import('../models/User');
    const users = await User.find({ wardId, role: 'Citizen' }).select('_id');
    const notifications = users.map(u => ({
        userId: u._id.toString(),
        type,
        message,
        issueId
    }));
    if (notifications.length > 0) {
        await notificationRepository.createMany(notifications);
    }
}
