const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateNotification, handleValidationErrors } = require('../middleware/validators');

// Strict Protection: Every route requires a valid session
router.use(requireAuth);

/**
 * USER ROUTES
 */

// @route   GET /api/notifications
// Supports pagination (e.g., ?page=1&limit=20) for faster loading
router.get('/', notificationController.getUserNotifications);

// @route   PATCH /api/notifications/read-all
// Critical for UX: Allows users to clear their inbox in one tap
router.patch('/read-all', notificationController.markAllAsRead);

// @route   PATCH /api/notifications/:id/read
// Use PATCH for partial updates like changing 'isRead' status
router.patch('/:id/read', notificationController.markAsRead);

// @route   DELETE /api/notifications/:id
router.delete('/:id', notificationController.deleteNotification);


/**
 * ADMIN ROUTES
 */

// @route   POST /api/notifications
// Admins can send targeted notifications to specific users or groups
router.post(
  '/', 
  requireAdmin, 
  validateNotification, 
  handleValidationErrors, 
  notificationController.createSystemNotification
);

module.exports = router;
