## 1. OpenSpec Validation

- [ ] 1.1 Create the OpenSpec change files
- [ ] 1.2 Run `openspec validate Phase-22-live-replies --strict`
- [ ] 1.3 Do not begin implementation until the change has been reviewed

## 2. Realtime Types and Hook

- [ ] 2.1 Add `reply.created` frontend realtime event type
- [ ] 2.2 Extend `useRealtimeStream` to accept optional `threadId`
- [ ] 2.3 Append `threadId` to the EventSource URL when provided
- [ ] 2.4 Preserve existing `viewerId` URL behavior
- [ ] 2.5 Add `onReplyCreated` callback support
- [ ] 2.6 Ignore malformed reply events without crashing the UI
- [ ] 2.7 Preserve connected, heartbeat, notification, system, error, and cleanup behavior

## 3. Thread UI Integration

- [ ] 3.1 Add a client replies list component for thread replies
- [ ] 3.2 Pass the root post id as `threadId` to `useRealtimeStream`
- [ ] 3.3 Append live replies to the rendered replies list
- [ ] 3.4 Deduplicate replies by id
- [ ] 3.5 Replace the no-replies empty state when the first live reply arrives
- [ ] 3.6 Reuse existing `PostCard` rendering for live replies
- [ ] 3.7 Preserve existing reply composer behavior

## 4. Tests

- [ ] 4.1 Test EventSource URL includes `threadId` when provided
- [ ] 4.2 Test `reply.created` invokes the reply callback for the subscribed thread
- [ ] 4.3 Test `reply.created` for another thread is ignored
- [ ] 4.4 Test malformed reply events do not throw
- [ ] 4.5 Test live replies append to the list
- [ ] 4.6 Test duplicate live reply ids are ignored
- [ ] 4.7 Mock EventSource; do not require a running backend

## 5. Verification

- [ ] 5.1 Run `bunx turbo typecheck --filter=@repo/main`
- [ ] 5.2 Run `bunx turbo lint --filter=@repo/main`
- [ ] 5.3 Run `bunx turbo test --filter=@repo/main`
- [ ] 5.4 Run `bunx turbo build --filter=@repo/main`
- [ ] 5.5 With frontend and backend running, verify a live `reply.created` event appears on the matching thread page
