const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/* ================= PROGRESS MODEL ================= */
const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scenarioId: Number,
  score: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ✅ prevent overwrite crash
const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);


/* ================= GET PROGRESS ================= */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const progress = await Progress.find({ userId });

    const stats = await Progress.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$userId",
          total_completed: { $sum: { $cond: ["$completed", 1, 0] } },
          total_score: { $sum: "$score" }
        }
      }
    ]);

    res.json({
      success: true,
      progress,
      stats: stats[0] || { total_completed: 0, total_score: 0 }
    });

  } catch (error) {
    console.error('Get progress error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ================= GET STATS ================= */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Progress.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$userId",
          total_completed: { $sum: { $cond: ["$completed", 1, 0] } },
          total_score: { $sum: "$score" }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || { total_completed: 0, total_score: 0 }
    });

  } catch (error) {
    console.error('Get stats error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ================= LEADERBOARD ================= */
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const leaderboard = await Progress.aggregate([
      {
        $group: {
          _id: "$userId",
          total_score: { $sum: "$score" }
        }
      },
      { $sort: { total_score: -1 } },
      { $limit: limit }
    ]);

    // user rank
    const allRanks = await Progress.aggregate([
      {
        $group: {
          _id: "$userId",
          total_score: { $sum: "$score" }
        }
      },
      { $sort: { total_score: -1 } }
    ]);

    const userRank =
      allRanks.findIndex(p => p._id.toString() === req.user.id) + 1 || null;

    res.json({
      success: true,
      leaderboard,
      userRank
    });

  } catch (error) {
    console.error('Leaderboard error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;