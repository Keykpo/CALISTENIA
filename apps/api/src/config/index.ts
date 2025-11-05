import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
] as const;

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Application configuration
export const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || 'localhost',
    apiUrl: process.env.API_URL || 'http://localhost:3001',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL!,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: {
      email: process.env.FROM_EMAIL || 'noreply@calisthenics-platform.com',
      name: process.env.FROM_NAME || 'Calisthenics Platform',
    },
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // File Storage
  storage: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    local: {
      uploadDir: process.env.UPLOAD_DIR || 'uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    },
  },

  // Payment
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID,
      teamId: process.env.APPLE_TEAM_ID,
      keyId: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
    },
  },

  // Security
  security: {
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    session: {
      secret: process.env.SESSION_SECRET || process.env.JWT_SECRET!,
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE,
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    gaTrackingId: process.env.GA_TRACKING_ID,
  },

  // Development
  development: {
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enablePlayground: process.env.ENABLE_PLAYGROUND === 'true',
    enableCors: process.env.ENABLE_CORS !== 'false',
    enableLogging: process.env.ENABLE_LOGGING !== 'false',
  },

  // Seed data
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@calisthenics-platform.com',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'admin123456',
  },

  // Application constants
  constants: {
    // Pagination
    defaultPageSize: 20,
    maxPageSize: 100,

    // File uploads
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB

    // Workout limits
    maxExercisesPerWorkout: 20,
    maxSetsPerExercise: 10,
    maxWorkoutDuration: 180, // 3 hours in minutes

    // Course limits
    maxLessonsPerCourse: 50,
    maxCourseDuration: 1440, // 24 hours in minutes

    // Community limits
    maxPostLength: 2000,
    maxCommentLength: 500,
    maxTagsPerPost: 10,

    // Progress tracking
    maxProgressEntriesPerDay: 10,
    progressRetentionDays: 365,

    // Achievements
    maxAchievementsPerUser: 100,

    // Subscriptions
    trialPeriodDays: 7,
    gracePeriodDays: 3,
  },

  // Feature flags
  features: {
    enableCommunity: true,
    enableCourses: true,
    enableProgressTracking: true,
    enableAchievements: true,
    enableSubscriptions: true,
    enableNotifications: true,
    enableSocialLogin: true,
    enableVideoStreaming: true,
    enableOfflineMode: false,
  },
} as const;

// Validate configuration
export const validateConfig = (): void => {
  // Validate server port
  if (config.server.port < 1 || config.server.port > 65535) {
    throw new Error('Invalid server port');
  }

  // Validate JWT secret length
  if (config.jwt.secret.length < 32) {
    console.warn('⚠️  JWT secret should be at least 32 characters long');
  }

  // Validate email configuration if features require it
  if (config.features.enableNotifications && !config.email.smtp.user) {
    console.warn('⚠️  Email configuration is incomplete but notifications are enabled');
  }

  // Validate Stripe configuration if subscriptions are enabled
  if (config.features.enableSubscriptions && !config.stripe.secretKey) {
    console.warn('⚠️  Stripe configuration is incomplete but subscriptions are enabled');
  }

  // Validate file storage configuration
  if (!config.storage.cloudinary.cloudName && !config.storage.local.uploadDir) {
    throw new Error('No file storage configuration found');
  }
};

// Export individual configurations for convenience
export const {
  env,
  isDevelopment,
  isProduction,
  isTest,
  server,
  database,
  jwt,
  email,
  redis,
  storage,
  stripe,
  oauth,
  security,
  logging,
  monitoring,
  development,
  seed,
  constants,
  features,
} = config;

export default config;