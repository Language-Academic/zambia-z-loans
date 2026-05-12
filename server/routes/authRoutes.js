const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  handleValidationErrors 
} = require('../middleware/validators');
const rateLimit = require('express-rate-limit');

// Anti-Brute Force: Limit login and register attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { message: 'Too many attempts, please try again after 15 minutes.' }
});

/**
 * @route   POST /api/auth/register
 * @desc    Create new user account with validation
 */
router.post(
  '/register', 
  authLimiter, 
  validateRegistration, 
  handleValidationErrors, 
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return tokens
 */
router.post(
  '/login', 
  authLimiter, 
  validateLogin, 
  handleValidationErrors, 
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rotate refresh token & generate new access token
 */
router.post('/refresh', authController.refreshSession);

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke refresh token and clear session
 */
router.post('/logout', requireAuth, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile (optimized)
 */
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
