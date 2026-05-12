// src/services/transactionService.js
const prisma = require('../config/prisma');

/**
 * ZAMBIA Z - ATOMIC REPAYMENT HANDLER
 * Logic: Updates transaction AND loan status simultaneously.
 */
const recordRepayment = async ({ loanId, userId, amount, mpesaReceipt, phone }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the completed transaction record
    const transaction = await tx.transaction.create({
      data: {
        userId,
        loanId,
        amount,
        type: 'REPAYMENT',
        status: 'COMPLETED',
        mpesaReceiptNumber: mpesaReceipt,
        phoneNumber: phone,
      },
    });

    // 2. Update the Loan balance and status
    const loan = await tx.loan.findUnique({ where: { id: loanId } });
    const newTotalRepaid = loan.totalRepaid + amount;
    
    // Check if loan is now fully paid
    const interest = (loan.principalAmount * (loan.interestRate / 100));
    const totalDue = loan.principalAmount + interest + loan.penaltyAmount;
    const isFullyPaid = newTotalRepaid >= totalDue;

    await tx.loan.update({
      where: { id: loanId },
      data: {
        totalRepaid: newTotalRepaid,
        repaymentStatus: isFullyPaid ? 'FULL' : 'PARTIAL',
        status: isFullyPaid ? 'CLOSED' : 'ACTIVE',
        fullyPaidAt: isFullyPaid ? new Date() : null
      }
    });

    // 3. Notify the user
    await tx.notification.create({
      data: {
        userId,
        type: 'REPAYMENT_CONFIRM',
        title: 'Payment Received! ✅',
        body: `We have received your payment of KSh ${amount}. Your new balance is KSh ${Math.max(0, totalDue - newTotalRepaid)}.`,
      }
    });

    return transaction;
  });
};

module.exports = { recordRepayment };
