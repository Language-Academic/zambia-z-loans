const prisma = require('../config/prisma');
const { sendLoanApplicationEmail } = require('../utils/email');
const { processLoanFeePayment } = require('../utils/paymentAlternatives');

/**
 * ZAMBIA Z - LOAN MANAGEMENT
 * Strategy: Atomic transactions and strict validation.
 */

const applyForLoan = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const userId = req.user.uid; // Using uid from our updated auth middleware

    // 1. Unified Eligibility Check & Application in a Transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { 
          loans: { 
            where: { status: { in: ['pending', 'approved'] } } 
          } 
        }
      });

      if (!user) throw new Error('User not found');
      
      // Professional Validation Logic
      if (!user.isCitizen) throw new Error('Only Kenyan citizens are eligible');
      if (user.loans.length > 0) throw new Error('Existing active loan detected');
      if (amount > user.loanLimit) throw new Error(`Limit exceeded: KSh ${user.loanLimit}`);

      // 2. Business Logic: 10% Fee Calculation (Server-side only)
      const feeAmount = Math.round(amount * 0.10);

      // 3. Atomic Updates
      const newLoan = await tx.loan.create({
        data: {
          userId,
          amount,
          feeAmount,
          description,
          status: 'pending',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { totalLoansApplied: { increment: 1 } },
      });

      return { user, newLoan };
    });

    // 4. Async Side Effects (Email)
    sendLoanApplicationEmail(result.user, result.newLoan).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Application submitted for review',
      data: { loanId: result.newLoan.id, fee: result.newLoan.feeAmount }
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const payLoanFee = async (req, res, next) => {
  try {
    const { paymentMethod = 'mpesa', paymentData } = req.body;
    const loanId = req.params.id;
    const userId = req.user.uid;

    // 1. Pre-payment verification
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId },
    });

    if (!loan || loan.status !== 'approved' || loan.feePaid) {
      return res.status(400).json({ success: false, message: 'Loan ineligible for fee payment' });
    }

    // 2. Execute Payment through Utility
    const paymentResponse = await processLoanFeePayment(
      paymentMethod,
      paymentData,
      loan.feeAmount,
      loan.id
    );

    // 3. Use Transaction to ensure record keeping matches loan status
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId,
          loanId: loan.id,
          amount: loan.feeAmount,
          type: 'LOAN_FEE',
          status: 'completed',
          mpesaResponse: JSON.stringify(paymentResponse),
          phoneNumber: paymentData?.phoneNumber || 'N/A',
        },
      });

      await tx.loan.update({
        where: { id: loanId },
        data: {
          feePaid: true,
          mpesaTransactionId: paymentResponse.transactionId || paymentResponse.checkoutRequestID,
        },
      });
    });

    res.json({
      success: true,
      message: 'Fee processed successfully',
      data: { transactionId: paymentResponse.transactionId }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { applyForLoan, payLoanFee };
