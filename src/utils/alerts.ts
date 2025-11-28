/**
 * Alerting utility for critical application events
 */
import logger from './logger';

// Alert levels
export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Alert types
export enum AlertType {
  RESERVATION_CREATION_FAILED = 'reservation_creation_failed',
  PAYMENT_PROCESSING_FAILED = 'payment_processing_failed',
  PAYMENT_CHECKOUT_FAILED = 'payment_checkout_failed',
  DATABASE_CONNECTION_FAILED = 'database_connection_failed',
  API_ERROR = 'api_error',
  SECURITY_ISSUE = 'security_issue'
}

// Alert interface
export interface Alert {
  level: AlertLevel;
  type: AlertType;
  message: string;
  timestamp: string;
  data?: Record<string, any>;
  requestId?: string;
}

class AlertManager {
  private alertHandlers: ((alert: Alert) => void)[] = [];
  
  /**
   * Register an alert handler
   * @param handler Function to handle alerts
   */
  registerHandler(handler: (alert: Alert) => void): void {
    this.alertHandlers.push(handler);
  }
  
  /**
   * Trigger an alert
   * @param level Alert level
   * @param type Alert type
   * @param message Alert message
   * @param data Additional data
   * @param requestId Optional request ID for correlation
   */
  triggerAlert(
    level: AlertLevel,
    type: AlertType,
    message: string,
    data?: Record<string, any>,
    requestId?: string
  ): void {
    const alert: Alert = {
      level,
      type,
      message,
      timestamp: new Date().toISOString(),
      data,
      requestId
    };
    
    // Log the alert
    const logMethod = this.getLogMethod(level);
    logMethod(`ALERT: ${message}`, {
      alertType: type,
      ...data,
      requestId
    });
    
    // Notify all handlers
    this.alertHandlers.forEach(handler => {
      try {
        handler(alert);
      } catch (error) {
        logger.error('Error in alert handler', {
          error: (error as Error).message,
          alertType: type
        });
      }
    });
  }
  
  /**
   * Get the appropriate log method based on alert level
   * @param level Alert level
   * @returns Log method
   */
  private getLogMethod(level: AlertLevel): (message: string, meta?: any) => void {
    switch (level) {
      case AlertLevel.INFO:
        return logger.info.bind(logger);
      case AlertLevel.WARNING:
        return logger.warn.bind(logger);
      case AlertLevel.ERROR:
        return logger.error.bind(logger);
      case AlertLevel.CRITICAL:
        return logger.error.bind(logger);
      default:
        return logger.info.bind(logger);
    }
  }
  
  /**
   * Default console alert handler
   * @param alert Alert to handle
   */
  defaultConsoleHandler(alert: Alert): void {
    const { level, type, message, timestamp, data } = alert;
    console.log(`[${timestamp}] [${level.toUpperCase()}] [${type}] ${message}`, data || '');
  }
}

// Create and export a singleton instance
const alertManager = new AlertManager();

// Register the default console handler
alertManager.registerHandler(alertManager.defaultConsoleHandler);

export default alertManager;
