const express = require('express');
const UserProgress = require('../models/UserProgress');
const { authMiddleware } = require('../middleware/auth');
const { mysqlPool } = require('../config/database');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await UserProgress.getUserProgress(userId);
    const stats = await UserProgress.getUserStats(userId);
    const performanceByRole = await UserProgress.getPerformanceByRole(userId);
    res.json({ 
      success: true, 
      progress: progress || [], 
      stats: stats || {}, 
      performanceByRole: performanceByRole || [] 
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await UserProgress.getUserStats(userId);
    const performanceByRole = await UserProgress.getPerformanceByRole(userId);
    res.json({ 
      success: true, 
      stats: stats || {}, 
      performanceByRole: performanceByRole || [] 
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await UserProgress.getLeaderboard(limit);
    const [userRank] = await mysqlPool.query(
      'SELECT rank_position FROM leaderboard WHERE user_id = ?',
      [req.user.id]
    );
    res.json({
      success: true,
      leaderboard: leaderboard || [],
      userRank: userRank.length > 0 ? userRank[0].rank_position : null
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;