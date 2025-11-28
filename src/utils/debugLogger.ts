/**
 * Debug Logger Utility
 * Provides a centralized way to control console logging across the application
 */

interface DebugConfig {
  enabled: boolean;
  categories: {
    api: boolean;
    components: boolean;
    hooks: boolean;
    images: boolean;
    business: boolean;
    auth: boolean;
    validation: boolean;
    newsletter: boolean;
  };
}

class DebugLogger {
  private config: DebugConfig = {
    enabled: process.env.NODE_ENV === 'development',
    categories: {
      api: false,           // API calls and responses
      components: false,    // Component rendering and lifecycle
      hooks: false,         // React hooks state changes
      images: false,        // Image processing and validation
      business: false,      // Business profile operations
      auth: false,          // Authentication flows
      validation: false,    // Form validation
      newsletter: false,    // Newsletter booking operations
    }
  };

  constructor() {
    // Allow runtime toggling via window object in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).debugLogger = this;
      console.log('🐛 Debug Logger available at window.debugLogger');
      console.log('📝 Use debugLogger.enable("category") or debugLogger.disable("category")');
      console.log('📋 Available categories:', Object.keys(this.config.categories));
    }
  }

  /**
   * Enable debug logging for a specific category
   */
  enable(category: keyof DebugConfig['categories'] | 'all'): void {
    if (category === 'all') {
      this.config.enabled = true;
      Object.keys(this.config.categories).forEach(key => {
        (this.config.categories as any)[key] = true;
      });
      console.log('🟢 All debug logging enabled');
    } else if (category in this.config.categories) {
      this.config.enabled = true;
      this.config.categories[category] = true;
      console.log(`🟢 Debug logging enabled for: ${category}`);
    }
  }

  /**
   * Disable debug logging for a specific category
   */
  disable(category: keyof DebugConfig['categories'] | 'all'): void {
    if (category === 'all') {
      this.config.enabled = false;
      Object.keys(this.config.categories).forEach(key => {
        (this.config.categories as any)[key] = false;
      });
      console.log('🔴 All debug logging disabled');
    } else if (category in this.config.categories) {
      this.config.categories[category] = false;
      console.log(`🔴 Debug logging disabled for: ${category}`);
    }
  }

  /**
   * Check if a category is enabled
   */
  isEnabled(category: keyof DebugConfig['categories']): boolean {
    return this.config.enabled && this.config.categories[category];
  }

  /**
   * Log to console if the category is enabled
   */
  log(category: keyof DebugConfig['categories'], ...args: any[]): void {
    if (this.isEnabled(category)) {
      console.log(`[${category.toUpperCase()}]`, ...args);
    }
  }

  /**
   * Warn to console if the category is enabled
   */
  warn(category: keyof DebugConfig['categories'], ...args: any[]): void {
    if (this.isEnabled(category)) {
      console.warn(`[${category.toUpperCase()}]`, ...args);
    }
  }

  /**
   * Error to console if the category is enabled
   */
  error(category: keyof DebugConfig['categories'], ...args: any[]): void {
    if (this.isEnabled(category)) {
      console.error(`[${category.toUpperCase()}]`, ...args);
    }
  }

  /**
   * Show current configuration
   */
  status(): void {
    console.table({
      'Debug Enabled': this.config.enabled,
      ...this.config.categories
    });
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// Export helper functions for convenience
export const debugLog = {
  api: (...args: any[]) => debugLogger.log('api', ...args),
  components: (...args: any[]) => debugLogger.log('components', ...args),
  hooks: (...args: any[]) => debugLogger.log('hooks', ...args),
  images: (...args: any[]) => debugLogger.log('images', ...args),
  business: (...args: any[]) => debugLogger.log('business', ...args),
  auth: (...args: any[]) => debugLogger.log('auth', ...args),
  validation: (...args: any[]) => debugLogger.log('validation', ...args),
  newsletter: (...args: any[]) => debugLogger.log('newsletter', ...args),
};

export const debugWarn = {
  api: (...args: any[]) => debugLogger.warn('api', ...args),
  components: (...args: any[]) => debugLogger.warn('components', ...args),
  hooks: (...args: any[]) => debugLogger.warn('hooks', ...args),
  images: (...args: any[]) => debugLogger.warn('images', ...args),
  business: (...args: any[]) => debugLogger.warn('business', ...args),
  auth: (...args: any[]) => debugLogger.warn('auth', ...args),
  validation: (...args: any[]) => debugLogger.warn('validation', ...args),
  newsletter: (...args: any[]) => debugLogger.warn('newsletter', ...args),
};

export const debugError = {
  api: (...args: any[]) => debugLogger.error('api', ...args),
  components: (...args: any[]) => debugLogger.error('components', ...args),
  hooks: (...args: any[]) => debugLogger.error('hooks', ...args),
  images: (...args: any[]) => debugLogger.error('images', ...args),
  business: (...args: any[]) => debugLogger.error('business', ...args),
  auth: (...args: any[]) => debugLogger.error('auth', ...args),
  validation: (...args: any[]) => debugLogger.error('validation', ...args),
  newsletter: (...args: any[]) => debugLogger.error('newsletter', ...args),
};

export default debugLogger;