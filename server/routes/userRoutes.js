const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const loanController = require('../controllers/loanController');
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');
const { validateProfileUpdate, handleValidationErrors } = require('../middleware/validators');

// Global Protection: Identity data must be secured
router.use(requireAuth);

/**
 * IDENTITY & PROFILE
 */
// @route   GET /api/user/profile
// Returns core identity, contact info, and current loan limit
router.get('/profile', userController.getProfile);

// @route   PATCH /api/user/profile
// Allows users to update specific fields like phone or address
router.patch('/profile', validateProfileUpdate, handleValidationErrors, userController.updateProfile);

/**
 * FINANCIAL STATUS (DELEGATED)
 */
// @route   GET /api/user/eligibility
// Uses loanController logic to calculate real-time credit worthiness
router.get('/eligibility', loanController.checkEligibility);

// @route   GET /api/user/loans
// Proxies to loanController to maintain a single source of truth for history
router.get('/loans', loanController.getUserLoans);

/**
 * ENGAGEMENT (DELEGATED)
 */
// @route   GET /api/user/notifications
// Fetches the latest alerts for the dashboard
router.get('/notifications', notificationController.getUserNotifications);

module.exports = router;
