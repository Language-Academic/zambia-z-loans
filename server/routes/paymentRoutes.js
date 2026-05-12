const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');
const crypto = require('crypto');

/**
 * @route   GET /api/payments/methods
 * @desc    Get active payment gateways based on user region
 */
router.get('/methods', requireAuth, paymentController.getPaymentMethods);

/**
 * @route   POST /api/payments/webhook/flutterwave
 * @desc    Secure Flutterwave Webhook with Signature Verification
 */
router.post(
  '/webhook/flutterwave', 
  // Use a raw body parser specifically for signature verification if needed
  express.json(), 
  async (req, res) => {
    // 1. Verify Flutterwave Secret Hash
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== secretHash) {
      // Log unauthorized attempt[cite: 1]
      console.warn('[SECURITY] Unauthorized Flutterwave webhook attempt blocked.');
      return res.status(401).end(); 
    }

    // 2. Acknowledge receipt immediately to avoid retries
    res.status(200).send('Webhook Received');

    // 3. Process the logic asynchronously
    try {
      await paymentController.handleFlutterwaveWebhook(req.body);
    } catch (error) {
      console.error('[PAYMENT] Webhook processing error:', error.message);
    }
  }
);

module.exports = router;
