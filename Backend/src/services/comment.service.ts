import { commentRepository } from '../repo/comment.repository';

export async function addCommentService(issueId: string, userId: string, userName: string, content: string, userAvatar?: string) {
    return await commentRepository.create({ issueId: issueId as any, userId, userName, userAvatar, content });
}

export async function getCommentsService(issueId: string) {
    return await commentRepository.findByIssue(issueId);
}
