/** @format */

import { userActivityLogger } from './utils.js';

// Middleware to automatically log user activities
const userActivityMiddleware = (req, res, next) => {
  // Store original res.json and res.send to intercept responses
  const originalJson = res.json;
  const originalSend = res.send;
  
  // Override res.json
  res.json = function(data) {
    logUserActivity(req, res, data);
    return originalJson.call(this, data);
  };
  
  // Override res.send
  res.send = function(data) {
    logUserActivity(req, res, data);
    return originalSend.call(this, data);
  };
  
  next();
};

// Function to determine and log appropriate user activity
const logUserActivity = async (req, res, responseData) => {
  try {
    const user = req.user; // Assuming user is attached to request after authentication
    if (!user) return; // Skip if no user is authenticated
    
    const method = req.method;
    const url = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    
    // Skip logging for certain routes (health checks, static files, etc.)
    const skipRoutes = [
      '/health',
      '/favicon.ico',
      '/robots.txt',
      '/api/ping',
      '/static/'
    ];
    
    if (skipRoutes.some(route => url.includes(route))) {
      return;
    }
    
    // Determine activity type based on URL and method
    if (url.includes('/auth/login') && method === 'POST') {
      await userActivityLogger.logLogin(req, user, statusCode < 400);
    }
    else if (url.includes('/auth/logout') && method === 'POST') {
      await userActivityLogger.logLogout(req, user);
    }
    else if (url.includes('/auth/register') && method === 'POST') {
      await userActivityLogger.logRegistration(req, user, statusCode < 400);
    }
    else if (url.includes('/profile') && method === 'PUT') {
      await userActivityLogger.logProfileUpdate(req, user, req.body);
    }
    else if (url.includes('/upload') && method === 'POST') {
      const filename = req.file?.originalname || req.body?.filename || 'unknown';
      const fileSize = req.file?.size || null;
      await userActivityLogger.logFileOperation(req, user, 'upload', filename, fileSize);
    }
    else if (url.includes('/download') && method === 'GET') {
      const filename = req.params?.filename || req.query?.filename || 'unknown';
      await userActivityLogger.logFileOperation(req, user, 'download', filename);
    }
    else if (method === 'GET' && statusCode < 300) {
      // Log page views for successful GET requests
      await userActivityLogger.logPageView(req, user, url);
    }
    else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Log CRUD operations
      const operation = {
        'POST': 'CREATE',
        'PUT': 'UPDATE',
        'PATCH': 'UPDATE',
        'DELETE': 'DELETE'
      }[method];
      
      const resourceType = extractResourceType(url);
      const resourceId = req.params?.id || req.body?.id || 'unknown';
      
      await userActivityLogger.logCrudOperation(
        req, 
        user, 
        operation, 
        resourceType, 
        resourceId,
        {
          requestBody: method !== 'DELETE' ? req.body : undefined,
          queryParams: req.query,
          statusCode
        }
      );
    }
    
    // Log errors if status code indicates error
    if (statusCode >= 400) {
      const error = new Error(`HTTP ${statusCode} error`);
      error.code = statusCode;
      const severity = statusCode >= 500 ? 'high' : 'medium';
      await userActivityLogger.logError(req, user, error, severity);
    }
    
  } catch (error) {
    console.error('Error in user activity logging:', error);
  }
};

// Helper function to extract resource type from URL
const extractResourceType = (url) => {
  const pathSegments = url.split('/').filter(segment => segment && !segment.includes('?'));
  
  // Remove 'api' prefix if present
  if (pathSegments[0] === 'api') {
    pathSegments.shift();
  }
  
  // Return the first meaningful segment
  return pathSegments[0] || 'unknown';
};

// Middleware for logging unauthorized access attempts
const unauthorizedActivityMiddleware = async (req, res, next) => {
  try {
    await userActivityLogger.logUnauthorized(req, 'Missing or invalid authentication token');
  } catch (error) {
    console.error('Error logging unauthorized activity:', error);
  }
  next();
};

export {
  userActivityMiddleware,
  unauthorizedActivityMiddleware,
  logUserActivity
};
