## MODIFIED Requirements

### Requirement: Reply Composition

The system SHALL let the viewer compose and submit a reply to the root post from its thread page, applying the same validation as top-level post composition (non-empty, within `MAX_POST_LENGTH`).

#### Scenario: Viewer submits a valid reply

- **WHEN** the viewer submits non-empty reply text within the maximum length
- **THEN** the system SHALL persist a new `Post` with `authorId` set to the viewer, `parentId` set to the root post's id, and `createdAt` set to the current time
- **AND** the backend SHALL publish a live reply event to active realtime connections for that root post's thread

#### Scenario: Viewer submits empty or whitespace-only text

- **WHEN** the viewer submits reply text that is empty or contains only whitespace
- **THEN** the system SHALL NOT create a reply and SHALL indicate that the reply cannot be empty
- **AND** the backend SHALL NOT publish a live reply event

#### Scenario: Viewer submits text exceeding the maximum length

- **WHEN** the viewer submits reply text longer than the maximum post length
- **THEN** the system SHALL NOT create a reply and SHALL indicate that the maximum length has been exceeded
- **AND** the backend SHALL NOT publish a live reply event
