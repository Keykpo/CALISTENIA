import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logSecurityEvent } from '../config/logger';

// CORS configuration
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = config.security.cors.allowedOrigins;
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Log unauthorized origin attempt
    logSecurityEvent('Unauthorized CORS origin', undefined, undefined, {
      origin,
      allowedOrigins,
    });

    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: config.security.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Client-Version',
    'X-Device-ID',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
  maxAge: 86400, // 24 hours
};

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'https:'],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: 'no-referrer' },
  xssFilter: true,
});

// API Key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    logSecurityEvent('Missing API key', undefined, req.ip, {
      endpoint: req.originalUrl,
      userAgent: req.get('User-Agent'),
    });
    
    res.status(401).json({
      success: false,
      error: {
        message: 'API key is required',
        code: 'MISSING_API_KEY',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Validate API key format and existence
  const validApiKeys = config.security.apiKeys || [];
  if (!validApiKeys.includes(apiKey)) {
    logSecurityEvent('Invalid API key', undefined, req.ip, {
      endpoint: req.originalUrl,
      apiKey: apiKey.substring(0, 8) + '...',
      userAgent: req.get('User-Agent'),
    });
    
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid API key',
        code: 'INVALID_API_KEY',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Remove potentially dangerous characters from query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    }
  }

  // Remove potentially dangerous characters from request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
};

// Helper function to recursively sanitize objects
const sanitizeObject = (obj: any): void => {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
};

// IP whitelist middleware
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = forwarded ? forwarded.split(',')[0].trim() : clientIP;

    if (!allowedIPs.includes(realIP || '')) {
      logSecurityEvent('IP not whitelisted', undefined, realIP, {
        endpoint: req.originalUrl,
        allowedIPs,
      });

      res.status(403).json({
        success: false,
        error: {
          message: 'Access denied from this IP address',
          code: 'IP_NOT_ALLOWED',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

// Request size limiter
export const requestSizeLimiter = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength);
      const maxSizeInBytes = parseSize(maxSize);
      
      if (sizeInBytes > maxSizeInBytes) {
        logSecurityEvent('Request size exceeded', req.user?.id, req.ip, {
          endpoint: req.originalUrl,
          contentLength: sizeInBytes,
          maxSize: maxSizeInBytes,
        });

        res.status(413).json({
          success: false,
          error: {
            message: 'Request entity too large',
            code: 'REQUEST_TOO_LARGE',
            maxSize,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    next();
  };
};

// Helper function to parse size strings
const parseSize = (size: string): number => {
  const units: { [key: string]: number } = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return Math.floor(value * units[unit]);
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Add API version header
  res.setHeader('X-API-Version', config.app.version);
  
  next();
};

// Request logging middleware for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union\s+select/gi, // SQL injection
    /javascript:/gi, // JavaScript injection
    /eval\(/gi, // Code injection
  ];

  const url = req.originalUrl;
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(body) || pattern.test(query)
  );

  if (isSuspicious) {
    logSecurityEvent('Suspicious request pattern detected', req.user?.id, req.ip, {
      method: req.method,
      url,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
    });
  }

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests (potential DoS)
    if (duration > 5000) {
      logSecurityEvent('Slow request detected', req.user?.id, req.ip, {
        method: req.method,
        url,
        duration,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

// Content type validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }

    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Content-Type header is required',
          code: 'MISSING_CONTENT_TYPE',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const isAllowed = allowedTypes.some(type => 
      contentType.toLowerCase().includes(type.toLowerCase())
    );

    if (!isAllowed) {
      logSecurityEvent('Invalid content type', req.user?.id, req.ip, {
        contentType,
        allowedTypes,
        endpoint: req.originalUrl,
      });

      res.status(415).json({
        success: false,
        error: {
          message: 'Unsupported Media Type',
          code: 'INVALID_CONTENT_TYPE',
          allowedTypes,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

export default {
  corsOptions,
  helmetConfig,
  validateApiKey,
  sanitizeRequest,
  ipWhitelist,
  requestSizeLimiter,
  securityHeaders,
  securityLogger,
  validateContentType,
};