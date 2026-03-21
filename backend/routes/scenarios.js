const express = require('express');
const Scenario = require('../models/Scenario');
const UserProgress = require('../models/UserProgress');
const ActivityLog = require('../models/ActivityLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, difficulty, category } = req.query;
    const filters = {};
    if (role) filters.role = role;
    if (difficulty) filters.difficulty = difficulty;
    if (category) filters.category = category;
    const scenarios = await Scenario.getAll(filters);
    res.json({ success: true, count: scenarios.length, scenarios });
  } catch (error) {
    console.error('Get scenarios error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scenarios' });
  }
});

router.get('/role/:role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.params;
    if (!['soc_analyst', 'penetration_tester'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    const scenarios = await Scenario.getByRole(role);
    res.json({ success: true, role, count: scenarios.length, scenarios });
  } catch (error) {
    console.error('Get scenarios by role error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scenarios' });
  }
});

router.get('/random/:role/:difficulty', authMiddleware, async (req, res) => {
  try {
    const { role, difficulty } = req.params;
    const scenario = await Scenario.getRandom(role, difficulty);
    if (!scenario) {
      return res.status(404).json({ success: false, error: 'No scenario found matching criteria' });
    }
    res.json({ success: true, scenario });
  } catch (error) {
    console.error('Get random scenario error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scenario' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const scenario = await Scenario.getById(req.params.id);
    if (!scenario) {
      return res.status(404).json({ success: false, error: 'Scenario not found' });
    }
    await ActivityLog.logActivity({
      userId: req.user.id,
      scenarioId: scenario.id,
      action: 'START_SCENARIO',
      details: { title: scenario.title },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.json({ success: true, scenario });
  } catch (error) {
    console.error('Get scenario error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scenario' });
  }
});

router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { actions, timeTaken, hintsUsed } = req.body;
    const scenarioId = parseInt(req.params.id);
    const userId = req.user.id;
    if (!actions || !Array.isArray(actions)) {
      return res.status(400).json({ success: false, error: 'Actions array is required' });
    }
    const scenario = await Scenario.getById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ success: false, error: 'Scenario not found' });
    }
    const correctActions = scenario.correct_actions;
    const maxScore = scenario.max_score;
    let correctCount = 0;
    let feedback = [];
    actions.forEach((action) => {
      const isCorrect = correctActions.includes(action);
      if (isCorrect) {
        correctCount++;
        feedback.push({ action, correct: true, message: 'Correct action!' });
      } else {
        feedback.push({ action, correct: false, message: 'This action may not be optimal for this scenario' });
      }
    });
    const scorePercentage = (correctCount / correctActions.length) * 100;
    let finalScore = Math.round((scorePercentage / 100) * maxScore);
    const hintPenalty = (hintsUsed || 0) * 5;
    finalScore = Math.max(0, finalScore - hintPenalty);
    const allCorrect = correctCount === correctActions.length && actions.length === correctActions.length;
    if (allCorrect) {
      finalScore = Math.min(maxScore, finalScore + 10);
    }
    const missingActions = correctActions.filter(ca => !actions.includes(ca));
    await UserProgress.saveProgress(userId, scenarioId, {
      score: finalScore,
      maxScore,
      timeTaken: timeTaken || 0,
      actionsTaken: actions,
      hintsUsed: hintsUsed || 0,
      completed: true
    });
    await ActivityLog.logActivity({
      userId,
      scenarioId,
      action: 'SUBMIT_SOLUTION',
      details: { score: finalScore, timeTaken, correctCount, totalActions: correctActions.length },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.json({
      success: true,
      results: { score: finalScore, maxScore, percentage: scorePercentage, correctActions: correctCount, totalActions: correctActions.length, allCorrect, feedback, missingActions, timeTaken, hintsUsed }
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit solution' });
  }
});

router.post('/', authMiddleware, roleMiddleware('admin', 'instructor'), async (req, res) => {
  try {
    const scenarioId = await Scenario.create(req.body);
    res.status(201).json({ success: true, message: 'Scenario created successfully', scenarioId });
  } catch (error) {
    console.error('Create scenario error:', error);
    res.status(500).json({ success: false, error: 'Failed to create scenario' });
  }
});

module.exports = router;