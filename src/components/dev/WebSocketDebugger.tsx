import React from 'react';

// Development-only WebSocket debugger component
const WebSocketDebugger: React.FC = () => {
  if (import.meta.env.PROD) return null;
  return null; // Placeholder - no actual debugging UI in this version
};

export default WebSocketDebugger;
