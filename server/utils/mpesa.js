const axios = require('axios');
const prisma = require('../config/prisma');

// 1. Singleton Configuration & State
const MPESA_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

let cachedToken = null;
let tokenExpiry = null;

/**
 * Professional Token Management with Caching
 * Avoids hitting Safaricom rate limits
 */
const getAccessToken = async () => {
  const now = new Date();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  try {
    const { data } = await axios.get(`${MPESA_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` }
    });

    cachedToken = data.access_token;
    // Set expiry 1 minute early for safety buffer
    tokenExpiry = new Date(now.getTime() + (data.expires_in - 60) * 1000);
    
    return cachedToken;
  } catch (error) {
    console.error('[MPESA TOKEN ERROR]:', error.response?.data || error.message);
    throw new Error('M-PESA Authentication failed');
  }
};

/**
 * Sanitizes phone numbers to 254XXXXXXXXX format
 */
const formatPhone = (phone) => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '254' + cleaned.slice(1);
  if (cleaned.startsWith('7')) cleaned = '254' + cleaned;
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  return cleaned;
};

/**
 * STK Push (Lipa Na M-PESA Online)
 */
const initiateStkPush = async (phoneNumber, amount, loanId) => {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount), // Ensure no decimals
    PartyA: formatPhone(phoneNumber),
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: formatPhone(phoneNumber),
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: `JAMII-${loanId}`,
    TransactionDesc: 'Loan Processing Fee'
  };

  try {
    const { data } = await axios.post(`${MPESA_URL}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('[MPESA STK ERROR]:', error.response?.data || error.message);
    throw new Error('Failed to trigger STK Push prompt');
  }
};

/**
 * B2C Disbursement (Sending money to customer)
 */
const initiateB2CDisbursement = async (phoneNumber, amount, loanId) => {
  const token = await getAccessToken();

  const payload = {
    InitiatorName: process.env.MPESA_INITIATOR_NAME,
    SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
    CommandID: 'BusinessPayment',
    Amount: amount,
    PartyA: process.env.MPESA_SHORTCODE,
    PartyB: formatPhone(phoneNumber),
    Remarks: `Disbursement-${loanId}`,
    QueueTimeOutURL: process.env.MPESA_QUEUE_TIMEOUT_URL,
    ResultURL: process.env.MPESA_RESULT_URL,
    Occassion: 'Loan Disbursement'
  };

  try {
    const { data } = await axios.post(`${MPESA_URL}/mpesa/b2c/v1/paymentrequest`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('[MPESA B2C ERROR]:', error.response?.data || error.message);
    throw new Error('M-PESA disbursement request failed');
  }
};

module.exports = {
  initiateStkPush,
  initiateB2CDisbursement,
  getAccessToken
};
