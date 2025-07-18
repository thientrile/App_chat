
import { asyncHandler } from '@async/asyncHandler';
import { healthCheck } from '@internal/controller/index.controller.js';
import express from 'express';

const Router =express.Router();
Router.get('/health-check', asyncHandler(healthCheck))





export { Router };