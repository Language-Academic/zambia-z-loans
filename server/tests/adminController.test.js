const { autoApproveLoan, getAdminStats } = require('../controllers/adminController');
const prisma = require('../config/prisma');

// Mock Prisma to avoid hitting the real database during unit tests
jest.mock('../config/prisma', () => ({
  loan: {
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(require('../config/prisma'))),
}));

describe('Admin Controller - Financial Logic', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { params: {}, user: { id: 'admin_123', role: 'ADMIN' } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('autoApproveLoan()', () => {
    const loanId = 'loan_888';
    const mockLoan = {
      id: loanId,
      userId: 'user_456',
      amount: 5000,
      status: 'PENDING',
      feePaid: true,
      user: { creditScore: 750 } // Critical for auto-approval
    };

    it('should approve loan if credit score > 700 and fee is paid', async () => {
      mockReq.params.id = loanId;
      prisma.loan.findUnique.mockResolvedValue(mockLoan);

      await autoApproveLoan(mockReq, mockRes, mockNext);

      // Verify logic: Status must change to APPROVED
      expect(prisma.loan.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: loanId },
        data: { status: 'APPROVED', isAutoApproved: true }
      }));

      // Verify customer is notified
      expect(prisma.notification.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should fail auto-approval if processing fee is missing', async () => {
      mockReq.params.id = loanId;
      prisma.loan.findUnique.mockResolvedValue({ ...mockLoan, feePaid: false });

      await autoApproveLoan(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Processing fee must be paid for auto-approval'
      }));
    });
  });

  describe('getAdminStats()', () => {
    it('should aggregate financial data for dashboard', async () => {
      prisma.loan.count.mockResolvedValue(150);
      prisma.loan.findMany.mockResolvedValue([{ amount: 1000 }, { amount: 2000 }]);

      await getAdminStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          totalLoans: 150,
          totalVolume: 3000
        })
      }));
    });
  });
});
