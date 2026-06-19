# Bookmarks

## Requirements

### Requirement: Save and Unsave a Post

The system SHALL let a signed-in viewer save and unsave any post (root post or reply), and SHALL make both operations idempotent.

#### Scenario: Viewer saves a post they have not saved

- **WHEN** the viewer saves a post they have not already saved
- **THEN** the system SHALL create a `Bookmark` record with `userId` set to the viewer and `postId` set to that post

#### Scenario: Viewer unsaves a post they have saved

- **WHEN** the viewer unsaves a post they have already saved
- **THEN** the system SHALL remove the corresponding `Bookmark` record

#### Scenario: Viewer saves a post they have already saved

- **WHEN** the viewer saves a post they have already saved
- **THEN** the system SHALL NOT create a duplicate `Bookmark` record and SHALL NOT return an error

#### Scenario: Viewer unsaves a post they have not saved

- **WHEN** the viewer unsaves a post they have not saved
- **THEN** the system SHALL NOT return an error

### Requirement: Bookmark Privacy

The system SHALL treat bookmarks as private viewer state and SHALL NOT expose public bookmark counts or public bookmark lists.

#### Scenario: Post is rendered with bookmark state

- **WHEN** a post is rendered for a signed-in viewer
- **THEN** the system SHALL indicate whether that viewer has saved the post
- **AND** the system SHALL NOT display a public bookmark count

#### Scenario: Another viewer opens a profile

- **WHEN** a viewer opens another user's profile
- **THEN** the system SHALL NOT expose that user's bookmarked posts

### Requirement: Bookmark Toggle Feedback

The system SHALL let the viewer toggle a post's saved state from post cards without a full page reload.

#### Scenario: Viewer toggles a bookmark

- **WHEN** the viewer activates a post's bookmark control
- **THEN** the system SHALL immediately update the displayed saved state, then persist the change in the background

#### Scenario: Bookmark toggle fails

- **WHEN** a save or unsave action fails
- **THEN** the system SHALL revert the displayed saved state to its previous value and display an inline error message

#### Scenario: Post is rendered with no viewer

- **WHEN** a post is rendered and no viewer is resolved
- **THEN** the system SHALL display bookmark state without an interactive bookmark control

### Requirement: Bookmarks Page

The system SHALL provide a private `/bookmarks` page that lists the current viewer's saved posts in reverse bookmark order.

#### Scenario: Viewer opens their bookmarks page

- **WHEN** a signed-in viewer opens `/bookmarks`
- **THEN** the system SHALL display posts saved by that viewer ordered by `Bookmark.createdAt` descending

#### Scenario: Viewer has no bookmarks

- **WHEN** a signed-in viewer opens `/bookmarks` and has not saved any posts
- **THEN** the system SHALL display an empty state

#### Scenario: Loading more bookmarked posts

- **WHEN** more bookmarked posts exist beyond the initial page
- **THEN** the system SHALL let the viewer load additional bookmarked posts via a "load more" control

#### Scenario: No viewer opens bookmarks page

- **WHEN** `/bookmarks` is opened and no viewer is resolved
- **THEN** the system SHALL NOT show any user's bookmarks and SHALL display an auth/empty state
