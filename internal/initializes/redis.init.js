import { Logger } from "../../global/global.js";
import { CreateRedis,  } from "../../pkg/redis/redis.js"
import { Config } from "../../global/global.js";
const { user, pass, host } = Config.redis;
const redisUser = encodeURIComponent(user);
const redisPass = encodeURIComponent(pass);

const redisUrl = `redis://${redisUser}:${redisPass}@${host}`;

const InitRedis=  ()  =>{
    CreateRedis(redisUrl);
  Logger.info('Redis system initialized successfully' )
    
}
export default InitRedis;