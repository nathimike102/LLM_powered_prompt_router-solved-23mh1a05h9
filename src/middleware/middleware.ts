/**
 * Express middleware functions
 * @module middleware
 */

import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors";

/**
 * Middleware to validate JSON request body
 */
export function validateJsonBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    next();
  } else {
    next(new ValidationError("Invalid request body"));
  }
}

/**
 * Middleware to validate required fields
 */
export function requireFields(...fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = fields.filter((field) => !(field in req.body));
    if (missing.length > 0) {
      next(new ValidationError(`Missing required fields: ${missing.join(", ")}`));
    } else {
      next();
    }
  };
}

/**
 * Middleware to validate message field in request
 */
export function validateMessage(req: Request, res: Response, next: NextFunction): void {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    next(new ValidationError("Message must be a non-empty string"));
    return;
  }

  if (message.trim().length === 0) {
    next(new ValidationError("Message cannot be empty or whitespace"));
    return;
  }

  if (message.length > 10000) {
    next(new ValidationError("Message exceeds maximum length (10000 characters)"));
    return;
  }

  next();
}

/**
 * Middleware to add request ID
 */
export function addRequestId(req: Request, res: Response, next: NextFunction): void {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader("X-Request-ID", req.id);
  next();
}

/**
 * Middleware to add timing information
 */
export function addTimingInfo(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  // Override res.json to capture timing
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    const duration = Date.now() - startTime;
    res.setHeader("X-Response-Time", `${duration}ms`);
    return originalJson(data);
  };

  next();
}

/**
 * Middleware to log requests
 */
export function logRequest(req: Request, res: Response, next: NextFunction): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}

/**
 * Middleware to handle async errors
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * CORS middleware (simplified)
 */
export function corsHeaders(req: Request, res: Response, next: NextFunction): void {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
}

/**
 * Middleware to handle 404 errors
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    method: req.method,
  });
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("[Error]", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
      requestId: req.id,
    });
    return;
  }

  // Unhandled error
  res.status(500).json({
    error: "Internal server error",
    statusCode: 500,
    requestId: req.id,
  });
}
