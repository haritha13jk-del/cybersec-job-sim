const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  scenarioId: { type: String, required: true },
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 100 },
  timeTaken: { type: Number, default: 0 },
  actionsTaken: { type: [String], default: [] },
  hintsUsed: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  attemptNumber: { type: Number, default: 1 },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const UserProgressModel = mongoose.model('UserProgress', UserProgressSchema);

class UserProgress {

  static async saveProgress(userId, scenarioId, progressData) {
    const { score, maxScore, timeTaken, actionsTaken, hintsUsed, completed } = progressData;
    const lastAttempt = await UserProgressModel.findOne({ userId, scenarioId }).sort({ attemptNumber: -1 });
    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;
    const progress = new UserProgressModel({
      userId, scenarioId, score, maxScore, timeTaken,
      actionsTaken, hintsUsed, completed, attemptNumber, completedAt: new Date(),
    });
    await progress.save();
    return progress._id;
  }

  static async getUserProgress(userId) {
    try {
      return await UserProgressModel.find({ userId }).sort({ completedAt: -1 });
    } catch (error) {
      console.error('getUserProgress error:', error);
      return [];
    }
  }

  // Field names matched to what Dashboard.js and Profile.js expect
  static async getUserStats(userId) {
    try {
      const data = await UserProgressModel.find({ userId });
      if (data.length === 0) return {
        total_attempts: 0, scenarios_completed: 0,
        average_score: 0, best_score: 0,
        total_score: 0, avg_score: 0
      };

      const totalAttempts = data.length;
      const completedData = data.filter(p => p.completed);
      const scenariosCompleted = completedData.length;
      const totalScore = completedData.reduce((sum, p) => sum + p.score, 0);
      const avgScore = scenariosCompleted > 0 ? Math.round(totalScore / scenariosCompleted) : 0;
      const bestScore = data.length > 0 ? Math.max(...data.map(p => p.score)) : 0;

      return {
        total_attempts: totalAttempts,
        scenarios_completed: scenariosCompleted,
        average_score: avgScore,
        avg_score: avgScore,
        best_score: bestScore,
        total_score: totalScore,
      };
    } catch (error) {
      console.error('getUserStats error:', error);
      return { total_attempts: 0, scenarios_completed: 0, average_score: 0, best_score: 0, total_score: 0 };
    }
  }

  static async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await UserProgressModel.aggregate([
        { $match: { completed: true } },
        { $group: { _id: "$userId", totalScore: { $sum: "$score" }, scenariosCompleted: { $sum: 1 } } },
        { $sort: { totalScore: -1 } },
        { $limit: limit },
      ]);
      return leaderboard.map((user, index) => ({
        rank_position: index + 1, userId: user._id,
        total_score: user.totalScore, scenarios_completed: user.scenariosCompleted,
      }));
    } catch (error) {
      console.error('getLeaderboard error:', error);
      return [];
    }
  }
}

module.exports = UserProgress;
