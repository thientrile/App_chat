import { Config } from "../../global.js";
import { initRedis } from "../../pkg/redis/redis.js";

const { user, pass, host } = Config.redis;

// Tạo redisUrl động theo điều kiện có user/pass
const hasAuth = Boolean(user?.trim() && pass?.trim());

const redisUrl = hasAuth
  ? `redis://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}`
  : `redis://${host}`;

const InitRedis = async () => {
  console.log(`Redis URL: ${redisUrl}`);
  global.RedisClient = await initRedis(redisUrl);
};

export default InitRedis;
