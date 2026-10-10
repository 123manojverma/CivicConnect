import { IComment, Comment } from "../models/Comment";

class CommentRepository {
    async create(data: Partial<IComment>) {
        const comment = new Comment(data);
        return await comment.save();
    }

    async findByIssue(issueId: string) {
        return await Comment.find({ issueId }).sort({ createdAt: -1 });
    }

    async deleteById(id: string) {
        return await Comment.findByIdAndDelete(id);
    }
}

export const commentRepository = new CommentRepository();
