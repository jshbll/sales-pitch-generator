// ConvexClientManager - Singleton manager for Convex client
import { ConvexReactClient } from 'convex/react';

/**
 * Singleton manager for the Convex client instance.
 * Ensures only one client is created and shared across the app.
 */
export class ConvexClientManager {
  private static instance: ConvexReactClient | null = null;
  private static url: string | null = null;

  /**
   * Initialize the Convex client with the given URL.
   * Should be called once at app startup.
   */
  static initialize(url: string): ConvexReactClient {
    if (!this.instance) {
      this.url = url;
      this.instance = new ConvexReactClient(url);
      console.log('[ConvexClientManager] Initialized with URL:', url);
    }
    return this.instance;
  }

  /**
   * Get the shared Convex client instance.
   * Throws if not initialized.
   */
  static getClient(): ConvexReactClient {
    if (!this.instance) {
      throw new Error('[ConvexClientManager] Client not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Get the Convex URL.
   */
  static getUrl(): string | null {
    return this.url;
  }

  /**
   * Check if the client has been initialized.
   */
  static isInitialized(): boolean {
    return this.instance !== null;
  }
}
