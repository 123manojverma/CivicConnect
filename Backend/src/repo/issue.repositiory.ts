import logger from "../config/logger.config";
import { DuplicateError } from "../utils/errors/app.error";

export async function createIssue(data:IssueDTO){
  //Duplication Check
  const duplicate = await Issue.findOne({
    category,
    status:{$ne:'Resolved'},
    location:{
      $near:{
        $geometry:{type:"Point",coordinates:[longitude,latitude]},
        $maxDistance:50
      }
    }
  });

  if (duplicate) {
    logger.error(`Duplicate Found ${duplicate.id}`)
    throw new DuplicateError("Similar Issue Found")
  }

  const newIssue = new Issue({
    title,
    description,
  })
}

