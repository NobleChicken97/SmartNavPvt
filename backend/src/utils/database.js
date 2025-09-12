import mongoose from 'mongoose';
import logger from './logger.js';

/**
 * Database connection utilities for MongoDB Atlas
 * @fileoverview Provides secure database connection and management for Smart Navigator
 */

/**
 * Establishes connection to MongoDB Atlas database
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} When connection fails or MONGODB_URI is not configured
 * @description Sets up MongoDB connection with proper event handlers and graceful shutdown
 * @example
 * try {
 *   await connectDB();
 *   console.log('Database ready for operations');
 * } catch (error) {
 *   console.error('Failed to connect to database:', error);
 * }
 */
const connectDB = async () => {
  try {
    // Validate environment configuration
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not configured');
    }

    // Establish connection with modern options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // Maximum number of connections in connection pool
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send/receive on socket can take
      bufferCommands: false, // Disable mongoose buffering
    });

    const dbLogger = logger.child({ component: 'database', operation: 'connection' });
    dbLogger.info('MongoDB connection established', {
      host: conn.connection.host,
      database: conn.connection.name,
      readyState: conn.connection.readyState
    });
    
    /**
     * Handles MongoDB connection errors after initial connection
     * @param {Error} err - MongoDB connection error
     */
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      // Optionally implement reconnection logic here
    });

    /**
     * Handles MongoDB disconnection events
     */
    mongoose.connection.on('disconnected', () => {
      const dbLogger = logger.child({ component: 'database', event: 'disconnected' });
      dbLogger.warn('MongoDB disconnected - attempting to reconnect', { reason: 'connection_lost' });
    });

    /**
     * Handles MongoDB reconnection events
     */
    mongoose.connection.on('reconnected', () => {
      const dbLogger = logger.child({ component: 'database', event: 'reconnected' });
      dbLogger.info('MongoDB reconnected successfully');
    });

    /**
     * Graceful shutdown handler for SIGINT (Ctrl+C)
     * Ensures proper database connection cleanup before process exit
     */
    process.on('SIGINT', async () => {
      try {
        const dbLogger = logger.child({ component: 'database', event: 'shutdown', signal: 'SIGINT' });
        dbLogger.info('Received SIGINT - shutting down gracefully');
        await mongoose.connection.close();
        dbLogger.info('MongoDB connection closed successfully');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during database shutdown:', error.message);
        process.exit(1);
      }
    });

    /**
     * Graceful shutdown handler for SIGTERM (process termination)
     * Ensures proper database connection cleanup before process exit
     */
    process.on('SIGTERM', async () => {
      try {
        const dbLogger = logger.child({ component: 'database', event: 'shutdown', signal: 'SIGTERM' });
        dbLogger.info('Received SIGTERM - shutting down gracefully');
        await mongoose.connection.close();
        dbLogger.info('MongoDB connection closed successfully');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during database shutdown:', error.message);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    // Log additional connection details for debugging
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Check your MongoDB Atlas connection string and network access');
    }
    
    process.exit(1);
  }
};

export default connectDB;
