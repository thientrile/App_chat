
import { asyncHandler } from '../../pkg/async/asyncHandler.js';
import express from 'express';
import AccoutRouter from './Account/account.router.js';
import { healthCheck } from '../controller/index.js';

const Router =express.Router();
Router.get('/', asyncHandler(healthCheck))

Router.use("/auth",AccoutRouter)


export default Router;