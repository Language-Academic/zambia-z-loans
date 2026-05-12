const nodemailer = require('nodemailer');
const { formatCurrency } = require('./formatters'); // Utility to handle KSh/ZK formatting

// 1. Singleton Transporter: Reuse the same connection for performance
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true, // Key for pro apps: keeps the connection open
  maxConnections: 5,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Core Mail Sender Wrapper
 * Standardizes error handling and logging across the app
 */
const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Zambia Z Digital" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[MAIL] Sent: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[MAIL ERROR] Failed to send to ${to}:`, error.message);
    // In production, you'd log this to a service like Sentry or Winston
    return { success: false, error: 'Email delivery failed' };
  }
};

/**
 * DOMAIN SPECIFIC EMAIL FUNCTIONS
 */

// Uses template literals for clean, readable HTML
const sendWelcomeEmail = (user) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
      <h2 style="color: #2563eb;">Welcome to Zambia Z, ${user.fullName}!</h2>
      <p>Your digital wallet is ready. Your initial loan limit is: 
         <strong>${formatCurrency(user.loanLimit)}</strong>
      </p>
      <a href="${process.env.APP_URL}/login" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Dashboard</a>
    </div>
  `;
  return sendMail(user.email, 'Welcome to Zambia Z - Account Verified', html);
};

const sendLoanStatusEmail = (user, loan, status) => {
  const colors = {
    APPROVED: '#10b981',
    REJECTED: '#dc2626',
    PENDING: '#f59e0b'
  };

  const html = `
    <div style="font-family: sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 10px;">
      <h2 style="color: ${colors[status] || '#333'}">Loan Application Update</h2>
      <p>Hello ${user.fullName}, your application for <strong>${formatCurrency(loan.amount)}</strong> is currently <strong>${status}</strong>.</p>
      ${status === 'APPROVED' ? '<p>Please check your app to accept the disbursement.</p>' : ''}
      <p>Reference: ${loan.id}</p>
    </div>
  `;
  return sendMail(user.email, `Loan Status Update: ${status}`, html);
};

module.exports = {
  sendWelcomeEmail,
  sendLoanStatusEmail
};
