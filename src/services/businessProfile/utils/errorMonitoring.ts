/**
 * Enhanced Error Monitoring Utility
 * 
 * Provides centralized error monitoring and reporting for the Business Profile Service.
 * This utility integrates with the enhanced logger service to provide consistent
 * error tracking, monitoring, and reporting with improved correlation and metrics.
 *
 * Features:
 * - Consistent error categorization and tracking
 * - Correlation of related errors through operation IDs
 * - Error rate monitoring and anomaly detection
 * - Support for multiple monitoring backends
 * - Configurable sampling and filtering
 * - Detailed error context enrichment
 */
import logger from './loggerService';
import { BusinessProfileErrorContext, createErrorContext } from './errorContext';
import { BusinessProfileErrorType, BusinessProfileErrorCode, ERROR_CATEGORY_MAPPING } from './errorTypes';
import { categorizeError } from './errorCategorization';

/**
 * Error monitoring configuration
 */
interface ErrorMonitoringConfig {
  /** Whether to enable error monitoring */
  enabled: boolean;
  /** Whether to track database errors */
  trackDatabaseErrors: boolean;
  /** Whether to track validation errors */
  trackValidationErrors: boolean;
  /** Whether to track authentication errors */
  trackAuthErrors: boolean;
  /** Whether to track server errors */
  trackServerErrors: boolean;
  /** Minimum error level to report to monitoring service */
  minReportLevel: 'error' | 'critical';
  /** Error rate threshold for alerting (errors per minute) */
  errorRateThreshold: number;
  /** Whether to track error correlations */
  trackCorrelations: boolean;
  /** Error sampling rate (0-1, where 1 means track all errors) */
  samplingRate: number;
  /** Whether to enrich errors with additional context */
  enrichErrors: boolean;
  /** List of error types to always monitor, regardless of other settings */
  criticalErrorTypes: BusinessProfileErrorType[];
}

/**
 * Default error monitoring configuration
 */
const DEFAULT_CONFIG: ErrorMonitoringConfig = {
  enabled: process.env.NODE_ENV === 'production',
  trackDatabaseErrors: true,
  trackValidationErrors: process.env.NODE_ENV === 'production',
  trackAuthErrors: true,
  trackServerErrors: true,
  minReportLevel: 'critical',
  errorRateThreshold: 5, // Alert if more than 5 errors per minute
  trackCorrelations: true,
  samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // Sample 10% in production, all in dev
  enrichErrors: true,
  criticalErrorTypes: [
    BusinessProfileErrorType.INTERNAL_ERROR,
    BusinessProfileErrorType.DATABASE_ERROR,
    BusinessProfileErrorType.AUTHENTICATION_ERROR
  ]
};

/**
 * Error Monitoring Service
 * 
 * Provides centralized error monitoring and reporting for the Business Profile Service.
 */
/**
 * Error rate tracking data
 */
interface ErrorRateData {
  /** Timestamp of the first error in the current window */
  windowStart: number;
  /** Error counts by type in the current window */
  counts: Record<BusinessProfileErrorType, number>;
  /** Total errors in the current window */
  total: number;
}

/**
 * Correlation data for tracking related errors
 */
interface CorrelationData {
  /** Operation ID for the correlated errors */
  operationId: string;
  /** Timestamp of the first error */
  firstSeen: number;
  /** Timestamp of the last error */
  lastSeen: number;
  /** Count of related errors */
  count: number;
  /** Error types encountered */
  errorTypes: Set<BusinessProfileErrorType>;
  /** Component where the errors occurred */
  component?: string;
}

export class ErrorMonitoringService {
  private config: ErrorMonitoringConfig;
  private errorRateData: ErrorRateData;
  private correlations: Map<string, CorrelationData>;
  
  /**
   * Create a new error monitoring service
   * 
   * @param config - Error monitoring configuration
   */
  constructor(config: Partial<ErrorMonitoringConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
    
    // Initialize error rate tracking
    this.errorRateData = {
      windowStart: Date.now(),
      counts: Object.values(BusinessProfileErrorType).reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<BusinessProfileErrorType, number>),
      total: 0
    };
    
    // Initialize correlations tracking
    this.correlations = new Map<string, CorrelationData>();
  }
  
  /**
   * Track an error
   * 
   * Enhanced with error rate monitoring, sampling, and correlation tracking.
   * 
   * @param error - Error to track
   * @param context - Error context
   * @param errorType - Error type
   * @param errorCode - Error code
   */
  trackError(error: Error, context: BusinessProfileErrorContext, errorType?: BusinessProfileErrorType, errorCode?: BusinessProfileErrorCode): void {
    if (!this.config.enabled) {
      return;
    }
    
    // Apply sampling if configured
    if (this.config.samplingRate < 1.0 && Math.random() > this.config.samplingRate) {
      // Skip this error based on sampling rate, but still count it for rate monitoring
      this.updateErrorRate(errorType || categorizeError(error));
      return;
    }
    
    // Categorize the error if not already categorized
    const categorizedError = errorType || categorizeError(error);
    
    // Always track critical error types regardless of other settings
    const isCriticalErrorType = this.config.criticalErrorTypes.includes(categorizedError);

    // Skip tracking for certain error types based on configuration
    if (!isCriticalErrorType && (
      (categorizedError === BusinessProfileErrorType.DATABASE_ERROR && !this.config.trackDatabaseErrors) ||
      (categorizedError === BusinessProfileErrorType.VALIDATION_ERROR && !this.config.trackValidationErrors) ||
      (categorizedError === BusinessProfileErrorType.AUTHENTICATION_ERROR && !this.config.trackAuthErrors) ||
      (categorizedError === BusinessProfileErrorType.INTERNAL_ERROR && !this.config.trackServerErrors)
    )) {
      return;
    }
    
    // Update error rate monitoring
    this.updateErrorRate(categorizedError);
    
    // Track correlation if enabled and context has an operationId
    if (this.config.trackCorrelations && context.operationId) {
      this.trackCorrelation(context, categorizedError);
    }
    
    // Enrich error context if enabled
    if (this.config.enrichErrors) {
      context = this.enrichErrorContext(context, error, categorizedError);
    }
    
    // Get error category from mapping for better categorization
    const errorCategory = ERROR_CATEGORY_MAPPING[categorizedError] || 'UNKNOWN';
    
    // Log the error with the appropriate level
    const errorMessage = error.message || 'Unknown error';
    logger.logError(context, errorMessage, categorizedError, errorCode, error);
    
    // Check for error rate anomalies
    const hasAnomalousRate = this.checkErrorRateThreshold();
    
    // Report the error to the monitoring service based on criteria
    if (
      hasAnomalousRate || // Always report if we detect an anomalous error rate
      isCriticalErrorType || // Always report critical error types
      this.config.minReportLevel === 'error' ||
      (this.config.minReportLevel === 'critical' && 
       (categorizedError === BusinessProfileErrorType.INTERNAL_ERROR || 
        categorizedError === BusinessProfileErrorType.DATABASE_ERROR))
    ) {
      this.reportToMonitoringService(error, context, categorizedError, errorCode, errorCategory);
    }
  }
  
  /**
   * Update the error rate counters
   * 
   * @param errorType - Type of error that occurred
   */
  private updateErrorRate(errorType: BusinessProfileErrorType): void {
    const now = Date.now();
    const windowDuration = 60000; // 1 minute window
    
    // Reset the window if it's been longer than the window duration
    if (now - this.errorRateData.windowStart > windowDuration) {
      this.errorRateData = {
        windowStart: now,
        counts: Object.values(BusinessProfileErrorType).reduce((acc, type) => {
          acc[type] = 0;
          return acc;
        }, {} as Record<BusinessProfileErrorType, number>),
        total: 0
      };
    }
    
    // Increment the counter for this error type
    this.errorRateData.counts[errorType] = (this.errorRateData.counts[errorType] || 0) + 1;
    this.errorRateData.total++;
  }
  
  /**
   * Check if the error rate exceeds the threshold
   * 
   * @returns True if the error rate is above threshold
   */
  private checkErrorRateThreshold(): boolean {
    const now = Date.now();
    // Calculate elapsed minutes directly using milliseconds-to-minutes conversion factor
    const elapsedMinutes = (now - this.errorRateData.windowStart) / 60000;
    
    // Calculate errors per minute
    const errorsPerMinute = elapsedMinutes > 0 
      ? this.errorRateData.total / elapsedMinutes 
      : this.errorRateData.total;
      
    return errorsPerMinute >= this.config.errorRateThreshold;
  }
  
  /**
   * Track correlations between errors with the same operation ID
   * 
   * @param context - Error context with operation ID
   * @param errorType - Error type
   */
  private trackCorrelation(context: BusinessProfileErrorContext, errorType: BusinessProfileErrorType): void {
    if (!context.operationId) return;
    
    const now = Date.now();
    const operationId = context.operationId;
    
    if (this.correlations.has(operationId)) {
      // Update existing correlation
      const correlation = this.correlations.get(operationId)!;
      correlation.count++;
      correlation.lastSeen = now;
      correlation.errorTypes.add(errorType);
      
      // Update component if not already set
      if (!correlation.component && context.component) {
        correlation.component = context.component;
      }
    } else {
      // Create new correlation
      this.correlations.set(operationId, {
        operationId,
        firstSeen: now,
        lastSeen: now,
        count: 1,
        errorTypes: new Set([errorType]),
        component: context.component
      });
    }
    
    // If we have more than 100 correlations, remove the oldest ones
    if (this.correlations.size > 100) {
      const oldest = [...this.correlations.entries()]
        .sort((a, b) => a[1].lastSeen - b[1].lastSeen)
        .slice(0, 20) // Remove 20 oldest correlations
        .map(entry => entry[0]); // Get operation IDs
        
      oldest.forEach(id => this.correlations.delete(id));
    }
  }
  
  /**
   * Enrich error context with additional information
   * 
   * @param context - Original error context
   * @param error - The error being reported
   * @param errorType - Type of error
   * @returns Enriched error context
   */
  private enrichErrorContext(context: BusinessProfileErrorContext, error: Error, errorType: BusinessProfileErrorType): BusinessProfileErrorContext {
    // If we don't have a context with necessary fields, create a new one
    if (!context.operationId || !context.timestamp) {
      // Create a new context with all available information
      const newContext = createErrorContext({
        functionName: context.functionName,
        component: context.component,
        // For error context, we pass null for the user to avoid type issues
        // The essential user info is still preserved in the context itself
        user: null,
        businessId: context.business?.id,
        businessName: context.business?.name,
        dbOperation: context.database?.operation,
        dbTable: context.database?.table,
        dbQueryId: context.database?.queryId,
        info: context.info
      });
      
      // Merge new context with original, prioritizing original values
      context = { ...newContext, ...context };
    }
    
    // Add error type mapping information
    const errorCategory = ERROR_CATEGORY_MAPPING[errorType] || 'UNKNOWN';
    context.info = context.info || {};
    context.info.errorCategory = errorCategory;
    context.info.errorTypeName = errorType;
    
    // Add stack trace information if available
    if (error.stack) {
      context.info.stackTrace = error.stack;
    }
    
    return context;
  }
  
  /**
   * Report an error to the monitoring service
   * 
   * @param error - Error to report
   * @param context - Error context
   * @param errorType - Error type
   * @param errorCode - Error code
   * @param errorCategory - Error category from ERROR_CATEGORY_MAPPING
   */
  private reportToMonitoringService(
    error: Error, 
    context: BusinessProfileErrorContext, 
    errorType: BusinessProfileErrorType, 
    errorCode?: BusinessProfileErrorCode,
    errorCategory?: string
  ): void {
    // In a real implementation, this would send the error to a monitoring service
    // For now, we'll just log it to the console with a special prefix
    console.error(
      '[ERROR MONITORING]',
      JSON.stringify({
        timestamp: context.timestamp || Date.now(),
        errorType,
        errorCode,
        errorCategory,
        message: error.message,
        stack: error.stack,
        operationId: context.operationId,
        component: context.component,
        functionName: context.functionName,
        userId: context.user?.id,
        userRole: context.user?.role,
        businessId: context.business?.id,
        database: context.database,
        info: context.info
      })
    );
    
    // Example implementation for sending to a monitoring service:
    // try {
    //   fetch('https://monitoring-service.example.com/api/errors', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       timestamp: context.timestamp || Date.now(),
    //       errorType,
    //       errorCode,
    //       errorCategory,
    //       message: error.message,
    //       stack: error.stack,
    //       operationId: context.operationId,
    //       component: context.component,
    //       functionName: context.functionName,
    //       userId: context.user?.id,
    //       userRole: context.user?.role,
    //       businessId: context.business?.id,
    //       database: context.database,
    //       info: context.info
    //     })
    //   });
    // } catch (reportError) {
    //   console.error('Failed to report error to monitoring service', reportError);
    // }
  }
  
  /**
   * Track a database error
   * 
   * @param error - Database error
   * @param context - Error context
   * @param errorCode - Error code
   */
  trackDatabaseError(error: Error, context: BusinessProfileErrorContext, errorCode?: BusinessProfileErrorCode): void {
    this.trackError(error, context, BusinessProfileErrorType.DATABASE_ERROR, errorCode);
  }
  
  /**
   * Track a validation error
   * 
   * @param error - Validation error
   * @param context - Error context
   * @param errorCode - Error code
   */
  trackValidationError(error: Error, context: BusinessProfileErrorContext, errorCode?: BusinessProfileErrorCode): void {
    this.trackError(error, context, BusinessProfileErrorType.VALIDATION, errorCode);
  }
  
  /**
   * Track an authentication error
   * 
   * @param error - Authentication error
   * @param context - Error context
   * @param errorCode - Error code
   */
  trackAuthError(error: Error, context: BusinessProfileErrorContext, errorCode?: BusinessProfileErrorCode): void {
    this.trackError(error, context, BusinessProfileErrorType.AUTHENTICATION, errorCode);
  }
  
  /**
   * Track a server error
   * 
   * @param error - Server error
   * @param context - Error context
   * @param errorCode - Error code
   */
  trackServerError(error: Error, context: BusinessProfileErrorContext, errorCode?: BusinessProfileErrorCode): void {
    this.trackError(error, context, BusinessProfileErrorType.SERVER_ERROR, errorCode);
  }
  
  /**
   * Track a permission error
   * 
   * @param error - Permission error
   * @param context - Error context
   * @param errorCode - Error code
   */
  trackPermissionError(error: Error, context: BusinessProfileErrorContext, errorCode?: BusinessProfileErrorCode): void {
    this.trackError(error, context, BusinessProfileErrorType.PERMISSION_DENIED, errorCode);
  }
  
  /**
   * Track a timeout error
   * 
   * @param error - Timeout error
   * @param context - Error context
   * @param errorCode - Error code
   */
  trackTimeoutError(error: Error, context: BusinessProfileErrorContext, errorCode?: BusinessProfileErrorCode): void {
    this.trackError(error, context, BusinessProfileErrorType.TIMEOUT, errorCode);
  }
  
  /**
   * Track a rate limit error
   * 
   * @param error - Rate limit error
   * @param context - Error context
   * @param errorCode - Error code
   */
  trackRateLimitError(error: Error, context: BusinessProfileErrorContext, errorCode?: BusinessProfileErrorCode): void {
    this.trackError(error, context, BusinessProfileErrorType.RATE_LIMIT_EXCEEDED, errorCode);
  }
}

// Create and export a default instance
const errorMonitoring = new ErrorMonitoringService();
export default errorMonitoring;
