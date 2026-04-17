const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();


// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // ✅ Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // ✅ Check existing user
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // ✅ Register user
    const userId = await User.register(
      username,
      email,
      password,
      fullName || username
    );

    // ✅ Log activity (safe)
    try {
      await ActivityLog.logActivity({
        userId,
        action: 'REGISTER',
        details: { username, email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logErr) {
      console.error("Activity log error:", logErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId
    });

  } catch (error) {
    console.error('❌ Registration error:', error.message);

    // 🔥 IMPORTANT FIX (shows real error)
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // ❌ Prevent crash if JWT missing
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'JWT secret not configured'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    // ✅ Log activity safely
    try {
      await ActivityLog.logActivity({
        userId: user.id,
        action: 'LOGIN',
        details: { email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logErr) {
      console.error("Activity log error:", logErr.message);
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ================= GET CURRENT USER =================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Get user error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ================= UPDATE PROFILE =================
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;

    const updatedUser = await User.updateProfile(req.user.id, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Update profile error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;