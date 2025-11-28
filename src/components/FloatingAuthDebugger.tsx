import React from 'react';

// Development-only auth state debugger
export const FloatingAuthDebugger: React.FC = () => {
  if (import.meta.env.PROD) return null;
  return null; // Placeholder - no actual debugging UI in this version
};
