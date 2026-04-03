//backend\src\middleware\error.middleware.ts

import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  // Log error
  logger.error("API Error", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Hide internal errors in production
  const message =
    process.env.NODE_ENV === "production" && !err.isOperational
      ? "Something went wrong"
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
};