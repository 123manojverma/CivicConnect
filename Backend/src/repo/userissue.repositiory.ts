import logger from "../config/logger.config";
import { IssueDTO } from "../dto/Issuedto";
import { Issue } from "../models/Issue";
import { DuplicateError } from "../utils/errors/app.error";

export async function createIssue(data:IssueDTO){
  const {title,description,category,longitude,latitude,wardId,userId,taggedEntity} = data
  //Duplication Check
  const duplicate = await Issue.findOne({
    data:category,
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
    category,
    location:{type:"Point",coordinates:[longitude,latitude]},
    wardId,
    taggedEntity,
    upvotedBy:[userId],
    upvotes:1
  })

  await newIssue.save()
  return newIssue 
}

