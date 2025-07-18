/** @format */

// Example sử dụng các logger trong hệ thống

const { 
  requestLogger, 
  errorLogger, 
  dbLogger, 
  authLogger, 
  apiLogger, 
  systemLogger, 
  securityLogger,
  systemMonitor 
} = require('./index');

// ==================== MIDDLEWARE USAGE ====================

// 1. Request logging middleware - sử dụng trong app.js
/*
app.use(requestLogger);
*/

// 2. Error logging middleware - sử dụng cuối cùng trong app.js
/*
app.use(errorLogger);
*/

// ==================== DATABASE LOGGING ====================

// Trong mongodb.init.js
/*
mongoose.connect(mongoUrl)
  .then(() => {
    dbLogger.connect('MongoDB');
  })
  .catch((err) => {
    dbLogger.error('connect', err);
  });

// Trong các repository
const timer = systemMonitor.createPerformanceTimer('User.findById');
const user = await User.findById(id);
timer.end({ userId: id });

// Log slow queries
dbLogger.query('User.findById', 1200, { userId: id, slow: true });
*/

// ==================== AUTHENTICATION LOGGING ====================

// Trong auth controller
/*
// Login thành công
authLogger.login(req, user._id, true);

// Login thất bại
authLogger.login(req, null, false);

// Logout
authLogger.logout(req, user._id);

// Đăng ký thành công
authLogger.register(req, newUser._id, true);

// Truy cập không được phép
authLogger.unauthorized(req, 'Token expired');
*/

// ==================== API LOGGING ====================

// Trong rate limiting middleware
/*
apiLogger.rateLimit(req, 100, 23); // limit: 100, remaining: 23
apiLogger.rateLimitExceeded(req);

// Trong validation middleware
apiLogger.validation(req, validationErrors);
*/

// ==================== SYSTEM MONITORING ====================

// Trong app.js khởi động
/*
systemLogger.startup('Express Server', 3000);
systemMonitor.start();
systemMonitor.logSystemInfo();

// Monitor database
const mongoose = require('mongoose');
systemMonitor.monitorDatabase(mongoose);

// Performance timing
const timer = systemMonitor.createPerformanceTimer('Heavy Operation');
await heavyOperation();
timer.end({ operation: 'data-processing', records: 1000 });
*/

// ==================== SECURITY LOGGING ====================

// Trong security middleware
/*
securityLogger.suspiciousActivity(req, 'Multiple failed login attempts', 'high');
securityLogger.bruteForce('192.168.1.100', 15);
securityLogger.sqlInjection(req, suspiciousQuery);
*/

// ==================== CUSTOM LOGGING ====================

// Sử dụng logger trực tiếp từ global
/*
const { Logger } = require('../src/global');

Logger.info('Custom info message', ['CUSTOM', req, { data: 'some data' }]);
Logger.error('Custom error message', ['CUSTOM', req, { error: 'details' }]);
Logger.debug('Debug information', ['DEBUG']);
Logger.warn('Warning message', ['WARNING', req]);
*/

module.exports = {
  // Export examples for documentation
  examples: {
    middleware: 'app.use(requestLogger)',
    database: 'dbLogger.connect("MongoDB")',
    auth: 'authLogger.login(req, userId, true)',
    system: 'systemMonitor.start()',
    security: 'securityLogger.suspiciousActivity(req, "activity", "high")'
  }
};
