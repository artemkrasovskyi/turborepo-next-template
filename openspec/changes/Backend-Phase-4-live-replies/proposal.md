## Why

Thread pages currently show replies from persisted data and refresh after local reply creation, but viewers already on a thread do not receive replies created elsewhere in realtime. The backend realtime infrastructure can deliver targeted SSE events, so the next backend phase should add live reply events for active thread viewers.

## What Changes

- Associate realtime SSE connections with an optional thread id.
- Publish `reply.created` SSE events to active connections subscribed to the replied-to thread.
- Use the existing `ThreadPost` shape for live reply payloads.
- Persist replies before attempting live delivery.
- Keep delivery in-memory and best-effort for this phase.

## Impact

- Extends realtime delivery from user-targeted notifications to thread-targeted reply events.
- Does not add WebSockets, Redis, queues, cross-process fanout, or frontend UI behavior.
- Does not change Prisma schema, migrations, or seed data.
- Keeps persisted thread data as the source of truth.
