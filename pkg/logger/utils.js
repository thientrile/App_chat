import { Logger } from "../../global/global.js";
import UserActivity from "./UserActivity/UserActivity.model.js";

// Helper function to get request ID or generate one
const getRequestId = (req) => {
  if (!req.requestId) {
    req.requestId = Math.random().toString(36).substr(2, 9);
  }
  return req.requestId;
};

// Helper function to get session ID
const getSessionId = (req) => {
  return req.session?.id || req.sessionID || req.get('x-session-id') || getRequestId(req);
};

// Helper function to format request metadata nicely
const getRequestMetadata = (req, additionalData = {}) => {
  return {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown',
    method: req.method,
    url: req.originalUrl || req.url,
    protocol: req.protocol,
    httpVersion: req.httpVersion,
    ...additionalData
  };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = getRequestId(req);
  
  // Log incoming request with beautiful formatting
  Logger.info(`📥 ${req.method} ${req.originalUrl}`, ['REQUEST', req, getRequestMetadata(req, {
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    host: req.get('Host'),
  })]);

  // Log response when request finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
    
    // Get status icon
    const getStatusIcon = (statusCode) => {
      if (statusCode >= 200 && statusCode < 300) return '✅';
      if (statusCode >= 300 && statusCode < 400) return '🔄';
      if (statusCode >= 400 && statusCode < 500) return '⚠️';
      if (statusCode >= 500) return '❌';
      return '❓';
    };

    const statusIcon = getStatusIcon(res.statusCode);
    const durationColor = duration > 1000 ? '🐌' : duration > 500 ? '⏳' : '⚡';
    
    Logger[level](`${statusIcon} ${req.method} ${req.originalUrl} - ${res.statusCode}`, ['RESPONSE', req, {
      ...getRequestMetadata(req),
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      durationIcon: durationColor,
      contentLength: res.get('Content-Length'),
      contentType: res.get('Content-Type'),
    }]);
  });

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const errorMetadata = {
    ...getRequestMetadata(req),
    errorName: err.name,
    errorMessage: err.message,
    statusCode: err.statusCode || err.status || 500,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  };

  // Add additional error context if available
  if (err.code) errorMetadata.errorCode = err.code;
  if (err.errno) errorMetadata.errno = err.errno;
  if (err.syscall) errorMetadata.syscall = err.syscall;

  Logger.error(`💥 ${err.name}: ${err.message}`, ['ERROR', req, errorMetadata]);
  next(err);
};

// Database operation logger
const dbLogger = {
  connect: (database) => {
    Logger.info(`🔗 Database connected successfully`, ['DATABASE', null, { 
      database,
      timestamp: new Date().toISOString(),
      status: 'connected'
    }]);
  },
  reconnect: (database) => {
    Logger.info(`🔄 Database reconnected`, ['DATABASE', null, { 
      database,
      timestamp: new Date().toISOString(),
      status: 'reconnected'
    }]);
  },
  disconnect: (database) => {
    Logger.warn(`🔌 Database disconnected`, ['DATABASE', null, { 
      database,
      timestamp: new Date().toISOString(),
      status: 'disconnected'
    }]);
  },
  
  error: (operation, error, metadata = {}) => {
    Logger.error(`💥 Database ${operation} failed: ${error.message}`, ['DATABASE', null, {
      operation,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...metadata
    }]);
  },
  
  query: (operation, duration, metadata = {}) => {
    const level = duration > 1000 ? 'warn' : 'debug';
    const icon = duration > 1000 ? '🐌' : duration > 500 ? '⏳' : '⚡';
    
    Logger[level](`${icon} Database ${operation} completed`, ['DATABASE', null, {
      operation,
      duration: `${duration}ms`,
      performance: duration > 1000 ? 'slow' : duration > 500 ? 'medium' : 'fast',
      timestamp: new Date().toISOString(),
      ...metadata
    }]);
  }
};

// Authentication logger
const authLogger = {
  login: (req, userId, success = true) => {
    const level = success ? 'info' : 'warn';
    const icon = success ? '🔓' : '🔒';
    const message = success ? 'login successful' : 'login failed';
    
    Logger[level](`${icon} User ${message}`, ['AUTH', req, {
      ...getRequestMetadata(req),
      userId,
      success,
      action: 'login',
      timestamp: new Date().toISOString(),
    }]);
  },
  
  logout: (req, userId) => {
    Logger.info(`👋 User logout`, ['AUTH', req, {
      ...getRequestMetadata(req),
      userId,
      action: 'logout',
      timestamp: new Date().toISOString(),
    }]);
  },
  
  register: (req, userId, success = true) => {
    const level = success ? 'info' : 'error';
    const icon = success ? '👤' : '❌';
    const message = success ? 'registration successful' : 'registration failed';
    
    Logger[level](`${icon} User ${message}`, ['AUTH', req, {
      ...getRequestMetadata(req),
      userId,
      success,
      action: 'register',
      timestamp: new Date().toISOString(),
    }]);
  },
  
  unauthorized: (req, reason = 'Invalid token') => {
    Logger.warn(`🚫 Unauthorized access attempt`, ['AUTH', req, {
      ...getRequestMetadata(req),
      reason,
      action: 'unauthorized',
      timestamp: new Date().toISOString(),
    }]);
  }
};

// API logger
const apiLogger = {
  rateLimit: (req, limit, remaining) => {
    Logger.warn(`Rate limit approached`, ['API', req, {
      limit,
      remaining,
      ip: req.ip,
      endpoint: req.originalUrl,
    }]);
  },
  
  rateLimitExceeded: (req) => {
    Logger.error(`Rate limit exceeded`, ['API', req, {
      ip: req.ip,
      endpoint: req.originalUrl,
      userAgent: req.get('User-Agent'),
    }]);
  },
  
  validation: (req, errors) => {
    Logger.warn(`Validation failed`, ['API', req, {
      errors,
      body: req.body,
      params: req.params,
      query: req.query,
    }]);
  }
};

// System logger
const systemLogger = {
  startup: (service, port) => {
    Logger.info(`🚀 ${service} started successfully`, ['SYSTEM', null, { 
      service,
      port,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform
    }]);
  },
  
  shutdown: (service, reason = 'Normal shutdown') => {
    Logger.info(`🛑 ${service} shutting down`, ['SYSTEM', null, { 
      service,
      reason,
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`
    }]);
  },
  
  memory: (usage) => {
    const level = usage.heapUsed / usage.heapTotal > 0.8 ? 'warn' : 'debug';
    const icon = usage.heapUsed / usage.heapTotal > 0.8 ? '⚠️' : '💾';
    
    Logger[level](`${icon} Memory usage`, ['SYSTEM', null, {
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      memoryUsagePercent: `${Math.round((usage.heapUsed / usage.heapTotal) * 100)}%`,
      timestamp: new Date().toISOString(),
    }]);
  },
  
  performance: (operation, duration, metadata = {}) => {
    const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
    const icon = duration > 5000 ? '🐌' : duration > 1000 ? '⏳' : '⚡';
    
    Logger[level](`${icon} Performance: ${operation}`, ['PERFORMANCE', null, {
      operation,
      duration: `${duration}ms`,
      performance: duration > 5000 ? 'very slow' : duration > 1000 ? 'slow' : 'fast',
      timestamp: new Date().toISOString(),
      ...metadata
    }]);
  }
};

// Security logger
const securityLogger = {
  suspiciousActivity: (req, activity, severity = 'medium') => {
    const level = severity === 'high' ? 'error' : 'warn';
    const icon = severity === 'high' ? '🚨' : '⚠️';
    
    Logger[level](`${icon} Suspicious activity detected: ${activity}`, ['SECURITY', req, {
      ...getRequestMetadata(req),
      activity,
      severity,
      timestamp: new Date().toISOString(),
    }]);
  },
  
  bruteForce: (ip, attempts) => {
    Logger.error(`🔴 Brute force attack detected`, ['SECURITY', null, {
      attackType: 'brute-force',
      sourceIp: ip,
      attempts,
      severity: 'high',
      timestamp: new Date().toISOString(),
    }]);
  },
  
  sqlInjection: (req, query) => {
    Logger.error(`💉 SQL injection attempt detected`, ['SECURITY', req, {
      ...getRequestMetadata(req),
      attackType: 'sql-injection',
      suspiciousQuery: query,
      severity: 'high',
      timestamp: new Date().toISOString(),
    }]);
  }
};

// User Activity Logger - Ghi lại lịch sử hành vi người dùng vào MongoDB
const userActivityLogger = {
  // Log user login activity
  logLogin: async (req, user, success = true) => {
    try {
      const sessionId = getSessionId(req);
      const activityData = {
        userId: user._id || user.id,
        sessionId,
        action: 'login',
        description: success ? `User logged in successfully` : `User login failed`,
        metadata: {
          ...getRequestMetadata(req),
          email: user.email,
          username: user.username,
          role: user.role,
          success,
          loginMethod: req.body?.loginMethod || 'email'
        },
        severity: success ? 'low' : 'medium'
      };

      await UserActivity.create(activityData);
      Logger.info(`👤 User activity logged: ${activityData.action}`, ['USER_ACTIVITY', req, activityData]);
    } catch (error) {
      Logger.error(`Failed to log user activity: ${error.message}`, ['USER_ACTIVITY', req, { error: error.message }]);
    }
  },

  // Log user logout activity
  logLogout: async (req, user) => {
    try {
      const sessionId = getSessionId(req);
      const activityData = {
        userId: user._id || user.id,
        sessionId,
        action: 'logout',
        description: `User logged out`,
        metadata: {
          ...getRequestMetadata(req),
          email: user.email,
          username: user.username,
          sessionDuration: req.session?.duration || 'unknown'
        },
        severity: 'low'
      };

      await UserActivity.create(activityData);
      Logger.info(`👋 User activity logged: ${activityData.action}`, ['USER_ACTIVITY', req, activityData]);
    } catch (error) {
      Logger.error(`Failed to log user activity: ${error.message}`, ['USER_ACTIVITY', req, { error: error.message }]);
    }
  },

  // Log user registration
  logRegistration: async (req, user, success = true) => {
    try {
      const sessionId = getSessionId(req);
      const activityData = {
        userId: user._id || user.id,
        sessionId,
        action: 'register',
        description: success ? `New user registered` : `User registration failed`,
        metadata: {
          ...getRequestMetadata(req),
          email: user.email,
          username: user.username,
          role: user.role,
          success,
          registrationMethod: req.body?.registrationMethod || 'email'
        },
        severity: success ? 'low' : 'medium'
      };

      await UserActivity.create(activityData);
      Logger.info(`🆕 User activity logged: ${activityData.action}`, ['USER_ACTIVITY', req, activityData]);
    } catch (error) {
      Logger.error(`Failed to log user activity: ${error.message}`, ['USER_ACTIVITY', req, { error: error.message }]);
    }
  },

  // Log page views
  logPageView: async (req, user, page) => {
    try {
      const sessionId = getSessionId(req);
      const activityData = {
        userId: user._id || user.id,
        sessionId,
        action: 'view_page',
        description: `User viewed page: ${page}`,
        metadata: {
          ...getRequestMetadata(req),
          email: user.email,
          username: user.username,
          page,
          referer: req.get('Referer')
        },
        severity: 'low'
      };

      await UserActivity.create(activityData);
      Logger.debug(`👁️ User activity logged: ${activityData.action}`, ['USER_ACTIVITY', req, activityData]);
    } catch (error) {
      Logger.error(`Failed to log user activity: ${error.message}`, ['USER_ACTIVITY', req, { error: error.message }]);
    }
  },

  // Log profile updates
  logProfileUpdate: async (req, user, changes) => {
    try {
      const sessionId = getSessionId(req);
      const activityData = {
        userId: user._id || user.id,
        sessionId,
        action: 'profile_update',
        description: `User updated profile`,
        metadata: {
          ...getRequestMetadata(req),
          email: user.email,
          username: user.username,
          changes,
          fieldsChanged: Object.keys(changes)
        },
        severity: 'medium'
      };

      await UserActivity.create(activityData);
      Logger.info(`✏️ User activity logged: ${activityData.action}`, ['USER_ACTIVITY', req, activityData]);
    } catch (error) {
      Logger.error(`Failed to log user activity: ${error.message}`, ['USER_ACTIVITY', req, { error: error.message }]);
    }
  },

  // Log CRUD operations
  logCrudOperation: async (req, user, operation, resourceType, resourceId, data = {}) => {
    try {
      const sessionId = getSessionId(req);
      const actionMap = {
        'CREATE': 'create_post',
        'READ': 'view_page',
        'UPDATE': 'update_post',
        'DELETE': 'delete_post'
      };

      const activityData = {
        userId: user._id || user.id,
        sessionId,
        action: actionMap[operation] || 'api_call',
        description: `User ${operation.toLowerCase()}d ${resourceType}`,
        metadata: {
          ...getRequestMetadata(req),
          email: user.email,
          username: user.username,
          resourceType,
          resourceId,
          operation,
          ...data
        },
        severity: operation === 'DELETE' ? 'medium' : 'low'
      };

      await UserActivity.create(activityData);
      Logger.info(`🔄 User activity logged: ${activityData.action}`, ['USER_ACTIVITY', req, activityData]);
    } catch (error) {
      Logger.error(`Failed to log user activity: ${error.message}`, ['USER_ACTIVITY', req, { error: error.message }]);
    }
  },

  // Log file operations
  logFileOperation: async (req, user, operation, filename, fileSize = null) => {
    try {
      const sessionId = getSessionId(req);
      const actionMap = {
        'upload': 'upload_file',
        'download': 'download_file'
      };

      const activityData = {
        userId: user._id || user.id,
        sessionId,
        action: actionMap[operation] || 'api_call',
        description: `User ${operation}ed file: ${filename}`,
        metadata: {
          ...getRequestMetadata(req),
          email: user.email,
          username: user.username,
          filename,
          fileSize,
          operation
        },
        severity: 'low'
      };

      await UserActivity.create(activityData);
      Logger.info(`📁 User activity logged: ${activityData.action}`, ['USER_ACTIVITY', req, activityData]);
    } catch (error) {
      Logger.error(`Failed to log user activity: ${error.message}`, ['USER_ACTIVITY', req, { error: error.message }]);
    }
  },

  // Log errors and unauthorized access
  logError: async (req, user, error, severity = 'medium') => {
    try {
      const sessionId = getSessionId(req);
      const activityData = {
        userId: user?._id || user?.id || 'anonymous',
        sessionId,
        action: 'error_occurred',
        description: `Error occurred: ${error.message}`,
        metadata: {
          ...getRequestMetadata(req),
          email: user?.email,
          username: user?.username,
          errorMessage: error.message,
          errorCode: error.code,
          errorStack: error.stack
        },
        severity
      };

      await UserActivity.create(activityData);
      Logger.error(`❌ User activity logged: ${activityData.action}`, ['USER_ACTIVITY', req, activityData]);
    } catch (logError) {
      Logger.error(`Failed to log user activity: ${logError.message}`, ['USER_ACTIVITY', req, { error: logError.message }]);
    }
  },

  // Log unauthorized access attempts
  logUnauthorized: async (req, reason = 'Invalid token') => {
    try {
      const sessionId = getSessionId(req);
      const activityData = {
        userId: 'anonymous',
        sessionId,
        action: 'unauthorized_access',
        description: `Unauthorized access attempt: ${reason}`,
        metadata: {
          ...getRequestMetadata(req),
          reason,
          attemptedResource: req.originalUrl
        },
        severity: 'high'
      };

      await UserActivity.create(activityData);
      Logger.warn(`🚫 User activity logged: ${activityData.action}`, ['USER_ACTIVITY', req, activityData]);
    } catch (error) {
      Logger.error(`Failed to log user activity: ${error.message}`, ['USER_ACTIVITY', req, { error: error.message }]);
    }
  },

  // Get user activity history
  getUserHistory: async (userId, limit = 100, page = 1) => {
    try {
      const skip = (page - 1) * limit;
      const activities = await UserActivity.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
      
      return activities;
    } catch (error) {
      Logger.error(`Failed to get user history: ${error.message}`, ['USER_ACTIVITY']);
      return [];
    }
  },

  // Get user activity stats
  getUserStats: async (userId, days = 30) => {
    try {
      return await UserActivity.getUserStats(userId, days);
    } catch (error) {
      Logger.error(`Failed to get user stats: ${error.message}`, ['USER_ACTIVITY']);
      return [];
    }
  },

  // Get suspicious activities
  getSuspiciousActivities: async (hours = 24) => {
    try {
      return await UserActivity.getSuspiciousActivities(hours);
    } catch (error) {
      Logger.error(`Failed to get suspicious activities: ${error.message}`, ['USER_ACTIVITY']);
      return [];
    }
  }
};

export {
  requestLogger,
  errorLogger,
  dbLogger,
  authLogger,
  apiLogger,
  systemLogger,
  securityLogger,
  userActivityLogger
};
