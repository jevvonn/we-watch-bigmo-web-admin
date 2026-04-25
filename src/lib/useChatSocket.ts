import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiMessage } from "../types";

const WS_URL = import.meta.env.VITE_WS_URL;

type Listener = (msg: ApiMessage) => void;

export function useChatSocket(token: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<Listener>>(new Set());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      return;
    }

    let active = true;
    let attempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (!active) return;

      const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!active) {
          ws.close();
          return;
        }
        setConnected(true);
        attempts = 0;
      };

      ws.onclose = () => {
        setConnected(false);
        if (!active) return;
        attempts += 1;
        const delay = Math.min(1000 * 2 ** Math.min(attempts, 5), 15000);
        reconnectTimer = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // onclose akan kepanggil
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data?.type === "message" && data.message) {
            const m = data.message as ApiMessage;
            listenersRef.current.forEach((fn) => fn(m));
          }
        } catch (err) {
          console.warn("Bad WS payload", err);
        }
      };
    };

    connect();

    return () => {
      active = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      const ws = wsRef.current;
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      wsRef.current = null;
      setConnected(false);
    };
  }, [token]);

  const send = useCallback((data: object) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  return { connected, send, subscribe };
}
