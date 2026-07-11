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

    it('appends viewerId query param when provided', () => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://test-api.example.com');
      renderHook(() => useRealtimeStream({ viewerId: 'user-42' }));
      expect(capturedSource?.url).toBe('http://test-api.example.com/realtime/stream?viewerId=user-42');
    });

    it('does not append viewerId when not provided', () => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://test-api.example.com');
      renderHook(() => useRealtimeStream());
      expect(capturedSource?.url).toBe('http://test-api.example.com/realtime/stream');
    });

    it('appends threadId query param when provided', () => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://test-api.example.com');
      renderHook(() => useRealtimeStream({ threadId: 'thread-1' }));
      expect(capturedSource?.url).toBe('http://test-api.example.com/realtime/stream?threadId=thread-1');
    });

    it('does not append threadId when not provided', () => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://test-api.example.com');
      renderHook(() => useRealtimeStream());
      expect(capturedSource?.url).toBe('http://test-api.example.com/realtime/stream');
    });

    it('appends both viewerId and threadId when both are provided', () => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://test-api.example.com');
      renderHook(() => useRealtimeStream({ viewerId: 'user-42', threadId: 'thread-1' }));
      expect(capturedSource?.url).toBe(
        'http://test-api.example.com/realtime/stream?viewerId=user-42&threadId=thread-1',
      );
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

  describe('notification.created events', () => {
    it('invokes onNotificationCreated callback with parsed NotificationItem', async () => {
      const onNotificationCreated = vi.fn();
      renderHook(() => useRealtimeStream({ onNotificationCreated }));
      const notification = {
        id: 'notif-1',
        type: 'FOLLOW',
        actor: { id: 'actor-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
        createdAt: '2026-01-01T00:00:00.000Z',
        post: null,
      };
      await act(async () => {
        capturedSource?.emit('notification.created', notification);
      });
      expect(onNotificationCreated).toHaveBeenCalledWith(notification);
    });

    it('updates lastEvent when notification.created is received', async () => {
      const { result } = renderHook(() => useRealtimeStream({ viewerId: 'user-1' }));
      await act(async () => {
        capturedSource?.emit('notification.created', {
          id: 'notif-1',
          type: 'FOLLOW',
          actor: { id: 'actor-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
          createdAt: '2026-01-01T00:00:00.000Z',
          post: null,
        });
      });
      expect(result.current.lastEvent).not.toBeNull();
    });

    it('does not throw when notification.created payload is malformed JSON', async () => {
      const onNotificationCreated = vi.fn();
      renderHook(() => useRealtimeStream({ onNotificationCreated }));
      await act(async () => {
        const handlers = (capturedSource as unknown as {
          listeners: Record<string, Array<(event: MessageEvent) => void>>;
        }).listeners['notification.created'] ?? [];
        const badEvent = { data: 'not-json{{' } as MessageEvent;
        expect(() => handlers.forEach((handler) => handler(badEvent))).not.toThrow();
      });
      expect(onNotificationCreated).not.toHaveBeenCalled();
    });

    it('does not invoke callback when notification payload is missing required fields', async () => {
      const onNotificationCreated = vi.fn();
      renderHook(() => useRealtimeStream({ onNotificationCreated }));
      await act(async () => {
        capturedSource?.emit('notification.created', { someUnknownField: true });
      });
      expect(onNotificationCreated).not.toHaveBeenCalled();
    });
  });

  describe('reply.created events', () => {
    const makeReply = () => ({
      id: 'reply-1',
      body: 'Hello',
      createdAt: '2026-01-01T00:00:00.000Z',
      author: { id: 'author-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
      likeCount: 0,
      isLikedByViewer: false,
      isBookmarkedByViewer: false,
      images: [],
    });

    it('invokes onReplyCreated callback with parsed reply for the subscribed thread', async () => {
      const onReplyCreated = vi.fn();
      renderHook(() => useRealtimeStream({ threadId: 'thread-1', onReplyCreated }));
      const reply = makeReply();
      await act(async () => {
        capturedSource?.emit('reply.created', {
          threadId: 'thread-1',
          reply,
          timestamp: '2026-01-01T00:00:00.000Z',
        });
      });
      expect(onReplyCreated).toHaveBeenCalledWith(reply);
    });

    it('does not invoke callback for a reply.created event from another thread', async () => {
      const onReplyCreated = vi.fn();
      renderHook(() => useRealtimeStream({ threadId: 'thread-1', onReplyCreated }));
      await act(async () => {
        capturedSource?.emit('reply.created', {
          threadId: 'thread-2',
          reply: makeReply(),
          timestamp: '2026-01-01T00:00:00.000Z',
        });
      });
      expect(onReplyCreated).not.toHaveBeenCalled();
    });

    it('updates lastEvent when a matching reply.created is received', async () => {
      const { result } = renderHook(() => useRealtimeStream({ threadId: 'thread-1' }));
      await act(async () => {
        capturedSource?.emit('reply.created', {
          threadId: 'thread-1',
          reply: makeReply(),
          timestamp: '2026-01-01T00:00:00.000Z',
        });
      });
      expect(result.current.lastEvent).not.toBeNull();
    });

    it('does not throw when reply.created payload is malformed JSON', async () => {
      const onReplyCreated = vi.fn();
      renderHook(() => useRealtimeStream({ threadId: 'thread-1', onReplyCreated }));
      await act(async () => {
        const handlers = (capturedSource as unknown as {
          listeners: Record<string, Array<(event: MessageEvent) => void>>;
        }).listeners['reply.created'] ?? [];
        const badEvent = { data: 'not-json{{' } as MessageEvent;
        expect(() => handlers.forEach((handler) => handler(badEvent))).not.toThrow();
      });
      expect(onReplyCreated).not.toHaveBeenCalled();
    });

    it('does not invoke callback when reply payload is missing required fields', async () => {
      const onReplyCreated = vi.fn();
      renderHook(() => useRealtimeStream({ threadId: 'thread-1', onReplyCreated }));
      await act(async () => {
        capturedSource?.emit('reply.created', { threadId: 'thread-1' });
      });
      expect(onReplyCreated).not.toHaveBeenCalled();
    });
  });
});
