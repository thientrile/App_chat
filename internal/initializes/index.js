// Load global constants first

import InitError from "./error.init.js";
import InitMiddle from "./midleware.init.js";
import InitMongoDB from "./mongodb.init.js";
import InitRouter from "./router.init.js";
import InitRedis from "./redis.init.js";
import express from 'express';
import { createServer } from 'http';
import InitSocketIo from "./socketIo.init.js";
import InitFirebase from "./firebase.ini.js";
const app = express();






await InitRedis()
// Initialize middleware
InitMiddle(app);

InitFirebase();

InitMongoDB();
// Initialize routes
InitRouter(app);





const httpServer = createServer(app);
// init access control
InitSocketIo(httpServer, global.RedisClient);
InitError(app);
export { httpServer };
