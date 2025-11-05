import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { redisService } from '../config/redis';
import { config } from '../config';
import { logSecurityEvent } from '../config/logger';

// Custom store using Redis
class RedisStore {
  constructor(private prefix: string = 'rate_limit:') {}

  async increment(key: string): Promise<{ totalHits: number; resetTime?: Date }> {
    const redisKey = `${this.prefix}${key}`;
    const windowMs = config.security.rateLimit.windowMs;
    const windowSeconds = Math.floor(windowMs / 1000);

    try {
      const current = await redisService.get(redisKey);
      let totalHits = 1;

      if (current) {
        totalHits = parseInt(current) + 1;
        await redisService.set(redisKey, totalHits.toString());
      } else {
        await redisService.set(redisKey, '1', windowSeconds);
      }

      const ttl = await redisService.redis.ttl(redisKey);
      const resetTime = new Date(Date.now() + (ttl * 1000));

      return { totalHits, resetTime };
    } catch (error) {
      // Fallback to allowing request if Redis fails
      return { totalHits: 1 };
    }
  }

  async decrement(key: string): Promise<void> {
    const redisKey = `${this.prefix}${key}`;
    try {
      const current = await redisService.get(redisKey);
      if (current) {
        const newValue = Math.max(0, parseInt(current) - 1);
        if (newValue === 0) {
          await redisService.del(redisKey);
        } else {
          await redisService.set(redisKey, newValue.toString());
        }
      }
    } catch (error) {
      // Ignore errors in decrement
    }
  }

  async resetKey(key: string): Promise<void> {
    const redisKey = `${this.prefix}${key}`;
    try {
      await redisService.del(redisKey);
    } catch (error) {
      // Ignore errors in reset
    }
  }
}

// Create Redis store instance
const redisStore = new RedisStore();

// Key generator function
const keyGenerator = (req: Request): string => {
  // Use user ID if authenticated, otherwise use IP
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  
  // Get real IP address
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
  return `ip:${ip}`;
};

// Skip function for certain conditions
const skipSuccessfulRequests = (req: Request, res: Response): boolean => {
  // Don't count successful requests for authenticated users
  return req.user && res.statusCode < 400;
};

// Rate limit handler
const rateLimitHandler = (req: Request, res: Response): void => {
  const key = keyGenerator(req);
  
  // Log security event
  logSecurityEvent('Rate limit exceeded', req.user?.id, req.ip, {
    endpoint: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    key,
  });

  res.status(429).json({
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.security.rateLimit.windowMs / 1000),
    },
    timestamp: new Date().toISOString(),
  });
};

// Default rate limiter
export const rateLimiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.maxRequests,
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipSuccessfulRequests,
  store: {
    increment: (key: string) => redisStore.increment(key),
    decrement: (key: string) => redisStore.decrement(key),
    resetKey: (key: string) => redisStore.resetKey(key),
  },
});

// Strict rate limiter for sensitive endpoints
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: {
    increment: (key: string) => new RedisStore('strict_rate_limit:').increment(key),
    decrement: (key: string) => new RedisStore('strict_rate_limit:').decrement(key),
    resetKey: (key: string) => new RedisStore('strict_rate_limit:').resetKey(key),
  },
});

// Auth rate limiter (for login/register endpoints)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  keyGenerator: (req: Request) => {
    // Use email if provided, otherwise IP
    const email = req.body?.email;
    if (email) {
      return `auth:email:${email}`;
    }
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
    return `auth:ip:${ip}`;
  },
  handler: (req: Request, res: Response) => {
    const email = req.body?.email;
    logSecurityEvent('Auth rate limit exceeded', undefined, req.ip, {
      endpoint: req.originalUrl,
      method: req.method,
      email,
      userAgent: req.get('User-Agent'),
    });

    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts, please try again later',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: 900, // 15 minutes
      },
      timestamp: new Date().toISOString(),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: {
    increment: (key: string) => new RedisStore('auth_rate_limit:').increment(key),
    decrement: (key: string) => new RedisStore('auth_rate_limit:').decrement(key),
    resetKey: (key: string) => new RedisStore('auth_rate_limit:').resetKey(key),
  },
});

// Password reset rate limiter
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  keyGenerator: (req: Request) => {
    const email = req.body?.email;
    return email ? `password_reset:${email}` : `password_reset:ip:${req.ip}`;
  },
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: {
    increment: (key: string) => new RedisStore('password_reset:').increment(key),
    decrement: (key: string) => new RedisStore('password_reset:').decrement(key),
    resetKey: (key: string) => new RedisStore('password_reset:').resetKey(key),
  },
});

// API rate limiter for different user tiers
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  prefix?: string;
  skipSuccessful?: boolean;
}) => {
  const {
    windowMs = config.security.rateLimit.windowMs,
    max = config.security.rateLimit.maxRequests,
    prefix = 'custom_rate_limit:',
    skipSuccessful = false,
  } = options;

  return rateLimit({
    windowMs,
    max: (req: Request) => {
      // Different limits based on user role/subscription
      if (req.user?.role === 'ADMIN') {
        return max * 10; // Admins get 10x limit
      }
      if (req.user?.subscriptionStatus === 'ACTIVE') {
        return max * 3; // Premium users get 3x limit
      }
      if (req.user) {
        return max * 2; // Authenticated users get 2x limit
      }
      return max; // Default limit for anonymous users
    },
    keyGenerator,
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipSuccessful ? skipSuccessfulRequests : undefined,
    store: {
      increment: (key: string) => new RedisStore(prefix).increment(key),
      decrement: (key: string) => new RedisStore(prefix).decrement(key),
      resetKey: (key: string) => new RedisStore(prefix).resetKey(key),
    },
  });
};

// File upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req: Request) => {
    if (req.user?.role === 'ADMIN') return 1000;
    if (req.user?.subscriptionStatus === 'ACTIVE') return 100;
    if (req.user) return 50;
    return 10;
  },
  keyGenerator: (req: Request) => {
    return req.user?.id ? `upload:user:${req.user.id}` : `upload:ip:${req.ip}`;
  },
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: {
    increment: (key: string) => new RedisStore('upload_rate_limit:').increment(key),
    decrement: (key: string) => new RedisStore('upload_rate_limit:').decrement(key),
    resetKey: (key: string) => new RedisStore('upload_rate_limit:').resetKey(key),
  },
});

// Search rate limiter
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req: Request) => {
    if (req.user?.role === 'ADMIN') return 1000;
    if (req.user?.subscriptionStatus === 'ACTIVE') return 100;
    if (req.user) return 30;
    return 10;
  },
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: {
    increment: (key: string) => new RedisStore('search_rate_limit:').increment(key),
    decrement: (key: string) => new RedisStore('search_rate_limit:').decrement(key),
    resetKey: (key: string) => new RedisStore('search_rate_limit:').resetKey(key),
  },
});

export default rateLimiter;