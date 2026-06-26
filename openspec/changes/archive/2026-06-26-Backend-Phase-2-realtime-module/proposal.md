## Why

The backend API currently supports request/response HTTP endpoints, but it does not have a realtime delivery surface. Flock needs a basic server-sent events foundation so the API can hold client connections, identify them, and send lifecycle events before feature-specific realtime events are added.

## What Changes

- Add a Nest realtime module under `apps/api`.
- Expose `GET /realtime/stream` as an SSE endpoint.
- Create and track a `clientId` for each connection.
- Send an initial `connected` event with `clientId` and `timestamp`.
- Send heartbeat events every 15-30 seconds.
- Clean up connection state and heartbeat intervals on disconnect.
- Enable CORS for the `apps/main` origin.
- Add basic logging for connection open, close, and heartbeat errors.

## Impact

- Adds the backend foundation for realtime features.
- Does not add domain-specific realtime events yet.
- Does not require Prisma schema, migration, seed, or frontend changes.
- Requires tests for SSE lifecycle behavior and CORS configuration.
