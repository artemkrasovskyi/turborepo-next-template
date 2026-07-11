## Context

The frontend realtime foundation opens an `EventSource` to `/realtime/stream`, tracks lifecycle state, and displays a dev status widget. Backend live notifications add `notification.created` events targeted to streams associated with a viewer id.

The notifications page currently renders the initial page on the server and uses a client load-more component for pagination. Live notifications should enhance that experience without replacing persisted notification history.

## Goals / Non-Goals

**Goals:**
- Parse `notification.created` SSE events in the main app
- Include the current viewer id when opening the realtime stream
- Prepend live notifications to the notifications UI
- Preserve existing notification list pagination
- Deduplicate live notifications by notification id
- Keep malformed or failed realtime events from crashing the UI
- Add focused tests for hook and notification-list behavior

**Non-Goals:**
- Add unread count badges
- Add toast notifications
- Add browser push notifications
- Add sound, desktop notifications, or notification permissions
- Add optimistic notification creation
- Change backend notification creation rules
- Replace the persisted notifications list

## Decisions

### Realtime stream identity

Update the frontend realtime hook to accept an optional `viewerId`. When present, the hook appends `viewerId` to the `/realtime/stream` URL so the backend can target notification events to the viewer's connection.

When no viewer id is available, the hook may still connect for lifecycle/status events but it must not expect user-targeted notifications.

### Event type

Add a frontend event type for:

```ts
type NotificationCreatedEvent = {
  type: 'notification.created';
  notification: NotificationItem;
  timestamp: string;
};
```

If the backend sends the `NotificationItem` as the top-level payload instead of a nested `notification` field, normalize it at the hook boundary. The rest of the UI should consume `NotificationItem`.

### Hook API

Extend `useRealtimeStream` to support an optional `onNotificationCreated` callback. The hook should:
- register an event listener for `notification.created`
- parse and validate enough payload shape to avoid obvious crashes
- call the callback with a `NotificationItem`
- update `lastEvent`
- ignore malformed notification payloads without throwing

### Notifications UI

Add a client component for live notification list behavior. It should receive the server-rendered initial items and `initialCursor`, render the existing `NotificationItem` component, prepend new live notifications, and keep the existing load-more behavior.

Deduplicate by notification id so reconnects or duplicate events do not render the same notification twice.

### Error handling

Realtime errors should continue to show reconnecting state through the existing hook. Notification event parsing errors should be contained to the hook/list and should not unmount the page.

## Risks / Trade-offs

- Passing `viewerId` in the stream URL is a temporary compatibility approach until backend realtime auth is session-derived.
- Live notifications are best-effort; missed events are recovered by refreshing or revisiting the persisted notifications list.
- Prepending live items can slightly reorder the visible list relative to server pagination, but notifications are already reverse-chronological.
