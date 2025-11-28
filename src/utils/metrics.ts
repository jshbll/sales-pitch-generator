/**
 * Metrics utility for tracking application performance and errors
 */
import logger from './logger';

// Simple in-memory metrics store
// In a production environment, this would be replaced with a proper metrics service
// like Prometheus, DataDog, or CloudWatch
class MetricsClient {
  private counters: Record<string, number> = {};
  private gauges: Record<string, number> = {};
  private histograms: Record<string, number[]> = {};
  private lastReportTime: number = Date.now();
  private reportIntervalMs: number = 60000; // Report every minute by default

  /**
   * Increment a counter metric
   * @param name Metric name
   * @param value Value to increment by (default: 1)
   * @param tags Optional tags for the metric
   */
  incrementCounter(name: string, value: number = 1, tags: Record<string, string> = {}): void {
    const metricKey = this.formatMetricKey(name, tags);
    this.counters[metricKey] = (this.counters[metricKey] || 0) + value;
    this.checkReportMetrics();
  }

  /**
   * Set a gauge metric
   * @param name Metric name
   * @param value Current value
   * @param tags Optional tags for the metric
   */
  setGauge(name: string, value: number, tags: Record<string, string> = {}): void {
    const metricKey = this.formatMetricKey(name, tags);
    this.gauges[metricKey] = value;
    this.checkReportMetrics();
  }

  /**
   * Record a value in a histogram
   * @param name Metric name
   * @param value Value to record
   * @param tags Optional tags for the metric
   */
  recordHistogram(name: string, value: number, tags: Record<string, string> = {}): void {
    const metricKey = this.formatMetricKey(name, tags);
    if (!this.histograms[metricKey]) {
      this.histograms[metricKey] = [];
    }
    this.histograms[metricKey].push(value);
    this.checkReportMetrics();
  }

  /**
   * Time an operation and record it in a histogram
   * @param name Metric name
   * @param operation Function to time
   * @param tags Optional tags for the metric
   * @returns Result of the operation
   */
  async timeOperation<T>(
    name: string, 
    operation: () => Promise<T>, 
    tags: Record<string, string> = {}
  ): Promise<T> {
    const start = Date.now();
    try {
      return await operation();
    } finally {
      const duration = Date.now() - start;
      this.recordHistogram(name, duration, tags);
    }
  }

  /**
   * Record the result of an operation (success or failure)
   * @param name Operation name
   * @param success Whether the operation succeeded
   * @param tags Optional tags for the metric
   */
  recordOperation(name: string, success: boolean, tags: Record<string, string> = {}): void {
    const result = success ? 'success' : 'failure';
    this.incrementCounter(`${name}.${result}`, 1, tags);
  }

  /**
   * Format a metric key with tags
   * @param name Metric name
   * @param tags Tags for the metric
   * @returns Formatted metric key
   */
  private formatMetricKey(name: string, tags: Record<string, string>): string {
    if (Object.keys(tags).length === 0) {
      return name;
    }
    
    const tagString = Object.entries(tags)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
    
    return `${name}{${tagString}}`;
  }

  /**
   * Check if it's time to report metrics
   */
  private checkReportMetrics(): void {
    const now = Date.now();
    if (now - this.lastReportTime >= this.reportIntervalMs) {
      this.reportMetrics();
      this.lastReportTime = now;
    }
  }

  /**
   * Report all current metrics
   */
  private reportMetrics(): void {
    // In a production environment, this would send metrics to a monitoring service
    // For now, we'll just log them
    logger.info('Metrics Report', {
      timestamp: new Date().toISOString(),
      counters: this.counters,
      gauges: this.gauges,
      histograms: this.calculateHistogramStats()
    });
  }

  /**
   * Calculate statistics for histograms
   */
  private calculateHistogramStats(): Record<string, { count: number, min: number, max: number, avg: number }> {
    const stats: Record<string, { count: number, min: number, max: number, avg: number }> = {};
    
    for (const [key, values] of Object.entries(this.histograms)) {
      if (values.length === 0) continue;
      
      const min = Math.min(...values);
      const max = Math.max(...values);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      
      stats[key] = { count: values.length, min, max, avg };
    }
    
    return stats;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters = {};
    this.gauges = {};
    this.histograms = {};
  }
}

// Export a singleton instance
const metricsClient = new MetricsClient();
export default metricsClient;
