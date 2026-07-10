## Context

The app already stores follow and like notifications in Prisma and exposes notification list behavior through existing package clients. Backend Phase 2 added SSE infrastructure with `GET /realtime/stream`, connected events, heartbeat events, and connection cleanup.

Live notifications should build on that SSE foundation. This phase adds recipient-aware realtime delivery, but keeps delivery intentionally simple: in-memory, per API process, and best-effort. Durable notification history remains the Prisma `Notification` table.

## Goals / Non-Goals

**Goals:**
- Associate SSE connections with a viewer id when available
- Publish newly-created notifications to active recipient connections
- Send live notification events using SSE
- Use the existing `NotificationItem` payload shape
- Persist notifications before attempting live delivery
- Add backend tests for targeted delivery and non-delivery cases

**Non-Goals:**
- Add frontend live notification UI
- Add unread counts or read/unread state
- Add WebSockets
- Add Redis, queues, pub/sub, or multi-instance fanout
- Add Prisma schema, migration, or seed changes
- Guarantee delivery to disconnected clients
- Replace the existing paginated notification list

## Decisions

### Stream recipient association

Extend `GET /realtime/stream` to accept an optional `viewerId` query parameter. When present, the realtime service associates that connection's `clientId` with the viewer id. When absent, the connection still receives `connected` and `heartbeat` events but does not receive user-targeted notification events.

This mirrors the current project pattern of passing viewer ids before backend session-derived identity is specified. It is not an authorization boundary.

### Live event contract

Use a named SSE event:

- event: `notification.created`
- payload: `NotificationItem`

`NotificationItem` comes from `@repo/types/features/notifications` and includes:
- `id`
- `type`
- `actor`
- `createdAt`
- `post`

The payload must not expose private user fields such as email, sessions, accounts, or verification data.

### Notification publishing

Add backend notification service behavior that creates notification records and maps them to `NotificationItem`. After the notification is persisted, the service publishes `notification.created` to active connections for `recipientId`.

If no active recipient connections exist, the persisted notification remains available through the existing notification list. Live delivery failure must not roll back the stored notification.

### Realtime service extension

Extend `RealtimeService` with recipient-aware connection tracking and a targeted publish method, such as `publishToUser(userId, event, payload)`.

Connection cleanup must remove the client from both the main connection registry and any viewer-to-client index. Heartbeat behavior remains unchanged.

### Notification sources

Support the existing notification types:
- `FOLLOW`
- `LIKE`

Do not introduce new notification types in this phase.

## Risks / Trade-offs

- Viewer id query association is convenient but not secure. It must be replaced with session-derived identity in a later auth-backed realtime phase.
- In-memory delivery only reaches clients connected to the same API process.
- Live delivery is best-effort; persisted notifications are still the source of truth.
