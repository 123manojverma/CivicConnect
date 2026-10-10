import logger from "../config/logger.config";
import { IssueDTO, StatusEnum } from "../dto/Issuedto";
import { issueRepository } from "../repo/issue.repositiory";
import { DuplicateError } from "../utils/errors/app.error";



export async function createIssueService(data:IssueDTO) {
    const {title, description, category, longitude, latitude, wardId, userId, taggedEntity} = data;
    
    const duplicate = await issueRepository.findNearbyDuplicate({
        category,
        longitude, 
        latitude,
        maxDistance:50
    });

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

export async function getWardIssuesService(wardId:string, status?:StatusEnum){
    return await issueRepository.findByWard({wardId, status});
}

export async function getNgoIssuesService(ngoId: string) {
  return await issueRepository.findByNgo(ngoId);
}

export async function updateIssueStatusService(issueId:string, status:StatusEnum) {
     const allowedStatuses = ['Submitted', 'In Progress', 'Resolved'];

     if(!allowedStatuses.includes(status)){
        throw new Error(`Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`);
     

     const updateIssue = await issueRepository.updateStatus({id:issueId, status});

     if(!updateIssue){
        throw new Error('Issue not found')
     }
     return updateIssue;
}
}

