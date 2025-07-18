
import { asyncHandler } from '../../pkg/async/asyncHandler.js';
import { healthCheck } from '../controller/index.controller.js';
import express from 'express';

const Router =express.Router();
Router.get('/health-check', asyncHandler(healthCheck))





export { Router };