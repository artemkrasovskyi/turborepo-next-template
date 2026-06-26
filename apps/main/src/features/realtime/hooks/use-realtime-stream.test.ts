import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRealtimeStream } from './use-realtime-stream';

let capturedSource: MockEventSource | null = null;

class MockEventSource {
  url: string;

  private listeners: Record<string, Array<(event: MessageEvent) => void>> = {};

  onerror: ((event: Event) => void) | null = null;

  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    capturedSource = this;
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type]!.push(listener);
  }

  emit(type: string, data: unknown) {
    const handlers = this.listeners[type] ?? [];
    const event = { data: JSON.stringify(data) } as MessageEvent;
    handlers.forEach((handler) => handler(event));
  }
}

describe('useRealtimeStream', () => {
  beforeEach(() => {
    capturedSource = null;
    vi.stubGlobal('EventSource', MockEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe('EventSource URL configuration', () => {
    it('creates EventSource with NEXT_PUBLIC_API_URL when set', () => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://test-api.example.com');
      renderHook(() => useRealtimeStream());
      expect(capturedSource?.url).toBe('http://test-api.example.com/realtime/stream');
    });

    it('falls back to localhost:4000 when NEXT_PUBLIC_API_URL is not set', () => {
      renderHook(() => useRealtimeStream());
      expect(capturedSource?.url).toBe('http://localhost:4000/realtime/stream');
    });
  });

  describe('connection state', () => {
    it('starts in disconnected state', () => {
      const { result } = renderHook(() => useRealtimeStream());
      expect(result.current.connectionState).toBe('disconnected');
    });

    it('sets connected state and updates lastEvent on connected event', async () => {
      const { result } = renderHook(() => useRealtimeStream());
      await act(async () => {
        capturedSource?.emit('connected', {
          clientId: 'abc-123',
          timestamp: '2026-01-01T00:00:00.000Z',
        });
      });
      expect(result.current.connectionState).toBe('connected');
      expect(result.current.lastEvent).toBe('2026-01-01T00:00:00.000Z');
    });

    it('sets reconnecting state on EventSource error', async () => {
      const { result } = renderHook(() => useRealtimeStream());
      await act(async () => {
        capturedSource?.onerror?.(new Event('error'));
      });
      expect(result.current.connectionState).toBe('reconnecting');
    });
  });

  describe('lastEvent updates', () => {
    it('starts with null lastEvent', () => {
      const { result } = renderHook(() => useRealtimeStream());
      expect(result.current.lastEvent).toBeNull();
    });

    it('updates lastEvent on heartbeat event without changing connectionState', async () => {
      const { result } = renderHook(() => useRealtimeStream());
      await act(async () => {
        capturedSource?.emit('connected', {
          clientId: 'abc',
          timestamp: '2026-01-01T00:00:00.000Z',
        });
      });
      await act(async () => {
        capturedSource?.emit('heartbeat', { timestamp: '2026-01-01T00:00:30.000Z' });
      });
      expect(result.current.lastEvent).toBe('2026-01-01T00:00:30.000Z');
      expect(result.current.connectionState).toBe('connected');
    });

    it('updates lastEvent on system event', async () => {
      const { result } = renderHook(() => useRealtimeStream());
      await act(async () => {
        capturedSource?.emit('system', {
          message: 'maintenance soon',
          timestamp: '2026-01-01T00:01:00.000Z',
        });
      });
      expect(result.current.lastEvent).toBe('2026-01-01T00:01:00.000Z');
    });
  });

  describe('cleanup on unmount', () => {
    it('closes EventSource on unmount', () => {
      const { unmount } = renderHook(() => useRealtimeStream());
      unmount();
      expect(capturedSource?.close).toHaveBeenCalledTimes(1);
    });

    it('sets disconnected state on unmount', async () => {
      const { unmount } = renderHook(() => useRealtimeStream());
      await act(async () => {
        capturedSource?.emit('connected', {
          clientId: 'abc',
          timestamp: '2026-01-01T00:00:00.000Z',
        });
      });
      act(() => {
        unmount();
      });
      expect(capturedSource?.close).toHaveBeenCalledTimes(1);
    });
  });
});
