import { IssueDTO } from "../dto/Issuedto";
import { createIssue } from "../repo/userissue.repositiory";

export async function createIssueService(data:IssueDTO){
  const response = await createIssue(data);
  return response
}

export async function getWardIssues(){
     
}  