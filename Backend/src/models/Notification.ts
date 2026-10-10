import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
    userId: string;
    type: 'issue_upvoted' | 'verify_completion' | 'issue_resolved' | 'new_issue_in_ward' | 'ngo_request';
    message: string;
    issueId?: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['issue_upvoted', 'verify_completion', 'issue_resolved', 'new_issue_in_ward', 'ngo_request'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    issueId: {
        type: String
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Notification = model<INotification>('Notification', NotificationSchema);
