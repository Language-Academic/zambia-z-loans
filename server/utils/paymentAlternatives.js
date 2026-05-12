const mpesa = require('./mpesa');
const flutterwave = require('./flutterwave');
const { formatCurrency } = require('./formatters');

/**
 * Strategy Registry
 * Maps payment IDs to their specific handler functions
 */
const PAYMENT_STRATEGIES = {
  mpesa_direct: async (data, amount, ref) => {
    return await mpesa.initiateStkPush(data.phoneNumber, amount, ref);
  },
  flutterwave_mpesa: async (data, amount, ref) => {
    return await flutterwave.initiateFlutterwavePayment({
      phoneNumber: data.phoneNumber,
      amount,
      email: data.email,
      name: data.fullName,
      reference: ref
    });
  },
  bank_transfer: async (data, amount, ref) => {
    // Return structured instructions for manual verification
    return {
      success: true,
      status: 'AWAITING_CONFIRMATION',
      instructions: `Please pay ${formatCurrency(amount)} to Equity Bank, Acc: 123456789. Use Ref: ${ref}`,
      reference: ref
    };
  }
};

/**
 * Unified Payment Entry Point
 * Orchestrates logic and fallbacks
 */
const processLoanFeePayment = async (methodId, paymentData, amount, reference) => {
  console.log(`[PAYMENT] Attempting ${methodId} for Ref: ${reference}`);

  const strategy = PAYMENT_STRATEGIES[methodId];
  
  if (!strategy) {
    throw new Error(`Payment method ${methodId} is not supported.`);
  }

  try {
    const result = await strategy(paymentData, amount, reference);
    return {
      ...result,
      processedAt: new Date(),
      method: methodId
    };
  } catch (error) {
    console.error(`[PAYMENT FAILURE] ${methodId}:`, error.message);
    
    // Pro-Level Fallback: If Direct M-Pesa fails, attempt Flutterwave automatically
    if (methodId === 'mpesa_direct') {
      console.log('[PAYMENT] Falling back to Flutterwave...');
      return await PAYMENT_STRATEGIES.flutterwave_mpesa(paymentData, amount, reference);
    }

    throw new Error('Payment initiation failed. Please try a different method.');
  }
};

/**
 * Get Active Payment Methods
 * Filtered by environment (no Mocks in production)
 */
const getAvailablePaymentMethods = () => {
  const methods = [
    {
      id: 'mpesa_direct',
      name: 'M-PESA Direct',
      description: 'Instant STK Push to your phone',
      icon: 'mpesa_logo.png'
    },
    {
      id: 'flutterwave_mpesa',
      name: 'Mobile Money (Alternative)',
      description: 'Works with Airtel & M-PESA via Flutterwave',
      icon: 'flw_logo.png'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Pay via Equity Eazzy or Branch',
      icon: 'bank_icon.png'
    }
  ];

  // In production, we don't return the "Mock" method
  if (process.env.NODE_ENV !== 'production') {
    methods.push({ id: 'mock', name: 'Test Payment', description: 'Development only' });
  }

  return methods;
};

module.exports = {
  processLoanFeePayment,
  getAvailablePaymentMethods
};
