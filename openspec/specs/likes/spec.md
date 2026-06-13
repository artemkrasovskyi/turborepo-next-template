# Likes

## Requirements

### Requirement: Like and Unlike a Post

The system SHALL let a viewer like and unlike any post (root post or reply), and SHALL make both operations idempotent.

#### Scenario: Viewer likes a post they haven't liked

- **WHEN** the viewer likes a post they have not already liked
- **THEN** the system SHALL create a `Like` record with `userId` set to the viewer and `postId` set to that post

#### Scenario: Viewer unlikes a post they've liked

- **WHEN** the viewer unlikes a post they have already liked
- **THEN** the system SHALL remove the corresponding `Like` record

#### Scenario: Viewer likes a post they've already liked

- **WHEN** the viewer likes a post they have already liked
- **THEN** the system SHALL NOT create a duplicate `Like` record and SHALL NOT return an error

#### Scenario: Viewer unlikes a post they haven't liked

- **WHEN** the viewer unlikes a post they have not liked
- **THEN** the system SHALL NOT return an error

### Requirement: Like State and Count Display

The system SHALL display each post's like count, and SHALL indicate whether the viewer has liked it, on the home feed, thread pages, and profile post lists.

#### Scenario: Post is rendered with a viewer

- **WHEN** a post is rendered in the feed, a thread, or a profile's post list, and a viewer is resolved
- **THEN** the system SHALL display its like count and SHALL visually distinguish whether the viewer has liked it

#### Scenario: Post is rendered with no viewer

- **WHEN** a post is rendered and no viewer is resolved
- **THEN** the system SHALL display its like count without an interactive like control

### Requirement: Like Toggle Feedback

The system SHALL let the viewer toggle a post's like state from wherever it is rendered, updating the displayed state and count without a full page reload.

#### Scenario: Viewer toggles a like

- **WHEN** the viewer activates a post's like control
- **THEN** the system SHALL immediately update the displayed like state and count, then persist the change in the background

#### Scenario: Toggling fails

- **WHEN** a like or unlike action fails
- **THEN** the system SHALL revert the displayed like state and count to their previous values and display an inline error message
