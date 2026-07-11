import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ThreadPost } from '@repo/types/features/posts';
import type { UseRealtimeStreamOptions } from '@/features/realtime/hooks/use-realtime-stream';
import { ThreadRepliesList } from './thread-replies-list';

let capturedOptions: UseRealtimeStreamOptions = {};
let triggerReply: ((reply: ThreadPost) => void) | undefined;

vi.mock('@/features/realtime/hooks/use-realtime-stream', () => ({
  useRealtimeStream: (options: UseRealtimeStreamOptions = {}) => {
    capturedOptions = options;
    triggerReply = options.onReplyCreated;
    return { connectionState: 'connected', lastEvent: null };
  },
}));

const makeReply = (id: string, body = 'Hello'): ThreadPost => ({
  id,
  body,
  createdAt: '2026-01-01T00:00:00.000Z',
  author: { id: 'author-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
  likeCount: 0,
  isLikedByViewer: false,
  isBookmarkedByViewer: false,
  images: [],
});

afterEach(cleanup);

describe('ThreadRepliesList', () => {
  beforeEach(() => {
    capturedOptions = {};
    triggerReply = undefined;
  });

  describe('realtime hook integration', () => {
    it('passes threadId to useRealtimeStream', () => {
      render(<ThreadRepliesList threadId="thread-99" initialReplies={[]} viewerId="viewer-1" />);
      expect(capturedOptions.threadId).toBe('thread-99');
    });
  });

  describe('empty state', () => {
    it('shows empty state when no initial or live replies exist', () => {
      render(<ThreadRepliesList threadId="thread-1" initialReplies={[]} viewerId="viewer-1" />);
      expect(screen.getByText('No replies yet')).toBeDefined();
    });

    it('hides empty state once a live reply arrives', async () => {
      render(<ThreadRepliesList threadId="thread-1" initialReplies={[]} viewerId="viewer-1" />);
      expect(screen.getByText('No replies yet')).toBeDefined();
      await act(async () => {
        triggerReply?.(makeReply('reply-live-1'));
      });
      expect(screen.queryByText('No replies yet')).toBeNull();
    });
  });

  describe('initial replies', () => {
    it('renders initial replies from server', () => {
      const replies = [makeReply('reply-1', 'First'), makeReply('reply-2', 'Second')];
      render(<ThreadRepliesList threadId="thread-1" initialReplies={replies} viewerId="viewer-1" />);
      expect(screen.getByText('First')).toBeDefined();
      expect(screen.getByText('Second')).toBeDefined();
    });
  });

  describe('live reply append', () => {
    it('appends live replies after initial replies', async () => {
      const initialReplies = [makeReply('reply-initial', 'Initial')];
      render(
        <ThreadRepliesList threadId="thread-1" initialReplies={initialReplies} viewerId="viewer-1" />,
      );
      await act(async () => {
        triggerReply?.(makeReply('reply-live', 'Live'));
      });
      expect(screen.getByText('Initial')).toBeDefined();
      expect(screen.getByText('Live')).toBeDefined();
    });
  });

  describe('deduplication', () => {
    it('ignores a live reply with the same id as an initial reply', async () => {
      const initialReplies = [makeReply('reply-dup', 'Original')];
      render(
        <ThreadRepliesList threadId="thread-1" initialReplies={initialReplies} viewerId="viewer-1" />,
      );
      await act(async () => {
        triggerReply?.(makeReply('reply-dup', 'Original'));
      });
      expect(screen.getAllByText('Original')).toHaveLength(1);
    });

    it('ignores duplicate live replies with the same id', async () => {
      render(<ThreadRepliesList threadId="thread-1" initialReplies={[]} viewerId="viewer-1" />);
      await act(async () => {
        triggerReply?.(makeReply('reply-dup', 'Text'));
      });
      await act(async () => {
        triggerReply?.(makeReply('reply-dup', 'Text'));
      });
      expect(screen.getAllByText('Text')).toHaveLength(1);
    });
  });
});
