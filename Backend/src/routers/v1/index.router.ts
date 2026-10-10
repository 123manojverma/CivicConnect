import express from 'express';
import pingRouter from './ping.router';
import issueRouter from './issue.route';
import authRouter from './auth.route';
import ngoRouter from './ngo.route';
import commentRouter from './comment.route';
import notificationRouter from './notification.route';
import uploadRouter from './upload.route';
import aiRouter from './ai.route';
import donationRouter from './donation.route';

const v1Router = express.Router();

v1Router.use('/ping', pingRouter);
v1Router.use('/issue', issueRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/ngo', ngoRouter);
v1Router.use('/comment', commentRouter);
v1Router.use('/notification', notificationRouter);
v1Router.use('/upload', uploadRouter);
v1Router.use('/ai', aiRouter);
v1Router.use('/donation', donationRouter);

export default v1Router;