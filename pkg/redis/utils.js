
/**
 * Set data in Redis.
 * @param {string} key - The key to save in Redis.
 * @param {any} value - The value to save.
 * @param {number} expireTime - (optional) Expiration time in seconds.
 * @returns {Promise<string>} - Returns the result of the set operation.
 */
const setData = async (key, value, expireTime) => {
  try {
    const data = JSON.stringify(value);

    if (expireTime) {
      await  global.RedisClient.setEx(key, expireTime, data); // Using setEx for expiration
    } else {
      await  global.RedisClient.set(key, data); // Simple set without expiration
    }
  } catch (err) {
    console.error("redis error".err);
  }
};
const getData = async (key) => {
  const data = await  global.RedisClient.get(key);
  return JSON.parse(data);
};

const incr = async (key, ttl = 60) => {
  try {
    const result = await  global.RedisClient.incr(key);
    if (result === 1) {
      await  global.RedisClient.expire(key, ttl);
    }
    return result;
  } catch (err) {
    console.error("redis error".err);
  }
};
export { setData, getData, incr };