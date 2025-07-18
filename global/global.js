// Load configuration
import Config from '../configs/local.js';
import Mylogger from '../pkg/logger/myLogger.js';
import { getRedis } from '../pkg/redis/redis.js';

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

// Lazy-loaded Redis client to avoid initialization issues
function getRedisClient() {
    const client = getRedis().intanceConnect;
    if (!client) {
        console.warn('Redis client not initialized yet');
        return null;
    }
    return client;
}

export {
    Config,
    // getRedis,
    // getRedisClient,
    // getIo
};

export const Logger = new Mylogger();
export const Io = getIo;
export const RedisClient = getRedisClient;