import { useEffect, useState, useCallback, useRef } from 'react';
import type { AgentMessage } from '@clawshield/shared-types';

type SocketStatus = 'connecting' | 'connected' | 'error' | 'disconnected';

export function useAgentSocket() {
  const [status, setStatus] = useState<SocketStatus>('disconnected');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback((jwt: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const wsUrl = `ws://localhost:4000?token=${encodeURIComponent(jwt)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as AgentMessage;
        setMessages((prev) => [...prev, msg].slice(-100)); // Keep last 100
      } catch (err) {
        console.warn('Unknown message format received:', event.data);
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      // Simple reconnect logic
      setTimeout(() => connect(jwt), 3000);
    };

    ws.onerror = () => {
      setStatus('error');
    };

    wsRef.current = ws;
  }, []);

  const send = useCallback((msg: Omit<AgentMessage, 'sessionId' | 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMsg: AgentMessage = {
        ...msg,
        sessionId: 'dashboard-local',
        timestamp: new Date().toISOString(),
      };
      wsRef.current.send(JSON.stringify(fullMsg));
    }
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem('clawshield_device_jwt');
    if (jwt) {
      connect(jwt);
    }

    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return { status, messages, send };
}
