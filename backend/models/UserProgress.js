const mongoose = require('mongoose');

/* ================= SCHEMA ================= */

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  scenarioId: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    default: 100,
  },
  timeTaken: {
    type: Number,
    default: 0,
  },
  actionsTaken: {
    type: [String],
    default: [],
  },
  hintsUsed: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  attemptNumber: {
    type: Number,
    default: 1,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const UserProgressModel = mongoose.model('UserProgress', UserProgressSchema);

/* ================= CLASS ================= */

class UserProgress {

  // ✅ Save Progress
  static async saveProgress(userId, scenarioId, progressData) {
    const { score, maxScore, timeTaken, actionsTaken, hintsUsed, completed } = progressData;

    // Get last attempt
    const lastAttempt = await UserProgressModel
      .findOne({ userId, scenarioId })
      .sort({ attemptNumber: -1 });

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    const progress = new UserProgressModel({
      userId,
      scenarioId,
      score,
      maxScore,
      timeTaken,
      actionsTaken,
      hintsUsed,
      completed,
      attemptNumber,
      completedAt: new Date(),
    });

    await progress.save();

    return progress._id;
  }

  // ✅ Get User Progress
  static async getUserProgress(userId) {
    try {
      return await UserProgressModel
        .find({ userId })
        .sort({ completedAt: -1 });
    } catch (error) {
      console.error('getUserProgress error:', error);
      return [];
    }
  }

  // ✅ Get User Stats
  static async getUserStats(userId) {
    try {
      const data = await UserProgressModel.find({ userId });

      if (data.length === 0) return {};

      const totalAttempts = data.length;
      const completedScenarios = data.filter(p => p.completed).length;
      const avgScore =
        data.filter(p => p.completed).reduce((sum, p) => sum + p.score, 0) /
        (completedScenarios || 1);

      const totalTime = data.reduce((sum, p) => sum + (p.timeTaken || 0), 0);
      const bestScore = Math.max(...data.map(p => p.score));

      return {
        total_attempts: totalAttempts,
        completed_scenarios: completedScenarios,
        avg_score: avgScore,
        total_time: totalTime,
        best_score: bestScore,
      };

    } catch (error) {
      console.error('getUserStats error:', error);
      return {};
    }
  }

  // ✅ Performance by Role (simplified)
  static async getPerformanceByRole(userId) {
    try {
      const data = await UserProgressModel.find({ userId });

      const roleMap = {};

      data.forEach(p => {
        const role = p.role || 'unknown';

        if (!roleMap[role]) {
          roleMap[role] = {
            role,
            attempts: 0,
            completed: 0,
            totalScore: 0,
          };
        }

        roleMap[role].attempts++;
        if (p.completed) {
          roleMap[role].completed++;
          roleMap[role].totalScore += p.score;
        }
      });

      return Object.values(roleMap).map(r => ({
        role: r.role,
        attempts: r.attempts,
        completed: r.completed,
        avg_score: r.completed ? r.totalScore / r.completed : 0,
      }));

    } catch (error) {
      console.error('getPerformanceByRole error:', error);
      return [];
    }
  }

  // ✅ Leaderboard (simple version)
  static async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await UserProgressModel.aggregate([
        { $match: { completed: true } },
        {
          $group: {
            _id: "$userId",
            totalScore: { $sum: "$score" },
            scenariosCompleted: { $sum: 1 },
          },
        },
        { $sort: { totalScore: -1 } },
        { $limit: limit },
      ]);

      return leaderboard.map((user, index) => ({
        rank_position: index + 1,
        userId: user._id,
        total_score: user.totalScore,
        scenarios_completed: user.scenariosCompleted,
      }));

    } catch (error) {
      console.error('getLeaderboard error:', error);
      return [];
    }
  }
}

module.exports = UserProgress;