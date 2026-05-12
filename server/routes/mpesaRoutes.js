const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

/**
 * @desc    Handle M-PESA STK Push Callback
 * @route   POST /api/mpesa/callback
 * @access  Public (Called by Safaricom)
 */
router.post('/callback', async (req, res) => {
  // 1. Immediate acknowledgement to Safaricom to prevent timeouts
  res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });

  try {
    const { Body } = req.body;
    if (!Body || !Body.stkCallback) return;

    const { 
      ResultCode, 
      ResultDesc, 
      CallbackMetadata, 
      CheckoutRequestID 
    } = Body.stkCallback;

    // 2. Find the transaction using the indexed CheckoutRequestID column
    const transaction = await prisma.transaction.findUnique({
      where: { checkoutRequestId: CheckoutRequestID }
    });

    if (!transaction) {
      console.error(`[M-PESA] Transaction not found for RequestID: ${CheckoutRequestID}`);
      return;
    }

    // 3. Handle Failed Payments
    if (ResultCode !== 0) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: 'FAILED',
          description: ResultDesc 
        }
      });
      return;
    }

    // 4. Handle Successful Payments using an Atomic Transaction
    // Extract metadata values (Amount, ReceiptNumber, etc.)
    const metadata = CallbackMetadata.Item.reduce((acc, item) => {
      acc[item.Name] = item.Value;
      return acc;
    }, {});

    await prisma.$transaction(async (tx) => {
      // Update Transaction Record
      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          mpesaReceiptNumber: metadata.MpesaReceiptNumber,
          phoneNumber: String(metadata.PhoneNumber),
          amount: metadata.Amount,
        }
      });

      // Update associated Loan
      if (updatedTx.loanId) {
        await tx.loan.update({
          where: { id: updatedTx.loanId },
          data: { 
            feePaid: true,
            mpesaFeeRef: metadata.MpesaReceiptNumber,
            status: 'VERIFICATION' // Move to next stage in workflow
          }
        });

        // Create a Notification for the Flutter App
        await tx.notification.create({
          data: {
            userId: updatedTx.userId,
            loanId: updatedTx.loanId,
            title: "Payment Received",
            body: `Your fee of ${metadata.Amount} has been verified. Your loan is now under review.`,
          }
        });
      }
    });

    console.log(`[M-PESA] Successfully processed payment: ${metadata.MpesaReceiptNumber}`);

  } catch (error) {
    console.error('[M-PESA] Callback Processing Error:', error);
  }
});

module.exports = router;
