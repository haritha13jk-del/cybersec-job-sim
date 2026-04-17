const express = require('express');
const mongoose = require('mongoose');

const { generateAIResponse, generateHint } = require('../config/gemini');
const ActivityLog = require('../models/ActivityLog');
const Scenario = require('../models/Scenario');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/* ================= CHAT MODEL ================= */
const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scenarioId: { type: String, default: null },
  message: String,
  response: String,
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);


/* ================= AI CHAT ================= */
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, scenarioId } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Fetch full scenario object so gemini gets title/description/etc
    let scenarioObj = null;
    if (scenarioId) {
      try {
        scenarioObj = await Scenario.getById(scenarioId);
      } catch (e) {
        console.error('Could not fetch scenario for AI context:', e.message);
      }
    }

    let aiResponse;
    try {
      aiResponse = await generateAIResponse(message, scenarioObj);
    } catch (err) {
      console.error('Gemini error:', err.message);
      return res.status(500).json({ success: false, error: 'AI service unavailable' });
    }

    // Save chat
    try {
      await Chat.create({ userId, scenarioId: scenarioId || null, message, response: aiResponse.message });
    } catch (e) {
      console.error('Chat save error:', e.message);
    }

    // Log activity
    try {
      await ActivityLog.logActivity({
        userId, scenarioId: scenarioId || null, action: 'AI_CHAT',
        details: { messageLength: message.length },
        ipAddress: req.ip, userAgent: req.headers['user-agent']
      });
    } catch (e) {
      console.error('Activity log error:', e.message);
    }

    res.json({ success: true, message: aiResponse.message, timestamp: aiResponse.timestamp });

  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ================= HINT ================= */
router.post('/hint', authMiddleware, async (req, res) => {
  try {
    const { scenarioId } = req.body;
    const userId = req.user.id;

    if (!scenarioId) {
      return res.status(400).json({ success: false, error: 'Scenario ID is required' });
    }

    // Count previous hints
    const count = await Chat.countDocuments({
      userId, scenarioId, message: { $regex: /hint/i }
    });

    const attemptNumber = count + 1;

    // Fetch full scenario for context
    let scenarioObj = null;
    try {
      scenarioObj = await Scenario.getById(scenarioId);
    } catch (e) {
      console.error('Could not fetch scenario for hint:', e.message);
    }

    let hint;
    try {
      hint = await generateHint(scenarioObj || { title: 'Cybersecurity Scenario', description: '', difficulty: 'intermediate' }, attemptNumber);
    } catch (err) {
      console.error('Hint error:', err.message);
      hint = 'Review the scenario indicators carefully and think about what action an analyst would take first.';
    }

    // Save hint
    try {
      await Chat.create({ userId, scenarioId, message: `hint request ${attemptNumber}`, response: hint });
    } catch (e) {
      console.error('Hint save error:', e.message);
    }

    // Log activity
    try {
      await ActivityLog.logActivity({
        userId, scenarioId, action: 'REQUEST_HINT',
        details: { attemptNumber }, ipAddress: req.ip, userAgent: req.headers['user-agent']
      });
    } catch (e) {
      console.error('Activity log error:', e.message);
    }

    res.json({ success: true, hint, hintNumber: attemptNumber });

  } catch (error) {
    console.error('Hint error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ================= HISTORY ================= */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { scenarioId, limit = 50 } = req.query;

    const filter = { userId };
    if (scenarioId) filter.scenarioId = scenarioId;

    const history = await Chat.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));

    res.json({ success: true, history });

  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
