const mongoose = require('mongoose');

/* ================= SCHEMA ================= */

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // ✅ FIXED
    ref: 'User',
    required: true,
    index: true,
  },
  scenarioId: {
    type: mongoose.Schema.Types.ObjectId, // ✅ FIXED
    ref: 'Scenario',
    default: null,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'START_SCENARIO',
      'SUBMIT_SOLUTION',
      'REQUEST_HINT',
      'AI_CHAT',
      'VIEW_LEADERBOARD',
      'REGISTER',
    ],
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  collection: 'activity_logs',
});

/* ================= INDEXES ================= */

activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });

/* ================= METHODS ================= */

activityLogSchema.statics.logActivity = async function (logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    // ❗ NEVER crash app because of logs
    console.error('Activity logging error:', error.message);
    return null;
  }
};

activityLogSchema.statics.getUserActivity = async function (userId, limit = 50) {
  try {
    return await this.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Get activity error:', error.message);
    return [];
  }
};

/* ================= MODEL ================= */

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;