## Context

The backend realtime module exposes `GET /realtime/stream` as an SSE endpoint. It sends an initial `connected` event with `clientId` and `timestamp`, and sends heartbeat events while the connection stays open.

The main app should consume that stream in the browser with `EventSource`. This phase is intentionally infrastructure-oriented: it proves frontend connectivity, state handling, cleanup, and status display before feature-specific realtime events are introduced.

## Goals / Non-Goals

**Goals:**
- Add `NEXT_PUBLIC_API_URL=http://localhost:4000` for browser-side backend access
- Define frontend realtime event types for connected, heartbeat, and system message events
- Add `useRealtimeStream` with EventSource lifecycle management
- Track `connected`, `disconnected`, and `reconnecting` states
- Track `lastEvent` timestamp
- Clean up the EventSource on unmount
- Add `RealtimeStatus` UI for connection state and last event time
- Mount status UI in the app layout or a dev-only area
- Handle EventSource errors without crashing the app

**Non-Goals:**
- Add domain-specific realtime features such as notifications, chat, or feed updates
- Add WebSocket support
- Add client-to-server realtime messages
- Add authentication to the realtime stream
- Persist realtime state across page reloads
- Change the backend SSE event contract

## Decisions

### API URL configuration

Use `NEXT_PUBLIC_API_URL` because `EventSource` is created in the browser and needs a public backend origin. The local development value is:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The stream URL is `${NEXT_PUBLIC_API_URL}/realtime/stream`.

### Event types

Define frontend types for:
- `connected`: `{ type: 'connected'; clientId: string; timestamp: string }`
- `heartbeat`: `{ type: 'heartbeat'; timestamp: string }`
- `system message`: `{ type: 'system'; message: string; timestamp: string }`

The system message type is reserved for future non-domain operational messages and does not require backend emission in this phase.

### Hook behavior

`useRealtimeStream` should be a client hook that:
- creates one `EventSource` for `/realtime/stream`
- listens for `connected`, `heartbeat`, and `system` events
- stores connection state as `connected`, `disconnected`, or `reconnecting`
- updates `lastEvent` whenever a known event is received
- closes the `EventSource` on unmount
- handles `onerror` by setting `reconnecting` without throwing

Native EventSource retry behavior may handle reconnection; the hook should reflect that state rather than implementing a second manual retry loop.

### Status UI

`RealtimeStatus` should be a small client component that uses the hook and displays:
- current connection status
- last received event time, when present

Mount it in the app layout or an app-level development-only area. If dev-only, gate it with `process.env.NODE_ENV !== 'production'` so it does not appear in production UI.

### Error handling

EventSource errors must not crash the UI. The hook should keep the current page usable, set `reconnecting`, and allow native EventSource behavior to reconnect.

## Risks / Trade-offs

- `NEXT_PUBLIC_API_URL` is visible to the browser by design; it must only contain a public API origin.
- EventSource reconnection behavior is browser-managed, so status updates may lag until the browser opens or errors the stream again.
- A visible status widget can clutter production UI, so a dev-only mount is preferred unless the product wants users to see realtime status.
