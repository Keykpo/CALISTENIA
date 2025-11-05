// Environment configuration
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Database configuration
export const DATABASE_CONFIG = {
  MAX_CONNECTIONS: 10,
  CONNECTION_TIMEOUT: 60000, // 60 seconds
  IDLE_TIMEOUT: 300000, // 5 minutes
} as const;

// Authentication configuration
export const AUTH_CONFIG = {
  JWT_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SYMBOLS: false,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
  MAX_FILES_PER_UPLOAD: 5,
} as const;

// Pagination configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 300, // 5 minutes
  USER_PROFILE_TTL: 900, // 15 minutes
  EXERCISE_DATA_TTL: 3600, // 1 hour
  WORKOUT_DATA_TTL: 1800, // 30 minutes
  STATIC_DATA_TTL: 86400, // 24 hours
} as const;

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  SKIP_SUCCESSFUL_REQUESTS: false,
  SKIP_FAILED_REQUESTS: false,
} as const;

// Email configuration
export const EMAIL_CONFIG = {
  FROM_NAME: 'Calisthenics Platform',
  FROM_EMAIL: process.env.EMAIL_FROM || 'noreply@calisthenics-platform.com',
  REPLY_TO: process.env.EMAIL_REPLY_TO || 'support@calisthenics-platform.com',
  TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password-reset',
    EMAIL_VERIFICATION: 'email-verification',
    WORKOUT_REMINDER: 'workout-reminder',
    GOAL_DEADLINE: 'goal-deadline',
  },
} as const;

// Notification configuration
export const NOTIFICATION_CONFIG = {
  PUSH_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  PUSH_VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  PUSH_VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:admin@calisthenics-platform.com',
  DEFAULT_ICON: '/icons/notification-icon.png',
  DEFAULT_BADGE: '/icons/notification-badge.png',
} as const;

// Workout configuration
export const WORKOUT_CONFIG = {
  MIN_REST_TIME: 10, // seconds
  MAX_REST_TIME: 600, // 10 minutes
  DEFAULT_REST_TIME: 60, // 1 minute
  MIN_WORKOUT_DURATION: 300, // 5 minutes
  MAX_WORKOUT_DURATION: 7200, // 2 hours
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
} as const;

// Exercise configuration
export const EXERCISE_CONFIG = {
  MIN_REPS: 1,
  MAX_REPS: 1000,
  MIN_DURATION: 1, // seconds
  MAX_DURATION: 3600, // 1 hour
  MIN_WEIGHT: 0, // kg
  MAX_WEIGHT: 1000, // kg
  MIN_DISTANCE: 0, // meters
  MAX_DISTANCE: 100000, // 100km
} as const;

// Goal configuration
export const GOAL_CONFIG = {
  MIN_TARGET_VALUE: 1,
  MAX_TARGET_VALUE: 10000,
  DEFAULT_DEADLINE_DAYS: 30,
  MAX_DEADLINE_DAYS: 365,
  REMINDER_DAYS_BEFORE: [7, 3, 1], // Days before deadline to send reminders
} as const;

// Progress tracking configuration
export const PROGRESS_CONFIG = {
  MEASUREMENT_UNITS: {
    WEIGHT: ['kg', 'lbs'],
    HEIGHT: ['cm', 'ft'],
    DISTANCE: ['m', 'km', 'mi'],
    TIME: ['s', 'min', 'h'],
  },
  CHART_DATA_POINTS: 50, // Maximum data points to show in charts
  PROGRESS_CALCULATION_DAYS: 30, // Days to look back for progress calculation
} as const;

// Social features configuration
export const SOCIAL_CONFIG = {
  MAX_POST_LENGTH: 500,
  MAX_COMMENT_LENGTH: 200,
  MAX_IMAGES_PER_POST: 5,
  FEED_PAGE_SIZE: 20,
  MAX_FOLLOWERS: 10000,
  MAX_FOLLOWING: 5000,
} as const;

// Course configuration
export const COURSE_CONFIG = {
  MIN_PRICE: 0,
  MAX_PRICE: 999.99,
  MAX_LESSONS: 100,
  MAX_LESSON_DURATION: 3600, // 1 hour
  PREVIEW_LESSONS_COUNT: 3,
  COMPLETION_THRESHOLD: 0.8, // 80% completion required
} as const;

// Search configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  RESULTS_PER_PAGE: 20,
  MAX_RESULTS: 1000,
  DEBOUNCE_DELAY: 300, // milliseconds
} as const;

// Analytics configuration
export const ANALYTICS_CONFIG = {
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_ID,
  FACEBOOK_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
  HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID,
  TRACK_PAGE_VIEWS: true,
  TRACK_EVENTS: true,
  TRACK_USER_PROPERTIES: true,
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_SOCIAL_FEATURES: process.env.NEXT_PUBLIC_ENABLE_SOCIAL === 'true',
  ENABLE_COURSES: process.env.NEXT_PUBLIC_ENABLE_COURSES === 'true',
  ENABLE_PAYMENTS: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_BETA_FEATURES: process.env.NEXT_PUBLIC_ENABLE_BETA === 'true',
} as const;

// Theme configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  AVAILABLE_THEMES: ['light', 'dark', 'system'],
  STORAGE_KEY: 'calisthenics-theme',
} as const;

// Localization configuration
export const I18N_CONFIG = {
  DEFAULT_LOCALE: 'es',
  AVAILABLE_LOCALES: ['es', 'en'],
  STORAGE_KEY: 'calisthenics-locale',
  FALLBACK_LOCALE: 'en',
} as const;

// Error handling configuration
export const ERROR_CONFIG = {
  SHOW_STACK_TRACE: ENV.IS_DEVELOPMENT,
  LOG_ERRORS: true,
  SENTRY_DSN: process.env.SENTRY_DSN,
  ERROR_BOUNDARY_FALLBACK: true,
} as const;

// Performance configuration
export const PERFORMANCE_CONFIG = {
  ENABLE_SERVICE_WORKER: ENV.IS_PRODUCTION,
  CACHE_STATIC_ASSETS: true,
  PRELOAD_CRITICAL_RESOURCES: true,
  LAZY_LOAD_IMAGES: true,
  BUNDLE_ANALYZER: process.env.ANALYZE === 'true',
} as const;

// Security configuration
export const SECURITY_CONFIG = {
  ENABLE_CSRF_PROTECTION: true,
  ENABLE_CORS: true,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  ENABLE_HELMET: true,
  CONTENT_SECURITY_POLICY: ENV.IS_PRODUCTION,
} as const;

// Validation schemas configuration
export const VALIDATION_CONFIG = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  URL_REGEX: /^https?:\/\/.+/,
  USERNAME_REGEX: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

// Export all configurations
export const CONFIG = {
  ENV,
  API_CONFIG,
  DATABASE_CONFIG,
  AUTH_CONFIG,
  UPLOAD_CONFIG,
  PAGINATION_CONFIG,
  CACHE_CONFIG,
  RATE_LIMIT_CONFIG,
  EMAIL_CONFIG,
  NOTIFICATION_CONFIG,
  WORKOUT_CONFIG,
  EXERCISE_CONFIG,
  GOAL_CONFIG,
  PROGRESS_CONFIG,
  SOCIAL_CONFIG,
  COURSE_CONFIG,
  SEARCH_CONFIG,
  ANALYTICS_CONFIG,
  FEATURE_FLAGS,
  THEME_CONFIG,
  I18N_CONFIG,
  ERROR_CONFIG,
  PERFORMANCE_CONFIG,
  SECURITY_CONFIG,
  VALIDATION_CONFIG,
} as const;