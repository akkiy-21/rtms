// src/hooks/useWebSocket.ts

import { useState, useEffect, useCallback } from 'react';
import { WebSocketMessage } from '../types';

export const useWebSocket = () => {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [isConfigConnected, setIsConfigConnected] = useState(false);

  const handleDataUpdate = useCallback((data: WebSocketMessage) => {
    setLastMessage(data);
  }, []);

  const handleWebSocketStatus = useCallback((status: boolean) => {
    setIsConfigConnected(status);
  }, []);

  useEffect(() => {
    window.electronAPI.onUpdateData(handleDataUpdate);
    window.electronAPI.onWebSocketStatus(handleWebSocketStatus);

    return () => {
      window.electronAPI.removeListener('update-data', handleDataUpdate);
      window.electronAPI.removeListener('websocket-status', handleWebSocketStatus);
    };
  }, [handleDataUpdate, handleWebSocketStatus]);

  return { lastMessage, isConfigConnected };
};