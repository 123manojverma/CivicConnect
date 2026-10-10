import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../config/logger.config";
import { DuplicateError, InternalServerError } from "../utils/errors/app.error";
import { createIssueService, getNgoIssuesService, getWardIssuesService, updateIssueStatusService, upvoteIssueService } from "../services/issue.service";
import { StatusEnum } from "../dto/Issuedto";

export const createIssueHandler = async(req:Request,res:Response)=>{
  try {
    const issue = await createIssueService(req.body);
    res.status(StatusCodes.CREATED).json({
      message:`Issue Created Successfully`,
      success:true,
      data:issue
    })
  } catch (error) {
    if (error instanceof DuplicateError) {
      throw new DuplicateError(`Duplicate Request`)
    }
    logger.error("Internal Server Error: ",error)
    throw new InternalServerError("Internal Server Error")
  }
}

export const upvoteIssueHandler = async(req:Request,res:Response)=>{
  try {
    const {id} = req.params
    const {userId} = req.body 
    const issue = await upvoteIssueService(id,userId);
    res.status(StatusCodes.OK).json({
      message:`Upvoted Successfully`,
      success:true,
      issue,
      isDuplicate:false 
    })
  } catch (error:any) {
    throw new InternalServerError("Internal Server Error")
  }
}

export const getWardIssuesHandler = async(req:Request,res:Response)=>{
  try {
    const {wardId} = req.params
    const {status} = req.query
    const issue = await getWardIssuesService(
      wardId,
      typeof status === "string" ? (status as StatusEnum) : undefined
    );
    res.status(StatusCodes.OK).json({
      message:`Upvoted Successfully`,
      issue,
      success:true 
    })
  } catch (error) {
    throw new InternalServerError("Internal Server Error")
  }
}

export const getNGOIssuesHandler = async(req:Request,res:Response)=>{
  try {
    const {ngoId} = req.params
    const issue = await getNgoIssuesService(ngoId);
    res.status(StatusCodes.OK).json({
      message:`Ngo Service Fetched`,
      data:issue,
      success:true,
      count:issue.length 
    })
  } catch (error) {
    throw new InternalServerError("Internal Server Error")
  }
}


export const updateIssueStatusHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const issue = await updateIssueStatusService(id, status);
    res.status(200).json({ success: true, message: 'Status updated successfully', issue });
  } catch (error: any) {
    throw new InternalServerError("Internal Server Error")
  }
};