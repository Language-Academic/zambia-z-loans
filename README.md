💸 ZAMBIA-Z-LOANSEmpowering Financial Growth in KenyaZambia Z Loans is a professional-grade, full-stack digital lending platform designed for the Kenyan market. Built on the MERN stack (MongoDB, Express, React, Node.js), it provides a seamless, secure, and automated borrowing experience. By leveraging the Pesapal S3 API, Zambia Z offers diverse repayment options including M-PESA, Visa, and Mastercard.🚀 Core FeaturesFor BorrowersIntuitive Onboarding: Streamlined registration with secure KYC data handling.Credit Eligibility Engine: Automated scoring to determine loan limits based on repayment history.Pesapal Gateway: Integrated payment processing for instant loan repayments.Dynamic Dashboard: Real-time tracking of active loans, interest accrued, and upcoming due dates.Instant Notifications: Status updates on loan approvals and payment confirmations.For AdministratorsExecutive Command Center: Comprehensive overview of total disbursements, collections, and defaults.Automated Workflow: One-click approval/rejection system for loan applications.User Auditing: Detailed profiles and financial history for every registered borrower.Transaction Reconciliation: Automated matching of Pesapal payments to user accounts.🛠 Tech StackLayerTechnologyFrontendReact.js, Vite, Tailwind CSSBackendNode.js, Express.jsDatabaseMongoDB Atlas (Distributed Cloud)PaymentsPesapal S3 API (Multi-channel)AuthenticationJSON Web Tokens (JWT) & BCrypt EncryptionDeploymentVercel (Frontend) & Render (Backend)⚙️ Environment ConfigurationTo run Zambia Z professionally, create a .env file in the server directory and populate it with your credentials.Server Environment Variables (/server/.env)Code snippet# Server Configuration
PORT=5000
NODE_ENV=production

# Database (MongoDB Atlas)
MONGO_URI=mongodb+srv://zambiaz_admin:KenyaTamu%402541999@zambiaz-admin.6hv5svw.mongodb.net/?appName=zambiaz-admin

# Security
JWT_SECRET=zambiaz_secure_auth_protocol_2026

# Pesapal S3 API Configuration
PESAPAL_CONSUMER_KEY=your_pesapal_key
PESAPAL_CONSUMER_SECRET=your_pesapal_secret
PESAPAL_IPN_ID=your_registered_ipn_id
PESAPAL_ENV=sandbox # Switch to 'live' for production

# URLs
FRONTEND_URL=https://zambiaz.vercel.app
📦 Installation & Deployment1. Local SetupBash# Clone the repository
git clone https://github.com/Language-Academic/zambia-z-loans.git

# Install all dependencies
npm run install-all

# Start the development environment
npm run dev
2. Deployment WorkflowBackend: Deploy the server folder to Render.com. Ensure all Environment Variables are added to the Render Dashboard.Frontend: Deploy the client folder to Vercel.com. Set the VITE_API_URL to point to your Render URL.🛡 Security & ComplianceZambia Z follows industry best practices for financial data security:HTTPS Only: All communications are encrypted via SSL.Data Masking: Sensitive user information is hashed before storage.Tokenization: Secure session management via JWT to prevent unauthorized access.🔑 Initial Admin CredentialsFor the first-time setup and testing, use the following credentials to access the Admin Suite:Admin Email: admin@zambiaz.comAdmin Password: admin123Note: It is mandatory to update these credentials in the settings immediately after first login.⚖️ LicenseThis project is licensed under the ISC License.Developed with passion in Nairobi, Kenya.Zambia Z - Fast, Reliable, Professional.
