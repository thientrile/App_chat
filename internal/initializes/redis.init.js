import { Config } from "../../global.js";
import { initRedis } from "../../pkg/redis/redis.js";

const { user, pass, host } = Config.redis;

// Tạo redisUrl động theo điều kiện có user/pass
let redisUrl = "";

if (user && pass) {
  const redisUser = encodeURIComponent(user);
  const redisPass = encodeURIComponent(pass);
  redisUrl = `redis://${redisUser}:${redisPass}@${host}`;
} else {
  redisUrl = `redis://${host}`; // Local không auth
}

const InitRedis = async () => {
  global.RedisClient = await initRedis(redisUrl);
};

export default InitRedis;
