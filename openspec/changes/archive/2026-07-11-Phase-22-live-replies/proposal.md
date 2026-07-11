## Why

The backend live replies phase will publish `reply.created` events for active thread viewers, but the main app does not yet subscribe thread pages to realtime reply updates. The frontend should consume those events so viewers on a thread can see new replies without refreshing.

## What Changes

- Extend frontend realtime types to include `reply.created`.
- Allow the realtime hook to subscribe with a `threadId`.
- Add live reply handling to the post thread page.
- Append live replies to the visible replies list.
- Deduplicate replies by id.
- Preserve existing reply composer, server refresh, and persisted thread loading behavior.

## Impact

- Adds live reply updates to thread pages.
- Keeps persisted thread loading as the source of truth.
- Does not add optimistic replies, nested replies, typing indicators, or unread reply counts.
- Does not change backend SSE contracts.
