'use client';

/**
 * @openspec openspec/specs/frontend-realtime/spec.md
 * @change Phase-20-realtime-ui
 */
import { useEffect, useState } from 'react';
import type { ConnectedEvent, ConnectionState, HeartbeatEvent, SystemEvent } from '../types';

export type UseRealtimeStreamResult = {
  connectionState: ConnectionState;
  lastEvent: string | null;
};

export const useRealtimeStream = (): UseRealtimeStreamResult => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';
    const source = new EventSource(`${apiUrl}/realtime/stream`);

    source.addEventListener('connected', (event) => {
      const parsed = JSON.parse((event as MessageEvent).data as string) as ConnectedEvent;
      setConnectionState('connected');
      setLastEvent(parsed.timestamp);
    });

    source.addEventListener('heartbeat', (event) => {
      const parsed = JSON.parse((event as MessageEvent).data as string) as HeartbeatEvent;
      setLastEvent(parsed.timestamp);
    });

    source.addEventListener('system', (event) => {
      const parsed = JSON.parse((event as MessageEvent).data as string) as SystemEvent;
      setLastEvent(parsed.timestamp);
    });

    source.onerror = () => {
      setConnectionState('reconnecting');
    };

    return () => {
      source.close();
      setConnectionState('disconnected');
    };
  }, []);

  return { connectionState, lastEvent };
};
