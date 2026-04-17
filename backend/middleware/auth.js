const jwt = require('jsonwebtoken');

// 🔐 AUTH MIDDLEWARE
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Authorization required.'
      });
    }

    // ✅ Extract token
    const token = authHeader.split(' ')[1];

    // ❌ Missing JWT secret (IMPORTANT FIX)
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user
    req.user = decoded;

    next();

  } catch (error) {
    console.error("Auth error:", error.message);

    // ⏳ Token expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }

    // ❌ Invalid token
    return res.status(401).json({
      success: false,
      error: 'Invalid token. Authorization failed.'
    });
  }
};


// 🔐 ROLE-BASED ACCESS CONTROL
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // ❌ Not logged in
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // ❌ Role not allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access forbidden. Insufficient permissions.'
        });
      }

      next();

    } catch (error) {
      console.error("Role middleware error:", error.message);
      return res.status(500).json({
        success: false,
        error: 'Authorization error'
      });
    }
  };
};

module.exports = { authMiddleware, roleMiddleware };