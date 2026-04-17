const express = require('express');
const { generateAIResponse, generateHint } = require('../config/gemini');
const Scenario = require('../models/Scenario');
const ActivityLog = require('../models/ActivityLog');
const { mysqlPool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 🔹 AI Chat Route
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { message, scenarioId } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    let scenario = null;
    if (scenarioId) {
      scenario = await Scenario.getById(scenarioId);
    }

    // ✅ Safe Gemini call
    let aiResponse;
    try {
      aiResponse = await generateAIResponse(message, scenario);
    } catch (err) {
      console.error("Gemini error:", err);
      return res.status(500).json({
        success: false,
        error: "AI service temporarily unavailable"
      });
    }

    // ✅ Save chat
    await mysqlPool.query(
      `INSERT INTO chat_history (user_id, scenario_id, message, response)
       VALUES (?, ?, ?, ?)`,
      [userId, scenarioId || null, message, aiResponse.message]
    );

    // ✅ Log activity
    await ActivityLog.logActivity({
      userId,
      scenarioId: scenarioId || null,
      action: 'AI_CHAT',
      details: { messageLength: message.length },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: aiResponse.message,
      timestamp: aiResponse.timestamp
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI response'
    });
  }
});


// 🔹 Hint Route
router.post('/hint', authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { scenarioId } = req.body;
    const userId = req.user.id;

    if (!scenarioId) {
      return res.status(400).json({ success: false, error: 'Scenario ID is required' });
    }

    const scenario = await Scenario.getById(scenarioId);

    if (!scenario) {
      return res.status(404).json({ success: false, error: 'Scenario not found' });
    }

    // ✅ Correct MySQL result handling
    const [rows] = await mysqlPool.query(
      `SELECT COUNT(*) as count 
       FROM chat_history 
       WHERE user_id = ? AND scenario_id = ? AND message LIKE ?`,
      [userId, scenarioId, '%hint%']
    );

    const attemptNumber = rows[0].count + 1;

    let hint;

    if (scenario.hints && scenario.hints.length > 0 && attemptNumber <= scenario.hints.length) {
      hint = scenario.hints[attemptNumber - 1];
    } else {
      try {
        hint = await generateHint(scenario, attemptNumber);
      } catch (err) {
        console.error("Hint AI error:", err);
        hint = "Unable to generate hint right now. Try again later.";
      }
    }

    // ✅ Save hint request
    await mysqlPool.query(
      `INSERT INTO chat_history (user_id, scenario_id, message, response)
       VALUES (?, ?, ?, ?)`,
      [userId, scenarioId, `Request for hint #${attemptNumber}`, hint]
    );

    // ✅ Log activity
    await ActivityLog.logActivity({
      userId,
      scenarioId,
      action: 'REQUEST_HINT',
      details: { attemptNumber },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      hint,
      hintNumber: attemptNumber
    });

  } catch (error) {
    console.error('Hint generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate hint'
    });
  }
});


// 🔹 Chat History Route
router.get('/history', authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const userId = req.user.id;
    const { scenarioId, limit = 50 } = req.query;

    let query = `
      SELECT ch.*, s.title as scenario_title
      FROM chat_history ch
      LEFT JOIN scenarios s ON ch.scenario_id = s.id
      WHERE ch.user_id = ?
    `;

    const params = [userId];

    if (scenarioId) {
      query += ' AND ch.scenario_id = ?';
      params.push(scenarioId);
    }

    query += ' ORDER BY ch.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [history] = await mysqlPool.query(query, params);

    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
});
S
module.exports = router;