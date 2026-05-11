const prisma = require('../config/prisma');

/**
 * ZAMBIA Z - USER & ELIGIBILITY CONTROLLER
 * Strategy: Comprehensive data aggregation and defensive logic.
 */

// @desc    Get complete user profile with financial summary
// @route   GET /api/user/profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.uid;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        nationalId: true,
        isCitizen: true,
        creditScore: true,
        role: true,
        loanLimit: true,
        isActive: true,
        totalLoansApplied: true,
        // Pro-Level: Include active debt summary
        loans: {
          where: { status: 'approved', disbursementStatus: 'completed' },
          select: { amount: true, feeAmount: true }
        }
      },
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Calculate total outstanding balance (Principal + Fees)
    const outstandingBalance = user.loans.reduce((acc, loan) => acc + (loan.amount + loan.feeAmount), 0);

    res.json({
      success: true,
      data: {
        ...user,
        loans: undefined, // Remove the raw loan list from the profile object
        outstandingBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check loan eligibility with dynamic limit calculation
// @route   GET /api/user/eligibility
const checkEligibility = async (req, res, next) => {
  try {
    const userId = req.user.uid;

    // 1. Fetch user and check for any active loans in one query
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loans: {
          where: { status: { in: ['pending', 'approved'] } },
          select: { id: true, status: true }
        }
      }
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 2. Hard Eligibility Checks
    const rejections = [];
    if (!user.isCitizen) rejections.push('Only Kenyan citizens are eligible');
    if (!user.isActive) rejections.push('Your account is currently inactive');
    if (user.loans.length > 0) rejections.push('You have an active or pending loan application');

    if (rejections.length > 0) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          reasons: rejections,
          maxAmount: 0
        }
      });
    }

    // 3. Pro-Level Limit Logic: Use a tiered structure
    let calculatedMax = user.loanLimit;
    const score = user.creditScore;

    const tiers = [
      { minScore: 700, limitMultiplier: 1.0 },
      { minScore: 500, limitMultiplier: 0.8 },
      { minScore: 300, limitMultiplier: 0.5 },
      { minScore: 0,   limitMultiplier: 0.2 }
    ];

    const activeTier = tiers.find(t => score >= t.minScore);
    calculatedMax = Math.floor(user.loanLimit * activeTier.limitMultiplier);

    // New user ceiling (anti-fraud measure)
    if (user.totalLoansApplied === 0) {
      calculatedMax = Math.min(calculatedMax, 30000);
    }

    res.json({
      success: true,
      data: {
        eligible: true,
        creditScore: score,
        maxAmount: calculatedMax,
        loanLimit: user.loanLimit,
        tier: activeTier.minScore >= 700 ? 'Platinum' : activeTier.minScore >= 500 ? 'Gold' : 'Standard'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get loan history with admin details
// @route   GET /api/user/loans
const getLoanHistory = async (req, res, next) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.user.uid },
      orderBy: { createdAt: 'desc' },
      include: {
        // Only include admin name if the loan was approved/rejected
        approvedByAdmin: {
          select: { fullName: true },
        },
      },
    });

    res.json({ success: true, data: loans });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications (paginated)
// @route   GET /api/user/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.uid },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        loan: { select: { amount: true, status: true } },
      },
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  checkEligibility,
  getLoanHistory,
  getNotifications,
};
