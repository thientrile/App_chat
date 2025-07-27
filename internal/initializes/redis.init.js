import { Config } from "../../global.js";
import { initRedis } from "../../pkg/redis/redis.js";
const { user, pass, host } = Config.redis;

const redisUser = encodeURIComponent(user);
const redisPass = encodeURIComponent(pass);
let redisUrl = `redis://${redisUser}:${redisPass}@${host}`;
if(user && pass ) {
 redisUrl = `redis://${host}`;
}

const InitRedis=  async ()  =>{
    global.RedisClient =await initRedis(redisUrl);
    
}
export default InitRedis;