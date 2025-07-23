// Load configuration
import Config from '../configs/local.js';
import Mylogger from '../pkg/logger/myLogger.js';


// Lazy-loaded Socket.IO to avoid circular dependency
let io = null;

async function getIo() {
    if (!io) {
        const { httpServer } = await import('@initializes/index.js');
        const socketIO = await import('socket.io');
        io = socketIO.default(httpServer);
    }
    return io;
}



export {
    Config,
    // getRedis,
    // getRedisClient,
    // getIo
};

export const Logger = new Mylogger();
export const RedisClient = global.RedisClient; // Placeholder for Redis client, initialized later
