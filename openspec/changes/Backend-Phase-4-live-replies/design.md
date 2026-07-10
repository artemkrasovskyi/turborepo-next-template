## Context

The app already models replies as `Post` records with `parentId` set to a root post id. Thread pages render the root post and its replies ordered by `createdAt asc`.

The backend realtime module supports SSE connections and live notification delivery. Live replies should use the same SSE foundation but target connections by thread id rather than viewer id. This keeps reply delivery scoped to viewers currently watching a thread.

## Goals / Non-Goals

**Goals:**
- Associate SSE connections with a thread id when provided
- Publish newly-created replies to active connections for that thread
- Send a named `reply.created` SSE event
- Use the existing `ThreadPost` payload shape for the reply
- Persist the reply before live delivery
- Avoid private user fields in live reply payloads
- Add backend tests for targeted delivery and cleanup

**Non-Goals:**
- Add frontend consumption of live replies
- Add WebSockets
- Add Redis, pub/sub, queues, or multi-instance fanout
- Add nested replies
- Add optimistic replies
- Add Prisma schema, migration, or seed changes
- Guarantee delivery to disconnected clients

## Decisions

### Thread subscription

Extend `GET /realtime/stream` to accept an optional `threadId` query parameter. When present, the realtime service associates that connection's `clientId` with the thread id. A connection may still include `viewerId`; viewer association remains for notification targeting and thread association is used for reply targeting.

When `threadId` is absent, the connection continues to receive lifecycle and heartbeat events but does not receive thread-targeted reply events.

### Event contract

Use a named SSE event:

- event: `reply.created`
- payload: `{ threadId: string; reply: ThreadPost; timestamp: string }`

`ThreadPost` comes from `@repo/types/features/posts`. The payload must include public author data, reply body, images, like/bookmark state fields, and created time. It must not expose private user fields.

### Reply publishing

When a reply is created for a root post, the backend maps it to `ThreadPost` and publishes `reply.created` to all active connections subscribed to that root post id.

The reply must be persisted before publishing. If no active thread connections exist, the persisted reply remains available through normal thread loading. Live delivery failure must not roll back the stored reply.

### Realtime service extension

Extend `RealtimeService` with thread-aware connection tracking and a targeted publish method, such as `publishToThread(threadId, event, payload)`.

Connection cleanup must remove the client from the main connection registry, viewer association, and thread association. Heartbeat behavior remains unchanged.

### Existing reply creation

This phase specifies backend live delivery behavior. Existing frontend server actions may continue using current reply creation paths until a frontend integration phase switches to consuming the live event. The backend publisher should be available to the reply creation path that owns persistence.

## Risks / Trade-offs

- In-memory thread subscriptions only reach clients connected to the same API process.
- Thread id query association is not an authorization boundary; it only scopes public thread updates.
- Duplicate rendering can happen on the frontend if local reply refresh and live event handling are not deduplicated in the frontend phase.
