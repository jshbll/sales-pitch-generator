/**
 * Error Display Utilities
 * 
 * Helper functions and utilities for error display components.
 * These functions help with formatting, categorizing, and displaying errors
 * in a consistent way across the application.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { Theme } from '@mui/material';
import { ErrorCategory } from './errorHandler';

/**
 * Severity type for error display
 */
export type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

/**
 * Generic error interface that can be adapted to work with the ErrorDisplay component
 */
export interface GenericErrorInfo {
  /** The main error message to display */
  message: string;
  /** The title of the error */
  title?: string;
  /** The severity level of the error */
  severity?: ErrorSeverity;
  /** Whether the error is retryable */
  isRetryable?: boolean;
  /** Technical details to show when expanded */
  technicalDetails?: Record<string, unknown>;
  /** Raw error data for custom rendering */
  rawError?: unknown;
}

/**
 * Error adapter interface for converting various error types to GenericErrorInfo
 */
export interface ErrorAdapter<T> {
  canHandle: (error: unknown) => error is T;
  adapt: (error: T) => GenericErrorInfo;
}

// Generic adapter type for use in arrays
export type GenericErrorAdapter = ErrorAdapter<unknown>;

/**
 * Maps error categories to MUI Alert severity
 */
export const getSeverity = (category: ErrorCategory): ErrorSeverity => {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return 'warning';
    case ErrorCategory.NETWORK:
    case ErrorCategory.SERVER:
      return 'error';
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return 'info';
    case ErrorCategory.NOT_FOUND:
      return 'warning';
    default:
      return 'error';
  }
};

/**
 * Gets a user-friendly title based on error category
 */
export const getTitle = (category: ErrorCategory): string => {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return 'Validation Error';
    case ErrorCategory.NETWORK:
      return 'Connection Issue';
    case ErrorCategory.SERVER:
      return 'Server Error';
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication Required';
    case ErrorCategory.AUTHORIZATION:
      return 'Access Denied';
    case ErrorCategory.NOT_FOUND:
      return 'Not Found';
    default:
      return 'Error';
  }
};

/**
 * Get variant-specific styles based on the theme and variant
 */
export const getVariantStyles = (
  theme: Theme, 
  variant?: 'default' | 'compact' | 'outlined' | 'filled'
) => {
  switch (variant) {
    case 'compact':
      return {
        padding: theme.spacing(0.5, 1),
        '& .MuiAlertTitle-root': {
          marginBottom: 0,
          fontSize: '0.875rem'
        }
      };
    case 'outlined':
      return {
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'transparent'
      };
    case 'filled':
      return {
        '&.MuiAlert-standardError': {
          backgroundColor: theme.palette.error.dark,
          color: theme.palette.error.contrastText
        },
        '&.MuiAlert-standardWarning': {
          backgroundColor: theme.palette.warning.dark,
          color: theme.palette.warning.contrastText
        },
        '&.MuiAlert-standardInfo': {
          backgroundColor: theme.palette.info.dark,
          color: theme.palette.info.contrastText
        },
        '&.MuiAlert-standardSuccess': {
          backgroundColor: theme.palette.success.dark,
          color: theme.palette.success.contrastText
        }
      };
    default:
      return {};
  }
};

/**
 * Prepares technical details for display from an error object
 */
export const prepareErrorDetails = (error: {
  category: ErrorCategory;
  code?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
  details?: Record<string, unknown>;
  stack?: string;
}): Record<string, unknown> => {
  return {
    category: error.category,
    ...(error.code && { code: error.code }),
    ...(error.statusCode && { statusCode: error.statusCode }),
    ...(error.context && { context: error.context }),
    ...(error.details && { details: error.details }),
    ...(error.stack && { stack: error.stack })
  };
};

/**
 * Default adapters for common error types
 */

// Default adapters array
export const createDefaultAdapters = (
  standardErrorAdapter: ErrorAdapter<unknown>,
  nativeErrorAdapter: ErrorAdapter<Error>,
  stringErrorAdapter: ErrorAdapter<string>,
  genericErrorInfoAdapter: ErrorAdapter<GenericErrorInfo>
): ErrorAdapter<unknown>[] => [
  genericErrorInfoAdapter as ErrorAdapter<unknown>,
  standardErrorAdapter,
  nativeErrorAdapter as ErrorAdapter<unknown>,
  stringErrorAdapter as ErrorAdapter<unknown>
];
