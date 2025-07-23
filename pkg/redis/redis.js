/** @format */

"use strict";

import { createClient } from "redis";
import { dbLogger } from "../logger/index.js";
import { Consts } from "../../internal/const/consts.js";

const RedisStatus = {
  CONNECT: "connect",
  END: "end",
  RECONNECT: "reconnecting",
  ERROR: "error",
};

let retryCount = 0;
const maxRetries = Consts.Retry || 3;
let connectionTimeout;

const redisClient = {
  instance: null,
};

const forceCloseConnection = async () => {
  try {
    if (redisClient.instance?.isOpen) {
      await redisClient.instance.disconnect();
      dbLogger.disconnect("Redis");

      dbLogger.query("Force Close", 0, {
        reason: "force_close_initiated",
        connectionState: "closed",
      });
    }
  } catch (error) {
    dbLogger.error("Redis Force Close", error, {
      operation: "force_disconnect",
      graceful: false,
    });
  } finally {
    redisClient.instance = null;
    retryCount = 0;
    clearTimeout(connectionTimeout);
  }
};

const handleTimeoutError = () => {
  connectionTimeout = setTimeout(async () => {
    dbLogger.error(
      "Redis",
      new Error(Consts.REDIS_CONNECT_MESSAGE.message.en),
      {
        code: Consts.REDIS_CONNECT_MESSAGE.code,
        timeout: Consts.REDIS_CONNECT_TIMEOUT,
        reason: "connection_timeout",
      }
    );
    await forceCloseConnection();
    throw new RedisErrorRespoint(
      Consts.REDIS_CONNECT_MESSAGE.message.en,
      Consts.REDIS_CONNECT_MESSAGE.code
    );
  }, Consts.REDIS_CONNECT_TIMEOUT);
};

const handleRedisEvents = (instance) => {
  instance.on(RedisStatus.CONNECT, () => {
    dbLogger.connect("Redis");
    retryCount = 0;
    clearTimeout(connectionTimeout);
  });

  instance.on(RedisStatus.END, () => {
    dbLogger.disconnect("Redis");
  });

  instance.on(RedisStatus.RECONNECT, () => {
    retryCount++;
    dbLogger.reconnect("Redis");

    if (retryCount >= maxRetries) {
      dbLogger.error(
        "Redis",
        new Error(`Max retries (${maxRetries}) exceeded during reconnect`),
        {
          retryCount,
          maxRetries,
          finalAttempt: true,
          errorSource: "reconnect_max_retries_exceeded",
        }
      );
      setTimeout(forceCloseConnection, 1000);
      return;
    }

    dbLogger.query("Reconnect Attempt", 0, {
      attempt: retryCount,
      maxRetries,
      retryStatus: `${retryCount}/${maxRetries}`,
      source: "reconnect_event",
    });

    handleTimeoutError();
  });

  instance.on(RedisStatus.ERROR, (err) => {
    retryCount++;
    dbLogger.error("Redis", err, {
      retryCount,
      maxRetries,
      retryAttempt: `${retryCount}/${maxRetries}`,
      errorSource: "event_handler",
    });

    if (retryCount >= maxRetries) {
      dbLogger.error(
        "Redis",
        new Error(`Max retries (${maxRetries}) exceeded`),
        {
          retryCount,
          maxRetries,
          finalAttempt: true,
          errorSource: "error_max_retries_exceeded",
        }
      );
      setTimeout(forceCloseConnection, 1000);
      return;
    }

    handleTimeoutError();
  });
};

const initRedis = (url) => {
  if (!global.RedisClient) {
    const instance = createClient({ url });
    redisClient.instance = instance;
    handleRedisEvents(instance);

    const connect = async () => {
      try {
        dbLogger.query("Initial Connection Attempt", 0, {
          attempt: 1,
          maxRetries,
        });
        await instance.connect();
      } catch (err) {
        dbLogger.error("Redis", err, {
          errorSource: "initial_connection_attempt",
          willRetryViaEvents: true,
        });
      }
    };

    connect();
    global.RedisClient = redisClient.instance;
  }

  return global.RedisClient;
};


const closeRedis = async () => {
  try {
    if (redisClient.instance?.isOpen) {
      await redisClient.instance.quit();
      dbLogger.disconnect("Redis");
    } else {
      dbLogger.query("Close Attempt", 0, {
        status: "No active connection to close",
      });
    }
  } catch (error) {
    dbLogger.error("Redis Close", error, {
      operation: "disconnect",
      graceful: false,
    });
  } finally {
    redisClient.instance = null;
    retryCount = 0;
  }
};

const getRetryInfo = () => ({
  current: retryCount,
  max: maxRetries,
  remaining: maxRetries - retryCount,
  status: `${retryCount}/${maxRetries}`,
});

const resetRetryCount = () => {
  retryCount = 0;
  dbLogger.query("Retry Reset", 0, {
    action: "retry_count_reset",
    newCount: retryCount,
  });
};

const isConnected = () => redisClient.instance?.isOpen;

export {
  initRedis,
  closeRedis,
  getRetryInfo,
  resetRetryCount,
  isConnected,
  forceCloseConnection,
};
