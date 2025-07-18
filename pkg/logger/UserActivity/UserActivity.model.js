/** @format */

import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout', 
      'register',
      'profile_update',
      'password_change',
      'view_page',
      'search',
      'create_post',
      'update_post',
      'delete_post',
      'like',
      'comment',
      'upload_file',
      'download_file',
      'api_call',
      'error_occurred',
      'unauthorized_access'
    ],
    index: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    // Request information
    ip: String,
    userAgent: String,
    method: String,
    url: String,
    statusCode: Number,
    
    // User context
    email: String,
    username: String,
    role: String,
    
    // Action specific data
    resourceId: String,
    resourceType: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    
    // Performance data
    duration: Number,
    
    // Error information
    errorMessage: String,
    errorCode: String,
    
    // Additional custom data
    additionalData: mongoose.Schema.Types.Mixed
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 days TTL (optional - remove if you want to keep forever)
  }
}, {
  timestamps: true,
  collection: 'user_activities'
});

// Compound indexes for common queries
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });
userActivitySchema.index({ severity: 1, timestamp: -1 });
userActivitySchema.index({ sessionId: 1, timestamp: -1 });

// Static method to get user activity stats
userActivitySchema.statics.getUserStats = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
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
    }
  ]);
};

// Static method to get suspicious activities
userActivitySchema.statics.getSuspiciousActivities = function(hours = 24) {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hours);
  
  return this.find({
    timestamp: { $gte: startDate },
    $or: [
      { severity: { $in: ['high', 'critical'] } },
      { action: 'unauthorized_access' },
      { 'metadata.statusCode': { $gte: 400 } }
    ]
  }).sort({ timestamp: -1 });
};

export default mongoose.model('UserActivity', userActivitySchema);
