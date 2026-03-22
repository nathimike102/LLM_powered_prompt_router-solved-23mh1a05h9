/**
 * Custom error classes and error handling utilities
 * @module errors
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, true);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429, true);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Internal server error
 */
export class InternalError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, true);
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

/**
 * External API error
 */
export class ExternalAPIError extends AppError {
  constructor(
    public apiName: string,
    message: string,
    public originalError?: Error
  ) {
    super(`${apiName} error: ${message}`, 502, false);
    Object.setPrototypeOf(this, ExternalAPIError.prototype);
  }
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  return error?.status === 429 || 
         error?.statusCode === 429 ||
         (error?.message && error.message.includes("429"));
}

/**
 * Check if an error is operational (safe to return to client)
 */
export function isOperationalError(error: any): boolean {
  return error instanceof AppError && error.isOperational;
}

/**
 * Format error response for client
 */
export interface ErrorResponse {
  error: string;
  statusCode: number;
  timestamp?: string;
}

export function formatErrorResponse(error: any): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    error: "An unexpected error occurred",
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };
}
