import logger from "../config/logger.config";
import { IssueDTO, StatusEnum } from "../dto/Issuedto";
import { issueRepository } from "../repo/issue.repositiory";
import { DuplicateError } from "../utils/errors/app.error";
import { broadcastNotificationToWardService } from "./notification.service";



export async function createIssueService(data:IssueDTO) {
   console.log(1);
   
    const {title, description, category, longitude, latitude, wardId, userId, taggedEntity} = data;
    
    const duplicate = await issueRepository.findNearbyDuplicate({
        category,
        longitude, 
        latitude,
        maxDistance:50
    });
    console.log(duplicate);
    

     if(duplicate){
        logger.error(`Duplicate issue found: ${duplicate._id}`)
        throw new DuplicateError("A similar issue already exists nearby.");
     }

     return await issueRepository.create({
        title,
        description,
        category,
        location:{type:'Point', coordinates:[longitude, latitude]},
        wardId,
        taggedEntity,
        reportedBy:userId,
        upvotedBy:[userId],
        upvotes:1
     });
}

export async function upvoteIssueService(issueId: string, userId: string) {
  const issue = await issueRepository.findById(issueId);

  if (!issue) throw new Error('Issue not found');

  if (issue.upvotedBy.includes(userId)) {
    throw new Error('You have already upvoted this issue');
  }

  issue.upvotedBy.push(userId);
  issue.upvotes += 1;
  return await issueRepository.save(issue);
}

export async function getWardIssuesService(wardId:string, status?:StatusEnum | undefined){
    return await issueRepository.findByWard({wardId, status});
}

export async function getNgoIssuesService(ngoId: string) {
  return await issueRepository.findByNgo(ngoId);
}

export async function updateIssueStatusService(issueId:string, status:StatusEnum) {
     const allowedStatuses = ['Submitted', 'In Progress', 'Resolved'];

     if(!allowedStatuses.includes(status)){
        throw new Error(`Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`);
     }
     const updateIssue = await issueRepository.updateStatus({id:issueId, status});

     if(!updateIssue){
        throw new Error('Issue not found')
     }
     return updateIssue;
}

export async function govMarkCompleteService(issueId: string, completionImage: string) {
    const issue = await issueRepository.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    issue.govMarkedComplete = true;
    issue.govMarkedAt = new Date();
    issue.completionImage = completionImage;
    issue.status = 'In Progress';
    await issue.save();

    await broadcastNotificationToWardService(
        issue.wardId,
        'verify_completion',
        `Government has marked an issue as completed: "${issue.title}". Please verify if the work is done!`,
        issueId
    );

    return issue;
}

export async function voteCompletionService(issueId: string, userId: string, approved: boolean) {
    const issue = await issueRepository.findById(issueId);
    if (!issue) throw new Error('Issue not found');
    if (!issue.govMarkedComplete) throw new Error('Government has not marked this as complete yet');

    const alreadyVoted = issue.completionVotes.find(v => v.userId === userId);
    if (alreadyVoted) throw new Error('You have already voted on this issue');

    issue.completionVotes.push({ userId, approved });

    const total = issue.completionVotes.length;
    const approvedCount = issue.completionVotes.filter(v => v.approved).length;
    const approvalRate = total > 0 ? approvedCount / total : 0;

    if (total >= 3 && approvalRate >= 0.5) {
        issue.status = 'Resolved';
        await broadcastNotificationToWardService(
            issue.wardId,
            'issue_resolved',
            `Issue "${issue.title}" has been verified as resolved by the community!`,
            issueId
        );
    }

    await issue.save();
    return issue;
}

export async function getIssueByIdService(issueId: string) {
    const issue = await issueRepository.findById(issueId);
    if (!issue) throw new Error('Issue not found');
    return issue;
}
