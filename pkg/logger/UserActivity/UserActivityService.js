/** @format */

import UserActivity from './UserActivity.model.js';
import { Logger } from '@global/global.js';

class UserActivityService {
  
  // Get user activity dashboard data
  static async getUserDashboard(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get basic stats
      const totalActivities = await UserActivity.countDocuments({ 
        userId, 
        timestamp: { $gte: startDate } 
      });
      
      // Get activity by day
      const dailyActivity = await UserActivity.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' }
            },
            count: { $sum: 1 },
            actions: { $addToSet: '$action' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);
      
      // Get top actions
      const topActions = await UserActivity.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]);
      
      // Get recent activities
      const recentActivities = await UserActivity.find({ 
        userId,
        timestamp: { $gte: startDate }
      })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();
      
      return {
        totalActivities,
        dailyActivity,
        topActions,
        recentActivities,
        dateRange: { startDate, endDate: new Date() }
      };
      
    } catch (error) {
      Logger.error(`Error getting user dashboard: ${error.message}`, ['USER_ACTIVITY_SERVICE']);
      throw error;
    }
  }
  
  // Get suspicious activities for security monitoring
  static async getSuspiciousActivitiesReport(hours = 24) {
    try {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);
      
      const suspiciousActivities = await UserActivity.find({
        timestamp: { $gte: startDate },
        $or: [
          { severity: { $in: ['high', 'critical'] } },
          { action: 'unauthorized_access' },
          { action: 'error_occurred' },
          { 'metadata.statusCode': { $gte: 400 } }
        ]
      })
      .sort({ timestamp: -1 })
      .lean();
      
      // Group by IP for potential attack detection
      const suspiciousByIP = await UserActivity.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            $or: [
              { severity: { $in: ['high', 'critical'] } },
              { action: 'unauthorized_access' }
            ]
          }
        },
        {
          $group: {
            _id: '$metadata.ip',
            count: { $sum: 1 },
            actions: { $addToSet: '$action' },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $match: { count: { $gte: 5 } } // IPs with 5+ suspicious activities
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      return {
        suspiciousActivities,
        suspiciousByIP,
        totalSuspicious: suspiciousActivities.length,
        timeRange: { startDate, endDate: new Date() }
      };
      
    } catch (error) {
      Logger.error(`Error getting suspicious activities: ${error.message}`, ['USER_ACTIVITY_SERVICE']);
      throw error;
    }
  }
  
  // Get user session analysis
  static async getUserSessionAnalysis(userId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const sessionData = await UserActivity.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$sessionId',
            activities: { $sum: 1 },
            actions: { $addToSet: '$action' },
            startTime: { $min: '$timestamp' },
            endTime: { $max: '$timestamp' },
            ips: { $addToSet: '$metadata.ip' },
            userAgents: { $addToSet: '$metadata.userAgent' }
          }
        },
        {
          $addFields: {
            duration: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                1000 * 60 // Convert to minutes
              ]
            }
          }
        },
        {
          $sort: { startTime: -1 }
        }
      ]);
      
      return {
        sessions: sessionData,
        totalSessions: sessionData.length,
        averageSessionDuration: sessionData.reduce((sum, session) => sum + session.duration, 0) / sessionData.length,
        dateRange: { startDate, endDate: new Date() }
      };
      
    } catch (error) {
      Logger.error(`Error getting session analysis: ${error.message}`, ['USER_ACTIVITY_SERVICE']);
      throw error;
    }
  }
  
  // Search user activities with filters
  static async searchActivities(filters = {}) {
    try {
      const {
        userId,
        action,
        severity,
        startDate,
        endDate,
        ip,
        limit = 100,
        page = 1
      } = filters;
      
      const query = {};
      
      if (userId) query.userId = mongoose.Types.ObjectId(userId);
      if (action) query.action = action;
      if (severity) query.severity = severity;
      if (ip) query['metadata.ip'] = ip;
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
      
      const skip = (page - 1) * limit;
      
      const activities = await UserActivity.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
      
      const total = await UserActivity.countDocuments(query);
      
      return {
        activities,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      Logger.error(`Error searching activities: ${error.message}`, ['USER_ACTIVITY_SERVICE']);
      throw error;
    }
  }
  
  // Get system-wide activity statistics
  static async getSystemStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Total activities
      const totalActivities = await UserActivity.countDocuments({ 
        timestamp: { $gte: startDate } 
      });
      
      // Unique users
      const uniqueUsers = await UserActivity.distinct('userId', { 
        timestamp: { $gte: startDate } 
      });
      
      // Activities by action
      const activitiesByAction = await UserActivity.aggregate([
        {
          $match: { timestamp: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      // Activities by severity
      const activitiesBySeverity = await UserActivity.aggregate([
        {
          $match: { timestamp: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);
      
      return {
        totalActivities,
        uniqueUsers: uniqueUsers.length,
        activitiesByAction,
        activitiesBySeverity,
        dateRange: { startDate, endDate: new Date() }
      };
      
    } catch (error) {
      Logger.error(`Error getting system stats: ${error.message}`, ['USER_ACTIVITY_SERVICE']);
      throw error;
    }
  }
  
  // Clean up old activities (for maintenance)
  static async cleanupOldActivities(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await UserActivity.deleteMany({
        timestamp: { $lt: cutoffDate }
      });
      
      Logger.info(`Cleaned up ${result.deletedCount} old activities`, ['USER_ACTIVITY_SERVICE']);
      return result.deletedCount;
      
    } catch (error) {
      Logger.error(`Error cleaning up activities: ${error.message}`, ['USER_ACTIVITY_SERVICE']);
      throw error;
    }
  }
}

export default UserActivityService;
