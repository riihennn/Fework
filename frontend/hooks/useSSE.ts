"use client";

import { useEffect, useRef, useCallback } from "react";
import { API_BASE_URL } from "@/services/api";

type SSEEventHandler = (data: any) => void;

interface UseSSEOptions {
  enabled?: boolean;
  onConnected?: () => void;
  onError?: () => void;
}

/**
 * useSSE — connects to the worker's real-time event stream.
 * Automatically reconnects on disconnect with exponential backoff.
 */
export function useSSE(
  handlers: Record<string, SSEEventHandler>,
  options: UseSSEOptions = {}
) {
  const { enabled = true } = options;
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const handlersRef = useRef(handlers);

  // Keep handlers ref fresh without re-triggering the effect
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    const url = `${API_BASE_URL}/bookings/stream`;
    // EventSource doesn't support custom headers — auth via cookies (httpOnly)
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.addEventListener("connected", () => {
      console.log("[SSE] Connected to worker stream");
      retryCount.current = 0;
      options.onConnected?.();
    });

    // Register all provided event handlers dynamically
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      es.addEventListener(event, (e: MessageEvent) => {
        try {
          handler(JSON.parse(e.data));
        } catch {
          handler(e.data);
        }
      });
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      options.onError?.();

      // Exponential backoff: 1s, 2s, 4s, 8s … max 30s
      const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
      retryCount.current++;
      console.log(`[SSE] Reconnecting in ${delay / 1000}s…`);
      retryRef.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    connect();

    return () => {
      esRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [enabled, connect]);
}
