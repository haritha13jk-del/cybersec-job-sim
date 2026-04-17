const express = require('express');
const { generateAIResponse, generateHint } = require('../config/gemini');
const ActivityLog = require('../models/ActivityLog');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/* ================= CHAT MODEL ================= */
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scenarioId: { type: Number, default: null },
  message: String,
  response: String,
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);


/* ================= AI CHAT ================= */
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

    // ✅ Save chat (MongoDB)
    await Chat.create({
      userId,
      scenarioId: scenarioId || null,
      message,
      response: aiResponse.message
    });

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
    console.error('AI chat error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ================= HINT ================= */
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
    const count = await Chat.countDocuments({
      userId,
      scenarioId,
      message: { $regex: /hint/i }
    });

    const attemptNumber = count + 1;

    let hint;

    try {
      hint = await generateHint(scenarioId, attemptNumber);
    } catch (err) {
      console.error("Hint error:", err.message);
      hint = "Unable to generate hint right now.";
    }

    // ✅ Save hint
    await Chat.create({
      userId,
      scenarioId,
      message: `hint request ${attemptNumber}`,
      response: hint
    });

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
    console.error('Hint error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ================= HISTORY ================= */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { scenarioId, limit = 50 } = req.query;

    const filter = { userId };

    if (scenarioId) {
      filter.scenarioId = scenarioId;
    }

    const history = await Chat.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      history
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