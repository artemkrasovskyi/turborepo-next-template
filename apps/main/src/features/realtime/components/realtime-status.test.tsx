import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRealtimeStream } from '../hooks/use-realtime-stream';
import { RealtimeStatus } from './realtime-status';

vi.mock('../hooks/use-realtime-stream', () => ({
  useRealtimeStream: vi.fn(),
}));

afterEach(cleanup);

describe('RealtimeStatus', () => {
  it('renders the current connection status', () => {
    vi.mocked(useRealtimeStream).mockReturnValue({
      connectionState: 'connected',
      lastEvent: null,
    });
    render(<RealtimeStatus />);
    expect(screen.getByText(/Realtime: connected/)).toBeDefined();
  });

  it('renders disconnected status', () => {
    vi.mocked(useRealtimeStream).mockReturnValue({
      connectionState: 'disconnected',
      lastEvent: null,
    });
    render(<RealtimeStatus />);
    expect(screen.getByText(/Realtime: disconnected/)).toBeDefined();
  });

  it('renders reconnecting status', () => {
    vi.mocked(useRealtimeStream).mockReturnValue({
      connectionState: 'reconnecting',
      lastEvent: null,
    });
    render(<RealtimeStatus />);
    expect(screen.getByText(/Realtime: reconnecting/)).toBeDefined();
  });

  it('renders last event time when lastEvent is set', () => {
    vi.mocked(useRealtimeStream).mockReturnValue({
      connectionState: 'connected',
      lastEvent: '2026-01-01T00:00:00.000Z',
    });
    render(<RealtimeStatus />);
    expect(screen.getByText(/Last event:/)).toBeDefined();
  });

  it('does not render last event time when lastEvent is null', () => {
    vi.mocked(useRealtimeStream).mockReturnValue({
      connectionState: 'disconnected',
      lastEvent: null,
    });
    render(<RealtimeStatus />);
    expect(screen.queryByText(/Last event:/)).toBeNull();
  });
});
