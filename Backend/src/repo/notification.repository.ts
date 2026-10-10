import { INotification, Notification } from "../models/Notification";

class NotificationRepository {
    async create(data: Partial<INotification>) {
        const notif = new Notification(data);
        return await notif.save();
    }

    async createMany(notifications: Partial<INotification>[]) {
        return await Notification.insertMany(notifications);
    }

    async findByUser(userId: string) {
        return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    }

    async markRead(userId: string) {
        return await Notification.updateMany({ userId, read: false }, { read: true });
    }

    async markOneRead(id: string) {
        return await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    }

    async getUnreadCount(userId: string) {
        return await Notification.countDocuments({ userId, read: false });
    }
}

export const notificationRepository = new NotificationRepository();
