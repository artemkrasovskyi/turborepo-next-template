# Post Composer

## Requirements

### Requirement: Post Composition

The system SHALL let the viewer compose and submit a new top-level post containing text. The system SHALL reject empty, whitespace-only, or overlong submissions.

#### Scenario: Viewer submits a valid post

- **WHEN** the viewer submits non-empty post text within the maximum length
- **THEN** the system SHALL persist a new `Post` with `authorId` set to the viewer, `parentId` set to `null`, and `createdAt` set to the current time

#### Scenario: Viewer submits empty or whitespace-only text

- **WHEN** the viewer submits text that is empty or contains only whitespace
- **THEN** the system SHALL NOT create a post and SHALL indicate that the post cannot be empty

#### Scenario: Viewer submits text exceeding the maximum length

- **WHEN** the viewer submits text longer than the maximum post length
- **THEN** the system SHALL NOT create a post and SHALL indicate that the maximum length has been exceeded

### Requirement: Composer Feedback

The system SHALL give the viewer real-time feedback on their post's validity and submission state.

#### Scenario: Viewer types into the composer

- **WHEN** the viewer types or edits text in the composer
- **THEN** the system SHALL display the number of characters remaining out of the maximum

#### Scenario: Submission is in progress

- **WHEN** the viewer submits the composer form
- **THEN** the system SHALL disable the submit control and indicate a pending state until the submission completes

#### Scenario: Submission fails

- **WHEN** post creation fails due to validation or a server error
- **THEN** the system SHALL display an inline error message and SHALL retain the viewer's entered text

### Requirement: Feed Reflects New Posts

The system SHALL ensure a successfully created post appears in the viewer's home feed without a full page reload.

#### Scenario: New post appears at the top of the feed

- **WHEN** the viewer successfully submits a post
- **THEN** the home feed SHALL refresh and display the new post as the most recent item
