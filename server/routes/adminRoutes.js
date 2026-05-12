const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateLoanAction } = require('../middleware/validators'); // New: critical for fintech

// Global Admin Protection
router.use(requireAuth);
router.use(requireAdmin);

/**
 * LOAN MANAGEMENT
 */
// Use query params for filtering (e.g., /loans?status=PENDING)
router.get('/loans', adminController.getAllLoans);
router.get('/loans/queue', adminController.getLoanQueue);
router.get('/loans/:id', adminController.getLoanDetails);

/**
 * APPROVAL WORKFLOWS
 * Pro-tip: Use specific sub-resource paths for clarity
 */
router.patch('/loans/:id/status', validateLoanAction, adminController.updateLoanStatus);
router.post('/loans/:id/auto-approve', adminController.handleAutoApproval);
router.post('/loans/:id/special-approve', adminController.handleSpecialApproval);

/**
 * DISBURSEMENTS & NOTIFICATIONS
 */
// Disbursement is a sensitive POST action that creates a Transaction record
router.post('/loans/:id/disburse', adminController.initiateDisbursement);
router.post('/loans/:id/notify', adminController.sendNotification);

/**
 * SYSTEM ANALYTICS
 */
router.get('/dashboard/stats', adminController.getAdminStats);

module.exports = router;
