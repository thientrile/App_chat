// Load global constants first

import InitLogger from "./logger.init.js";
import InitError from "./error.init.js";
import InitMiddle from "./midleware.init.js";
import InitMongoDB from "./mongodb.init.js";
import InitRouter from "./router.init.js";
import InitRedis from "./redis.init.js";
import express from 'express';
import { requestLogger, systemLogger } from "@logger/index.js";
import { createServer } from 'http';
const app = express();
app.use(requestLogger);

// Initialize all systems
async function initializeApp() {
  // Initialize logger system first
  await InitLogger();
  // initialize Redis
  InitRedis()
  // Initialize middleware
  InitMiddle(app);
  
  // Initialize MongoDB connection
  InitMongoDB();
  // Initialize routes
  InitRouter(app);
  
  // Initialize error handling (should be last)
  InitError(app);
}

// Run initialization
await initializeApp();




  
  // Setup request logging middleware early
  
  
  // Initialize all systems (includes error handling)
  
  
  // Log server creation
  // systemLogger.startup('HTTP Server', 'Created');
  
const httpServer = createServer(app);
export { httpServer };
