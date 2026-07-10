## Why

The backend can publish live `notification.created` events over SSE, but the frontend realtime hook only handles lifecycle events and the notifications page only updates through initial load and pagination. The main app needs to consume live notification events so connected viewers can see new notifications without refreshing.

## What Changes

- Extend frontend realtime types to include `notification.created`.
- Connect the realtime stream with the current viewer id when available.
- Extend `useRealtimeStream` to accept live notification handlers.
- Add client-side notification list behavior that prepends live notifications.
- Preserve existing paginated notification loading.
- Handle malformed events and stream errors without crashing the UI.

## Impact

- Adds live updates to the notifications UI.
- Keeps persisted notification pagination as the source of truth.
- Does not add unread counts, browser push notifications, toast notifications, or sound.
- Does not change backend SSE contracts.
