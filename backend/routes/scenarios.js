const express = require('express');
const Scenario = require('../models/Scenario');
const UserProgress = require('../models/UserProgress');
const ActivityLog = require('../models/ActivityLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

/* ================= GET ALL SCENARIOS ================= */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, difficulty, category } = req.query;

    const filters = {};
    if (role) filters.role = role;
    if (difficulty) filters.difficulty = difficulty;
    if (category) filters.category = category;

    const scenarios = await Scenario.getAll(filters);

    res.json({
      success: true,
      count: scenarios?.length || 0,
      scenarios: scenarios || []
    });

  } catch (error) {
    console.error('Get scenarios error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ================= GET BY ROLE ================= */
router.get('/role/:role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.params;

    if (!['soc_analyst', 'penetration_tester'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    const scenarios = await Scenario.getByRole(role);

    res.json({
      success: true,
      role,
      count: scenarios?.length || 0,
      scenarios: scenarios || []
    });

  } catch (error) {
    console.error('Get scenarios by role error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ================= RANDOM SCENARIO ================= */
router.get('/random/:role/:difficulty', authMiddleware, async (req, res) => {
  try {
    const { role, difficulty } = req.params;

    const scenario = await Scenario.getRandom(role, difficulty);

    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'No scenario found'
      });
    }

    res.json({
      success: true,
      scenario
    });

  } catch (error) {
    console.error('Random scenario error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ================= GET SINGLE SCENARIO ================= */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const scenarioId = req.params.id;

    const scenario = await Scenario.getById(scenarioId);

    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }

    // safe logging
    try {
      await ActivityLog.logActivity({
        userId: req.user.id,
        scenarioId,
        action: 'START_SCENARIO',
        details: { title: scenario.title },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (e) {
      console.error("Activity log error:", e.message);
    }

    res.json({
      success: true,
      scenario
    });

  } catch (error) {
    console.error('Get scenario error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ================= SUBMIT SOLUTION ================= */
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const scenarioId = req.params.id;
    const userId = req.user.id;
    const { actions, timeTaken = 0, hintsUsed = 0 } = req.body;

    if (!Array.isArray(actions)) {
      return res.status(400).json({
        success: false,
        error: 'Actions must be an array'
      });
    }

    const scenario = await Scenario.getById(scenarioId);

    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }

    const normalize = s => s.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
    const correctActions = (scenario.correct_actions || []).map(normalize);
    const maxScore = scenario.max_score || 100;

    let correctCount = 0;
    let feedback = [];

    actions.forEach(action => {
      const isCorrect = correctActions.includes(normalize(action));

      if (isCorrect) correctCount++;

      feedback.push({
        action,
        correct: isCorrect,
        message: isCorrect ? 'Correct action!' : 'Not optimal'
      });
    });

    const percentage = correctActions.length
      ? (correctCount / correctActions.length) * 100
      : 0;

    let finalScore = Math.round((percentage / 100) * maxScore);

    finalScore -= hintsUsed * 5;
    finalScore = Math.max(0, finalScore);

    const allCorrect =
      correctCount === correctActions.length &&
      actions.length === correctActions.length;

    if (allCorrect) {
      finalScore = Math.min(maxScore, finalScore + 10);
    }

    const missingActions = correctActions.filter(a => !actions.map(normalize).includes(a));

    try {
      await UserProgress.saveProgress(userId, scenarioId, {
        score: finalScore,
        maxScore,
        timeTaken,
        actionsTaken: actions,
        hintsUsed,
        completed: true
      });
    } catch (e) {
      console.error("Progress save error:", e.message);
    }

    try {
      await ActivityLog.logActivity({
        userId,
        scenarioId,
        action: 'SUBMIT_SOLUTION',
        details: { score: finalScore },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (e) {
      console.error("Activity log error:", e.message);
    }

    res.json({
      success: true,
      results: {
        score: finalScore,
        maxScore,
        percentage,
        correctActions: correctCount,
        totalActions: correctActions.length,
        allCorrect,
        feedback,
        missingActions,
        timeTaken,
        hintsUsed
      }
    });

  } catch (error) {
    console.error('Submit error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ================= CREATE SCENARIO ================= */
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'instructor'),
  async (req, res) => {
    try {
      const scenarioId = await Scenario.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Scenario created successfully',
        scenarioId
      });

    } catch (error) {
      console.error('Create scenario error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

module.exports = router;
