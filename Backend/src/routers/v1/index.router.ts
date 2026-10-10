import express from 'express';
import pingRouter from './ping.router';
import issueRouter from './issueRoutes';

const v1Router = express.Router();


v1Router.use('/ping', pingRouter);
v1Router.use('/issue', issueRouter);

export default v1Router