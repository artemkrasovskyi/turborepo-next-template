import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationItem as NotificationItemData } from '@repo/types/features/notifications';
import type { UseRealtimeStreamOptions } from '@/features/realtime/hooks/use-realtime-stream';
import { loadMoreNotificationsAction } from '../actions';
import { NotificationLiveList } from './notification-live-list';

let capturedOptions: UseRealtimeStreamOptions = {};
let triggerNotification: ((notification: NotificationItemData) => void) | undefined;

vi.mock('@/features/realtime/hooks/use-realtime-stream', () => ({
  useRealtimeStream: (options: UseRealtimeStreamOptions = {}) => {
    capturedOptions = options;
    triggerNotification = options.onNotificationCreated;
    return { connectionState: 'connected', lastEvent: null };
  },
}));

vi.mock('../actions', () => ({
  loadMoreNotificationsAction: vi.fn(),
}));

const makeNotification = (id: string, type: 'FOLLOW' | 'LIKE' = 'FOLLOW'): NotificationItemData => ({
  id,
  type,
  actor: { id: 'actor-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
  createdAt: '2026-01-01T00:00:00.000Z',
  post: type === 'LIKE' ? { id: 'post-1', body: 'Hello world' } : null,
});

afterEach(cleanup);

describe('NotificationLiveList', () => {
  beforeEach(() => {
    capturedOptions = {};
    triggerNotification = undefined;
  });

  describe('realtime hook integration', () => {
    it('passes viewerId to useRealtimeStream', () => {
      render(
        <NotificationLiveList initialItems={[]} initialCursor={null} viewerId="viewer-99" />,
      );
      expect(capturedOptions.viewerId).toBe('viewer-99');
    });
  });

  describe('empty state', () => {
    it('shows empty state when no initial or live notifications exist', () => {
      render(<NotificationLiveList initialItems={[]} initialCursor={null} viewerId="viewer-1" />);
      expect(screen.getByText('No notifications yet')).toBeDefined();
    });

    it('hides empty state once a live notification arrives', async () => {
      render(<NotificationLiveList initialItems={[]} initialCursor={null} viewerId="viewer-1" />);
      expect(screen.getByText('No notifications yet')).toBeDefined();
      await act(async () => {
        triggerNotification?.(makeNotification('notif-live-1'));
      });
      expect(screen.queryByText('No notifications yet')).toBeNull();
    });
  });

  describe('initial items', () => {
    it('renders initial items from server', () => {
      const items = [makeNotification('notif-1'), makeNotification('notif-2')];
      render(<NotificationLiveList initialItems={items} initialCursor={null} viewerId="viewer-1" />);
      expect(screen.getAllByRole('link')).toHaveLength(2);
    });
  });

  describe('live notification prepend', () => {
    it('prepends live notifications before initial items', async () => {
      const initialItems = [makeNotification('notif-initial')];
      render(
        <NotificationLiveList initialItems={initialItems} initialCursor={null} viewerId="viewer-1" />,
      );
      await act(async () => {
        triggerNotification?.(makeNotification('notif-live'));
      });
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      expect(links[0]?.getAttribute('href')).toContain('alice');
      expect(links[1]?.getAttribute('href')).toContain('alice');
    });

    it('multiple live notifications appear in reverse arrival order', async () => {
      render(<NotificationLiveList initialItems={[]} initialCursor={null} viewerId="viewer-1" />);
      await act(async () => {
        triggerNotification?.(makeNotification('notif-first'));
      });
      await act(async () => {
        triggerNotification?.(makeNotification('notif-second'));
      });
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
    });
  });

  describe('deduplication', () => {
    it('ignores duplicate live notifications with the same id', async () => {
      render(<NotificationLiveList initialItems={[]} initialCursor={null} viewerId="viewer-1" />);
      await act(async () => {
        triggerNotification?.(makeNotification('notif-dup'));
      });
      await act(async () => {
        triggerNotification?.(makeNotification('notif-dup'));
      });
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });
  });

  describe('load-more pagination', () => {
    it('renders the load-more button when initialCursor is set', () => {
      vi.mocked(loadMoreNotificationsAction).mockResolvedValue({
        items: [makeNotification('notif-older')],
        nextCursor: null,
      });

      render(
        <NotificationLiveList
          initialItems={[makeNotification('notif-1')]}
          initialCursor="cursor-abc"
          viewerId="viewer-1"
        />,
      );
      expect(screen.getByRole('button', { name: /load more/i })).toBeDefined();
    });

    it('appends older items after load-more is clicked', async () => {
      vi.mocked(loadMoreNotificationsAction).mockResolvedValue({
        items: [makeNotification('notif-older')],
        nextCursor: null,
      });

      render(
        <NotificationLiveList
          initialItems={[makeNotification('notif-1')]}
          initialCursor="cursor-abc"
          viewerId="viewer-1"
        />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /load more/i }));
      });
      expect(screen.getAllByRole('link')).toHaveLength(2);
    });
  });
});
