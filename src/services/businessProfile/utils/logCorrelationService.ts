/**
 * Log Correlation Service
 * 
 * Service for tracking related operations across different components of the application.
 * Provides correlation IDs and maintains context throughout the request lifecycle.
 * 
 * @version 2.0.0
 * @author JaxSaver Team
 */
import { generateRequestId } from '../../../utils/logger';
import { BusinessProfileLogContext } from './businessProfileLogger';
import { isProductionEnv } from '../../../utils/environmentUtils';

/**
 * Maximum number of events to store in the correlation store
 */
const MAX_CORRELATION_EVENTS = 100;

/**
 * Correlation event with timestamp and context
 */
interface CorrelationEvent {
  timestamp: number;
  operation: string;
  status: 'start' | 'success' | 'error' | 'info';
  context: Partial<BusinessProfileLogContext>;
}

/**
 * Correlation store to track related events by correlation ID
 */
class CorrelationStore {
  private correlations: Map<string, CorrelationEvent[]> = new Map();
  
  /**
   * Add an event to the correlation store
   * 
   * @param correlationId Correlation ID
   * @param event Correlation event to add
   */
  public addEvent(correlationId: string, event: CorrelationEvent): void {
    // Get or create events array for this correlation
    const events = this.correlations.get(correlationId) || [];
    
    // Add event to array (limited to max events)
    events.push(event);
    if (events.length > MAX_CORRELATION_EVENTS) {
      events.shift(); // Remove oldest event
    }
    
    // Store updated events array
    this.correlations.set(correlationId, events);
  }
  
  /**
   * Get all events for a correlation ID
   * 
   * @param correlationId Correlation ID
   * @returns Array of correlation events or empty array if none found
   */
  public getEvents(correlationId: string): CorrelationEvent[] {
    return this.correlations.get(correlationId) || [];
  }
  
  /**
   * Check if a correlation ID exists in the store
   * 
   * @param correlationId Correlation ID to check
   * @returns True if correlation ID exists
   */
  public hasCorrelation(correlationId: string): boolean {
    return this.correlations.has(correlationId);
  }
  
  /**
   * Clean up old correlations (older than maxAgeMs)
   * 
   * @param maxAgeMs Maximum age in milliseconds (default: 30 minutes)
   */
  public cleanupOldCorrelations(maxAgeMs: number = 30 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [correlationId, events] of this.correlations.entries()) {
      // Get timestamp of most recent event
      const latestEvent = events[events.length - 1];
      if (!latestEvent) continue;
      
      // Remove correlation if too old
      if (now - latestEvent.timestamp > maxAgeMs) {
        this.correlations.delete(correlationId);
      }
    }
  }
}

// Create correlation store instance
const correlationStore = new CorrelationStore();

// Set up cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  correlationStore.cleanupOldCorrelations();
}, CLEANUP_INTERVAL_MS);

/**
 * Log Correlation Service
 */
const logCorrelationService = {
  /**
   * Create new correlation ID
   * 
   * @returns New correlation ID
   */
  createCorrelationId: (): string => {
    return `corr_${generateRequestId()}`;
  },
  
  /**
   * Start tracking a correlated operation
   * 
   * @param operation Operation name
   * @param context Operation context
   * @returns Correlation ID for this operation chain
   */
  startCorrelation: (
    operation: string,
    context: Partial<BusinessProfileLogContext> = {}
  ): string => {
    // Create correlation ID if not provided
    const correlationId = context.correlationId || logCorrelationService.createCorrelationId();
    
    // Add start event to store
    correlationStore.addEvent(correlationId, {
      timestamp: Date.now(),
      operation,
      status: 'start',
      context: {
        ...context,
        correlationId,
      },
    });
    
    return correlationId;
  },
  
  /**
   * Log success event for a correlated operation
   * 
   * @param operation Operation name
   * @param correlationId Correlation ID
   * @param context Additional context
   */
  logSuccess: (
    operation: string,
    correlationId: string,
    context: Partial<BusinessProfileLogContext> = {}
  ): void => {
    correlationStore.addEvent(correlationId, {
      timestamp: Date.now(),
      operation,
      status: 'success',
      context: {
        ...context,
        correlationId,
      },
    });
  },
  
  /**
   * Log error event for a correlated operation
   * 
   * @param operation Operation name
   * @param correlationId Correlation ID
   * @param context Additional context with error details
   */
  logError: (
    operation: string,
    correlationId: string,
    context: Partial<BusinessProfileLogContext> = {}
  ): void => {
    correlationStore.addEvent(correlationId, {
      timestamp: Date.now(),
      operation,
      status: 'error',
      context: {
        ...context,
        correlationId,
      },
    });
  },
  
  /**
   * Log informational event for a correlated operation
   * 
   * @param operation Operation name
   * @param correlationId Correlation ID
   * @param message Informational message
   * @param context Additional context
   */
  logInfo: (
    operation: string,
    correlationId: string,
    message: string,
    context: Partial<BusinessProfileLogContext> = {}
  ): void => {
    correlationStore.addEvent(correlationId, {
      timestamp: Date.now(),
      operation,
      status: 'info',
      context: {
        ...context,
        message,
        correlationId,
      },
    });
  },
  
  /**
   * Get all correlated events for a correlation ID
   * 
   * @param correlationId Correlation ID
   * @returns Array of correlated events or empty array if none found
   */
  getCorrelationEvents: (correlationId: string): CorrelationEvent[] => {
    return correlationStore.getEvents(correlationId);
  },
  
  /**
   * Check if a correlation ID exists
   * 
   * @param correlationId Correlation ID to check
   * @returns True if correlation ID exists
   */
  hasCorrelation: (correlationId: string): boolean => {
    return correlationStore.hasCorrelation(correlationId);
  },
  
  /**
   * Create correlation context from parent context
   * 
   * @param parentContext Parent context object
   * @param operation Current operation name
   * @returns New context object with correlation information
   */
  createCorrelationContext: (
    parentContext: Partial<BusinessProfileLogContext> = {},
    operation: string
  ): Partial<BusinessProfileLogContext> => {
    // Use existing correlation ID or create a new one
    const correlationId = parentContext.correlationId || logCorrelationService.createCorrelationId();
    const requestId = generateRequestId();
    
    return {
      ...parentContext,
      correlationId,
      requestId,
      parentOperation: parentContext.operation,
      operation,
      timestamp: new Date().toISOString(),
    };
  },
  
  /**
   * Get correlation trail as formatted string
   * Useful for debugging and tracing operations
   * 
   * @param correlationId Correlation ID
   * @returns Formatted string with correlation trail or null if not available
   */
  getCorrelationTrail: (correlationId: string): string | null => {
    // Don't expose correlation trails in production
    if (isProductionEnv()) return null;
    
    // Get all events for this correlation
    const events = correlationStore.getEvents(correlationId);
    if (!events.length) return null;
    
    // Format events as trail
    return events.map(event => {
      const timestamp = new Date(event.timestamp).toISOString();
      return `[${timestamp}] ${event.operation} (${event.status})${event.context.message ? `: ${event.context.message}` : ''}`;
    }).join('\n');
  },
};

export default logCorrelationService;
