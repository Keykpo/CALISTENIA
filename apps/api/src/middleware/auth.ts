import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { db } from '../config/database';
import { redisService } from '../config/redis';
import { logSecurityEvent, logger } from '../config/logger';
import { ApiError } from '../utils/errors';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        isEmailVerified: boolean;
        subscriptionStatus?: string;
      };
      token?: string;
    }
  }
}

// JWT payload interface
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Token validation result
interface TokenValidationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

/**
 * Validate JWT token
 */
const validateToken = async (token: string): Promise<TokenValidationResult> => {
  try {
    // Verify token signature and expiration
    const payload = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Check if token is blacklisted (for logout functionality)
    const isBlacklisted = await redisService.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      return { valid: false, error: 'Token has been revoked' };
    }

    return { valid: true, payload };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token has expired' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: false, error: 'Token validation failed' };
  }
};

/**
 * Extract token from request headers
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer token" and "token" formats
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
};

/**
 * Main authentication middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(401, 'Authentication token required');
    }

    // Validate token
    const validation = await validateToken(token);
    if (!validation.valid || !validation.payload) {
      logSecurityEvent('Invalid token attempt', undefined, req.ip, {
        userAgent: req.get('User-Agent'),
        error: validation.error,
      });
      throw new ApiError(401, validation.error || 'Invalid token');
    }

    // Get user from database to ensure they still exist and get latest data
    const user = await db.user.findUnique({
      where: { id: validation.payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          select: { status: true },
          take: 1,
        },
      },
    });

    if (!user) {
      logSecurityEvent('Token for non-existent user', validation.payload.userId, req.ip);
      throw new ApiError(401, 'User not found');
    }

    if (!user.isActive) {
      logSecurityEvent('Token for inactive user', user.id, req.ip);
      throw new ApiError(401, 'Account has been deactivated');
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      subscriptionStatus: user.subscriptions[0]?.status,
    };
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    // Validate token
    const validation = await validateToken(token);
    if (!validation.valid || !validation.payload) {
      return next();
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: validation.payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          select: { status: true },
          take: 1,
        },
      },
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        subscriptionStatus: user.subscriptions[0]?.status,
      };
      req.token = token;
    }

    next();
  } catch (error) {
    // In optional auth, we don't fail on errors, just continue without user
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      logSecurityEvent('Unauthorized access attempt', req.user.id, req.ip, {
        requiredRoles: roles,
        userRole: req.user.role,
        endpoint: req.originalUrl,
      });
      throw new ApiError(403, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Email verification requirement middleware
 */
export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!req.user.isEmailVerified) {
    throw new ApiError(403, 'Email verification required');
  }

  next();
};

/**
 * Subscription requirement middleware
 */
export const requireSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!req.user.subscriptionStatus || req.user.subscriptionStatus !== 'ACTIVE') {
    throw new ApiError(403, 'Active subscription required');
  }

  next();
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize('ADMIN');

/**
 * Moderator or Admin middleware
 */
export const moderatorOrAdmin = authorize('MODERATOR', 'ADMIN');

/**
 * Premium user middleware (subscription or admin)
 */
export const premiumAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const hasSubscription = req.user.subscriptionStatus === 'ACTIVE';
  const isAdmin = req.user.role === 'ADMIN';

  if (!hasSubscription && !isAdmin) {
    throw new ApiError(403, 'Premium subscription required');
  }

  next();
};

/**
 * Rate limiting by user ID
 */
export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next();
      }

      const key = `rate_limit:user:${req.user.id}`;
      const windowSeconds = Math.floor(windowMs / 1000);

      const result = await redisService.rateLimit(key, maxRequests, windowSeconds);

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      });

      if (!result.allowed) {
        logSecurityEvent('Rate limit exceeded', req.user.id, req.ip, {
          endpoint: req.originalUrl,
          limit: maxRequests,
          window: windowMs,
        });
        throw new ApiError(429, 'Too many requests');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Blacklist token (for logout)
 */
export const blacklistToken = async (token: string, expiresIn?: number): Promise<void> => {
  try {
    const payload = jwt.decode(token) as JWTPayload;
    if (payload && payload.exp) {
      const ttl = expiresIn || (payload.exp - Math.floor(Date.now() / 1000));
      if (ttl > 0) {
        await redisService.set(`blacklist:${token}`, '1', ttl);
      }
    }
  } catch (error) {
    logger.error('Failed to blacklist token:', error);
  }
};

/**
 * Generate JWT token
 */
export const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } | null => {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret) as any;
    if (payload.type !== 'refresh') {
      return null;
    }
    return { userId: payload.userId };
  } catch (error) {
    return null;
  }
};