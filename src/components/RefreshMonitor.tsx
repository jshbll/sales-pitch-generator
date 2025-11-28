import React from 'react';

// Development-only refresh monitor
export const RefreshMonitor: React.FC = () => {
  if (import.meta.env.PROD) return null;
  return null; // Placeholder - no actual monitoring UI in this version
};
