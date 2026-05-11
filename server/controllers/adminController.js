const prisma = require('../config/prisma');
const { initiateB2CDisbursement } = require('../utils/mpesa');
const { 
  sendLoanApprovalEmail, 
  sendLoanRejectionEmail, 
  sendLoanDisbursementEmail 
} = require('../utils/email');

/**
 * HELPER: Centralized Loan Approval Logic
 * Used by standard, auto, and special approval to ensure consistency.
 */
const executeApproval = async (loanId, adminId, { isAuto = false, isSpecial = false, creditBoost = 50 }) => {
  return await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({
      where: { id: loanId },
      include: { user: true }
    });

    if (!loan || loan.status !== 'pending') {
      throw new Error('Loan not found or already processed');
    }

    // 1. Update Loan
    const updatedLoan = await tx.loan.update({
      where: { id: loanId },
      data: {
        status: 'approved',
        approvedBy: isAuto ? null : adminId,
        approvalDate: new Date(),
        isAutoApproved: isAuto,
        isSpecialApproved: isSpecial,
      },
    });

    // 2. Update User Metrics
    const updatedUser = await tx.user.update({
      where: { id: loan.userId },
      data: {
        creditScore: { increment: creditBoost },
        totalLoansApproved: { increment: 1 },
      },
    });

    // 3. Create Notification Record
    await tx.notification.create({
      data: {
        userId: loan.userId,
        loanId: loan.id,
        title: isSpecial ? 'Special Approval' : 'Loan Approved',
        message: `Your loan of KSh ${loan.amount.toLocaleString()} is approved.`,
      },
    });

    return { updatedLoan, updatedUser };
  });
};

// --- CONTROLLERS ---

const approveLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { updatedLoan, updatedUser } = await executeApproval(id, req.user.userId, { 
      creditBoost: 50 
    });

    sendLoanApprovalEmail(updatedUser, updatedLoan).catch(console.error);

    res.json({ success: true, data: updatedLoan });
  } catch (error) {
    next(error);
  }
};

const autoApproveLoan = async (req, res, next) => {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    // Professional Criteria Check
    const criteria = {
      feePaid: loan?.feePaid || false,
      goodCredit: (loan?.user?.creditScore || 0) >= 600,
      isCitizen: loan?.user?.isCitizen || false
    };

    if (!Object.values(criteria).every(Boolean)) {
      return res.status(400).json({ success: false, message: 'Criteria not met', criteria });
    }

    const { updatedLoan, updatedUser } = await executeApproval(req.params.id, null, { 
      isAuto: true, 
      creditBoost: 25 
    });

    res.json({ success: true, message: 'Auto-approved', data: updatedLoan });
  } catch (error) {
    next(error);
  }
};

const initiateLoanDisbursement = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Use a transaction to lock the record so no two admins can disburse at once
    const disbursement = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id }, include: { user: true } });
      
      if (loan.disbursementStatus !== 'pending') throw new Error('Already processing');

      return await tx.loan.update({
        where: { id },
        data: { disbursementStatus: 'processing' },
        include: { user: true }
      });
    });

    try {
      // M-PESA Integration
      const result = await initiateB2CDisbursement(disbursement.user.nationalId, disbursement.amount, id);
      
      const finalLoan = await prisma.loan.update({
        where: { id },
        data: { 
          disbursementStatus: 'completed', 
          disbursementTransactionId: result.transactionId 
        }
      });

      sendLoanDisbursementEmail(disbursement.user, finalLoan).catch(console.error);
      res.json({ success: true, transactionId: result.transactionId });

    } catch (err) {
      // Rollback status if M-PESA fails
      await prisma.loan.update({ where: { id }, data: { disbursementStatus: 'failed' } });
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLoans,
  approveLoan,
  rejectLoan,
  autoApproveLoan,
  initiateLoanDisbursement,
  // ... rest of exports
};
