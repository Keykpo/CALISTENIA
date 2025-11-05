import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { MulterError } from 'multer';
import { logger, logError } from '../config/logger';
import { config } from '../config';
import { ApiError } from '../utils/errors';

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
    stack?: string;
  };
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
}

/**
 * Main error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate request ID for tracking
  const requestId = req.headers['x-request-id'] as string || generateRequestId();

  // Log the error
  logError('Request error occurred', error, {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle different error types
  let statusCode = 500;
  let message = 'Internal server error';
  let code: string | undefined;
  let details: any;

  if (error instanceof ApiError) {
    // Custom API errors
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  } else if (error instanceof ZodError) {
    // Validation errors
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = {
      errors: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    };
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma database errors
    const { statusCode: dbStatusCode, message: dbMessage, code: dbCode } = handlePrismaError(error);
    statusCode = dbStatusCode;
    message = dbMessage;
    code = dbCode;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Prisma validation errors
    statusCode = 400;
    message = 'Database validation error';
    code = 'DATABASE_VALIDATION_ERROR';
  } else if (error instanceof MulterError) {
    // File upload errors
    const { statusCode: multerStatusCode, message: multerMessage } = handleMulterError(error);
    statusCode = multerStatusCode;
    message = multerMessage;
    code = 'FILE_UPLOAD_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    // JWT errors
    statusCode = 401;
    message = 'Invalid authentication token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    // JWT expiration errors
    statusCode = 401;
    message = 'Authentication token has expired';
    code = 'TOKEN_EXPIRED';
  } else if (error.name === 'ValidationError') {
    // Mongoose validation errors (if using MongoDB)
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = error.message;
  } else if (error.name === 'CastError') {
    // Mongoose cast errors
    statusCode = 400;
    message = 'Invalid data format';
    code = 'INVALID_FORMAT';
  } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    // MongoDB errors
    statusCode = 500;
    message = 'Database error';
    code = 'DATABASE_ERROR';
  } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    // Network/connection errors
    statusCode = 503;
    message = 'Service temporarily unavailable';
    code = 'SERVICE_UNAVAILABLE';
  } else if (error.message.includes('timeout')) {
    // Timeout errors
    statusCode = 408;
    message = 'Request timeout';
    code = 'REQUEST_TIMEOUT';
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    requestId,
  };

  // Include stack trace in development
  if (config.isDevelopment && !(error instanceof ApiError)) {
    errorResponse.error.stack = error.stack;
  }

  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  });

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Handle Prisma database errors
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError) => {
  switch (error.code) {
    case 'P2000':
      return {
        statusCode: 400,
        message: 'The provided value is too long for the field',
        code: 'VALUE_TOO_LONG',
      };
    case 'P2001':
      return {
        statusCode: 404,
        message: 'Record not found',
        code: 'RECORD_NOT_FOUND',
      };
    case 'P2002':
      return {
        statusCode: 409,
        message: 'A record with this value already exists',
        code: 'DUPLICATE_RECORD',
      };
    case 'P2003':
      return {
        statusCode: 400,
        message: 'Foreign key constraint violation',
        code: 'FOREIGN_KEY_VIOLATION',
      };
    case 'P2004':
      return {
        statusCode: 400,
        message: 'A constraint failed on the database',
        code: 'CONSTRAINT_VIOLATION',
      };
    case 'P2005':
      return {
        statusCode: 400,
        message: 'The value stored in the database is invalid for the field type',
        code: 'INVALID_VALUE',
      };
    case 'P2006':
      return {
        statusCode: 400,
        message: 'The provided value is not valid for the field',
        code: 'INVALID_VALUE',
      };
    case 'P2007':
      return {
        statusCode: 400,
        message: 'Data validation error',
        code: 'VALIDATION_ERROR',
      };
    case 'P2008':
      return {
        statusCode: 400,
        message: 'Failed to parse the query',
        code: 'QUERY_PARSE_ERROR',
      };
    case 'P2009':
      return {
        statusCode: 400,
        message: 'Failed to validate the query',
        code: 'QUERY_VALIDATION_ERROR',
      };
    case 'P2010':
      return {
        statusCode: 500,
        message: 'Raw query failed',
        code: 'RAW_QUERY_ERROR',
      };
    case 'P2011':
      return {
        statusCode: 400,
        message: 'Null constraint violation',
        code: 'NULL_CONSTRAINT_VIOLATION',
      };
    case 'P2012':
      return {
        statusCode: 400,
        message: 'Missing a required value',
        code: 'MISSING_REQUIRED_VALUE',
      };
    case 'P2013':
      return {
        statusCode: 400,
        message: 'Missing the required argument',
        code: 'MISSING_REQUIRED_ARGUMENT',
      };
    case 'P2014':
      return {
        statusCode: 400,
        message: 'The change would violate the required relation',
        code: 'RELATION_VIOLATION',
      };
    case 'P2015':
      return {
        statusCode: 404,
        message: 'A related record could not be found',
        code: 'RELATED_RECORD_NOT_FOUND',
      };
    case 'P2016':
      return {
        statusCode: 400,
        message: 'Query interpretation error',
        code: 'QUERY_INTERPRETATION_ERROR',
      };
    case 'P2017':
      return {
        statusCode: 400,
        message: 'The records for relation are not connected',
        code: 'RECORDS_NOT_CONNECTED',
      };
    case 'P2018':
      return {
        statusCode: 404,
        message: 'The required connected records were not found',
        code: 'CONNECTED_RECORDS_NOT_FOUND',
      };
    case 'P2019':
      return {
        statusCode: 400,
        message: 'Input error',
        code: 'INPUT_ERROR',
      };
    case 'P2020':
      return {
        statusCode: 400,
        message: 'Value out of range for the type',
        code: 'VALUE_OUT_OF_RANGE',
      };
    case 'P2021':
      return {
        statusCode: 404,
        message: 'The table does not exist in the current database',
        code: 'TABLE_NOT_FOUND',
      };
    case 'P2022':
      return {
        statusCode: 404,
        message: 'The column does not exist in the current database',
        code: 'COLUMN_NOT_FOUND',
      };
    case 'P2025':
      return {
        statusCode: 404,
        message: 'Record to delete does not exist',
        code: 'RECORD_NOT_FOUND',
      };
    default:
      return {
        statusCode: 500,
        message: 'Database error occurred',
        code: 'DATABASE_ERROR',
      };
  }
};

/**
 * Handle Multer file upload errors
 */
const handleMulterError = (error: MulterError) => {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return {
        statusCode: 413,
        message: 'File size too large',
      };
    case 'LIMIT_FILE_COUNT':
      return {
        statusCode: 400,
        message: 'Too many files uploaded',
      };
    case 'LIMIT_FIELD_KEY':
      return {
        statusCode: 400,
        message: 'Field name too long',
      };
    case 'LIMIT_FIELD_VALUE':
      return {
        statusCode: 400,
        message: 'Field value too long',
      };
    case 'LIMIT_FIELD_COUNT':
      return {
        statusCode: 400,
        message: 'Too many fields',
      };
    case 'LIMIT_UNEXPECTED_FILE':
      return {
        statusCode: 400,
        message: 'Unexpected file field',
      };
    case 'MISSING_FIELD_NAME':
      return {
        statusCode: 400,
        message: 'Missing field name',
      };
    default:
      return {
        statusCode: 400,
        message: 'File upload error',
      };
  }
};

/**
 * Generate a unique request ID
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  res.status(404).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 */
export const validationErrorHandler = (
  error: ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: {
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: (err as any).received,
          expected: (err as any).expected,
        })),
      },
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  res.status(400).json(errorResponse);
};