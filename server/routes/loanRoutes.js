const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { requireAuth } = require('../middleware/auth');
const { validateLoanApplication, handleValidationErrors } = require('../middleware/validators');

// All routes are protected: Only the owner can access their loans
router.use(requireAuth);

/**
 * LOAN MANAGEMENT (USER-FACING)
 */

// @route   POST /api/loans/apply
// Standardized path; includes strict validation for principal amounts
router.post('/apply', validateLoanApplication, handleValidationErrors, loanController.applyForLoan);

// @route   GET /api/loans/my-loans
// Fetches all loans associated with the authenticated user
router.get('/my-loans', loanController.getUserLoans);

// @route   GET /api/loans/:id
// Fetches specific details including repayment dates and interest
router.get('/:id', loanController.getLoanById);

/**
 * PAYMENTS & FINANCIAL ACTIONS
 */

// @route   POST /api/loans/:id/pay-fee
// Initiates the M-Pesa STK Push for the required service fee
router.post('/:id/pay-fee', loanController.initiateFeePayment);

// @route   POST /api/loans/:id/repay
// Allows users to make partial or full repayments
router.post('/:id/repay', loanController.repayLoan);

module.exports = router;
