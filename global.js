// Load configuration
import Config from './configs.js';
import Mylogger from './pkg/logger/myLogger.js';




export {
    Config,
    // getRedis,
    // getRedisClient,
    // getIo
};
export const IO=global.IO
export const Logger = new Mylogger();
export const RedisClient = global.RedisClient; // Placeholder for Redis client, initialized later
