import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../utils/errors/app.error";
import { StatusCodes } from "http-status-codes";
import { createIssueService } from "../services/issue.ervice";


export async function createIssueHandler(req:Request,res:Response,next:NextFunction){
  try {
    const response = await createIssueService(req.body)
    res.status(StatusCodes.OK).json({
      message:`Issue Created Successfully`,
      data:response,
      success:true
    })
  } catch (error) {
    throw new InternalServerError("Internal Server Error")
  }
}