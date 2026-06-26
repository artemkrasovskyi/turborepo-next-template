## Why

The backend now exposes a realtime SSE stream, but the main app does not connect to it. The frontend needs a small realtime foundation that can open an `EventSource`, track connection state, expose received event timing, and show a safe status UI without affecting the rest of the app.

## What Changes

- Add `NEXT_PUBLIC_API_URL=http://localhost:4000` to frontend environment configuration.
- Add shared frontend realtime event types for `connected`, `heartbeat`, and `system message` events.
- Add a `useRealtimeStream` hook that manages an `EventSource` connection.
- Add a `RealtimeStatus` component that displays connection state and last event time.
- Mount the status UI in the app layout or a development-only area.
- Handle EventSource errors by showing reconnecting state without crashing the UI.

## Impact

- Adds a browser-side connection from `apps/main` to the backend SSE stream.
- Establishes frontend realtime primitives for future domain-specific events.
- Does not add notifications, chat, feed updates, or other domain realtime behavior.
- Does not require backend API changes beyond the existing SSE contract.
