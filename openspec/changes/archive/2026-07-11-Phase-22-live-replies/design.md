## Context

Thread pages currently render a server-loaded root post and replies. Local reply submission refreshes the thread path after persistence. Backend live replies add `reply.created` events targeted by `threadId`.

The frontend phase should enhance the thread page with live events while preserving the current server-rendered thread and reply composer behavior.

## Goals / Non-Goals

**Goals:**
- Parse `reply.created` SSE events in the main app
- Include the current thread id when opening the realtime stream from a thread page
- Append live replies to the visible replies list
- Deduplicate live replies by id
- Preserve existing reply composition and pagination-free thread rendering
- Keep malformed realtime events from crashing the UI

**Non-Goals:**
- Add optimistic replies
- Add nested replies
- Add typing indicators
- Add unread reply counters
- Add toast notifications for replies
- Change backend reply event contract
- Replace persisted thread loading

## Decisions

### Realtime stream subscription

Extend `useRealtimeStream` to accept an optional `threadId`. When present, the hook appends `threadId` to the `/realtime/stream` URL. The hook may include both `viewerId` and `threadId` when both are available.

### Event type

Add a frontend event type:

```ts
type ReplyCreatedEvent = {
  type: 'reply.created';
  threadId: string;
  reply: ThreadPost;
  timestamp: string;
};
```

`ThreadPost` comes from `@repo/types/features/posts`.

### Hook API

Extend `useRealtimeStream` with an optional `onReplyCreated` callback. The hook should parse `reply.created`, verify the event belongs to the subscribed thread before invoking the callback, update `lastEvent`, and ignore malformed payloads without throwing.

### Thread UI

Add a client thread replies component that receives server-loaded replies and renders the existing `PostCard` for each reply. It uses `useRealtimeStream` with the current root post id and appends live replies to the list.

Deduplicate by reply id so local revalidation and live delivery do not render the same reply twice.

### Empty state

If a thread initially has no replies, the existing no-replies state should be replaced when the first live reply arrives.

## Risks / Trade-offs

- Users can miss live events while disconnected; persisted thread loading remains the recovery path.
- Local reply submission and live reply delivery can both surface the same reply, so deduplication is required.
- Thread subscriptions are public routing context, not authorization.
