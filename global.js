// Load configuration
import Mylogger from './pkg/logger/myLogger.js';

import  Configs  from './configs.js';



export const Config = Configs;
export const IO=global.IO
export const Logger = new Mylogger();
export const RedisClient = global.RedisClient; // Placeholder for Redis client, initialized later
