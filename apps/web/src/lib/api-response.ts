import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Standard API response types
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
  code?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Success response helper
export function apiSuccess<T>(data: T, message?: string, status: number = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

// Error response helpers
export function apiError(
  error: string,
  status: number = 500,
  details?: any,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
      ...(code && { code }),
    },
    { status }
  );
}

export function apiBadRequest(error: string, details?: any): NextResponse<ApiErrorResponse> {
  return apiError(error, 400, details, 'BAD_REQUEST');
}

export function apiUnauthorized(error: string = 'Unauthorized'): NextResponse<ApiErrorResponse> {
  return apiError(error, 401, undefined, 'UNAUTHORIZED');
}

export function apiForbidden(error: string = 'Forbidden'): NextResponse<ApiErrorResponse> {
  return apiError(error, 403, undefined, 'FORBIDDEN');
}

export function apiNotFound(error: string = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return apiError(error, 404, undefined, 'NOT_FOUND');
}

export function apiConflict(error: string, details?: any): NextResponse<ApiErrorResponse> {
  return apiError(error, 409, details, 'CONFLICT');
}

export function apiValidationError(zodError: ZodError): NextResponse<ApiErrorResponse> {
  const errors = zodError.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return apiError('Validation failed', 400, errors, 'VALIDATION_ERROR');
}

export function apiInternalError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('Internal server error:', error);

  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'development'
    ? error instanceof Error ? error.message : 'Unknown error'
    : 'Internal server error';

  return apiError(message, 500, undefined, 'INTERNAL_ERROR');
}

// Type guard for API responses
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return !response.success;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success;
}
