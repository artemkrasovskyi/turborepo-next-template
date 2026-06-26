'use client';

/**
 * @openspec openspec/specs/frontend-realtime/spec.md
 * @change Phase-20-realtime-ui
 */
import type { FC } from 'react';
import { useRealtimeStream } from '../hooks/use-realtime-stream';

export const RealtimeStatus: FC = () => {
  const { connectionState, lastEvent } = useRealtimeStream();

  return (
    <div className="fixed bottom-4 right-4 rounded bg-black/70 px-3 py-1.5 text-xs text-white">
      <span>Realtime: {connectionState}</span>
      {lastEvent !== null && (
        <span className="ml-2">Last event: {new Date(lastEvent).toLocaleTimeString()}</span>
      )}
    </div>
  );
};
