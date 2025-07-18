/** @format */

"use strict";

import { Consts } from "../../internal/const/consts.js";
import { RedisErrorRespoint } from "../response/error.js";
import { dbLogger } from "../logger/utils.js";
import { createClient } from "redis";

let client = {},
  retryCount = 0,
  maxRetries = Consts.Retry || 3,
  statusConnectRedis = {
    CONNECT: "connect",
    END: "end",
    RECONNECT: "reconnecting",
    ERROR: "error",
  },
  connectionTimeout;

// Force close connection (used when max retries exceeded)
const forceCloseConnection = async () => {
  try {
    if (client.intanceConnect) {
      if (client.intanceConnect.isOpen) {
        await client.intanceConnect.disconnect();
      }
      dbLogger.disconnect("Redis");
      dbLogger.query("Force Close", 0, { 
        reason: "force_close_initiated",
        connectionState: "closed"
      });
    }
  } catch (error) {
    dbLogger.error("Redis Force Close", error, { 
      operation: "force_disconnect",
      graceful: false
    });
  } finally {
    client = {};
    retryCount = 0;
    clearTimeout(connectionTimeout);
  }
};

const handleTimeoutError = () => {
  connectionTimeout = setTimeout(async () => {
    dbLogger.error("Redis", new Error(Consts.REDIS_CONNECT_MESSAGE.message.en), {
      code: Consts.REDIS_CONNECT_MESSAGE.code,
      timeout: Consts.REDIS_CONNECT_TIMEOUT,
      reason: "connection_timeout"
    });
    
    // Force close connection on timeout
    await forceCloseConnection();
    
    throw new RedisErrorRespoint(
      Consts.REDIS_CONNECT_MESSAGE.message.en,
      Consts.REDIS_CONNECT_MESSAGE.code
    );
  }, Consts.REDIS_CONNECT_TIMEOUT);
};
const handleEventConnect = ({ connectingRedis }) => {
  // check if connecting is null
  connectingRedis.on(statusConnectRedis.CONNECT, () => {
    dbLogger.connect("Redis");
    retryCount = 0; // Reset retry count on successful connection
    // clear timeout
    clearTimeout(connectionTimeout);
  });

  connectingRedis.on(statusConnectRedis.END, () => {
    dbLogger.disconnect("Redis");
  });

  connectingRedis.on(statusConnectRedis.RECONNECT, () => {
    retryCount++; // Increment retry count on reconnect
    dbLogger.reconnect("Redis");
    
    // Check if max retries exceeded during reconnect
    if (retryCount >= maxRetries) {
      dbLogger.error("Redis", new Error(`Max retries (${maxRetries}) exceeded during reconnect`), { 
        retryCount, 
        maxRetries,
        finalAttempt: true,
        errorSource: "reconnect_max_retries_exceeded"
      });
      
      // Force close connection
      setTimeout(async () => {
        await forceCloseConnection();
      }, 1000);
      return;
    }
    
    // Log retry info
    dbLogger.query("Reconnect Attempt", 0, { 
      attempt: retryCount,
      maxRetries: maxRetries,
      retryStatus: `${retryCount}/${maxRetries}`,
      source: "reconnect_event"
    });
    
    // connect timeout
    handleTimeoutError();
  });

  connectingRedis.on(statusConnectRedis.ERROR, (err) => {
    retryCount++; // Increment retry count on error
    
    dbLogger.error("Redis", err, { 
      retryCount, 
      maxRetries,
      retryAttempt: `${retryCount}/${maxRetries}`,
      errorSource: "event_handler"
    });
    
    // Check if max retries exceeded
    if (retryCount >= maxRetries) {
      dbLogger.error("Redis", new Error(`Max retries (${maxRetries}) exceeded`), { 
        retryCount, 
        maxRetries,
        finalAttempt: true,
        errorSource: "error_max_retries_exceeded"
      });
      
      // Force close connection after max retries
      setTimeout(async () => {
        await forceCloseConnection();
      }, 1000);
      return;
    }
    
    handleTimeoutError();
  });
};

const CreateRedis = (url) => {
  const instanceRedis = createClient({ url: url });
  client.intanceConnect = instanceRedis;

  handleEventConnect({
    connectingRedis: instanceRedis,
  });
  const connectRedis = async () => {
    try {
      dbLogger.query("Initial Connection Attempt", 0, { 
        attempt: 1,
        maxRetries: maxRetries
      });
      
      await instanceRedis.connect();
      
    } catch (err) {
      dbLogger.error("Redis", err, { 
        errorSource: "initial_connection_attempt",
        willRetryViaEvents: true
      });
      
      // Event handlers will handle retries automatically
      // No need for manual retry logic here
    }
  };

  connectRedis();
};
const getRedis = () => client;

// Get current retry information
const getRetryInfo = () => ({
  current: retryCount,
  max: maxRetries,
  remaining: maxRetries - retryCount,
  status: `${retryCount}/${maxRetries}`
});

// Reset retry count
const resetRetryCount = () => {
  retryCount = 0;
  dbLogger.query("Retry Reset", 0, { 
    action: "retry_count_reset",
    newCount: retryCount
  });
};

// Check if connection is available
const isConnected = () => {
  return client.intanceConnect && client.intanceConnect.isOpen;
};

const closeRedis = async () => {
  try {
    if (client.intanceConnect) {
      // Gracefully disconnect from Redis
      await client.intanceConnect.quit(); // Use quit() for proper shutdown
      dbLogger.disconnect("Redis");
    } else {
      dbLogger.query("Close Attempt", 0, { 
        status: "No active connection to close" 
      });
    }
  } catch (error) {
    // Log any errors during the closing process
    dbLogger.error("Redis Close", error, { 
      operation: "disconnect",
      graceful: false
    });
    // Optionally, re-throw or handle the error in a way that suits your application
  } finally {
    // Ensure the client object is reset, indicating no active connection
    client = {};
    retryCount = 0; // Reset retry count
  }
};
export {
  CreateRedis,
  getRedis,
  closeRedis,
  getRetryInfo,
  resetRetryCount,
  isConnected,
  forceCloseConnection,
};
