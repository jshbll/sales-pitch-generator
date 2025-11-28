/**
 * Utility to clear all auth-related storage
 * Run this in browser console to clear malformed auth tokens
 */

export function clearAllAuthStorage() {
  console.log('[ClearAuthStorage] Starting cleanup...');
  
  const keysToRemove: string[] = [];
  
  // Find all auth-related keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('convexAuth') || 
      key.includes('__convexAuth') ||
      key.includes('JWT') ||
      key.includes('RefreshToken') ||
      key.includes('auth')
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all found keys
  keysToRemove.forEach(key => {
    console.log(`[ClearAuthStorage] Removing: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Also clear sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (
      key.includes('convexAuth') || 
      key.includes('__convexAuth') ||
      key.includes('auth')
    )) {
      console.log(`[ClearAuthStorage] Removing from session: ${key}`);
      sessionStorage.removeItem(key);
    }
  }
  
  console.log(`[ClearAuthStorage] Cleared ${keysToRemove.length} auth keys`);
  
  // Force page reload to reset all auth state
  console.log('[ClearAuthStorage] Reloading page to reset auth state...');
  window.location.reload();
}

// Make it available globally for easy access
if (typeof window !== 'undefined') {
  (window as any).clearAllAuthStorage = clearAllAuthStorage;
}