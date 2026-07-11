## 1. OpenSpec Validation

- [x] 1.1 Create the OpenSpec change files
- [x] 1.2 Run `openspec validate Phase-22-live-replies --strict`
- [x] 1.3 Do not begin implementation until the change has been reviewed

## 2. Realtime Types and Hook

- [x] 2.1 Add `reply.created` frontend realtime event type
- [x] 2.2 Extend `useRealtimeStream` to accept optional `threadId`
- [x] 2.3 Append `threadId` to the EventSource URL when provided
- [x] 2.4 Preserve existing `viewerId` URL behavior
- [x] 2.5 Add `onReplyCreated` callback support
- [x] 2.6 Ignore malformed reply events without crashing the UI
- [x] 2.7 Preserve connected, heartbeat, notification, system, error, and cleanup behavior

## 3. Thread UI Integration

- [x] 3.1 Add a client replies list component for thread replies
- [x] 3.2 Pass the root post id as `threadId` to `useRealtimeStream`
- [x] 3.3 Append live replies to the rendered replies list
- [x] 3.4 Deduplicate replies by id
- [x] 3.5 Replace the no-replies empty state when the first live reply arrives
- [x] 3.6 Reuse existing `PostCard` rendering for live replies
- [x] 3.7 Preserve existing reply composer behavior

## 4. Tests

- [x] 4.1 Test EventSource URL includes `threadId` when provided
- [x] 4.2 Test `reply.created` invokes the reply callback for the subscribed thread
- [x] 4.3 Test `reply.created` for another thread is ignored
- [x] 4.4 Test malformed reply events do not throw
- [x] 4.5 Test live replies append to the list
- [x] 4.6 Test duplicate live reply ids are ignored
- [x] 4.7 Mock EventSource; do not require a running backend

## 5. Verification

- [x] 5.1 Run `bunx turbo typecheck --filter=@repo/main`
- [x] 5.2 Run `bunx turbo lint --filter=@repo/main`
- [x] 5.3 Run `bunx turbo test --filter=@repo/main`
- [x] 5.4 Run `bunx turbo build --filter=@repo/main`
- [x] 5.5 With frontend and backend running, verify a live `reply.created` event appears on the matching thread page
