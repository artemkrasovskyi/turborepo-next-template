# Thread Page

## Requirements

### Requirement: Thread View

The system SHALL render a page for a top-level post showing that post (the "root post") followed by all of its replies, ordered by `createdAt` ascending (oldest first).

#### Scenario: Viewer opens a thread with replies

- **WHEN** a viewer navigates to a top-level post's thread page
- **THEN** the system SHALL display the root post followed by its replies, ordered from oldest to newest

#### Scenario: Viewer opens a thread with no replies

- **WHEN** a viewer navigates to a top-level post that has no replies
- **THEN** the system SHALL display the root post and indicate that there are no replies yet

#### Scenario: Viewer opens a thread for a non-existent post

- **WHEN** a viewer navigates to `/posts/<id>` for an id that does not correspond to an existing top-level post
- **THEN** the system SHALL display a not-found state

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

#### Scenario: Reply submission succeeds

- **WHEN** the viewer successfully submits a reply
- **THEN** the thread page SHALL refresh and display the new reply at the end of the replies list without a full page reload

### Requirement: Feed Links to Threads

The system SHALL let the viewer navigate from a feed post to that post's thread page, and SHALL display the post's reply count in the feed.

#### Scenario: Feed item shows reply count

- **WHEN** the home feed renders a post
- **THEN** the feed item SHALL display the number of replies that post has

#### Scenario: Viewer opens a thread from the feed

- **WHEN** the viewer activates a feed item
- **THEN** the system SHALL navigate to that post's thread page at `/posts/<id>`
