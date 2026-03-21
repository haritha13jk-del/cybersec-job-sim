const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  scenarioId: {
    type: Number,
    default: null
  },
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'START_SCENARIO', 'SUBMIT_SOLUTION', 'REQUEST_HINT', 'AI_CHAT', 'VIEW_LEADERBOARD', 'REGISTER']
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  collection: 'activity_logs'
});

activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });

activityLogSchema.statics.logActivity = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};

activityLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return await this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;