import { Config } from "../../global.js";
import { initRedis } from "../../pkg/redis/redis.js";
const { user, pass, host } = Config.redis;
const redisUser = encodeURIComponent(user);
const redisPass = encodeURIComponent(pass);

const redisUrl = `redis://${redisUser}:${redisPass}@${host}`;

const InitRedis=  async ()  =>{
    global.RedisClient =await initRedis(redisUrl);
    
}
export default InitRedis;