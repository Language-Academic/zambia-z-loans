# ZAMBIA-Z-LOANS - Professional Kenyan Lending Platform

A high-performance, full-stack loan management system built for the Kenyan market. **Zambia Z** offers a seamless borrowing experience with automated Pesapal integration for secure payment processing.

## 🚀 Features

### For Borrowers
*   **Secure Onboarding:** Fast registration and KYC verification.
*   **Pesapal Integration:** Securely repay loans using M-PESA, Visa, or Mastercard through the Pesapal gateway.
*   **Real-Time Dashboard:** Monitor loan limits, active balances, and upcoming due dates.
*   **Zambia Z Credit Scoring:** Automated eligibility checks based on user repayment history.

### For Administrators
*   **Management Suite:** Full control over loan approvals, disbursements, and user records.
*   **Pesapal Tracking:** Automated reconciliation of payments received via Pesapal.
*   **Analytics:** Track disbursement trends and collection rates across Nairobi and beyond.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Payments** | Pesapal S3 API (M-PESA/Cards) |

---

## ⚙️ Quick Start

### 1. Environment Configuration
Create a `.env` file in the **server** directory with your specific credentials:

```env
PORT=5000
MONGO_URI=mongodb+srv://zambiaz_admin:KenyaTamu%402541999@zambiaz-admin.6hv5svw.mongodb.net/?appName=zambiaz-admin
JWT_SECRET=zambiaz_secure_auth_2026
PESAPAL_CONSUMER_KEY=your_pesapal_key
PESAPAL_CONSUMER_SECRET=your_pesapal_secret
PESAPAL_ENV=sandbox # Change to 'live' for production
NODE_ENV=production
