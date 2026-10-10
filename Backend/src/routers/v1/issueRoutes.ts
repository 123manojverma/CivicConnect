import { Router } from "express";
import { createIssueHandler } from "../../controllers/issue.controller";

const issueRouter = Router()

issueRouter.post('/create', createIssueHandler);

export default issueRouter;