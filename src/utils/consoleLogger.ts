/**
 * Console Logger
 *
 * Intercepts console.log, console.warn, and console.error calls
 * and stores the last 50 messages for diagnostic purposes.
 */

interface LogEntry {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
}

interface ConsoleLogs {
  logs: LogEntry[];
  errorCount: number;
  warningCount: number;
  sessionId: string;
  capturedAt: string;
}

class ConsoleLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 50;
  private sessionId: string;
  private originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    info: typeof console.info;
  };

  constructor() {
    this.sessionId = this.generateSessionId();

    // Store original console methods
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    };

    // Always intercept console methods to capture logs for bug reports
    this.interceptConsole();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Intercept console methods
   */
  private interceptConsole(): void {
    console.log = (...args: any[]) => {
      this.addLog('log', args);
      this.originalConsole.log(...args);
    };

    console.warn = (...args: any[]) => {
      this.addLog('warn', args);
      this.originalConsole.warn(...args);
    };

    console.error = (...args: any[]) => {
      this.addLog('error', args);
      this.originalConsole.error(...args);
    };

    console.info = (...args: any[]) => {
      this.addLog('info', args);
      this.originalConsole.info(...args);
    };
  }

  /**
   * Add a log entry
   */
  private addLog(level: LogEntry['level'], args: any[]): void {
    const message = args
      .map((arg) => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: message.substring(0, 500), // Limit message length
    };

    this.logs.push(entry);

    // Keep only the last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Get all captured logs
   */
  public getLogs(): ConsoleLogs {
    const errorCount = this.logs.filter((log) => log.level === 'error').length;
    const warningCount = this.logs.filter((log) => log.level === 'warn').length;

    return {
      logs: [...this.logs],
      errorCount,
      warningCount,
      sessionId: this.sessionId,
      capturedAt: new Date().toISOString(),
    };
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get logs filtered by level
   */
  public getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get recent logs (last N entries)
   */
  public getRecentLogs(count: number): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Restore original console methods
   */
  public restoreConsole(): void {
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.info = this.originalConsole.info;
  }
}

// Create singleton instance
const consoleLogger = new ConsoleLogger();

// Export singleton instance and types
export default consoleLogger;
export type { LogEntry, ConsoleLogs };
