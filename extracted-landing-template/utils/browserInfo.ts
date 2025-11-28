/**
 * Browser Information Utility
 *
 * Captures browser and system information for diagnostic purposes.
 * Used in bug reports to help identify environment-specific issues.
 */

interface BrowserInfo {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  viewport: {
    width: number;
    height: number;
  };
  screenResolution: string;
  language: string;
  timezone: string;
  cookiesEnabled: boolean;
}

/**
 * Parse user agent to extract browser name and version
 */
function parseBrowser(userAgent: string): { name: string; version: string } {
  let name = 'Unknown';
  let version = 'Unknown';

  // Chrome
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/([\d.]+)/);
    version = match ? match[1] : version;
  }
  // Edge
  else if (userAgent.includes('Edg')) {
    name = 'Edge';
    const match = userAgent.match(/Edg\/([\d.]+)/);
    version = match ? match[1] : version;
  }
  // Firefox
  else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/([\d.]+)/);
    version = match ? match[1] : version;
  }
  // Safari (but not Chrome)
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/([\d.]+)/);
    version = match ? match[1] : version;
  }
  // Opera
  else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
    name = 'Opera';
    const match = userAgent.match(/(?:OPR|Opera)\/([\d.]+)/);
    version = match ? match[1] : version;
  }

  return { name, version };
}

/**
 * Parse user agent to extract OS name and version
 */
function parseOS(userAgent: string): { name: string; version: string } {
  let name = 'Unknown';
  let version = 'Unknown';

  // Windows
  if (userAgent.includes('Windows')) {
    name = 'Windows';
    if (userAgent.includes('Windows NT 10.0')) {
      version = '10/11';
    } else if (userAgent.includes('Windows NT 6.3')) {
      version = '8.1';
    } else if (userAgent.includes('Windows NT 6.2')) {
      version = '8';
    } else if (userAgent.includes('Windows NT 6.1')) {
      version = '7';
    }
  }
  // macOS
  else if (userAgent.includes('Mac OS X')) {
    name = 'macOS';
    const match = userAgent.match(/Mac OS X ([\d_]+)/);
    if (match) {
      version = match[1].replace(/_/g, '.');
    }
  }
  // iOS
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    name = userAgent.includes('iPhone') ? 'iOS (iPhone)' : 'iOS (iPad)';
    const match = userAgent.match(/OS ([\d_]+)/);
    if (match) {
      version = match[1].replace(/_/g, '.');
    }
  }
  // Android
  else if (userAgent.includes('Android')) {
    name = 'Android';
    const match = userAgent.match(/Android ([\d.]+)/);
    version = match ? match[1] : version;
  }
  // Linux
  else if (userAgent.includes('Linux')) {
    name = 'Linux';
  }

  return { name, version };
}

/**
 * Get comprehensive browser and system information
 */
export function getBrowserInfo(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const browser = parseBrowser(userAgent);
  const os = parseOS(userAgent);

  return {
    userAgent,
    browser: browser.name,
    browserVersion: browser.version,
    os: os.name,
    osVersion: os.version,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
  };
}

/**
 * Get a human-readable summary of browser info
 */
export function getBrowserSummary(): string {
  const info = getBrowserInfo();
  return `${info.browser} ${info.browserVersion} on ${info.os} ${info.osVersion}`;
}

/**
 * Check if browser is supported (for displaying warnings)
 */
export function isSupportedBrowser(): boolean {
  const info = getBrowserInfo();
  const browser = info.browser.toLowerCase();

  // Check for outdated browsers
  if (browser === 'internet explorer') {
    return false;
  }

  // Check minimum versions for major browsers
  const version = parseFloat(info.browserVersion);

  if (browser === 'chrome' && version < 90) {
    return false;
  }

  if (browser === 'firefox' && version < 88) {
    return false;
  }

  if (browser === 'safari' && version < 14) {
    return false;
  }

  if (browser === 'edge' && version < 90) {
    return false;
  }

  return true;
}

/**
 * Get detailed system capabilities (for advanced diagnostics)
 */
export function getSystemCapabilities() {
  return {
    // Connection info
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    onLine: navigator.onLine,

    // Hardware info
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    maxTouchPoints: navigator.maxTouchPoints || 0,

    // Feature detection
    webGL: detectWebGL(),
    localStorage: detectLocalStorage(),
    sessionStorage: detectSessionStorage(),
    serviceWorker: 'serviceWorker' in navigator,
    notifications: 'Notification' in window,

    // Display info
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
  };
}

/**
 * Detect WebGL support
 */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    );
  } catch (e) {
    return false;
  }
}

/**
 * Detect localStorage support
 */
function detectLocalStorage(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Detect sessionStorage support
 */
function detectSessionStorage(): boolean {
  try {
    const test = '__storage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
