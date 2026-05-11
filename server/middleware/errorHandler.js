const { Prisma } = require('@prisma/client');

/**
 * ZAMBIA Z - GLOBAL ERROR INTERCEPTOR
 * Strategy: Centralized Error Mapping & Environment-Aware Responses
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // 1. Log errors for internal monitoring (Avoid console.log in pro apps, use a logger like Winston)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ [Error]:', err);
  }

  // 2. Handle Prisma Specific Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint
        statusCode = 400;
        const target = err.meta?.target || 'Field';
        message = `${target} is already taken. Please use a different value.`;
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = 'The requested resource could not be found.';
        break;
      case 'P2003': // Foreign key failure
        statusCode = 400;
        message = 'Action failed: This resource is linked to other records.';
        break;
      case 'P2014': // Relation violation
        statusCode = 400;
        message = 'Invalid ID reference provided.';
        break;
      default:
        message = 'A database error occurred while processing your request.';
    }
  }

  // 3. Handle Prisma Validation Errors (e.g., wrong data types)
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided. Please check your input fields.';
  }

  // 4. Handle JWT / Auth Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid session token. Please log in again.';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please refresh your login.';
  }

  // 5. Handle Custom Application Errors (e.g., insufficiency funds)
  if (err.name === 'AppError') {
    statusCode = err.statusCode;
    message = err.message;
  }

  // 6. Final Response
  const response = {
    success: false,
    message: message,
    // Add extra info only in development mode
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      rawError: err
    }),
  };

  res.status(statusCode).json(response);
};

/**
 * PRO-TIP: Custom Error Class
 * Use this to throw errors in your controllers like:
 * throw new AppError('Insufficient loan limit', 400);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
