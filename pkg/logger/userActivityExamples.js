/** @format */

// Ví dụ sử dụng User Activity Logger

const { userActivityLogger, userActivityMiddleware } = require('../pkg/logger');
const UserActivityService = require('./UserActivity/UserActivityService');

// ==================== SETUP MIDDLEWARE ====================

// Trong app.js hoặc middleware setup
/*
const { userActivityMiddleware } = require('./pkg/logger');

// Sử dụng middleware để tự động log user activities
app.use(userActivityMiddleware);
*/

// ==================== MANUAL LOGGING EXAMPLES ====================

// 1. Log user login
/*
app.post('/auth/login', async (req, res) => {
  try {
    const user = await authenticate(req.body.email, req.body.password);
    
    // Log successful login
    await userActivityLogger.logLogin(req, user, true);
    
    res.json({ success: true, user });
  } catch (error) {
    // Log failed login attempt
    await userActivityLogger.logLogin(req, { email: req.body.email }, false);
    
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
*/

// 2. Log user profile update
/*
app.put('/profile', async (req, res) => {
  try {
    const user = req.user;
    const changes = req.body;
    
    // Update profile
    await updateUserProfile(user.id, changes);
    
    // Log profile update
    await userActivityLogger.logProfileUpdate(req, user, changes);
    
    res.json({ success: true });
  } catch (error) {
    await userActivityLogger.logError(req, req.user, error);
    res.status(500).json({ error: error.message });
  }
});
*/

// 3. Log file operations
/*
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const user = req.user;
    const file = req.file;
    
    // Log file upload
    await userActivityLogger.logFileOperation(req, user, 'upload', file.originalname, file.size);
    
    res.json({ success: true, filename: file.originalname });
  } catch (error) {
    await userActivityLogger.logError(req, req.user, error);
    res.status(500).json({ error: error.message });
  }
});
*/

// 4. Log CRUD operations
/*
app.post('/posts', async (req, res) => {
  try {
    const user = req.user;
    const post = await createPost(req.body);
    
    // Log post creation
    await userActivityLogger.logCrudOperation(req, user, 'CREATE', 'post', post.id, {
      title: post.title,
      category: post.category
    });
    
    res.json(post);
  } catch (error) {
    await userActivityLogger.logError(req, req.user, error);
    res.status(500).json({ error: error.message });
  }
});
*/

// ==================== ANALYTICS EXAMPLES ====================

// 1. Get user activity dashboard
/*
app.get('/analytics/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const days = req.query.days || 30;
    
    const dashboard = await UserActivityService.getUserDashboard(userId, days);
    
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// 2. Get suspicious activities report
/*
app.get('/analytics/security/suspicious', async (req, res) => {
  try {
    const hours = req.query.hours || 24;
    
    const report = await UserActivityService.getSuspiciousActivitiesReport(hours);
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// 3. Search user activities
/*
app.get('/analytics/activities/search', async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId,
      action: req.query.action,
      severity: req.query.severity,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      ip: req.query.ip,
      limit: parseInt(req.query.limit) || 100,
      page: parseInt(req.query.page) || 1
    };
    
    const results = await UserActivityService.searchActivities(filters);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// 4. Get system-wide statistics
/*
app.get('/analytics/system/stats', async (req, res) => {
  try {
    const days = req.query.days || 30;
    
    const stats = await UserActivityService.getSystemStats(days);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// ==================== MAINTENANCE EXAMPLES ====================

// Cleanup old activities (run as cron job)
/*
const cleanupOldActivities = async () => {
  try {
    const daysToKeep = 90; // Keep 90 days of data
    const deletedCount = await UserActivityService.cleanupOldActivities(daysToKeep);
    console.log(`Cleaned up ${deletedCount} old activity records`);
  } catch (error) {
    console.error('Error cleaning up activities:', error);
  }
};

// Run cleanup daily at midnight
const cron = require('node-cron');
cron.schedule('0 0 * * *', cleanupOldActivities);
*/

// ==================== SECURITY MONITORING ====================

// Monitor for suspicious activities
/*
const monitorSuspiciousActivities = async () => {
  try {
    const report = await UserActivityService.getSuspiciousActivitiesReport(1); // Last hour
    
    if (report.totalSuspicious > 10) {
      // Alert security team
      console.log('⚠️ High number of suspicious activities detected:', report.totalSuspicious);
      
      // Check for potential attacks
      report.suspiciousByIP.forEach(ipData => {
        if (ipData.count >= 10) {
          console.log(`🚨 Potential attack from IP: ${ipData._id} (${ipData.count} suspicious activities)`);
          // Consider blocking IP or sending alert
        }
      });
    }
  } catch (error) {
    console.error('Error monitoring suspicious activities:', error);
  }
};

// Run monitoring every 15 minutes
// const cron = require('node-cron');
// cron.schedule('0,15,30,45 * * * *', monitorSuspiciousActivities);
*/

module.exports = {
  // Export examples for documentation
  examples: {
    login: 'await userActivityLogger.logLogin(req, user, true)',
    profileUpdate: 'await userActivityLogger.logProfileUpdate(req, user, changes)',
    fileUpload: 'await userActivityLogger.logFileOperation(req, user, "upload", filename, fileSize)',
    crudOperation: 'await userActivityLogger.logCrudOperation(req, user, "CREATE", "post", postId)',
    getDashboard: 'await UserActivityService.getUserDashboard(userId, 30)',
    searchActivities: 'await UserActivityService.searchActivities(filters)'
  }
};
