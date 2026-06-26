## ADDED Requirements

### Requirement: Realtime SSE Module

The API app SHALL expose a realtime module using server-sent events.

#### Scenario: Client opens realtime stream

- **WHEN** a client sends `GET /realtime/stream`
- **THEN** the API app SHALL keep the HTTP connection open as an SSE stream
- **AND** the response SHALL use `text/event-stream`
- **AND** the response SHALL use no-cache behavior suitable for realtime streaming

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
