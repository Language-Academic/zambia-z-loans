const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * ZAMBIA Z - AUTHENTICATION MIDDLEWARE
 * Strategy: Stateless verification with payload-first logic.
 */

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a Bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];

    // 1. Verify token integrity
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    /**
     * PRO-TIP: We trust the JWT payload for performance.
     * Only query the DB here if you need to check 'isActive' status 
     * or 'lastPasswordChange' for high-security actions.
     */
    
    // Attach user data to request (Mapped to 'uid' as used in controllers)
    req.user = {
      uid: decoded.uid || decoded.userId,
      role: decoded.role || decoded.rol,
      email: decoded.email
    };

    next();
  } catch (error) {
    let message = 'Invalid or malformed session';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Session expired. Please refresh your token.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Security violation: Invalid token signature.';
    }

    return res.status(401).json({ success: false, message });
  }
};

/**
 * Role-Based Access Control (RBAC) 
 * Improved with an 'allowedRoles' array for cleaner extensibility.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Auth context missing' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};

// Standardized exports for cleaner route files
const requireAdmin = authorize('ADMIN', 'SUPER_ADMIN');
const requireSuperAdmin = authorize('SUPER_ADMIN');

/**
 * Account Integrity Check (Optional/High-Security)
 * Use this ONLY for sensitive routes (like loan disbursement) 
 * to ensure the user hasn't been banned mid-session.
 */
const verifyAccountStatus = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.uid },
    select: { isActive: true }
  });

  if (!user || !user.isActive) {
    return res.status(403).json({ success: false, message: 'Account disabled' });
  }
  next();
};

module.exports = {
  requireAuth,
  authorize,
  requireAdmin,
  requireSuperAdmin,
  verifyAccountStatus
};
