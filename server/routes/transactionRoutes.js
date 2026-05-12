const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateTransactionQuery, handleValidationErrors } = require('../middleware/validators');

// Global Protection: Every financial record is sensitive
router.use(requireAuth);

/**
 * USER TRANSACTIONS (Self-Service)
 */

// @route   GET /api/transactions/my-history
// Users should only ever see their own records
router.get('/my-history', transactionController.getMyTransactions);

// @route   GET /api/transactions/:id
// Fetches detailed breakdown of a specific payment/disbursement
router.get('/:id', transactionController.getTransactionDetails);


/**
 * ADMIN AUDIT & REPORTING
 */

// @route   GET /api/transactions
// Admins can view all, filtered by status, type, or date range
router.get(
  '/', 
  requireAdmin, 
  validateTransactionQuery, 
  handleValidationErrors, 
  transactionController.getAllTransactions
);

// @route   GET /api/transactions/reports/stats
// For admin dashboards: daily volumes, success rates, etc.
router.get('/reports/stats', requireAdmin, transactionController.getTransactionStats);

// @route   POST /api/transactions/:id/reconcile
// Instead of 'Delete', admins 'Reconcile' or 'Reverse' transactions
router.post('/:id/reconcile', requireAdmin, transactionController.reconcileTransaction);

module.exports = router;
