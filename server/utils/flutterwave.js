const Flutterwave = require('flutterwave-node-v3');
const prisma = require('../config/prisma');

// Singleton Initialization
const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);

/**
 * Initiate Mobile Money (M-PESA/Airtel/Zamtel) Charge
 */
const initiateFlutterwavePayment = async ({ phoneNumber, amount, email, name, reference }) => {
  try {
    const payload = {
      tx_ref: reference,
      amount,
      currency: process.env.CURRENCY || 'KES',
      redirect_url: `${process.env.API_URL}/api/payments/callback`,
      payment_options: 'mobilemoney',
      customer: { email, phone_number: phoneNumber, name },
      customizations: {
        title: 'Zambia Z Digital',
        description: `Loan Processing Fee: ${amount}`,
        logo: 'https://your-cdn.com/logo.png',
      }
    };

    const response = await flw.Charge.mobile_money(payload);

    if (response.status !== 'success') {
      throw new Error(response.message || 'Payment initiation failed');
    }

    return {
      success: true,
      flw_ref: response.data.flw_ref,
      order_id: response.data.id
    };
  } catch (error) {
    console.error('[FLW INIT ERROR]:', error.message);
    throw error;
  }
};

/**
 * Handle Webhook with Idempotency & Atomic Transactions
 */
const handleFlutterwaveWebhook = async (payload) => {
  const { tx_ref, status, id: flw_id, amount } = payload;

  try {
    // 1. Find the local transaction record
    const localTx = await prisma.transaction.findFirst({
      where: { checkoutRequestId: tx_ref }
    });

    if (!localTx) return { success: false, message: 'Transaction not found' };

    // 2. Idempotency Check: Don't process if already completed
    if (localTx.status === 'COMPLETED') {
      return { success: true, message: 'Already processed' };
    }

    // 3. Atomic Update: Wrap everything in a transaction
    await prisma.$transaction(async (tx) => {
      // Update the transaction status
      await tx.transaction.update({
        where: { id: localTx.id },
        data: {
          status: status === 'successful' ? 'COMPLETED' : 'FAILED',
          mpesaReceiptNumber: String(flw_id), // Storing FLW ID as reference
          completedAt: new Date()
        }
      });

      // If it's a loan fee and payment was successful, update the loan
      if (status === 'successful' && localTx.loanId) {
        await tx.loan.update({
          where: { id: localTx.loanId },
          data: { 
            feePaid: true,
            status: 'APPROVED' // Auto-move to approved once fee is paid
          }
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error('[FLW WEBHOOK ERROR]:', error.message);
    throw error;
  }
};

module.exports = {
  initiateFlutterwavePayment,
  handleFlutterwaveWebhook,
  flw
};
