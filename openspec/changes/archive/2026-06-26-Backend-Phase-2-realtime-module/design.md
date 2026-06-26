## Context

The Nest API app currently exposes health and search endpoints. Phase 2 adds a minimal realtime foundation using server-sent events. SSE is appropriate for one-way server-to-client updates, works over plain HTTP, and avoids introducing WebSocket infrastructure before the product has bidirectional realtime requirements.

This phase should focus on connection lifecycle correctness and a stable stream contract, not on domain events such as notifications or direct messages.

## Goals / Non-Goals

**Goals:**
- Add `RealtimeModule`, `RealtimeController`, and `RealtimeService`
- Expose `GET /realtime/stream`
- Return `text/event-stream`
- Assign one `clientId` per connection
- Register connections and remove them on close
- Send an initial `connected` event
- Send heartbeat events every 15-30 seconds
- Clear heartbeat intervals and connection state on disconnect
- Allow the `apps/main` origin through CORS
- Log connection opened, connection closed, and heartbeat errors

**Non-Goals:**
- Add WebSockets
- Add bidirectional realtime messaging
- Add notification, feed, direct-message, or search realtime events
- Persist connections in Prisma
- Add Redis, pub/sub, queues, or cross-process fanout
- Add frontend EventSource integration

## Decisions

### SSE endpoint

Use `GET /realtime/stream` as the initial realtime endpoint. The response must set SSE-compatible headers, including `Content-Type: text/event-stream`, no-cache behavior, and a persistent connection.

Events should use standard SSE framing with named events. Payloads should be JSON strings.

### Connection lifecycle

For each accepted SSE request, generate a unique `clientId`, register the connection in `RealtimeService`, and remove it when the request closes. The service should own connection bookkeeping so future phases can publish events without embedding state in the controller.

The initial event must be:
- event type: `connected`
- payload fields: `clientId`, `timestamp`

`timestamp` should be an ISO 8601 string generated when the event is sent.

### Heartbeat

Send heartbeat events every 15-30 seconds. Use a fixed interval inside that range; prefer 25 seconds unless implementation constraints suggest another value. Heartbeat payloads should include a timestamp and must not include private or domain data.

Clear the heartbeat interval when the connection closes. Heartbeat write failures should be logged and should trigger connection cleanup if the stream is no longer writable.

### CORS

Enable CORS for the frontend origin used by `apps/main`. The implementation should read an environment variable for the origin, with a local development default of `http://localhost:3000`.

Do not use a broad wildcard origin for the realtime endpoint.

### Logging

Use Nest's `Logger` or the existing app logging convention. Log:
- connection opened with `clientId`
- connection closed with `clientId`
- heartbeat write errors with `clientId`

Logs must not include private user data.

## Risks / Trade-offs

- In-memory connection tracking only works per process. That is acceptable for this foundation phase but not for multi-instance fanout.
- SSE is one-way. If the product needs bidirectional realtime behavior later, WebSockets or another transport may be added in a later phase.
- Heartbeat intervals must always be cleared on close to avoid leaks during local development and long-running servers.
