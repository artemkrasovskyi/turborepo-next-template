'use client';

/**
 * @openspec openspec/specs/frontend-realtime/spec.md
 * @change Phase-20-realtime-ui
 * @change Phase-21-live-notifications
 */
import { useEffect, useRef, useState } from 'react';
import type { NotificationItem } from '@repo/types/features/notifications';
import type { ConnectedEvent, ConnectionState, HeartbeatEvent, SystemEvent } from '../types';

export type UseRealtimeStreamOptions = {
  viewerId?: string;
  onNotificationCreated?: (notification: NotificationItem) => void;
};

export type UseRealtimeStreamResult = {
  connectionState: ConnectionState;
  lastEvent: string | null;
};

export const useRealtimeStream = (options: UseRealtimeStreamOptions = {}): UseRealtimeStreamResult => {
  const { viewerId, onNotificationCreated } = options;
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const onNotificationCreatedRef = useRef(onNotificationCreated);
  useEffect(() => {
    onNotificationCreatedRef.current = onNotificationCreated;
  });

  useEffect(() => {
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';
    const url = new URL(`${apiUrl}/realtime/stream`);
    if (viewerId) url.searchParams.set('viewerId', viewerId);

    const source = new EventSource(url.toString());

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

    source.addEventListener('notification.created', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data as string) as NotificationItem;
        if (!data || typeof data.id !== 'string' || !data.type || !data.actor) return;
        setLastEvent(new Date().toISOString());
        onNotificationCreatedRef.current?.(data);
      } catch {
        // ignore malformed events
      }
    });

    source.onerror = () => {
      setConnectionState('reconnecting');
    };

    return () => {
      source.close();
      setConnectionState('disconnected');
    };
  }, [viewerId]);

  return { connectionState, lastEvent };
};
