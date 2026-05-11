const prisma = require('../config/prisma');

/**
 * ZAMBIA Z - FINANCIAL TRANSACTION LEDGER
 * Strategy: Immutable ledger principles and strict data isolation.
 */

// @desc    Create transaction (Internal/System Use)
// Note: Usually called by payment callbacks or disbursement logic
const createTransaction = async (req, res, next) => {
  try {
    const { 
      userId, loanId, amount, type, status, 
      mpesaReceiptNumber, phoneNumber, description 
    } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        loanId,
        amount,
        type,
        status: status || 'pending',
        mpesaReceiptNumber,
        phoneNumber,
        description,
      },
      include: {
        user: { select: { fullName: true, email: true } },
        loan: { select: { amount: true, status: true } },
      },
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Transactions (Admin Dashboard)
const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, userId, type, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(userId && { userId }),
      ...(type && { type }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { mpesaReceiptNumber: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search } },
          { user: { fullName: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, phoneNumber: true } },
          loan: { select: { amount: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get My Transactions (Self Only)
const getUserTransactions = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          loan: { select: { amount: true, status: true } },
        },
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Transaction (With Ownership Check)
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, email: true } },
        loan: { select: { amount: true, status: true } },
      },
    });

    if (!transaction) return res.status(404).json({ success: false, message: 'Not found' });

    // SECURITY: Prevent users from viewing other people's money records
    if (req.user.role !== 'ADMIN' && transaction.userId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Transaction Statistics for Admin Dashboard
const getTransactionStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const where = { ...(Object.keys(dateFilter).length && { createdAt: dateFilter }) };

    // Advanced aggregation for financial reporting
    const stats = await prisma.transaction.aggregate({
      where: { ...where, status: 'completed' },
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true }
    });

    const byType = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        totalVolume: stats._sum.amount || 0,
        transactionCount: stats._count.id,
        averageValue: stats._avg.amount || 0,
        breakdown: byType,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getUserTransactions,
  getTransactionStats,
  // Note: update and delete are removed as financial ledgers should be immutable
};
