/**
 * Business Profile Error Context Utilities
 * 
 * Provides standardized error context creation and management for business profile operations.
 * This ensures consistent error tracking, logging, and reporting across the service.
 */

import { v4 as uuidv4 } from 'uuid';
import { User } from '../../../types/user';

/**
 * Database operation types for context tracking
 */
export enum DatabaseOperationType {
  QUERY = 'query',
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
  TRANSACTION = 'transaction'
}

/**
 * Enhanced error context for business profile operations
 */
export interface BusinessProfileErrorContext {
  /** Unique operation ID for request tracing */
  operationId: string;
  /** Function or method where the error occurred */
  functionName?: string;
  /** Component or module where the error occurred */
  component?: string;
  /** Timestamp when the error occurred */
  timestamp: number;
  /** User context information */
  user?: {
    /** User ID */
    id?: string;
    /** User role */
    role?: string;
    /** Whether user is authenticated */
    isAuthenticated: boolean;
  };
  /** Business context information */
  business?: {
    /** Business ID */
    id?: string;
    /** Business name */
    name?: string;
  };
  /** Database operation details */
  database?: {
    /** Operation type */
    operation?: DatabaseOperationType;
    /** Table name */
    table?: string;
    /** Query identifier or description */
    queryId?: string;
  };
  /** Additional contextual information */
  info?: Record<string, unknown>;
}

/**
 * Options for creating error context
 */
export interface ErrorContextOptions {
  /** Function or method where the error occurred */
  functionName?: string;
  /** Component or module where the error occurred */
  component?: string;
  /** User object for context */
  user?: User | null;
  /** Business ID for context */
  businessId?: string;
  /** Business name for context */
  businessName?: string;
  /** Database operation type */
  dbOperation?: DatabaseOperationType;
  /** Database table name */
  dbTable?: string;
  /** Database query identifier */
  dbQueryId?: string;
  /** Additional contextual information */
  info?: Record<string, unknown>;
}

/**
 * Create standardized error context for business profile operations
 * 
 * @param options - Options for creating error context
 * @returns Standardized error context
 */
export function createErrorContext(options: ErrorContextOptions = {}): BusinessProfileErrorContext {
  const {
    functionName,
    component = 'BusinessProfileService',
    user,
    businessId,
    businessName,
    dbOperation,
    dbTable,
    dbQueryId,
    info
  } = options;

  // Create base context
  const context: BusinessProfileErrorContext = {
    operationId: uuidv4(),
    functionName,
    component,
    timestamp: Date.now(),
    info
  };

  // Add user context if available
  if (user) {
    context.user = {
      id: user.id,
      role: user.role,
      isAuthenticated: true
    };
  } else {
    context.user = {
      isAuthenticated: false
    };
  }

  // Add business context if available
  if (businessId || businessName) {
    context.business = {
      id: businessId,
      name: businessName
    };
  }

  // Add database context if available
  if (dbOperation || dbTable || dbQueryId) {
    context.database = {
      operation: dbOperation,
      table: dbTable,
      queryId: dbQueryId
    };
  }

  return context;
}

/**
 * Enhance existing error context with additional information
 * 
 * @param existingContext - Existing error context to enhance
 * @param additionalInfo - Additional information to add
 * @returns Enhanced error context
 */
export function enhanceErrorContext(
  existingContext: BusinessProfileErrorContext,
  additionalInfo: Record<string, unknown>
): BusinessProfileErrorContext {
  return {
    ...existingContext,
    info: {
      ...existingContext.info,
      ...additionalInfo
    }
  };
}

/**
 * Create database operation context
 * 
 * @param operation - Database operation type
 * @param table - Database table name
 * @param queryId - Database query identifier
 * @param baseContext - Base context to extend
 * @returns Error context with database operation details
 */
export function createDatabaseErrorContext(
  operation: DatabaseOperationType,
  table: string,
  queryId?: string,
  baseContext?: Partial<BusinessProfileErrorContext>
): BusinessProfileErrorContext {
  const context = baseContext || createErrorContext({
    component: 'BusinessProfileRepository'
  });

  return {
    ...context,
    database: {
      operation,
      table,
      queryId
    }
  } as BusinessProfileErrorContext;
}
