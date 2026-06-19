# Auth

## Requirements

### Requirement: Email and Password Authentication

The system SHALL let users create an account and sign in with email/password credentials.

#### Scenario: User signs up with valid account details

- **WHEN** a user submits a display name, unique username, email, and valid password
- **THEN** the system SHALL create a `User`
- **AND** the system SHALL create a Better Auth credential `Account`
- **AND** the system SHALL create a signed-in session

#### Scenario: User signs in with valid credentials

- **WHEN** a user submits a registered email and correct password
- **THEN** the system SHALL create a signed-in session
- **AND** the app SHALL resolve the viewer from that session

#### Scenario: User signs out

- **WHEN** a signed-in user signs out
- **THEN** the system SHALL clear the active session
- **AND** authenticated navigation SHALL no longer be shown

### Requirement: Session-Backed Viewer

The system SHALL resolve the current viewer from the authenticated session rather than a seeded fallback user.

#### Scenario: Session exists

- **WHEN** a request includes a valid Better Auth session
- **THEN** the system SHALL load the matching Flock `User`
- **AND** expose the viewer as `{ id, username, displayName, avatarUrl }`

#### Scenario: No session exists

- **WHEN** a request does not include a valid session
- **THEN** the system SHALL resolve the viewer as `null`
- **AND** SHALL NOT fall back to the first seeded user

### Requirement: Protected Routes

The system SHALL require a signed-in viewer for private or personalized routes.

#### Scenario: Signed-out user opens a protected route

- **WHEN** a signed-out user opens `/`, `/notifications`, `/bookmarks`, `/messages`, or `/messages/<conversationId>`
- **THEN** the system SHALL redirect them to sign in
- **AND** SHALL NOT display another user's private data

#### Scenario: Signed-in user opens a protected route

- **WHEN** a signed-in user opens a protected route
- **THEN** the system SHALL render data scoped to that user's id

### Requirement: Public Routes With Viewer State

The system SHALL keep public discovery and profile surfaces visible without a session.

#### Scenario: Signed-out user opens a public route

- **WHEN** a signed-out user opens explore, a profile page, a profile likes/follow list page, or a post thread
- **THEN** the system SHALL render public content
- **AND** interactive controls that require auth SHALL be hidden or inert

#### Scenario: Signed-in user opens a public route

- **WHEN** a signed-in user opens a public route
- **THEN** the system SHALL include viewer-specific state such as follow, like, repost, and bookmark status where applicable

### Requirement: Server-Derived Mutation Identity

The system SHALL derive the acting user for authenticated mutations from the server session.

#### Scenario: Signed-in user creates content or social actions

- **WHEN** a signed-in user creates a post, replies, follows, likes, reposts, bookmarks, edits their profile, starts a conversation, or sends a direct message
- **THEN** the Server Action SHALL use the session user's id as the actor
- **AND** SHALL NOT trust `viewerId`, `authorId`, or `senderId` values supplied by the browser

#### Scenario: Signed-out user attempts an authenticated mutation

- **WHEN** no viewer can be resolved for an authenticated mutation
- **THEN** the system SHALL reject the mutation
- **AND** SHALL NOT create or update data

### Requirement: Auth-Backed Demo Data

The system SHALL seed demo users with usable credential accounts.

#### Scenario: Demo seed runs

- **WHEN** the seed script runs
- **THEN** it SHALL create demo `User` rows
- **AND** it SHALL create matching Better Auth credential `Account` rows
- **AND** each seeded user SHALL be able to sign in with email `<username>@example.test` and password `password1234`
