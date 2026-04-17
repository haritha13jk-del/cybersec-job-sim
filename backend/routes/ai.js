const express = require('express');
const { generateAIResponse, generateHint } = require('../config/gemini');
const { pool } = require('../config/database'); // ✅ FIXED
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();


// 🔹 AI CHAT
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, scenarioId } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // ✅ AI response
    let aiResponse;
    try {
      aiResponse = await generateAIResponse(message, scenarioId);
    } catch (err) {
      console.error("Gemini error:", err.message);
      return res.status(500).json({
        success: false,
        error: "AI service unavailable"
      });
    }

    // ✅ Save chat (PostgreSQL)
    await pool.query(
      `INSERT INTO chat_history (user_id, scenario_id, message, response)
       VALUES ($1, $2, $3, $4)`,
      [userId, scenarioId || null, message, aiResponse.message]
    );

    res.json({
      success: true,
      message: aiResponse.message,
      timestamp: aiResponse.timestamp
    });

  } catch (error) {
    console.error('AI chat error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// 🔹 HINT
router.post('/hint', authMiddleware, async (req, res) => {
  try {
    const { scenarioId } = req.body;
    const userId = req.user.id;

    if (!scenarioId) {
      return res.status(400).json({
        success: false,
        error: 'Scenario ID is required'
      });
    }

    // ✅ Count previous hints
    const result = await pool.query(
      `SELECT COUNT(*) FROM chat_history 
       WHERE user_id = $1 AND scenario_id = $2 AND message LIKE $3`,
      [userId, scenarioId, '%hint%']
    );

    const attemptNumber = parseInt(result.rows[0].count) + 1;

    let hint;

    try {
      hint = await generateHint(scenarioId, attemptNumber);
    } catch (err) {
      console.error("Hint error:", err.message);
      hint = "Unable to generate hint right now.";
    }

    // ✅ Save hint
    await pool.query(
      `INSERT INTO chat_history (user_id, scenario_id, message, response)
       VALUES ($1, $2, $3, $4)`,
      [userId, scenarioId, `hint request ${attemptNumber}`, hint]
    );

    res.json({
      success: true,
      hint,
      hintNumber: attemptNumber
    });

  } catch (error) {
    console.error('Hint error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// 🔹 CHAT HISTORY
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { scenarioId, limit = 50 } = req.query;

    let query = `
      SELECT *
      FROM chat_history
      WHERE user_id = $1
    `;

    const params = [userId];

    if (scenarioId) {
      query += ` AND scenario_id = $2`;
      params.push(scenarioId);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      history: result.rows
    });

  } catch (error) {
    console.error('History error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;