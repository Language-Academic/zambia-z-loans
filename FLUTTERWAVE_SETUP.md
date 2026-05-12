🚀 Getting Started with PesaPal
This guide will help you set up PesaPal V3 for live payments in your Zambia Z Digital application. This integration allows you to receive money securely via mobile money and cards.

📋 Prerequisites
PesaPal Merchant Account: Sign up at pesapal.com.

Business Verification: Complete your KYC and business registration details on the PesaPal dashboard.

HTTPS Domain: Ensure your production server has a valid SSL certificate for secure IPN communication.

🔑 Step 1: Get Your API Credentials
1.1 Access API Settings
Log in to your PesaPal Dashboard.

Navigate to Settings → API Keys.

1.2 Copy Your Keys
You will need these two credentials to generate your OAuth2 access tokens:

Plaintext
PESAPAL_CONSUMER_KEY=your_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_consumer_secret_here
⚠️ Important: Ensure you are using Production keys for live payments and Sandbox keys for development.

🌐 Step 2: Set Up IPN (Instant Payment Notification)
2.1 Register IPN URL
In your PesaPal Dashboard, go to IPN Settings.

Register your IPN URL:

Plaintext
https://api.zambiaz.com/api/v1/payments/pesapal-ipn
Set the IPN Method to GET or POST as per your backend controller configuration.

2.2 Get IPN ID
After registration, PesaPal provides a unique IPN ID (UUID). Copy this—it is required for every order request.

⚙️ Step 3: Configure Environment Variables
3.1 Edit .env file
Replace your previous payment configurations in the .env file with these PesaPal variables:

Code snippet
# ==========================================
# PAYMENT GATEWAY: PESAPAL V3
# ==========================================
PESAPAL_ENVIRONMENT=sandbox  # Change to 'production' for live
PESAPAL_CONSUMER_KEY=your_pesapal_key
PESAPAL_CONSUMER_SECRET=your_pesapal_secret
PESAPAL_IPN_ID=your_registered_ipn_id
PESAPAL_CALLBACK_URL=https://zambiaz.com/payment-confirmation
🧪 Step 4: Test Your Setup
4.1 Use Sandbox Environment
Set PESAPAL_ENVIRONMENT=sandbox in your configuration.

Use PesaPal test credentials to simulate transactions.

4.2 Verify Token Generation
Ensure your server successfully exchanges keys for a Bearer Token.

Check that the token refreshes correctly before expiration.

4.3 Test IPN Callback
Complete a test payment and verify that your server receives the status update and updates the database via Prisma.

🚀 Step 5: Go Live
5.1 Switch to Live Credentials
Replace Sandbox keys with Live Consumer Keys from your business dashboard.

Update PESAPAL_ENVIRONMENT to production.

5.2 Update URLs
Verify that your PESAPAL_CALLBACK_URL points to your live production domain.

💳 Supported Payment Methods
Through PesaPal V3, Zambia Z Digital supports:

Mobile Money: M-Pesa, Airtel Money, MTN.

Cards: Visa, Mastercard, American Express.

Bank Transfers: Real-time settlements from supported banks.

🔧 Troubleshooting
"Authorization Failed": Check for trailing spaces in your Consumer Secret or ensure your server time is synced.

IPN Not Arriving: Ensure your IPN URL is publicly accessible and using HTTPS.

Invalid IPN ID: Double-check that the PESAPAL_IPN_ID in your .env matches the UUID in your dashboard.
