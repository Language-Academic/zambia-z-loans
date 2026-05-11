const prisma = require('../config/prisma');

/**
 * ZAMBIA Z - NOTIFICATION SYSTEM
 * Strategy: Strict ownership verification and efficient batching.
 */

// @desc    Create notification (Internal/Admin)
const createNotification = async (req, res, next) => {
  try {
    const { userId, loanId, title, message } = req.body;

    const notification = await prisma.notification.create({
      data: { userId, loanId, title, message },
      include: {
        user: { select: { fullName: true, email: true } },
        loan: { select: { amount: true, status: true } },
      },
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's notifications (Self) or All (Admin)
const getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isRead } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user.role === 'ADMIN' && req.query.userId ? req.query.userId : req.user.uid;

    const where = {
      userId,
      ...(isRead !== undefined && { isRead: isRead === 'true' }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          loan: { select: { amount: true, status: true } },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark specific notification as read (with ownership check)
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Use updateMany to safely enforce ownership without a separate query
    const updateResult = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    if (updateResult.count === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found or unauthorized' });
    }

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark ALL notifications as read for current user
const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.uid, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification (with ownership check)
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const deleteResult = await prisma.notification.deleteMany({
      where: { id, userId },
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found or unauthorized' });
    }

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
