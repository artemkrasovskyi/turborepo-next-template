# Feed

## Requirements

### Requirement: Feed Composition

The system SHALL populate a user's home feed with top-level posts authored by users the viewer follows, plus the viewer's own top-level posts. Replies SHALL NOT appear in the home feed. The feed SHALL NOT contain sponsored or promoted content.

#### Scenario: Feed includes followed users' posts

- **WHEN** a user views their home feed
- **THEN** the feed SHALL include top-level posts authored by every user the viewer follows

#### Scenario: Feed includes the viewer's own posts

- **WHEN** a user views their home feed
- **THEN** the feed SHALL include the viewer's own top-level posts

#### Scenario: Replies are excluded from the home feed

- **WHEN** a followed user publishes a reply to another post
- **THEN** that reply SHALL NOT appear in the viewer's home feed

### Requirement: Chronological Ordering

The system SHALL order feed posts by creation time, most recent first, without applying any algorithmic ranking.

#### Scenario: Posts ordered by recency

- **WHEN** the feed contains posts from multiple authors
- **THEN** posts SHALL be ordered by `createdAt` descending

#### Scenario: No ranking applied

- **WHEN** the feed is generated
- **THEN** the system SHALL NOT reorder posts based on engagement, relevance, or any ranking signal

### Requirement: Feed Pagination

The system SHALL paginate the feed using cursor-based pagination so clients can load additional posts incrementally.

#### Scenario: Initial page load

- **WHEN** a user opens their home feed
- **THEN** the system SHALL return the most recent page of posts up to a fixed page size

#### Scenario: Loading the next page

- **WHEN** a user requests more posts using the cursor returned by the previous page
- **THEN** the system SHALL return the next page of posts older than that cursor

#### Scenario: End of feed reached

- **WHEN** no further posts exist beyond the current page
- **THEN** the system SHALL indicate that there are no more posts to load

### Requirement: Empty Feed State

The system SHALL handle the case where a user follows no one and has not posted.

#### Scenario: New user with no follows and no posts

- **WHEN** a user who follows no one and has not posted views their home feed
- **THEN** the system SHALL return an empty feed and the UI SHALL display guidance to follow other users
