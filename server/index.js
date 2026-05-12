const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const prisma = require('./config/prisma');
const errorHandler = require('./middleware/errorHandler');

// 1. Initial Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 2. Database Connection Logic
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ MongoDB Connected via Prisma');
    
    // Seed Super Admin if credentials exist
    if (process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD) {
      const seedSuperAdmin = require('./seedSuperAdmin');
      await seedSuperAdmin();
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// 3. Security & Global Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://jamii-loan-i2yo.onrender.com", "*.flutterwave.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'https://zambiaz.com']
    : [/localhost/], // Use regex to allow any localhost port in dev
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. API Routes
// Grouping these ensures they are checked before any static file serving
const apiRouter = express.Router();
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/user', require('./routes/userRoutes'));
apiRouter.use('/loan', require('./routes/loanRoutes'));
apiRouter.use('/mpesa', require('./routes/mpesaRoutes'));
apiRouter.use('/payment', require('./routes/paymentRoutes'));
apiRouter.use('/transactions', require('./routes/transactionRoutes'));

app.use('/api', apiRouter);

// 5. Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 6. Static File Serving (Production Only Logic)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Zambia Z Digital API - Development Mode' });
  });
}

// 7. Error Handling (Must be after routes)
app.use(errorHandler);

// 8. Server Startup & Graceful Shutdown
const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  // Graceful Shutdown: Close Prisma and Server on SIGTERM (e.g., Render/Heroku restart)
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('HTTP server and Prisma connection closed');
      process.exit(0);
    });
  });
};

startServer();

module.exports = app; // Export for testing
