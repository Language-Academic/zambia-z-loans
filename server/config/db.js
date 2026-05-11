import mongoose from 'mongoose';

/**
 * Zambia Z - Database Connection Manager
 * Features: Singleton pattern, auto-retry, and lifecycle event logging.
 */

// Connection state to prevent multiple connection attempts
let isConnected = false;

export const connectDB = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('CRITICAL: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const db = await mongoose.connect(mongoUri, {
      // Professional production settings
      maxPoolSize: 10,             // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Fail fast if the server is down
      socketTimeoutMS: 45000,      // Close sockets after 45 seconds of inactivity
      family: 4                    // Use IPv4, skipping IPv6 attempt for faster connection
    });

    isConnected = !!db.connections[0].readyState;
    
    console.log(`🚀 MongoDB Connected: ${db.connection.host}`);

    // Handle connection events for long-running processes
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Database connection failed: ${message}`);
    
    // In production, we might want to retry instead of immediate exit
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
