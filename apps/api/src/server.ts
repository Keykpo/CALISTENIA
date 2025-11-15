import app from './app';
import { config } from './config';
import { databaseService } from './config/database';
import { redisService } from './config/redis';
import { logInfo, logError, logWarn } from './config/logger';
import { verifyEmailConfig } from './services/emailService';

/**
 * Initialize all services
 */
async function initializeServices(): Promise<void> {
  try {
    // Connect to database
    logInfo('Connecting to database...');
    await databaseService.connect();
    logInfo('Database connected successfully');

    // Connect to Redis (optional)
    try {
      logInfo('Connecting to Redis...');
      await redisService.connect();
      logInfo('Redis connected successfully');
    } catch (error) {
      logWarn('Redis connection failed', { error });
      logWarn('Cache and session features will be disabled');
    }

    // Verify email configuration (optional)
    if (config.email.enabled) {
      try {
        logInfo('Verifying email configuration...');
        await verifyEmailConfig();
        logInfo('Email configuration verified successfully');
      } catch (error) {
        logWarn('Email configuration verification failed', { error });
        logWarn('Email services will be disabled');
      }
    }

    logInfo('All services initialized successfully');
  } catch (error) {
    logError('Failed to initialize services', error as Error);
    throw error;
  }
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Initialize services first
    await initializeServices();

    // Start HTTP server
    const server = app.listen(config.server.port, () => {
      logInfo(`🚀 Server running on port ${config.server.port}`);
      logInfo(`📱 Environment: ${config.app.environment}`);
      logInfo(`🔗 API URL: ${config.server.apiUrl}`);
      logInfo(`🌐 Client URL: ${config.server.frontendUrl}`);
      
      if (config.app.environment === 'development') {
        logInfo(`📚 API Docs: ${config.server.apiUrl}/api/docs`);
        logInfo(`❤️  Health Check: ${config.server.apiUrl}/health`);
      }
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.server.port === 'string'
        ? 'Pipe ' + config.server.port
        : 'Port ' + config.server.port;

      switch (error.code) {
        case 'EACCES':
          logError(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logError(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logInfo(`Received ${signal}, shutting down gracefully`);
      
      server.close(async () => {
        logInfo('HTTP server closed');
        
        try {
          await databaseService.disconnect();
          await redisService.disconnect();
          logInfo('All connections closed');
          process.exit(0);
        } catch (error) {
          logError('Error during shutdown', error as Error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logError('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logError('Failed to start server', error as Error);
    process.exit(1);
  }
}

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logError('Uncaught Exception - shutting down', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection - shutting down', new Error(String(reason)), { promise });
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer().catch((error) => {
    logError('Failed to start application', error);
    process.exit(1);
  });
}

export { app, startServer };