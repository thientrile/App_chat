
import { asyncHandler } from '../../pkg/async/asyncHandler.js';
import express from 'express';
import AccoutRouter from './Account/account.router.js';
import { healthCheck } from '../controller/index.js';
import ProfileRouter from './Profile/profile.router.js';
import RouterMessage from './message.router.js';

const Router =express.Router();
Router.get('/', asyncHandler(healthCheck))

Router.use("/auth",AccoutRouter)
Router.use("/profile",ProfileRouter);
Router.use("/message", RouterMessage);

export default Router;