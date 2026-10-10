import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
    issueId: Types.ObjectId;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
    issueId: {
        type: Schema.Types.ObjectId,
        ref: 'Issue',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userAvatar: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Comment = model<IComment>('Comment', CommentSchema);
