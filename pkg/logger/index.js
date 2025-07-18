/** @format */

import MyLogger from './myLogger.js';
import {
  requestLogger,
  errorLogger,
  dbLogger,
  authLogger,
  apiLogger,
  systemLogger,
  securityLogger,
  userActivityLogger
} from './utils.js';
import systemMonitor from './monitor.js';
import { userActivityMiddleware, unauthorizedActivityMiddleware } from './userActivityMiddleware.js';

export {
  // Main logger class
  MyLogger,
  
  // Middleware
  requestLogger,
  errorLogger,
  userActivityMiddleware,
  unauthorizedActivityMiddleware,
  
  // Specialized loggers
  dbLogger,
  authLogger,
  apiLogger,
  systemLogger,
  securityLogger,
  userActivityLogger,
  
  // System monitoring
  systemMonitor,
};
