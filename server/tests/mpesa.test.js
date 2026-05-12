const { initiateB2CDisbursement } = require('../utils/mpesa');
const axios = require('axios');
const prisma = require('../config/prisma');

// Mock Axios to simulate Safaricom API responses
jest.mock('axios');

describe('M-PESA B2C Disbursement Integration', () => {
  const validPhone = '254712345678';
  const amount = 5000;
  const loanId = 'loan_abc_123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return success when Safaricom accepts the disbursement', async () => {
    // 1. Setup the Mock Response from Safaricom
    axios.post.mockResolvedValue({
      data: {
        ConversationID: "AG_20260512_000076cf",
        OriginatorConversationID: "12345-67890-1",
        ResponseCode: "0",
        ResponseDescription: "Accept the service request successfully."
      }
    });

    // 2. Execute the function
    const result = await initiateB2CDisbursement(validPhone, amount, loanId);

    // 3. Assertions
    expect(result.success).toBe(true);
    expect(result.conversationId).toBeDefined();
    // Ensure the function actually tried to hit Safaricom
    expect(axios.post).toHaveBeenCalledTimes(2); // 1 for Token, 1 for B2C
  });

  it('should throw an error if the phone number is incorrectly formatted', async () => {
    const invalidPhone = '07123456'; // Missing country code/too short

    await expect(initiateB2CDisbursement(invalidPhone, amount, loanId))
      .rejects
      .toThrow('Invalid Kenyan phone number format');
    
    // Ensure no API call was even attempted for bad data
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('should handle Safaricom internal server errors gracefully', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 500,
        data: { errorMessage: "Internal Server Error" }
      }
    });

    try {
      await initiateB2CDisbursement(validPhone, amount, loanId);
    } catch (error) {
      expect(error.message).toContain('M-PESA API Error');
    }
  });
});
