import { Logger } from "../../global.js";
import { Consts } from "../../internal/const/consts.js";

/**
 * Set data in Redis.
 * @param {string} key - The key to save in Redis.
 * @param {any} value - The value to save.
 * @param {number} expireTime - (optional) Expiration time in seconds.
 */
const setData = async (key, value, expireTime) => {
  try {
    const data = JSON.stringify(value);
    if (expireTime) {
      await global.RedisClient.setEx(key, expireTime, data);
    } else {
      await global.RedisClient.set(key, data);
    }
  } catch (err) {
    console.error("Redis setData error:", err);
    return null;
  }
};

/**
 * Get data from Redis.
 * @param {string} key - The Redis key.
 * @returns {Promise<any>}
 */
const getData = async (key) => {
  try {
    const data = await global.RedisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis getData error:", err);
    return null;
  }
};

/**
 * Delete a key from Redis.
 * @param {string} key - The key to delete.
 * @returns {Promise<number>} - 1 if deleted, 0 if not found.
 */
const delKey = async (key) => {
  try {
    return await global.RedisClient.del(key);
  } catch (err) {
    console.error("Redis delKey error:", err);
    return 0;
  }
};

/**
 * Push one or more values to a Redis List.
 * @param {string} key - The Redis key.
 * @param {...string} values - One or more values to push.
 * @returns {Promise<number>} - New list length.
 */
const pushToArray = async (key, ...values) => {
  try {
    const type = await global.RedisClient.type(key);
    if (type !== 'none' && type !== 'list') {
      throw new Error(`Expected list but found type: ${type}`);
    }

    const strValues = values.map((v) => v.toString());
    return await global.RedisClient.rPush(key, ...strValues);
  } catch (err) {
    console.error("Redis pushToArray error:", err);
    return null;
  }
};





/**
 * Get all items from a Redis List.
 * @param {string} key - The Redis key.
 * @returns {Promise<string[]>}
 */
const getArray = async (key) => {
  try {
    return await global.RedisClient.lRange(key, 0, -1);
  } catch (err) {
    console.error("Redis getArray error:", err);
    return [];
  }
};

/**
 * Remove a value from a Redis List.
 * @param {string} key - The Redis key.
 * @param {string} value - The value to remove.
 * @param {number} count - Number of occurrences to remove (0 = all).
 * @returns {Promise<number>} - Number of removed elements.
 */
const removeFromArray = async (key, value, count = 0) => {
  try {
    return await global.RedisClient.lRem(key, count, value);
  } catch (err) {
    console.error("Redis removeFromArray error:", err);
    return 0;
  }
};

/**
 * Increment a key's value, and optionally set expiration.
 * @param {string} key - The Redis key.
 * @param {number} ttl - Time-to-live in seconds if key is new.
 * @returns {Promise<number>}
 */
const incr = async (key, ttl = 60) => {
  try {
    const result = await global.RedisClient.incr(key);
    if (result === 1) {
      await global.RedisClient.expire(key, ttl);
    }
    return result;
  } catch (err) {
    console.error("Redis incr error:", err);
    return 0;
  }
};
const sAdd= async(key, value) => {
  try {
    return await global.RedisClient.sAdd(key, value);
  } catch (err) {
    console.error("Redis sAdd error:", err);
    return 0;
  }
}
const sRem = async (key, value) => {
  try {
    return await global.RedisClient.sRem(key, value);
  } catch (err) {
    console.error("Redis sRem error:", err);
    return 0;
  }
}
const sIsMember = async (key, value) => {
  try {
    return await global.RedisClient.sIsMember(key, value);
  } catch (err) {
    console.error("Redis sIsMember error:", err);
    return false;
  }
}
const sCard= async (key) => {
  try {
    return await global.RedisClient.sCard(key);
  } catch (err) {
    console.error("Redis sCard error:", err);
    return 0;
  }
}

const sMembers= async (key) => {
  try {
    return await global.RedisClient.sMembers(key);
  } catch (err) {
    console.error("Redis sMembers error:", err);
    return [];
  }
}




export {
 
  setData,
  getData,
  incr,
  delKey,
  pushToArray,
  getArray,
  removeFromArray,
  sAdd,
  sRem,
  sIsMember,
  sCard,
  sMembers
};
