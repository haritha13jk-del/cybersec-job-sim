const express = require('express');
const { pool } = require('../config/database'); // ✅ FIXED
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();


// ================= GET PROGRESS =================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Get progress
    const progressResult = await pool.query(
      `SELECT * FROM user_progress WHERE user_id = $1`,
      [userId]
    );

    // ✅ Stats
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) AS total_completed,
        COALESCE(SUM(score), 0) AS total_score
       FROM user_progress
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      progress: progressResult.rows,
      stats: statsResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Get progress error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ================= GET STATS =================
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        COUNT(*) AS total_completed,
        COALESCE(SUM(score), 0) AS total_score
       FROM user_progress
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      stats: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Get stats error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ================= LEADERBOARD =================
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // ✅ Leaderboard
    const leaderboardResult = await pool.query(
      `SELECT 
        user_id,
        SUM(score) AS total_score
       FROM user_progress
       GROUP BY user_id
       ORDER BY total_score DESC
       LIMIT $1`,
      [limit]
    );

    // ✅ User rank
    const rankResult = await pool.query(
      `SELECT rank FROM (
        SELECT 
          user_id,
          RANK() OVER (ORDER BY SUM(score) DESC) as rank
        FROM user_progress
        GROUP BY user_id
      ) ranked
      WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      leaderboard: leaderboardResult.rows,
      userRank: rankResult.rows[0]?.rank || null
    });

  } catch (error) {
    console.error('❌ Leaderboard error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;