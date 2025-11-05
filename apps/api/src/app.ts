import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import { db as databaseService } from './config/database';
import { redisService } from './config/redis';
import { logInfo, logError, logHttp } from './config/logger';
import {
  corsOptions,
  helmetConfig,
  securityHeaders,
  securityLogger,
  sanitizeRequest,
  validateContentType,
} from './middleware/security';
import {
  rateLimiter,
} from './middleware/rateLimiter';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler';
import routes from './routes';

// Create Express app
const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(securityLogger);

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
}));

// Request logging
if (config.app.environment !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logHttp(message.trim());
      },
    },
  }));
}

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification
    (req as any).rawBody = buf;
  },
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Content type validation for POST/PUT requests
app.use(validateContentType([
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
]));

// Request sanitization
app.use(sanitizeRequest);

// Health check endpoint (before other routes)
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbHealth = await databaseService.healthCheck();
    
    // Check Redis connection
    const redisHealth = await redisService.healthCheck();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.app.environment,
      version: config.app.version,
      services: {
        database: dbHealth ? 'healthy' : 'unhealthy',
        redis: redisHealth ? 'healthy' : 'unhealthy',
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    const statusCode = dbHealth && redisHealth ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logError('Health check failed', error as Error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
    });
  }
});

// API routes
app.use('/api/v1', routes);

// Serve static files (uploaded files)
app.use('/uploads', express.static(config.fileStorage.uploadPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true,
}));

// API documentation (in development)
if (config.app.environment === 'development') {
  app.get('/api/docs', (req, res) => {
    res.json({
      message: 'API Documentation',
      version: config.app.version,
      endpoints: {
        auth: {
          'POST /api/v1/auth/register': 'Register new user',
          'POST /api/v1/auth/login': 'Login user',
          'POST /api/v1/auth/logout': 'Logout user',
          'POST /api/v1/auth/refresh': 'Refresh access token',
          'POST /api/v1/auth/verify-email': 'Verify email address',
          'POST /api/v1/auth/resend-verification': 'Resend verification email',
          'POST /api/v1/auth/forgot-password': 'Request password reset',
          'POST /api/v1/auth/reset-password': 'Reset password',
          'POST /api/v1/auth/change-password': 'Change password',
          'GET /api/v1/auth/profile': 'Get current user profile',
        },
        users: {
          'PUT /api/v1/users/profile': 'Update user profile',
          'POST /api/v1/users/profile/picture': 'Upload profile picture',
          'GET /api/v1/users/search': 'Search users',
          'GET /api/v1/users/:userId': 'Get user by ID',
          'POST /api/v1/users/:userId/follow': 'Follow/unfollow user',
          'GET /api/v1/users/:userId/followers': 'Get user followers',
          'GET /api/v1/users/:userId/following': 'Get user following',
          'GET /api/v1/users/:userId/stats': 'Get user statistics',
          'DELETE /api/v1/users/account': 'Delete user account',
        },
      },
    });
  });
}

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
  logInfo(`Received ${signal}, starting graceful shutdown`);
  
  try {
    // Close database connections
    await databaseService.disconnect();
    logInfo('Database connections closed');
    
    // Close Redis connections
    await redisService.disconnect();
    logInfo('Redis connections closed');
    
    logInfo('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logError('Error during graceful shutdown', error as Error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError('Uncaught Exception', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection', new Error(String(reason)), { promise });
  gracefulShutdown('unhandledRejection');
});

export default app;