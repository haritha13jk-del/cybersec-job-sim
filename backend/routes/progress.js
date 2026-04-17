const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');

const router = express.Router();

/* ================= GET PROGRESS ================= */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await UserProgress.getUserProgress(userId);
    const stats = await UserProgress.getUserStats(userId);
    res.json({ success: true, progress, stats });
  } catch (error) {
    console.error('Get progress error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ================= GET STATS ================= */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await UserProgress.getUserStats(userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ================= LEADERBOARD ================= */
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get leaderboard from UserProgress model (same one scenarios.js saves to)
    const UserProgressModel = mongoose.models.UserProgress;

    const leaderboard = await UserProgressModel.aggregate([
      { $match: { completed: true } },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          scenariosCompleted: { $sum: 1 },
          bestScore: { $max: '$score' }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: limit }
    ]);

    // Try to enrich with usernames by looking up User model
    const User = mongoose.models.User;
    const enriched = await Promise.all(leaderboard.map(async (entry, index) => {
      let username = 'Player';
      if (User) {
        try {
          const user = await User.findById(entry._id).select('username name email');
          username = user?.username || user?.name || user?.email?.split('@')[0] || 'Player';
        } catch (e) { /* ignore */ }
      }
      return {
        rank: index + 1,
        userId: entry._id,
        username,
        total_score: entry.totalScore,
        scenarios_completed: entry.scenariosCompleted,
        best_score: entry.bestScore
      };
    }));

    // Get current user's rank
    const allRanks = await UserProgressModel.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$userId', totalScore: { $sum: '$score' } } },
      { $sort: { totalScore: -1 } }
    ]);
    const userRank = allRanks.findIndex(p => p._id.toString() === req.user.id) + 1 || null;

    res.json({ success: true, leaderboard: enriched, userRank });

  } catch (error) {
    console.error('Leaderboard error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
