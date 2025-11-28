/**
 * Browser-compatible logging service for JaxSaver frontend application
 * Provides structured logging with request tracking
 */
import { Request as ExpressRequest } from 'express';

// Extend the Express Request interface to include user property
interface Request extends ExpressRequest {
  user?: {
    id?: string;
    businessId?: string;
    role?: string;
  };
}

// Define log levels and their numeric values for comparison
type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

const levels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const getCurrentLevel = (): LogLevel => {
  const env = import.meta.env.MODE || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Current log level
const currentLevel = getCurrentLevel();

// Get timestamp in consistent format
const getTimestamp = (): string => {
  return new Date().toISOString().replace('T', ' ').substring(0, 23);
};

// Color codes for console output
const colors = {
  error: '\x1b[31m', // red
  warn: '\x1b[33m',  // yellow
  info: '\x1b[36m',  // cyan
  http: '\x1b[35m',  // magenta
  debug: '\x1b[32m', // green
  reset: '\x1b[0m',  // reset
};

/**
 * Browser-compatible logger service with request tracking and structured logging
 */
class LoggerService {
  // Store logs in memory if needed
  private logs: Record<LogLevel, string[]> = {
    error: [],
    warn: [],
    info: [],
    http: [],
    debug: [],
  };

  // Maximum number of logs to keep in memory
  private maxLogsPerLevel = 100;

  // Check if the level should be logged based on current level
  private shouldLog(level: LogLevel): boolean {
    return levels[level] <= levels[currentLevel];
  }

  // Format and log a message
  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const timestamp = getTimestamp();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    const formattedMessage = `${timestamp} ${level.toUpperCase()}: ${message}${metaStr}`;

    // Store in memory
    this.logs[level].push(formattedMessage);
    if (this.logs[level].length > this.maxLogsPerLevel) {
      this.logs[level].shift();
    }

    // Log to console with colors
    if (level === 'error') {
      console.error(`${colors[level]}${formattedMessage}${colors.reset}`);
    } else if (level === 'warn') {
      console.warn(`${colors[level]}${formattedMessage}${colors.reset}`);
    } else {
      console.log(`${colors[level]}${formattedMessage}${colors.reset}`);
    }
  }

  // Log error with context
  public error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  // Log warn with context
  public warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  // Log info with context
  public info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  // Log http with context
  public http(message: string, context?: Record<string, unknown>): void {
    this.log('http', message, context);
  }

  // Log debug with context
  public debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }
}

const logger = new LoggerService();

/**
 * Generate a unique request ID
 */
export const generateRequestId = (): string => {
  return `req_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Get request metadata for logging
 */
export const getRequestMeta = (req: Request): Record<string, unknown> => {
  return {
    requestId: req.headers['x-request-id'] || generateRequestId(),
    userId: req.user?.id,
    businessId: req.user?.businessId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };
};

/**
 * Log request start with metadata
 */
export const logRequestStart = (req: Request, message = 'Request received'): string => {
  const meta = getRequestMeta(req);
  logger.info(message, {
    ...meta,
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
  });
  return meta.requestId as string;
};

/**
 * Log request completion with duration
 */
export const logRequestEnd = (
  req: Request, 
  requestId: string, 
  startTime: number, 
  message = 'Request completed'
): void => {
  const duration = Date.now() - startTime;
  logger.info(message, {
    requestId,
    userId: req.user?.id,
    businessId: req.user?.businessId,
    method: req.method,
    path: req.path,
    duration,
  });
};

/**
 * Log error with context
 */
export const logError = (error: Error | unknown, context?: Record<string, unknown>): void => {
  // Convert unknown error to Error object
  const err = error instanceof Error ? error : new Error(String(error));

  // Extract error properties safely
  const errorInfo: Record<string, unknown> = {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };

  // Add code property if it exists
  if ('code' in err && err.code !== undefined) {
    errorInfo.code = err.code;
  }

  logger.error(err.message || 'An error occurred', {
    error: errorInfo,
    ...context,
  });
};

export default logger;
