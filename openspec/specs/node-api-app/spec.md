# Spec: Node API App

## Purpose

Defines the NestJS HTTP API app (`apps/api`) as a first-class Turborepo workspace within the monorepo.

## Requirements

### Requirement: NestJS API Workspace

The system SHALL include a NestJS HTTP API app as a first-class Turborepo workspace.

#### Scenario: Workspace is installed

- **WHEN** dependencies are installed from the repo root
- **THEN** `apps/api` SHALL be available as workspace package `@repo/api`
- **AND** the package SHALL use the existing Bun workspace setup

#### Scenario: Turbo targets the API app

- **WHEN** a developer runs Turbo tasks with `--filter=@repo/api`
- **THEN** the API app SHALL support `dev`, `build`, `lint`, `typecheck`, and `test` tasks

### Requirement: Vitest-Based Testing

The API app SHALL use Vitest for tests instead of Nest's default Jest setup.

#### Scenario: API app tests run

- **WHEN** the API app test task runs
- **THEN** tests SHALL execute with Vitest
- **AND** the app SHALL NOT require Jest configuration or Jest dependencies

### Requirement: API App Runtime

The API app SHALL run as a NestJS HTTP server using the default Express platform.

#### Scenario: API app starts without explicit port

- **WHEN** the app starts without `PORT`
- **THEN** it SHALL listen on port `3002`

#### Scenario: API app starts with explicit port

- **WHEN** the app starts with `PORT` set
- **THEN** it SHALL listen on the configured port

### Requirement: Health Endpoint

The API app SHALL expose a health endpoint for readiness checks.

#### Scenario: Health endpoint is requested

- **WHEN** a client sends `GET /health`
- **THEN** the API app SHALL respond successfully
- **AND** the response SHALL include a JSON health status

### Requirement: Shared Prisma Integration

The API app SHALL access Prisma through the existing shared database singleton.

#### Scenario: API app needs database access

- **WHEN** an API controller or service needs Prisma
- **THEN** it SHALL receive Prisma through a Nest injectable provider
- **AND** the provider SHALL wrap `@repo/shared/features/database`
- **AND** the API app SHALL NOT instantiate `PrismaClient` directly

#### Scenario: Database health is requested

- **WHEN** a client requests database health from the API app
- **THEN** the API app SHALL execute a lightweight Prisma query
- **AND** the response SHALL indicate database connectivity
- **AND** the response SHALL NOT expose business-domain records or private data

#### Scenario: Default API tests run

- **WHEN** the API app's default test task runs
- **THEN** Prisma dependencies SHALL be mocked where database behavior is tested
- **AND** the tests SHALL NOT require a live PostgreSQL instance

#### Scenario: Existing Prisma usage remains

- **WHEN** Prisma integration is added to the Nest API app
- **THEN** existing `@repo/api-client` direct Prisma calls SHALL remain unchanged
- **AND** no Prisma schema, migration, or seed changes SHALL be required

### Requirement: Search Module

The API app SHALL expose a NestJS search module for public user search.

#### Scenario: Client searches users

- **WHEN** a client sends `GET /search/users?query=<text>`
- **THEN** the API app SHALL search users by `username` and `displayName`
- **AND** matching SHALL be case-insensitive
- **AND** the response SHALL include a page of public user results

#### Scenario: Client sends an empty search query

- **WHEN** the `query` parameter is missing, empty, or whitespace-only
- **THEN** the API app SHALL return `{ items: [], nextCursor: null }`
- **AND** it SHALL NOT run a broad user listing query

#### Scenario: Client paginates user search

- **WHEN** a client supplies `cursor` and optional `limit`
- **THEN** the API app SHALL return the next page after the cursor
- **AND** the effective page size SHALL default to `20`
- **AND** the effective page size SHALL NOT exceed `20`
- **AND** `nextCursor` SHALL be the final returned user id when more results exist

#### Scenario: Client requests viewer-specific follow state

- **WHEN** a client supplies `viewerId`
- **THEN** the API app SHALL batch-load follow relationships for the returned users
- **AND** each result SHALL include whether that viewer follows the user

#### Scenario: Client searches without viewer state

- **WHEN** no `viewerId` is supplied
- **THEN** each returned user SHALL include `isFollowing: false`

#### Scenario: Search results are returned

- **WHEN** the API app returns user search results
- **THEN** each result SHALL include only `id`, `username`, `displayName`, `avatarUrl`, and `isFollowing`
- **AND** private fields such as email, sessions, accounts, and verification data SHALL NOT be exposed

#### Scenario: Existing frontend search remains

- **WHEN** the backend search module is added
- **THEN** existing `/explore` and `@repo/api-client/features/search` behavior SHALL remain unchanged

### Requirement: Realtime SSE Module

The API app SHALL expose a realtime module using server-sent events.

#### Scenario: Client opens realtime stream

- **WHEN** a client sends `GET /realtime/stream`
- **THEN** the API app SHALL keep the HTTP connection open as an SSE stream
- **AND** the response SHALL use `text/event-stream`
- **AND** the response SHALL use no-cache behavior suitable for realtime streaming

#### Scenario: Client opens realtime stream with viewer id

- **WHEN** a client sends `GET /realtime/stream?viewerId=<viewerId>`
- **THEN** the API app SHALL associate that connection with the supplied viewer id
- **AND** the connection SHALL remain eligible for lifecycle and heartbeat events
- **AND** the connection SHALL be eligible for live events targeted to that viewer id

#### Scenario: Connection opens

- **WHEN** a realtime stream connection is accepted
- **THEN** the API app SHALL create a unique `clientId` for that connection
- **AND** it SHALL register the connection
- **AND** it SHALL log that the connection opened with the `clientId`

#### Scenario: Initial connected event is sent

- **WHEN** a realtime stream connection is established
- **THEN** the API app SHALL send an SSE event of type `connected`
- **AND** the event payload SHALL include `clientId`
- **AND** the event payload SHALL include an ISO 8601 `timestamp`

#### Scenario: Heartbeat is sent

- **WHEN** a realtime stream connection remains open
- **THEN** the API app SHALL send heartbeat events every 15-30 seconds
- **AND** each heartbeat payload SHALL include a timestamp
- **AND** heartbeat payloads SHALL NOT include private or domain-specific data

#### Scenario: Connection closes

- **WHEN** the client closes the realtime stream connection
- **THEN** the API app SHALL remove the registered connection
- **AND** it SHALL remove any viewer association for that connection
- **AND** it SHALL clear that connection's heartbeat interval
- **AND** it SHALL log that the connection closed with the `clientId`

#### Scenario: Heartbeat write fails

- **WHEN** the API app cannot write a heartbeat to a connection
- **THEN** it SHALL log the heartbeat error with the `clientId`
- **AND** it SHALL clean up connection resources if the stream is no longer writable

#### Scenario: Frontend origin opens realtime stream

- **WHEN** the `apps/main` origin opens `GET /realtime/stream`
- **THEN** the API app SHALL allow the request through CORS

#### Scenario: Realtime module is added

- **WHEN** the realtime module is implemented
- **THEN** it SHALL NOT add WebSockets, Redis, queues, Prisma persistence, or domain-specific realtime events

### Requirement: Live Notification Events

The API app SHALL publish newly-created notifications to active realtime connections for the notification recipient.

#### Scenario: Follow notification is created for connected recipient

- **WHEN** a follow notification is persisted for a recipient with an active realtime connection
- **THEN** the API app SHALL send an SSE event named `notification.created` to that recipient's active connections
- **AND** the event payload SHALL be a `NotificationItem`

#### Scenario: Like notification is created for connected recipient

- **WHEN** a like notification is persisted for a recipient with an active realtime connection
- **THEN** the API app SHALL send an SSE event named `notification.created` to that recipient's active connections
- **AND** the event payload SHALL be a `NotificationItem`

#### Scenario: Notification recipient is disconnected

- **WHEN** a notification is persisted for a recipient without active realtime connections
- **THEN** the API app SHALL keep the persisted notification
- **AND** it SHALL NOT treat missing live delivery as a notification creation failure

#### Scenario: Notification event payload is sent

- **WHEN** a live notification event is sent
- **THEN** the payload SHALL include `id`, `type`, `actor`, `createdAt`, and `post`
- **AND** the payload SHALL NOT include private fields such as email, sessions, accounts, or verification data

#### Scenario: Multiple connections exist for recipient

- **WHEN** a notification is created for a recipient with multiple active realtime connections
- **THEN** the API app SHALL send `notification.created` to each active connection for that recipient

#### Scenario: Other users are connected

- **WHEN** a notification is created for one recipient
- **THEN** the API app SHALL NOT send that notification event to connections associated with other viewer ids

#### Scenario: Live delivery fails for one connection

- **WHEN** writing a live notification event fails for a connection
- **THEN** the API app SHALL log the publish error
- **AND** it SHALL clean up the failed connection if it is no longer writable
- **AND** it SHALL continue preserving the persisted notification

### Requirement: Isolated Nest TypeScript Configuration

The API app SHALL use app-local TypeScript settings required by NestJS.

#### Scenario: API app is typechecked

- **WHEN** the API app typecheck task runs
- **THEN** Nest decorators SHALL typecheck correctly
- **AND** root frontend TypeScript defaults SHALL NOT need to change

#### Scenario: API app is built

- **WHEN** the API app build task runs
- **THEN** compiled output SHALL be emitted to `dist`
- **AND** test files SHALL be excluded from build output
