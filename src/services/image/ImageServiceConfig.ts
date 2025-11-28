// Configuration for image service

// Helper function to safely access environment variables in both Node.js and browser environments
const getEnv = (key: string): string => {
  // For Vite/browser environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string) || '';
  }
  // Fallback for Node.js environment (SSR)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

export const IMAGE_SERVICE_CONFIG = {
  cloudflareUploadUrl: getEnv('VITE_CLOUDFLARE_UPLOAD_URL') || '',
  apiBaseUrl: getEnv('VITE_API_BASE_URL') || '',
  cloudflareAccountId: getEnv('VITE_CLOUDFLARE_ACCOUNT_ID') || '',
  cloudflareApiKey: getEnv('VITE_CLOUDFLARE_API_KEY') || '',
};
