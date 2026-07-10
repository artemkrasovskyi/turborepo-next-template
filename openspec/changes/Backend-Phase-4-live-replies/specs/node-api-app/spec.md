## MODIFIED Requirements

### Requirement: Realtime SSE Module

The API app SHALL expose a realtime module using server-sent events.

#### Scenario: Client opens realtime stream with thread id

- **WHEN** a client sends `GET /realtime/stream?threadId=<threadId>`
- **THEN** the API app SHALL associate that connection with the supplied thread id
- **AND** the connection SHALL remain eligible for lifecycle and heartbeat events
- **AND** the connection SHALL be eligible for live events targeted to that thread id

#### Scenario: Connection closes

- **WHEN** the client closes the realtime stream connection
- **THEN** the API app SHALL remove the registered connection
- **AND** it SHALL remove any viewer association for that connection
- **AND** it SHALL remove any thread association for that connection
- **AND** it SHALL clear that connection's heartbeat interval
- **AND** it SHALL log that the connection closed with the `clientId`

## ADDED Requirements

### Requirement: Live Reply Events

The API app SHALL publish newly-created replies to active realtime connections for the replied-to thread.

#### Scenario: Reply is created for connected thread

- **WHEN** a reply is persisted for a thread with active realtime connections
- **THEN** the API app SHALL send an SSE event named `reply.created` to that thread's active connections
- **AND** the event payload SHALL include the thread id and reply

#### Scenario: Reply event payload is sent

- **WHEN** a live reply event is sent
- **THEN** the payload SHALL include `threadId`, `reply`, and `timestamp`
- **AND** `reply` SHALL use the public `ThreadPost` shape
- **AND** private fields such as email, sessions, accounts, and verification data SHALL NOT be exposed

#### Scenario: Thread has no active connections

- **WHEN** a reply is persisted for a thread without active realtime connections
- **THEN** the API app SHALL keep the persisted reply
- **AND** it SHALL NOT treat missing live delivery as a reply creation failure

#### Scenario: Multiple connections exist for thread

- **WHEN** a reply is created for a thread with multiple active realtime connections
- **THEN** the API app SHALL send `reply.created` to each active connection for that thread

#### Scenario: Other threads are connected

- **WHEN** a reply is created for one thread
- **THEN** the API app SHALL NOT send that reply event to connections associated with other thread ids

#### Scenario: Reply creation is rejected

- **WHEN** reply creation fails validation or persistence
- **THEN** the API app SHALL NOT publish a `reply.created` event

#### Scenario: Live reply delivery fails for one connection

- **WHEN** writing a live reply event fails for a connection
- **THEN** the API app SHALL log the publish error
- **AND** it SHALL clean up the failed connection if it is no longer writable
- **AND** it SHALL continue preserving the persisted reply
