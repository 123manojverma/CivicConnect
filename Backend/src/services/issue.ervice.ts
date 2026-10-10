export async function createIssueService(data:IssueDTO){
  const response = await createIssue(data);
  return response
}